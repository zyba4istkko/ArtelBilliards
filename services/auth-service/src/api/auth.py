"""
Authentication endpoints для Auth Service
"""

from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import Optional
import logging

from ..core.config import settings
from ..models.schemas import (
    TelegramAuthRequest, GoogleAuthRequest, EmailAuthRequest,
    AuthResponse, RefreshTokenRequest, LogoutRequest,
    ErrorResponse, UserResponse
)
from ..services.auth import AuthService
from ..services.telegram import TelegramAuthService
from ..services.google import GoogleAuthService
from ..core.security import JWTManager
from ..core.database import database

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)


async def get_auth_service() -> AuthService:
    """Dependency для получения Auth Service"""
    return AuthService(database)


async def get_telegram_service() -> TelegramAuthService:
    """Dependency для получения Telegram Auth Service"""
    return TelegramAuthService(settings.TELEGRAM_BOT_TOKEN)


async def get_google_service() -> GoogleAuthService:
    """Dependency для получения Google Auth Service"""
    return GoogleAuthService(
        settings.GOOGLE_CLIENT_ID,
        settings.GOOGLE_CLIENT_SECRET
    )


async def get_jwt_manager() -> JWTManager:
    """Dependency для получения JWT Manager"""
    return JWTManager(
        secret_key=settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
        access_token_expire_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )


@router.post("/telegram", response_model=AuthResponse)
async def telegram_auth(
    request: TelegramAuthRequest,
    http_request: Request,
    auth_service: AuthService = Depends(get_auth_service),
    telegram_service: TelegramAuthService = Depends(get_telegram_service),
    jwt_manager: JWTManager = Depends(get_jwt_manager)
):
    """Аутентификация через Telegram Mini App"""
    try:
        # Валидируем данные от Telegram
        telegram_data = await telegram_service.validate_init_data(request.init_data)
        
        if not telegram_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Telegram data"
            )
        
        # Получаем или создаем пользователя
        user = await auth_service.get_or_create_telegram_user(telegram_data)
        
        # Создаем сессию
        session = await auth_service.create_session(
            user_id=user.id,
            ip_address=http_request.client.host,
            user_agent=http_request.headers.get("user-agent"),
            device_info={
                "platform": "telegram",
                "start_param": request.start_param
            }
        )
        
        # Генерируем токены
        access_token = jwt_manager.create_access_token(
            data={"user_id": str(user.id), "session_id": str(session.id)}
        )
        refresh_token = jwt_manager.create_refresh_token(
            data={"user_id": str(user.id), "session_id": str(session.id)}
        )
        
        # Сохраняем токены в сессии
        await auth_service.update_session_tokens(session.id, access_token, refresh_token)
        
        # Логируем успешный вход
        await auth_service.log_auth_event(
            user_id=user.id,
            action="telegram_login",
            ip_address=http_request.client.host,
            user_agent=http_request.headers.get("user-agent"),
            success=True,
            provider="telegram"
        )
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.from_orm(user)
        )
        
    except Exception as e:
        logger.error(f"Telegram auth error: {e}")
        
        # Логируем неудачную попытку
        await auth_service.log_auth_event(
            user_id=None,
            action="telegram_login",
            ip_address=http_request.client.host,
            user_agent=http_request.headers.get("user-agent"),
            success=False,
            error_message=str(e),
            provider="telegram"
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


@router.post("/google", response_model=AuthResponse)
async def google_auth(
    request: GoogleAuthRequest,
    http_request: Request,
    auth_service: AuthService = Depends(get_auth_service),
    google_service: GoogleAuthService = Depends(get_google_service),
    jwt_manager: JWTManager = Depends(get_jwt_manager)
):
    """Аутентификация через Google OAuth"""
    try:
        # Валидируем Google ID токен
        google_data = await google_service.validate_id_token(request.id_token)
        
        if not google_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )
        
        # Получаем или создаем пользователя
        user = await auth_service.get_or_create_google_user(google_data)
        
        # Создаем сессию
        session = await auth_service.create_session(
            user_id=user.id,
            ip_address=http_request.client.host,
            user_agent=http_request.headers.get("user-agent"),
            device_info={"platform": "google"}
        )
        
        # Генерируем токены
        access_token = jwt_manager.create_access_token(
            data={"user_id": str(user.id), "session_id": str(session.id)}
        )
        refresh_token = jwt_manager.create_refresh_token(
            data={"user_id": str(user.id), "session_id": str(session.id)}
        )
        
        # Сохраняем токены в сессии
        await auth_service.update_session_tokens(session.id, access_token, refresh_token)
        
        # Логируем успешный вход
        await auth_service.log_auth_event(
            user_id=user.id,
            action="google_login",
            ip_address=http_request.client.host,
            user_agent=http_request.headers.get("user-agent"),
            success=True,
            provider="google"
        )
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.from_orm(user)
        )
        
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        
        # Логируем неудачную попытку
        await auth_service.log_auth_event(
            user_id=None,
            action="google_login",
            ip_address=http_request.client.host,
            user_agent=http_request.headers.get("user-agent"),
            success=False,
            error_message=str(e),
            provider="google"
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
    jwt_manager: JWTManager = Depends(get_jwt_manager)
):
    """Обновление access токена используя refresh токен"""
    try:
        # Валидируем refresh токен
        payload = jwt_manager.decode_refresh_token(request.refresh_token)
        user_id = payload.get("user_id")
        session_id = payload.get("session_id")
        
        if not user_id or not session_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Проверяем сессию
        session = await auth_service.get_session(session_id)
        if not session or session.refresh_token != request.refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session"
            )
        
        # Получаем пользователя
        user = await auth_service.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Генерируем новые токены
        access_token = jwt_manager.create_access_token(
            data={"user_id": str(user.id), "session_id": str(session.id)}
        )
        new_refresh_token = jwt_manager.create_refresh_token(
            data={"user_id": str(user.id), "session_id": str(session.id)}
        )
        
        # Обновляем токены в сессии
        await auth_service.update_session_tokens(session.id, access_token, new_refresh_token)
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.from_orm(user)
        )
        
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )


@router.post("/logout")
async def logout(
    request: LogoutRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service),
    jwt_manager: JWTManager = Depends(get_jwt_manager)
):
    """Выход из системы"""
    try:
        # Декодируем токен
        payload = jwt_manager.decode_access_token(credentials.credentials)
        user_id = payload.get("user_id")
        session_id = payload.get("session_id")
        
        if request.all_sessions:
            # Закрываем все сессии пользователя
            await auth_service.revoke_all_user_sessions(user_id)
        else:
            # Закрываем конкретную сессию
            target_session_id = request.session_id or session_id
            await auth_service.revoke_session(target_session_id)
        
        # Логируем выход
        await auth_service.log_auth_event(
            user_id=user_id,
            action="logout",
            success=True,
            metadata={"all_sessions": request.all_sessions}
        )
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logout failed"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service),
    jwt_manager: JWTManager = Depends(get_jwt_manager)
):
    """Получение информации о текущем пользователе"""
    try:
        # Декодируем токен
        payload = jwt_manager.decode_access_token(credentials.credentials)
        user_id = payload.get("user_id")
        
        # Получаем пользователя
        user = await auth_service.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse.from_orm(user)
        
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )