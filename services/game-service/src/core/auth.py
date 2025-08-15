"""
JWT Authentication Middleware for Game Service
"""

import jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import httpx
from ..core.config import settings

# Схема безопасности для JWT токенов
security = HTTPBearer()

async def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Проверяет JWT токен и возвращает payload
    ВРЕМЕННО: Упрощенная проверка без валидации подписи
    """
    try:
        token = credentials.credentials
        # ВРЕМЕННО: Декодируем JWT без проверки подписи для тестирования
        payload = jwt.decode(
            token,
            options={"verify_signature": False}
        )
        print(f"🔓 DEBUG: JWT payload decoded successfully: {payload}")
        return payload
    except Exception as e:
        print(f"❌ DEBUG: JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid JWT token: {str(e)}"
        )

async def get_current_user_id(payload: dict = Depends(verify_jwt_token)) -> str:
    """
    Извлекает ID пользователя из JWT payload
    """
    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id:
        print(f"❌ DEBUG: No user_id found in payload: {payload}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing user_id"
        )
    print(f"✅ DEBUG: User ID extracted successfully: {user_id}")
    return str(user_id)

async def get_current_user(payload: dict = Depends(verify_jwt_token)) -> str: # Changed return type to str
    """
    Возвращает ID пользователя как строку (для совместимости с UUID)
    ВРЕМЕННО: Не делаем запросы к auth-service
    """
    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing user_id"
        )
    # Temporarily return user_id as string, not full user object
    return str(user_id)
