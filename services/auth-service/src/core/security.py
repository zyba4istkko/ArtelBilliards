"""
Security и JWT управление для Auth Service
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
import secrets
import hashlib
import hmac
import urllib.parse
import json

from .config import settings


class JWTManager:
    """Менеджер для работы с JWT токенами"""
    
    def __init__(
        self,
        secret_key: str,
        algorithm: str = "HS256",
        access_token_expire_minutes: int = 30,
        refresh_token_expire_days: int = 30
    ):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_expire_minutes = access_token_expire_minutes
        self.refresh_token_expire_days = refresh_token_expire_days
    
    def create_access_token(
        self, 
        data: Dict[str, Any], 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Создание access токена"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def create_refresh_token(
        self, 
        data: Dict[str, Any], 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Создание refresh токена"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def decode_access_token(self, token: str) -> Dict[str, Any]:
        """Декодирование access токена"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Проверяем тип токена
            if payload.get("type") != "access":
                raise JWTError("Invalid token type")
            
            return payload
        except JWTError as e:
            raise JWTError(f"Invalid access token: {e}")
    
    def decode_refresh_token(self, token: str) -> Dict[str, Any]:
        """Декодирование refresh токена"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Проверяем тип токена
            if payload.get("type") != "refresh":
                raise JWTError("Invalid token type")
            
            return payload
        except JWTError as e:
            raise JWTError(f"Invalid refresh token: {e}")
    
    def verify_token(self, token: str) -> bool:
        """Проверка валидности токена"""
        try:
            jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return True
        except JWTError:
            return False


class PasswordManager:
    """Менеджер для работы с паролями"""
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Проверка пароля"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Хеширование пароля"""
        return self.pwd_context.hash(password)
    
    def generate_random_password(self, length: int = 12) -> str:
        """Генерация случайного пароля"""
        return secrets.token_urlsafe(length)


class TelegramDataValidator:
    """Валидатор данных от Telegram Mini App"""
    
    def __init__(self, bot_token: str):
        self.bot_token = bot_token
    
    def validate_init_data(self, init_data: str) -> Optional[Dict[str, Any]]:
        """
        Валидация init_data от Telegram Mini App
        https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
        """
        try:
            # Парсим данные
            parsed_data = urllib.parse.parse_qs(init_data)
            
            # Извлекаем hash
            received_hash = parsed_data.get('hash', [None])[0]
            if not received_hash:
                return None
            
            # Создаем строку для проверки
            check_string = '\n'.join([
                f"{key}={value[0]}" 
                for key, value in sorted(parsed_data.items()) 
                if key != 'hash'
            ])
            
            # Создаем секретный ключ
            secret_key = hmac.new(
                b"WebAppData", 
                self.bot_token.encode(), 
                hashlib.sha256
            ).digest()
            
            # Вычисляем hash
            calculated_hash = hmac.new(
                secret_key,
                check_string.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Проверяем hash
            if not hmac.compare_digest(received_hash, calculated_hash):
                return None
            
            # Парсим user данные
            user_data = None
            if 'user' in parsed_data:
                try:
                    user_data = json.loads(parsed_data['user'][0])
                except json.JSONDecodeError:
                    return None
            
            return {
                'user': user_data,
                'auth_date': parsed_data.get('auth_date', [None])[0],
                'start_param': parsed_data.get('start_param', [None])[0],
                'query_id': parsed_data.get('query_id', [None])[0]
            }
            
        except Exception as e:
            print(f"Error validating Telegram data: {e}")
            return None


class SecurityHeaders:
    """Генератор заголовков безопасности"""
    
    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """Возвращает заголовки безопасности"""
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }


# Глобальные экземпляры
jwt_manager = JWTManager(
    secret_key=settings.JWT_SECRET_KEY,
    algorithm=settings.JWT_ALGORITHM,
    access_token_expire_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    refresh_token_expire_days=settings.REFRESH_TOKEN_EXPIRE_DAYS
)

password_manager = PasswordManager()

telegram_validator = TelegramDataValidator(settings.TELEGRAM_BOT_TOKEN or "")