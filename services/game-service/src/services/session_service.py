"""
Session Service - Управление игровыми сессиями
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID

# Database import removed - using direct connections now
from ..models.schemas import (
    CreateSessionRequest, SessionResponse, SessionParticipantResponse,
    JoinSessionRequest, InvitePlayerRequest, SessionStatus, SessionRole,
    GameTypeResponse
)


class SessionService:
    """Сервис для управления игровыми сессиями (stub implementation)"""
    
    @staticmethod
    async def create_session(request: CreateSessionRequest, creator_user_id: UUID) -> SessionResponse:
        """Создание новой игровой сессии (stub)"""
        
        # Временная заглушка - возвращаем примерную сессию
        session_id = UUID("12345678-1234-5678-9abc-123456789abc")
        
        return SessionResponse(
            id=session_id,
            creator_user_id=creator_user_id,
            game_type=GameTypeResponse(
                id=request.game_type_id,
                name="kolkhoz",
                display_name="Колхоз",
                description="Игра Колхоз с уникальной системой расчетов",
                default_rules={"point_value_rubles": 50.0},
                is_active=True
            ),
            template_id=request.template_id,
            name=request.name,
            status=SessionStatus.WAITING,
            max_players=request.max_players,
            current_players_count=1,
            rules=request.rules,
            participants=[
                SessionParticipantResponse(
                    id=UUID("87654321-4321-8765-cba9-987654321abc"),
                    user_id=creator_user_id,
                    display_name="Creator",
                    session_role=SessionRole.CREATOR,
                    is_empty_user=False,
                    joined_at=datetime.now(),
                    queue_position=1,
                    current_score=0,
                    is_active=True,
                    can_modify_settings=True,
                    can_kick_players=True,
                    can_change_rules=True,
                    session_balance_rubles=0.0,
                    total_games_played=0,
                    total_balls_potted=0
                )
            ],
            created_at=datetime.now(),
            started_at=None,
            completed_at=None,
            updated_at=datetime.now()
        )
    
    @staticmethod
    async def get_session(session_id: UUID) -> Optional[SessionResponse]:
        """Получение детальной информации о сессии (stub)"""
        
        # Заглушка - возвращаем примерную сессию
        return SessionResponse(
            id=session_id,
            creator_user_id=UUID("00000000-0000-0000-0000-000000000001"),
            game_type=GameTypeResponse(
                id=1,
                name="kolkhoz",
                display_name="Колхоз",
                description="Игра Колхоз с уникальной системой расчетов",
                default_rules={"point_value_rubles": 50.0},
                is_active=True
            ),
            template_id=None,
            name="Демо сессия",
            status=SessionStatus.WAITING,
            max_players=4,
            current_players_count=1,
            rules={"point_value_rubles": 50.0},
            participants=[
                SessionParticipantResponse(
                    id=UUID("87654321-4321-8765-cba9-987654321abc"),
                    user_id=UUID("00000000-0000-0000-0000-000000000001"),
                    display_name="Demo Player",
                    session_role=SessionRole.CREATOR,
                    is_empty_user=False,
                    joined_at=datetime.now(),
                    queue_position=1,
                    current_score=0,
                    is_active=True,
                    can_modify_settings=True,
                    can_kick_players=True,
                    can_change_rules=True,
                    session_balance_rubles=0.0,
                    total_games_played=0,
                    total_balls_potted=0
                )
            ],
            created_at=datetime.now(),
            started_at=None,
            completed_at=None,
            updated_at=datetime.now()
        )
    
    @staticmethod
    async def join_session(session_id: UUID, user_id: UUID, request: JoinSessionRequest) -> SessionResponse:
        """Присоединение к сессии (stub)"""
        
        # Заглушка - просто возвращаем сессию
        return await SessionService.get_session(session_id)
    
    @staticmethod
    async def leave_session(session_id: UUID, user_id: UUID) -> SessionResponse:
        """Покидание сессии (stub)"""
        
        # Заглушка - просто возвращаем сессию
        return await SessionService.get_session(session_id)
    
    @staticmethod
    async def get_user_sessions(user_id: UUID, limit: int = 10, offset: int = 0) -> List[SessionResponse]:
        """Получение списка сессий пользователя (stub)"""
        
        # Заглушка - возвращаем одну демо сессию
        session = await SessionService.get_session(UUID("12345678-1234-5678-9abc-123456789abc"))
        return [session] if session else []