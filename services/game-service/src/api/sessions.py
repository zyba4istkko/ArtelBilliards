"""
Session API Endpoints
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel

from ..models.schemas import (
    CreateSessionRequest, UpdateSessionRequest, SessionResponse, SessionListResponse,
    JoinSessionRequest, InvitePlayerRequest, BaseResponse, SessionParticipantResponse
)
from ..services.session_service import SessionService
from ..core.database import get_db
from ..core.auth import get_current_user_id, get_current_user
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse)
async def create_session(
    request: CreateSessionRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Создание новой игровой сессии"""
    try:
        return await SessionService.create_session(db, request, current_user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("", response_model=List[SessionResponse])
async def get_user_sessions(
    current_user_id: str = Depends(get_current_user_id),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Получение списка сессий пользователя"""
    try:
        return await SessionService.get_user_sessions(current_user_id, limit, offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/filter", response_model=List[SessionResponse])
async def get_sessions_by_status(
    status: Optional[str] = Query(None, description="Статус сессии"),
    user_id: Optional[UUID] = Query(None, description="ID пользователя"),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    """Получение сессий по фильтрам (статус, пользователь)"""
    try:
        # Если user_id не указан, используем текущего пользователя
        if not user_id:
            user_id = current_user_id
        
        # Получаем сессии с фильтрацией из базы данных
        sessions = await SessionService.get_user_sessions(db, user_id, limit, offset, status)
        
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: UUID, db: AsyncSession = Depends(get_db)):
    """Получение детальной информации о сессии"""
    try:
        session = await SessionService.get_session(db, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{session_id}/players", response_model=List[SessionParticipantResponse])
async def get_session_players(session_id: UUID, db: AsyncSession = Depends(get_db)):
    """Получение списка игроков в сессии"""
    try:
        players = await SessionService.get_session_participants(db, session_id)
        return players
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{session_id}/join", response_model=SessionResponse)
async def join_session(
    session_id: UUID,
    request: JoinSessionRequest,
    current_user: str = Depends(get_current_user)
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
    current_user: str = Depends(get_current_user)
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
    current_user: str = Depends(get_current_user)
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


@router.post("/{session_id}/players", response_model=BaseResponse)
async def add_player_to_session(
    session_id: UUID,
    request: InvitePlayerRequest,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Добавление игрока в сессию"""
    try:
        # Добавляем игрока через SessionService
        await SessionService.add_player_to_session(db, session_id, request, current_user)
        
        return BaseResponse(
            success=True,
            message=f"Player {request.display_name} added to session"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{session_id}/bots", response_model=SessionParticipantResponse)
async def add_bot_to_session(
    session_id: UUID,
    request: dict,  # {"bot_name": "string"}
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Добавление бота в сессию"""
    try:
        bot_name = request.get("bot_name")
        if not bot_name:
            raise HTTPException(status_code=400, detail="bot_name is required")
        
        # Добавляем бота через SessionService
        bot = await SessionService.add_bot_to_session(db, session_id, bot_name, current_user)
        
        return bot
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{session_id}/participants/{participant_id}", response_model=BaseResponse)
async def remove_participant_from_session(
    session_id: UUID,
    participant_id: UUID,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удаление участника из сессии"""
    try:
        # Удаляем участника через SessionService
        await SessionService.remove_participant_from_session(db, session_id, participant_id, current_user)
        
        return BaseResponse(
            success=True,
            message="Participant removed from session"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{session_id}/start", response_model=SessionResponse)
async def start_session(
    session_id: UUID,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Запуск сессии (изменение статуса на in_progress)"""
    try:
        # Запускаем сессию через SessionService
        updates = {"status": "in_progress"}
        return await SessionService.update_session(db, session_id, updates, current_user)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: UUID,
    request: UpdateSessionRequest,  # Используем новую схему для обновления
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновление настроек сессии"""
    try:
        # Фильтруем только непустые поля для обновления
        updates = {}
        if request.name is not None:
            updates["name"] = request.name
        if request.template_id is not None:
            updates["template_id"] = request.template_id
        if request.max_players is not None:
            updates["max_players"] = request.max_players
        if request.description is not None:
            updates["description"] = request.description
        if request.rules is not None:
            updates["rules"] = request.rules
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Обновляем сессию через SessionService
        return await SessionService.update_session(db, session_id, updates, current_user)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{session_id}", response_model=BaseResponse)
async def delete_session(
    session_id: UUID,
    current_user: str = Depends(get_current_user)
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