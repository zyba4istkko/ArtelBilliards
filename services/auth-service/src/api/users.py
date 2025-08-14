"""
User management endpoints для Auth Service
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from uuid import UUID
import logging

from ..core.config import settings
from ..models.schemas import (
    UserResponse, UserUpdate, UserProfile, SessionResponse,
    ErrorResponse, UserPermissions
)
from ..services.auth import AuthService
from ..core.security import JWTManager
from ..core.database import database

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)


async def get_auth_service() -> AuthService:
    """Dependency для получения Auth Service"""
    return AuthService(database)


async def get_jwt_manager() -> JWTManager:
    """Dependency для получения JWT Manager"""
    from ..core.security import jwt_manager
    return jwt_manager


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service),
    jwt_manager: JWTManager = Depends(get_jwt_manager)
) -> dict:
    """Dependency для получения текущего пользователя"""
    try:
        # Декодируем токен
        payload = jwt_manager.decode_access_token(credentials.credentials)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: user_id not found"
            )
        
        # Получаем пользователя
        user = await auth_service.get_user(UUID(user_id))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if not user.get('is_active'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is disabled"
            )
        
        return user
        
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


async def get_current_active_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Dependency для получения активного пользователя"""
    if not current_user.get('is_active'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


# ==================== SEARCH ENDPOINT ====================

@router.get("/search", response_model=List[UserResponse])
async def search_users(
    q: str = Query(..., description="Search query (username or email, min 2 chars, max 5 results)"),
    current_user: dict = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Поиск пользователей по username или email (для добавления в друзья)
    
    Возвращает максимум 5 результатов для лучшего UX.
    """
    
    if len(q.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query must be at least 2 characters long"
        )
    
    try:
        # Используем реальный поиск через AuthService
        users = await auth_service.search_users(q, exclude_user_id=current_user['id'])
        
        # Преобразуем в формат UserResponse
        user_responses = []
        for user in users:
            try:
                user_response = UserResponse(**user)
                user_responses.append(user_response)
            except Exception as e:
                logger.warning(f"Failed to create UserResponse for user {user.get('id')}: {e}")
                continue
        
        return user_responses
        
    except Exception as e:
        logger.error(f"Search users error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search users"
        )


# ==================== TEST ENDPOINT (временно) ====================

@router.get("/search-test", response_model=List[UserResponse])
async def search_users_test(
    q: str = Query(..., description="Search query (username or email, min 2 chars, max 5 results)"),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Временный endpoint для тестирования поиска без аутентификации
    
    Возвращает максимум 5 результатов для лучшего UX.
    """
    
    if len(q.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query must be at least 2 characters long"
        )
    
    try:
        # Используем реальный поиск через AuthService
        users = await auth_service.search_users(q)
        
        # Преобразуем в формат UserResponse
        user_responses = []
        for user in users:
            try:
                user_response = UserResponse(**user)
                user_responses.append(user_response)
            except Exception as e:
                logger.warning(f"Failed to create UserResponse for user {user.get('id')}: {e}")
                continue
        
        return user_responses
        
    except Exception as e:
        logger.error(f"Search users test error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search users"
        )


# ==================== USER PROFILE ENDPOINTS ====================

@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: dict = Depends(get_current_active_user)
):
    """Получение профиля текущего пользователя"""
    return UserResponse(**current_user)


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Обновление профиля текущего пользователя"""
    try:
        # Подготавливаем данные для обновления
        update_data = user_update.dict(exclude_unset=True)
        
        # Некоторые поля может обновлять только администратор
        restricted_fields = ['role', 'is_active', 'is_verified']
        for field in restricted_fields:
            if field in update_data:
                if current_user.get('role') != 'admin':
                    del update_data[field]
        
        # Обновляем пользователя
        updated_user = await auth_service.update_user(
            current_user['id'], 
            update_data
        )
        
        return UserResponse(**updated_user)
        
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update profile"
        )


@router.get("/me/full", response_model=UserProfile)
async def get_my_full_profile(
    current_user: dict = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Получение расширенного профиля с провайдерами и сессиями"""
    try:
        user_id = current_user['id']
        
        # Получаем активные сессии
        active_sessions = await auth_service.get_user_active_sessions(user_id)
        
        # TODO: Получаем провайдеры аутентификации
        # providers = await auth_service.get_user_providers(user_id)
        
        profile = UserProfile(
            **current_user,
            providers=[],  # TODO: Заполнить когда реализуем get_user_providers
            active_sessions_count=len(active_sessions)
        )
        
        return profile
        
    except Exception as e:
        logger.error(f"Full profile error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get full profile"
        )


# ==================== SESSION MANAGEMENT ====================

@router.get("/me/sessions", response_model=List[SessionResponse])
async def get_my_sessions(
    current_user: dict = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Получение всех активных сессий пользователя"""
    try:
        sessions = await auth_service.get_user_active_sessions(current_user['id'])
        
        session_responses = []
        for session in sessions:
            session_responses.append(SessionResponse(**session))
        
        return session_responses
        
    except Exception as e:
        logger.error(f"Get sessions error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get sessions"
        )


@router.delete("/me/sessions/{session_id}")
async def revoke_my_session(
    session_id: UUID,
    current_user: dict = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Отзыв конкретной сессии"""
    try:
        # Проверяем что сессия принадлежит пользователю
        session = await auth_service.get_session(session_id)
        if not session or session['user_id'] != current_user['id']:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        # Отзываем сессию
        await auth_service.revoke_session(session_id)
        
        return {"message": "Session revoked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Revoke session error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke session"
        )


@router.delete("/me/sessions")
async def revoke_all_my_sessions(
    current_user: dict = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Отзыв всех сессий пользователя (кроме текущей)"""
    try:
        # TODO: Исключить текущую сессию из отзыва
        await auth_service.revoke_all_user_sessions(current_user['id'])
        
        return {"message": "All sessions revoked successfully"}
        
    except Exception as e:
        logger.error(f"Revoke all sessions error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke sessions"
        )


# ==================== ADMIN ENDPOINTS ====================

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of users to return"),
    search: Optional[str] = Query(None, description="Search by username or email"),
    current_user: dict = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Получение списка пользователей (только для администраторов)"""
    
    # Проверяем права администратора
    if current_user.get('role') not in ['admin', 'moderator']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        # TODO: Реализовать поиск и пагинацию в AuthService
        # users = await auth_service.get_users(skip=skip, limit=limit, search=search)
        
        # Пока что возвращаем заглушку
        return []
        
    except Exception as e:
        logger.error(f"Get users error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get users"
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: dict = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Получение пользователя по ID (только для администраторов)"""
    
    # Пользователь может смотреть только свой профиль, админы - любой
    if str(user_id) != str(current_user['id']) and current_user.get('role') not in ['admin', 'moderator']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        user = await auth_service.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(**user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user"
        )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Обновление пользователя (только для администраторов)"""
    
    # Только администраторы могут редактировать других пользователей
    if str(user_id) != str(current_user['id']) and current_user.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        # Проверяем что пользователь существует
        user = await auth_service.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Подготавливаем данные для обновления
        update_data = user_update.dict(exclude_unset=True)
        
        # Обновляем пользователя
        updated_user = await auth_service.update_user(user_id, update_data)
        
        return UserResponse(**updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update user"
        )


@router.delete("/{user_id}")
async def delete_user(
    user_id: UUID,
    current_user: dict = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Деактивация пользователя (только для администраторов)"""
    
    # Только администраторы могут деактивировать пользователей
    if current_user.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Нельзя деактивировать самого себя
    if str(user_id) == str(current_user['id']):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself"
        )
    
    try:
        # Проверяем что пользователь существует
        user = await auth_service.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Деактивируем пользователя
        await auth_service.update_user(user_id, {'is_active': False})
        
        # Отзываем все сессии пользователя
        await auth_service.revoke_all_user_sessions(user_id)
        
        return {"message": "User deactivated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate user"
        )