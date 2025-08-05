"""
Session API Endpoints
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel

from ..models.schemas import (
    CreateSessionRequest, SessionResponse, SessionListResponse,
    JoinSessionRequest, InvitePlayerRequest, BaseResponse
)
from ..services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["sessions"])


# Dependency для получения текущего пользователя (заглушка)
async def get_current_user() -> UUID:
    """Получение текущего пользователя из JWT токена"""
    # TODO: Интеграция с Auth Service
    return UUID("00000000-0000-0000-0000-000000000001")


@router.post("/", response_model=SessionResponse)
async def create_session(
    request: CreateSessionRequest,
    current_user: UUID = Depends(get_current_user)
):
    """Создание новой игровой сессии"""
    try:
        return await SessionService.create_session(request, current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[SessionResponse])
async def get_user_sessions(
    current_user: UUID = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Получение списка сессий пользователя"""
    try:
        return await SessionService.get_user_sessions(current_user, limit, offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: UUID):
    """Получение детальной информации о сессии"""
    try:
        session = await SessionService.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{session_id}/join", response_model=SessionResponse)
async def join_session(
    session_id: UUID,
    request: JoinSessionRequest,
    current_user: UUID = Depends(get_current_user)
):
    """Присоединение к сессии"""
    try:
        return await SessionService.join_session(session_id, current_user, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{session_id}/leave", response_model=SessionResponse)
async def leave_session(
    session_id: UUID,
    current_user: UUID = Depends(get_current_user)
):
    """Покидание сессии"""
    try:
        return await SessionService.leave_session(session_id, current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{session_id}/invite", response_model=BaseResponse)
async def invite_player(
    session_id: UUID,
    request: InvitePlayerRequest,
    current_user: UUID = Depends(get_current_user)
):
    """Приглашение игрока в сессию"""
    try:
        # TODO: Реализовать логику приглашений
        return BaseResponse(
            success=True,
            message=f"Invitation sent to {request.display_name}"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: UUID,
    request: CreateSessionRequest,  # Используем ту же схему для обновления
    current_user: UUID = Depends(get_current_user)
):
    """Обновление настроек сессии"""
    try:
        # TODO: Реализовать обновление сессии
        session = await SessionService.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Проверяем права на изменение
        if session.creator_user_id != current_user:
            raise HTTPException(status_code=403, detail="Only session creator can modify settings")
        
        return session  # TODO: Реализовать обновление
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{session_id}", response_model=BaseResponse)
async def delete_session(
    session_id: UUID,
    current_user: UUID = Depends(get_current_user)
):
    """Удаление сессии"""
    try:
        # TODO: Реализовать удаление сессии
        session = await SessionService.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Проверяем права на удаление
        if session.creator_user_id != current_user:
            raise HTTPException(status_code=403, detail="Only session creator can delete session")
        
        return BaseResponse(
            success=True,
            message="Session deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")