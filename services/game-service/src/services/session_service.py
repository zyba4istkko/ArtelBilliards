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
        
        # Генерируем реальный UUID для сессии
        from uuid import uuid4
        session_id = uuid4()
        
        # Определяем game_type на основе template_id или используем дефолтный
        game_type_id = request.game_type_id or 1  # Дефолтный ID для kolkhoz
        
        return SessionResponse(
            id=session_id,
            creator_user_id=creator_user_id,
            game_type=GameTypeResponse(
                id=game_type_id,
                name="kolkhoz",
                display_name="Колхоз",
                description="Игра Колхоз с уникальной системой расчетов",
                default_rules={"point_value_rubles": 50.0},
                is_active=True
            ),
            template_id=request.template_id,  # template_id уже UUID из схемы
            name=request.name,
            status=SessionStatus.WAITING,
            max_players=request.max_players,
            current_players_count=1,
            rules=request.rules,
            participants=[
                SessionParticipantResponse(
                    id=uuid4(),  # Генерируем UUID для участника
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
    async def get_user_sessions(user_id: UUID, limit: int = 10, offset: int = 0, status: Optional[str] = None) -> List[SessionResponse]:
        """Получение списка сессий пользователя (stub)"""
        
        # Импортируем uuid4 для генерации
        from uuid import uuid4
        
        # Создаем несколько тестовых сессий с разными статусами
        demo_sessions = [
            SessionResponse(
                id=uuid4(),  # Генерируем реальный UUID
                creator_user_id=user_id,
                game_type=GameTypeResponse(
                    id=1,
                    name="kolkhoz",
                    display_name="Колхоз",
                    description="Игра Колхоз с уникальной системой расчетов",
                    default_rules={"point_value_rubles": 50.0},
                    is_active=True
                ),
                template_id=None,
                name="🎱 Колхоз с Игорем",
                status=SessionStatus.IN_PROGRESS,
                max_players=4,
                current_players_count=2,
                rules={"point_value_rubles": 50.0},
                participants=[
                    SessionParticipantResponse(
                        id=uuid4(),  # Генерируем реальный UUID
                        user_id=user_id,
                        display_name="Demo Player",
                        session_role=SessionRole.CREATOR,
                        is_empty_user=False,
                        joined_at=datetime.now(),
                        queue_position=1,
                        current_score=150,
                        is_active=True,
                        can_modify_settings=True,
                        can_kick_players=True,
                        can_change_rules=True,
                        session_balance_rubles=150.0,
                        total_games_played=3,
                        total_balls_potted=15
                    )
                ],
                created_at=datetime.now(),
                started_at=datetime.now(),
                completed_at=None,
                updated_at=datetime.now()
            ),
            SessionResponse(
                id=uuid4(),  # Генерируем реальный UUID
                creator_user_id=user_id,
                game_type=GameTypeResponse(
                    id=2,
                    name="americana",
                    display_name="Американка",
                    description="Классическая игра Американка",
                    default_rules={"point_value_rubles": 30.0},
                    is_active=True
                ),
                template_id=None,
                name="⚫ Американка",
                status=SessionStatus.WAITING,
                max_players=6,
                current_players_count=3,
                rules={"point_value_rubles": 30.0},
                participants=[
                    SessionParticipantResponse(
                        id=uuid4(),  # Генерируем реальный UUID
                        user_id=user_id,
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
            ),
            SessionResponse(
                id=uuid4(),  # Генерируем реальный UUID
                creator_user_id=user_id,
                game_type=GameTypeResponse(
                    id=3,
                    name="moscow_pyramid",
                    display_name="Московская пирамида",
                    description="Традиционная московская пирамида",
                    default_rules={"point_value_rubles": 40.0},
                    is_active=True
                ),
                template_id=None,
                name="🔺 Пирамида",
                status=SessionStatus.WAITING,
                max_players=8,
                current_players_count=5,
                rules={"point_value_rubles": 40.0},
                participants=[
                    SessionParticipantResponse(
                        id=uuid4(),  # Генерируем реальный UUID
                        user_id=user_id,
                        display_name="Demo Player",
                        session_role=SessionRole.CREATOR,
                        is_empty_user=False,
                        joined_at=datetime.now(),
                        queue_position=1,
                        current_score=80,
                        is_active=True,
                        can_modify_settings=True,
                        can_kick_players=True,
                        can_change_rules=True,
                        session_balance_rubles=80.0,
                        total_games_played=2,
                        total_balls_potted=8
                    )
                ],
                created_at=datetime.now(),
                started_at=datetime.now(),
                completed_at=None,
                updated_at=datetime.now()
            )
        ]
        
        # Фильтруем по статусу, если указан
        if status:
            demo_sessions = [s for s in demo_sessions if s.status == status]
        
        # Применяем пагинацию
        start_index = offset
        end_index = start_index + limit
        paginated_sessions = demo_sessions[start_index:end_index]
        
        return paginated_sessions

    @staticmethod
    async def get_session_players(session_id: UUID) -> List[SessionParticipantResponse]:
        """Получение списка игроков в сессии (stub)"""
        
        # Заглушка - возвращаем примерных игроков
        return [
            SessionParticipantResponse(
                id=UUID("87654321-4321-8765-cba9-987654321abc"),
                user_id=UUID("00000000-0000-0000-0000-000000000001"),
                display_name="Demo Player 1",
                session_role=SessionRole.CREATOR,
                is_empty_user=False,
                joined_at=datetime.now(),
                queue_position=1,
                current_score=15,
                is_active=True,
                can_modify_settings=True,
                can_kick_players=True,
                can_change_rules=True,
                session_balance_rubles=150.0,
                total_games_played=1,
                total_balls_potted=3
            ),
            SessionParticipantResponse(
                id=UUID("98765432-5432-9876-dcba-876543210cba"),
                user_id=UUID("00000000-0000-0000-0000-000000000002"),
                display_name="Demo Player 2",
                session_role=SessionRole.PARTICIPANT,
                is_empty_user=False,
                joined_at=datetime.now(),
                queue_position=2,
                current_score=8,
                is_active=True,
                can_modify_settings=False,
                can_kick_players=False,
                can_change_rules=False,
                session_balance_rubles=80.0,
                total_games_played=1,
                total_balls_potted=2
            ),
            SessionParticipantResponse(
                id=UUID("09876543-6543-0987-edcb-765432109dcb"),
                user_id=UUID("00000000-0000-0000-0000-000000000003"),
                display_name="Demo Player 3",
                session_role=SessionRole.PARTICIPANT,
                is_empty_user=False,
                joined_at=datetime.now(),
                queue_position=3,
                current_score=12,
                is_active=True,
                can_modify_settings=False,
                can_kick_players=False,
                can_change_rules=False,
                session_balance_rubles=120.0,
                total_games_played=1,
                total_balls_potted=4
            )
        ]