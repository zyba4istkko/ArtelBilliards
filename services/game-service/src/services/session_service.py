"""
Session Service - Управление игровыми сессиями
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

# Database import removed - using direct connections now
from ..models.schemas import (
    CreateSessionRequest, UpdateSessionRequest, SessionResponse, SessionParticipantResponse,
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
            display_name=request.creator_display_name or "Пользователь",  # 🔄 ИСПРАВЛЯЕМ: Используем реальное имя или "Пользователь"
            session_role="creator",
            is_empty_user=False,
            queue_position=1,
            can_modify_settings=True,
            can_kick_players=True,
            can_change_rules=True
        )
        db.add(participant)
        
        # 🔄 УБИРАЕМ: Автоматическое добавление бота
        # Теперь только создатель сессии добавляется автоматически
        
        await db.commit()
        await db.refresh(db_session)
        await db.refresh(participant)
        
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
            current_players_count=1,  # Теперь только 1 участник (создатель)
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
    async def get_user_sessions(db: AsyncSession, user_id: UUID, limit: int = 10, offset: int = 0, status: Optional[str] = None) -> List[SessionResponse]:
        """Получение списка сессий пользователя из базы данных"""
        try:
            print(f"🔍 get_user_sessions: user_id={user_id}, status={status}, limit={limit}, offset={offset}")
            
            # Строим запрос для получения сессий пользователя
            from sqlalchemy import select, or_
            
            # Базовый запрос - сессии где пользователь является создателем или участником
            # Исключаем JSON поля из UNION запроса
            creator_query = select(
                GameSession.id,
                GameSession.creator_user_id,
                GameSession.game_type_id,
                GameSession.template_id,
                GameSession.name,
                GameSession.status,
                GameSession.max_players,
                GameSession.current_players_count,
                GameSession.created_at,
                GameSession.started_at,
                GameSession.completed_at,
                GameSession.updated_at
            ).where(GameSession.creator_user_id == user_id)
            
            participant_query = select(
                GameSession.id,
                GameSession.creator_user_id,
                GameSession.game_type_id,
                GameSession.template_id,
                GameSession.name,
                GameSession.status,
                GameSession.max_players,
                GameSession.current_players_count,
                GameSession.created_at,
                GameSession.started_at,
                GameSession.completed_at,
                GameSession.updated_at
            ).join(
                SessionParticipant,
                SessionParticipant.session_id == GameSession.id
            ).where(
                SessionParticipant.user_id == user_id,
                SessionParticipant.is_active == True
            )
            
            # Объединяем запросы
            base_query = creator_query.union(participant_query)
            
            # Добавляем фильтр по статусу если указан
            if status:
                print(f"🔍 Применяем фильтр по статусу: {status}")
                # Применяем фильтр к каждому подзапросу
                creator_query = creator_query.where(GameSession.status == status)
                participant_query = participant_query.where(GameSession.status == status)
                base_query = creator_query.union(participant_query)
            else:
                print(f"🔍 Фильтр по статусу не указан - возвращаем все сессии")
            
            # Добавляем пагинацию
            base_query = base_query.offset(offset).limit(limit)
            
            print(f"🔍 Выполняем SQL запрос...")
            # Выполняем запрос
            result = await db.execute(base_query)
            db_sessions = result.all()
            print(f"🔍 Найдено сессий: {len(db_sessions)}")
            
            # Преобразуем в Pydantic модели
            sessions = []
            for db_session_row in db_sessions:
                try:
                    session_id = db_session_row[0]  # id
                    print(f"🔍 Обрабатываем сессию: {session_id}")
                    
                    # Получаем полную информацию о сессии включая JSON поля
                    full_session_query = await db.execute(
                        select(GameSession).where(GameSession.id == session_id)
                    )
                    db_session = full_session_query.scalar_one()
                    
                    # Получаем участников сессии
                    participants_query = await db.execute(
                        select(SessionParticipant)
                        .where(SessionParticipant.session_id == session_id)
                        .where(SessionParticipant.is_active == True)
                        .order_by(SessionParticipant.queue_position)
                    )
                    db_participants = participants_query.scalars().all()
                    print(f"🔍 Участников в сессии: {len(db_participants)}")
                    
                    # Получаем тип игры
                    game_type_query = await db.execute(
                        select(GameType)
                        .where(GameType.id == db_session.game_type_id)
                    )
                    db_game_type = game_type_query.scalar_one_or_none()
                    
                    if not db_game_type:
                        print(f"⚠️ Тип игры не найден для сессии {session_id}")
                        continue
                    
                    # Преобразуем участников
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
                    
                    # Создаем SessionResponse
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
                    sessions.append(session)
                    print(f"✅ Сессия {session_id} успешно обработана")
                    
                except Exception as e:
                    print(f"❌ Ошибка при обработке сессии {session_id if 'session_id' in locals() else 'unknown'}: {e}")
                    continue
            
            print(f"✅ get_user_sessions завершен успешно, возвращаем {len(sessions)} сессий")
            return sessions
            
        except Exception as e:
            print(f"❌ Критическая ошибка в get_user_sessions: {e}")
            import traceback
            traceback.print_exc()
            raise

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

    @staticmethod
    async def get_session_participants(db: AsyncSession, session_id: UUID) -> List[SessionParticipantResponse]:
        """Получение списка участников сессии"""
        try:
            # Получаем участников сессии из базы данных
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
            
            print(f"✅ Получено {len(participants)} участников для сессии {session_id}")
            return participants
            
        except Exception as e:
            print(f"❌ Ошибка при получении участников сессии {session_id}: {e}")
            raise

    @staticmethod
    async def add_bot_to_session(db: AsyncSession, session_id: UUID, bot_name: str, current_user_id: str) -> SessionParticipantResponse:
        """Добавление бота в сессию"""
        try:
            print(f"🔍 DEBUG: add_bot_to_session - session_id={session_id}, bot_name={bot_name}, current_user_id={current_user_id}")
            
            # Получаем сессию из базы
            from sqlalchemy import select
            session_query = await db.execute(
                select(GameSession).where(GameSession.id == session_id)
            )
            db_session = session_query.scalar_one_or_none()
            
            if not db_session:
                raise ValueError("Session not found")
            
            print(f"🔍 DEBUG: Found session - creator_user_id={db_session.creator_user_id}, type={type(db_session.creator_user_id)}")
            print(f"🔍 DEBUG: Current user_id={current_user_id}, type={type(current_user_id)}")
            
            # Приводим current_user_id к UUID для сравнения
            from uuid import UUID as UUIDType
            current_user_uuid = UUIDType(current_user_id)
            print(f"🔍 DEBUG: Converted current_user_uuid={current_user_uuid}, type={type(current_user_uuid)}")
            print(f"🔍 DEBUG: Comparison result: {db_session.creator_user_id == current_user_uuid}")
            
            # Проверяем права на добавление ботов
            if db_session.creator_user_id != current_user_uuid:
                print(f"❌ DEBUG: Access denied! Session creator: {db_session.creator_user_id}, Current user: {current_user_uuid}")
                raise ValueError("Only session creator can add bots")
            
            print(f"✅ DEBUG: Access granted! User {current_user_id} is session creator")
            
            # Проверяем что сессия не в процессе игры
            if db_session.status == "in_progress":
                raise ValueError("Cannot add bots while game is in progress")
            
            # Проверяем что не превышен лимит игроков
            if db_session.current_players_count >= db_session.max_players:
                raise ValueError(f"Session is full (max {db_session.max_players} players)")
            
            # Получаем следующую позицию в очереди
            max_position_query = await db.execute(
                select(SessionParticipant.queue_position)
                .where(SessionParticipant.session_id == session_id)
                .where(SessionParticipant.is_active == True)
                .order_by(SessionParticipant.queue_position.desc())
                .limit(1)  # 🔄 ИСПРАВЛЯЕМ: Добавляем limit(1) чтобы гарантировать одну строку
            )
            max_position_result = max_position_query.scalar_one_or_none()
            next_position = (max_position_result or 0) + 1
            
            # Создаем нового бота-участника
            from uuid import uuid4
            new_bot = SessionParticipant(
                id=uuid4(),
                session_id=session_id,
                user_id=None,  # У бота нет user_id
                display_name=bot_name,
                session_role="participant",
                is_empty_user=True,  # Это бот
                queue_position=next_position,
                can_modify_settings=False,
                can_kick_players=False,
                can_change_rules=False
            )
            db.add(new_bot)
            
            # Обновляем количество игроков в сессии
            db_session.current_players_count += 1
            
            # Сохраняем изменения
            await db.commit()
            await db.refresh(new_bot)
            await db.refresh(db_session)
            
            print(f"✅ Бот {bot_name} добавлен в сессию {session_id}")
            
            # Возвращаем созданного бота
            return SessionParticipantResponse(
                id=new_bot.id,
                user_id=new_bot.user_id,
                display_name=new_bot.display_name,
                session_role=SessionRole(new_bot.session_role),
                is_empty_user=new_bot.is_empty_user,
                joined_at=new_bot.joined_at,
                queue_position=new_bot.queue_position,
                current_score=new_bot.current_score,
                is_active=new_bot.is_active,
                can_modify_settings=new_bot.can_modify_settings,
                can_kick_players=new_bot.can_kick_players,
                can_change_rules=new_bot.can_change_rules,
                session_balance_rubles=float(new_bot.session_balance_rubles) if new_bot.session_balance_rubles else 0.0,
                total_games_played=new_bot.total_games_played,
                total_balls_potted=new_bot.total_balls_potted
            )
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Ошибка при добавлении бота в сессию {session_id}: {e}")
            raise

    @staticmethod
    async def remove_participant_from_session(db: AsyncSession, session_id: UUID, participant_id: UUID, current_user_id: str) -> None:
        """Удаление участника из сессии"""
        try:
            # Получаем сессию из базы
            from sqlalchemy import select
            session_query = await db.execute(
                select(GameSession).where(GameSession.id == session_id)
            )
            db_session = session_query.scalar_one_or_none()
            
            if not db_session:
                raise ValueError("Session not found")
            
            # Приводим current_user_id к UUID для сравнения
            from uuid import UUID as UUIDType
            current_user_uuid = UUIDType(current_user_id)
            
            # Проверяем права на удаление участников
            if db_session.creator_user_id != current_user_uuid:
                raise ValueError("Only session creator can remove participants")
            
            # Проверяем что сессия не в процессе игры
            if db_session.status == "in_progress":
                raise ValueError("Cannot remove participants while game is in progress")
            
            # Получаем участника для удаления
            participant_query = await db.execute(
                select(SessionParticipant)
                .where(SessionParticipant.id == participant_id)
                .where(SessionParticipant.session_id == session_id)
                .where(SessionParticipant.is_active == True)
            )
            db_participant = participant_query.scalar_one_or_none()
            
            if not db_participant:
                raise ValueError("Participant not found")
            
            # Нельзя удалить создателя сессии
            if db_participant.session_role == "creator":
                raise ValueError("Cannot remove session creator")
            
            # Помечаем участника как неактивного
            db_participant.is_active = False
            db_participant.left_at = datetime.utcnow()
            
            # Обновляем количество игроков в сессии
            db_session.current_players_count -= 1
            
            # Сохраняем изменения
            await db.commit()
            await db.refresh(db_session)
            
            print(f"✅ Участник {db_participant.display_name} удален из сессии {session_id}")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Ошибка при удалении участника из сессии {session_id}: {e}")
            raise

    @staticmethod
    async def add_player_to_session(db: AsyncSession, session_id: UUID, request: InvitePlayerRequest, current_user_id: str) -> None:
        """Добавление игрока в сессию"""
        try:
            # Получаем сессию из базы
            from sqlalchemy import select
            session_query = await db.execute(
                select(GameSession).where(GameSession.id == session_id)
            )
            db_session = session_query.scalar_one_or_none()
            
            if not db_session:
                raise ValueError("Session not found")
            
            # Приводим current_user_id к UUID для сравнения
            from uuid import UUID as UUIDType
            current_user_uuid = UUIDType(current_user_id)
            
            # Проверяем права на добавление игроков
            if db_session.creator_user_id != current_user_uuid:
                raise ValueError("Only session creator can add players")
            
            # Проверяем что сессия не в процессе игры
            if db_session.status == "in_progress":
                raise ValueError("Cannot add players while game is in progress")
            
            # Проверяем что не превышен лимит игроков
            if db_session.current_players_count >= db_session.max_players:
                raise ValueError(f"Session is full (max {db_session.max_players} players)")
            
            # Проверяем что игрок уже не в текущей сессии
            existing_participant_query = await db.execute(
                select(SessionParticipant)
                .where(SessionParticipant.session_id == session_id)
                .where(SessionParticipant.user_id == request.user_id)
                .where(SessionParticipant.is_active == True)
            )
            existing_participant = existing_participant_query.scalar_one_or_none()
            
            if existing_participant:
                # 🔄 ИСПРАВЛЯЕМ: Если игрок уже в текущей сессии, не добавляем
                print(f"✅ Игрок {request.display_name} уже в сессии {session_id}")
                return  # Просто выходим без ошибки
            
            # Получаем следующую позицию в очереди
            max_position_query = await db.execute(
                select(SessionParticipant.queue_position)
                .where(SessionParticipant.session_id == session_id)
                .where(SessionParticipant.is_active == True)
                .order_by(SessionParticipant.queue_position.desc())
                .limit(1)  # 🔄 ИСПРАВЛЯЕМ: Добавляем limit(1) чтобы гарантировать одну строку
            )
            max_position_result = max_position_query.scalar_one_or_none()
            next_position = (max_position_result or 0) + 1
            
            # Создаем нового участника
            new_participant = SessionParticipant(
                session_id=session_id,
                user_id=request.user_id,
                display_name=request.display_name,
                session_role=request.session_role or "participant",
                is_empty_user=False,  # Это реальный игрок, не бот
                queue_position=next_position,
                can_modify_settings=False,
                can_kick_players=False,
                can_change_rules=False
            )
            db.add(new_participant)
            
            # Обновляем количество игроков в сессии
            db_session.current_players_count += 1
            
            # Сохраняем изменения
            await db.commit()
            await db.refresh(new_participant)
            await db.refresh(db_session)
            
            print(f"✅ Игрок {request.display_name} добавлен в сессию {session_id}")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Ошибка при добавлении игрока в сессию {session_id}: {e}")
            raise

    @staticmethod
    async def update_session(db: AsyncSession, session_id: UUID, updates: Dict[str, Any], current_user_id: str) -> SessionResponse:
        """Обновление настроек сессии"""
        try:
            # Получаем сессию из базы
            from sqlalchemy import select
            session_query = await db.execute(
                select(GameSession).where(GameSession.id == session_id)
            )
            db_session = session_query.scalar_one_or_none()
            
            if not db_session:
                raise ValueError("Session not found")
            
            # Приводим current_user_id к UUID для сравнения
            from uuid import UUID as UUIDType
            current_user_uuid = UUIDType(current_user_id)
            
            # Проверяем права на изменение
            if db_session.creator_user_id != current_user_uuid:
                raise ValueError("Only session creator can modify settings")
            
            # Проверяем что сессия не в процессе игры
            if db_session.status == "in_progress":
                raise ValueError("Cannot modify session while game is in progress")
            
            # Обновляем только переданные поля
            if updates.get("name") is not None:
                db_session.name = updates["name"]
            
            if updates.get("template_id") is not None:
                db_session.template_id = updates["template_id"]
            
            if updates.get("max_players") is not None:
                # Проверяем что новое количество не меньше текущего количества игроков
                if updates["max_players"] < db_session.current_players_count:
                    raise ValueError(f"Cannot reduce max_players below current count ({db_session.current_players_count})")
                db_session.max_players = updates["max_players"]
            
            if updates.get("description") is not None:
                db_session.description = updates["description"]
            
            if updates.get("rules") is not None:
                db_session.rules = updates["rules"]
            
            # 🔄 НОВОЕ: Поддержка обновления статуса сессии
            if updates.get("status") is not None:
                # Проверяем валидность перехода статуса
                if db_session.status == "waiting" and updates["status"] == "in_progress":
                    # Можно запустить сессию только если есть минимум 2 игрока
                    if db_session.current_players_count < 2:
                        raise ValueError("Cannot start session with less than 2 players")
                    db_session.status = updates["status"]
                    db_session.started_at = datetime.utcnow()
                elif updates["status"] in ["waiting", "completed", "cancelled"]:
                    db_session.status = updates["status"]
                else:
                    raise ValueError(f"Invalid status transition from {db_session.status} to {updates['status']}")
            
            # Обновляем timestamp
            db_session.updated_at = datetime.utcnow()
            
            # Сохраняем изменения
            await db.commit()
            await db.refresh(db_session)
            
            print(f"✅ Сессия {session_id} успешно обновлена")
            
            # Возвращаем обновленную сессию
            return await SessionService.get_session(db, session_id)
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Ошибка при обновлении сессии {session_id}: {e}")
            raise