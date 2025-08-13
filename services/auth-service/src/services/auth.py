"""
Основной сервис аутентификации
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from uuid import UUID, uuid4
import databases
import json

from ..models.database import (
    users_table, auth_providers_table, user_sessions_table,
    auth_logs_table, ip_restrictions_table, UserRole, AuthProvider, SessionStatus
)
from ..models.schemas import UserCreate, UserResponse, SessionResponse
from ..core.security import password_manager
from ..core.config import settings


class AuthService:
    """Основной сервис аутентификации и управления пользователями"""
    
    def __init__(self, database: databases.Database):
        self.db = database
    
    # ==================== USER MANAGEMENT ====================
    
    async def get_user(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        """Получение пользователя по ID"""
        query = users_table.select().where(users_table.c.id == user_id)
        return await self.db.fetch_one(query)
    
    async def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Получение пользователя по username"""
        query = users_table.select().where(users_table.c.username == username)
        return await self.db.fetch_one(query)
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Получение пользователя по email"""
        query = users_table.select().where(users_table.c.email == email)
        return await self.db.fetch_one(query)
    
    async def create_user(self, user_data: UserCreate) -> Dict[str, Any]:
        """Создание нового пользователя"""
        user_id = uuid4()
        
        # Хешируем пароль если он есть
        hashed_password = None
        if user_data.password:
            hashed_password = password_manager.get_password_hash(user_data.password)
        
        query = users_table.insert().values(
            id=user_id,
            username=user_data.username,
            email=user_data.email,
            phone=user_data.phone,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            avatar_url=user_data.avatar_url,
            language_code=user_data.language_code,
            timezone=user_data.timezone,
            password_hash=hashed_password,
            role=UserRole.REGULAR_USER.value,
            is_active=True,
            is_verified=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        await self.db.execute(query)
        return await self.get_user(user_id)
    
    async def update_user(self, user_id: UUID, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обновление данных пользователя"""
        update_data["updated_at"] = datetime.utcnow()
        
        query = users_table.update().where(
            users_table.c.id == user_id
        ).values(**update_data)
        
        await self.db.execute(query)
        return await self.get_user(user_id)
    
    async def update_last_login(self, user_id: UUID):
        """Обновление времени последнего входа"""
        query = users_table.update().where(
            users_table.c.id == user_id
        ).values(
            last_login_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        await self.db.execute(query)
    
    # ==================== AUTH PROVIDERS ====================
    
    async def get_or_create_telegram_user(self, telegram_data: Dict[str, Any]) -> Dict[str, Any]:
        """Получение или создание пользователя через Telegram"""
        telegram_user = telegram_data.get('user', {})
        telegram_id = str(telegram_user.get('id'))
        
        if not telegram_id:
            raise ValueError("Invalid Telegram user data")
        
        # Ищем существующего пользователя по Telegram ID
        query = auth_providers_table.select().where(
            (auth_providers_table.c.provider == AuthProvider.TELEGRAM.value) &
            (auth_providers_table.c.provider_user_id == telegram_id)
        )
        provider_record = await self.db.fetch_one(query)
        
        if provider_record:
            # Пользователь уже существует
            return await self.get_user(provider_record['user_id'])
        
        # Создаем нового пользователя
        username = (
            telegram_user.get('username') or 
            f"user_{telegram_id}" or
            f"tg_{telegram_id}"
        )
        
        # Проверяем уникальность username
        existing_user = await self.get_user_by_username(username)
        if existing_user:
            username = f"tg_{telegram_id}_{uuid4().hex[:8]}"
        
        user_data = UserCreate(
            username=username,
            first_name=telegram_user.get('first_name'),
            last_name=telegram_user.get('last_name'),
            language_code=telegram_user.get('language_code', 'ru')
        )
        
        user = await self.create_user(user_data)
        
        # Создаем запись провайдера
        await self.create_auth_provider(
            user_id=user['id'],
            provider=AuthProvider.TELEGRAM,
            provider_user_id=telegram_id,
            provider_username=telegram_user.get('username'),
            provider_data=telegram_data,
            is_primary=True
        )
        
        return user
    
    async def get_or_create_google_user(self, google_data: Dict[str, Any]) -> Dict[str, Any]:
        """Получение или создание пользователя через Google"""
        google_id = google_data.get('sub')
        email = google_data.get('email')
        
        if not google_id or not email:
            raise ValueError("Invalid Google user data")
        
        # Ищем существующего пользователя по Google ID
        query = auth_providers_table.select().where(
            (auth_providers_table.c.provider == AuthProvider.GOOGLE.value) &
            (auth_providers_table.c.provider_user_id == google_id)
        )
        provider_record = await self.db.fetch_one(query)
        
        if provider_record:
            return await self.get_user(provider_record['user_id'])
        
        # Ищем по email
        existing_user = await self.get_user_by_email(email)
        if existing_user:
            # Добавляем Google провайдер к существующему пользователю
            await self.create_auth_provider(
                user_id=existing_user['id'],
                provider=AuthProvider.GOOGLE,
                provider_user_id=google_id,
                provider_data=google_data
            )
            return existing_user
        
        # Создаем нового пользователя
        username = email.split('@')[0]
        existing_username = await self.get_user_by_username(username)
        if existing_username:
            username = f"{username}_{uuid4().hex[:8]}"
        
        user_data = UserCreate(
            username=username,
            email=email,
            first_name=google_data.get('given_name'),
            last_name=google_data.get('family_name'),
            avatar_url=google_data.get('picture'),
            language_code='en'
        )
        
        user = await self.create_user(user_data)
        
        # Создаем запись провайдера
        await self.create_auth_provider(
            user_id=user['id'],
            provider=AuthProvider.GOOGLE,
            provider_user_id=google_id,
            provider_data=google_data,
            is_primary=True
        )
        
        return user
    
    async def create_auth_provider(
        self,
        user_id: UUID,
        provider: AuthProvider,
        provider_user_id: str,
        provider_username: Optional[str] = None,
        provider_data: Optional[Dict[str, Any]] = None,
        is_primary: bool = False
    ):
        """Создание записи провайдера аутентификации"""
        query = auth_providers_table.insert().values(
            id=uuid4(),
            user_id=user_id,
            provider=provider.value,
            provider_user_id=provider_user_id,
            provider_username=provider_username,
            provider_data=provider_data,
            is_primary=is_primary,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        await self.db.execute(query)
    
    # ==================== SESSION MANAGEMENT ====================
    
    async def create_session(
        self,
        user_id: UUID,
        access_token: str,
        refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        device_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Создание новой сессии пользователя"""
        
        # Проверяем количество активных сессий
        active_sessions = await self.get_user_active_sessions(user_id)
        if len(active_sessions) >= settings.MAX_ACTIVE_SESSIONS:
            # Удаляем самую старую сессию
            oldest_session = min(active_sessions, key=lambda s: s['created_at'])
            await self.revoke_session(oldest_session['id'])
        
        session_id = uuid4()
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        query = user_sessions_table.insert().values(
            id=session_id,
            user_id=user_id,
            access_token_hash=access_token,
            refresh_token_hash=refresh_token,
            session_token=access_token,
            refresh_token=refresh_token,
            device_info=device_info,
            ip_address=ip_address,
            user_agent=user_agent,
            status=SessionStatus.ACTIVE.value,
            expires_at=expires_at,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            last_activity_at=datetime.utcnow()
        )
        
        await self.db.execute(query)
        return await self.get_session(session_id)
    
    async def get_session(self, session_id: UUID) -> Optional[Dict[str, Any]]:
        """Получение сессии по ID"""
        query = user_sessions_table.select().where(user_sessions_table.c.id == session_id)
        return await self.db.fetch_one(query)
    
    async def get_user_active_sessions(self, user_id: UUID) -> List[Dict[str, Any]]:
        """Получение активных сессий пользователя"""
        query = user_sessions_table.select().where(
            (user_sessions_table.c.user_id == user_id) &
            (user_sessions_table.c.status == SessionStatus.ACTIVE.value) &
            (user_sessions_table.c.expires_at > datetime.utcnow())
        )
        return await self.db.fetch_all(query)
    
    async def update_session_tokens(
        self,
        session_id: UUID,
        access_token: str,
        refresh_token: str
    ):
        """Обновление токенов в сессии"""
        query = user_sessions_table.update().where(
            user_sessions_table.c.id == session_id
        ).values(
            session_token=access_token,
            refresh_token=refresh_token,
            updated_at=datetime.utcnow(),
            last_activity_at=datetime.utcnow()
        )
        
        await self.db.execute(query)
    
    async def revoke_session(self, session_id: UUID):
        """Отзыв сессии"""
        query = user_sessions_table.update().where(
            user_sessions_table.c.id == session_id
        ).values(
            status=SessionStatus.REVOKED.value,
            updated_at=datetime.utcnow()
        )
        
        await self.db.execute(query)
    
    async def revoke_all_user_sessions(self, user_id: UUID):
        """Отзыв всех сессий пользователя"""
        query = user_sessions_table.update().where(
            user_sessions_table.c.user_id == user_id
        ).values(
            status=SessionStatus.REVOKED.value,
            updated_at=datetime.utcnow()
        )
        
        await self.db.execute(query)
    
    # ==================== LOGGING ====================
    
    async def log_auth_event(
        self,
        action: str,
        user_id: Optional[UUID] = None,
        provider: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Логирование событий аутентификации"""
        query = auth_logs_table.insert().values(
            id=uuid4(),
            user_id=user_id,
            action=action,
            provider=provider,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            error_message=error_message,
            metadata=metadata,
            created_at=datetime.utcnow()
        )
        
        await self.db.execute(query)
    
    # ==================== SECURITY ====================
    
    async def check_ip_restrictions(self, ip_address: str) -> bool:
        """Проверка ограничений по IP"""
        if not ip_address:
            return True
        
        query = ip_restrictions_table.select().where(
            ip_restrictions_table.c.ip_address == ip_address
        )
        restriction = await self.db.fetch_one(query)
        
        if not restriction:
            return True
        
        # Проверяем блокировку
        if restriction['blocked_until'] and restriction['blocked_until'] > datetime.utcnow():
            return False
        
        return True
    
    async def record_failed_attempt(self, ip_address: str):
        """Запись неудачной попытки входа"""
        if not ip_address:
            return
        
        query = ip_restrictions_table.select().where(
            ip_restrictions_table.c.ip_address == ip_address
        )
        restriction = await self.db.fetch_one(query)
        
        if restriction:
            # Увеличиваем счетчик
            failed_attempts = restriction['failed_attempts'] + 1
            blocked_until = None
            
            # Блокируем при превышении лимита
            if failed_attempts >= settings.MAX_LOGIN_ATTEMPTS:
                blocked_until = datetime.utcnow() + timedelta(
                    minutes=settings.LOCKOUT_DURATION_MINUTES
                )
            
            update_query = ip_restrictions_table.update().where(
                ip_restrictions_table.c.ip_address == ip_address
            ).values(
                failed_attempts=failed_attempts,
                blocked_until=blocked_until,
                last_attempt_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            await self.db.execute(update_query)
        else:
            # Создаем новую запись
            insert_query = ip_restrictions_table.insert().values(
                id=uuid4(),
                ip_address=ip_address,
                failed_attempts=1,
                first_attempt_at=datetime.utcnow(),
                last_attempt_at=datetime.utcnow(),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            await self.db.execute(insert_query)
    
    async def clear_failed_attempts(self, ip_address: str):
        """Очистка неудачных попыток после успешного входа"""
        if not ip_address:
            return
        
        query = ip_restrictions_table.update().where(
            ip_restrictions_table.c.ip_address == ip_address
        ).values(
            failed_attempts=0,
            blocked_until=None,
            updated_at=datetime.utcnow()
        )
        
        await self.db.execute(query)