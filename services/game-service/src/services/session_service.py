"""
Session Service - Управление игровыми сессиями
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

# Database import removed - using direct connections now
from ..models.schemas import (
    CreateSessionRequest, SessionResponse, SessionParticipantResponse,
    JoinSessionRequest, InvitePlayerRequest, SessionStatus, SessionRole,
    GameTypeResponse
)
from ..models.database import GameSession, SessionParticipant, GameType


class SessionService:
    """Сервис для управления игровыми сессиями (stub implementation)"""
    
    @staticmethod
    async def _ensure_game_types_exist(db: AsyncSession):
        """Убеждаемся что базовые типы игр существуют в базе данных"""
        # Проверяем есть ли уже типы игр
        from sqlalchemy import select
        game_types_query = await db.execute(select(GameType))
        existing_types = game_types_query.scalars().all()
        
        if not existing_types:
            # Создаем базовые типы игр
            basic_types = [
                GameType(
                    id=1,
                    name="kolkhoz",
                    display_name="Колхоз",
                    description="Игра Колхоз с уникальной системой расчетов",
                    default_rules={"point_value_rubles": 50.0},
                    is_active=True
                ),
                GameType(
                    id=2,
                    name="americana",
                    display_name="Американка",
                    description="Классическая игра Американка",
                    default_rules={"point_value_rubles": 30.0},
                    is_active=True
                ),
                GameType(
                    id=3,
                    name="moscow_pyramid",
                    display_name="Московская пирамида",
                    description="Традиционная московская пирамида",
                    default_rules={"point_value_rubles": 40.0},
                    is_active=True
                )
            ]
            
            for game_type in basic_types:
                db.add(game_type)
            
            await db.commit()
    
    @staticmethod
    async def create_session(db: AsyncSession, request: CreateSessionRequest, creator_user_id: UUID) -> SessionResponse:
        """Создание новой игровой сессии"""
        
        # Убеждаемся что базовые типы игр существуют
        await SessionService._ensure_game_types_exist(db)
        
        # Генерируем реальный UUID для сессии
        from uuid import uuid4
        session_id = uuid4()
        
        # Определяем game_type на основе template_id или используем дефолтный
        game_type_id = request.game_type_id or 1  # Дефолтный ID для kolkhoz
        
        # Сохраняем сессию в базу данных
        db_session = GameSession(
            id=session_id,
            creator_user_id=creator_user_id,
            game_type_id=game_type_id,
            template_id=request.template_id,
            name=request.name or "Новая сессия",
            status="waiting",
            max_players=request.max_players,
            current_players_count=1,
            rules=request.rules or {"point_value_rubles": 50.0}
        )
        db.add(db_session)
        
        # Создаем участника
        participant = SessionParticipant(
            session_id=session_id,
            user_id=creator_user_id,
            display_name=request.creator_display_name or "Игрок",  # Используем реальное имя создателя
            session_role="creator",
            is_empty_user=False,
            queue_position=1,
            can_modify_settings=True,
            can_kick_players=True,
            can_change_rules=True
        )
        db.add(participant)
        
        # Автоматически добавляем бота с реальным именем
        bot_participant = SessionParticipant(
            session_id=session_id,
            user_id=None,  # У бота нет user_id
            display_name=request.bot_display_name or "Бот Игорь",  # Используем реальное имя бота
            session_role="participant",
            is_empty_user=True,  # Это бот
            queue_position=2,
            can_modify_settings=False,
            can_kick_players=False,
            can_change_rules=False
        )
        db.add(bot_participant)
        
        await db.commit()
        await db.refresh(db_session)
        await db.refresh(participant)
        await db.refresh(bot_participant)
        
        # Возвращаем созданную сессию
        session = SessionResponse(
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
            template_id=request.template_id,
            name=request.name or "Новая сессия",
            status=SessionStatus.WAITING,
            max_players=request.max_players,
            current_players_count=2,  # Теперь 2 участника
            rules=request.rules or {"point_value_rubles": 50.0},
            participants=[
                SessionParticipantResponse(
                    id=participant.id,
                    user_id=creator_user_id,
                    display_name=participant.display_name,
                    session_role=SessionRole(participant.session_role),
                    is_empty_user=participant.is_empty_user,
                    joined_at=participant.joined_at,
                    queue_position=1,
                    current_score=0,
                    is_active=True,
                    can_modify_settings=True,
                    can_kick_players=True,
                    can_change_rules=True,
                    session_balance_rubles=0.0,
                    total_games_played=0,
                    total_balls_potted=0
                ),
                SessionParticipantResponse(
                    id=bot_participant.id,
                    user_id=None,  # У бота нет user_id
                    display_name=bot_participant.display_name,
                    session_role=SessionRole(bot_participant.session_role),
                    is_empty_user=bot_participant.is_empty_user,
                    joined_at=bot_participant.joined_at,
                    queue_position=2,
                    current_score=0,
                    is_active=True,
                    can_modify_settings=False,
                    can_kick_players=False,
                    can_change_rules=False,
                    session_balance_rubles=0.0,
                    total_games_played=0,
                    total_balls_potted=0
                )
            ],
            created_at=db_session.created_at,
            started_at=None,
            completed_at=None,
            updated_at=db_session.updated_at
        )
        
        return session
    
    @staticmethod
    async def get_session(db: AsyncSession, session_id: UUID) -> Optional[SessionResponse]:
        """Получение детальной информации о сессии"""
        
        # Читаем сессию из базы данных
        # Получаем сессию
        db_session = await db.get(GameSession, session_id)
        if not db_session:
            return None
        
        # Получаем участников сессии
        from sqlalchemy import select
        participants_query = await db.execute(
            select(SessionParticipant)
            .where(SessionParticipant.session_id == session_id)
            .where(SessionParticipant.is_active == True)
            .order_by(SessionParticipant.queue_position)
        )
        db_participants = participants_query.scalars().all()
        
        # Получаем тип игры
        game_type_query = await db.execute(
            select(GameType)
            .where(GameType.id == db_session.game_type_id)
        )
        db_game_type = game_type_query.scalar_one_or_none()
        
        if not db_game_type:
            return None
        
        # Преобразуем в Pydantic модели
        participants = []
        for db_participant in db_participants:
            participant = SessionParticipantResponse(
                id=db_participant.id,
                user_id=db_participant.user_id,
                display_name=db_participant.display_name,
                session_role=SessionRole(db_participant.session_role),
                is_empty_user=db_participant.is_empty_user,
                joined_at=db_participant.joined_at,
                queue_position=db_participant.queue_position,
                current_score=db_participant.current_score,
                is_active=db_participant.is_active,
                can_modify_settings=db_participant.can_modify_settings,
                can_kick_players=db_participant.can_kick_players,
                can_change_rules=db_participant.can_change_rules,
                session_balance_rubles=float(db_participant.session_balance_rubles) if db_participant.session_balance_rubles else 0.0,
                total_games_played=db_participant.total_games_played,
                total_balls_potted=db_participant.total_balls_potted
            )
            participants.append(participant)
        
        # Создаем ответ
        session = SessionResponse(
            id=db_session.id,
            creator_user_id=db_session.creator_user_id,
            game_type=GameTypeResponse(
                id=db_game_type.id,
                name=db_game_type.name,
                display_name=db_game_type.display_name,
                description=db_game_type.description,
                default_rules=db_game_type.default_rules,
                is_active=db_game_type.is_active
            ),
            template_id=db_session.template_id,
            name=db_session.name,
            status=SessionStatus(db_session.status),
            max_players=db_session.max_players,
            current_players_count=db_session.current_players_count,
            rules=db_session.rules,
            participants=participants,
            created_at=db_session.created_at,
            started_at=db_session.started_at,
            completed_at=db_session.completed_at,
            updated_at=db_session.updated_at
        )
        
        return session
    
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
    async def get_session_players(db: AsyncSession, session_id: UUID) -> List[SessionParticipantResponse]:
        """Получение списка игроков в сессии"""
        
        # Читаем участников сессии из базы данных
        from sqlalchemy import select
        participants_query = await db.execute(
            select(SessionParticipant)
            .where(SessionParticipant.session_id == session_id)
            .where(SessionParticipant.is_active == True)
            .order_by(SessionParticipant.queue_position)
        )
        db_participants = participants_query.scalars().all()
        
        # Преобразуем в Pydantic модели
        participants = []
        for db_participant in db_participants:
            participant = SessionParticipantResponse(
                id=db_participant.id,
                user_id=db_participant.user_id,
                display_name=db_participant.display_name,
                session_role=SessionRole(db_participant.session_role),
                is_empty_user=db_participant.is_empty_user,
                joined_at=db_participant.joined_at,
                queue_position=db_participant.queue_position,
                current_score=db_participant.current_score,
                is_active=db_participant.is_active,
                can_modify_settings=db_participant.can_modify_settings,
                can_kick_players=db_participant.can_kick_players,
                can_change_rules=db_participant.can_change_rules,
                session_balance_rubles=float(db_participant.session_balance_rubles) if db_participant.session_balance_rubles else 0.0,
                total_games_played=db_participant.total_games_played,
                total_balls_potted=db_participant.total_balls_potted
            )
            participants.append(participant)
        
        return participants