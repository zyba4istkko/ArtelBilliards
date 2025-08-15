"""
Game Service - Управление играми и игровой логикой
"""

import random
import math
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..models.schemas import (
    CreateGameRequest, GameResponse, GameEventRequest, KolkhozBallPottedEvent,
    GameEventResponse, GameResultResponse, GameScoresResponse,
    QueueGenerationRequest, QueueResponse, GameStatus, GameEventType
)
from ..models.database import Game, GameQueue, GameSession, SessionParticipant
from .queue_algorithms import get_queue_algorithm


class GameService:
    """Сервис для управления играми"""
    
    @staticmethod
    def _map_db_status_to_frontend(db_status: str) -> str:
        """Маппинг статусов БД в frontend статусы"""
        status_mapping = {
            'active': 'in_progress',  # 🔄 МАППИНГ: 'active' -> 'in_progress'
            'completed': 'completed',
            'cancelled': 'cancelled'
        }
        return status_mapping.get(db_status, db_status)
    
    @staticmethod
    async def create_game(
        db: AsyncSession, 
        session_id: UUID, 
        request: CreateGameRequest
    ) -> GameResponse:
        """Создание новой игры в сессии"""
        
        try:
            print(f"🎮 GameService.create_game: Начинаем создание игры для сессии {session_id}")
            print(f"🎮 GameService.create_game: Request: {request}")
            print(f"🎮 GameService.create_game: Тип session_id: {type(session_id)}")
            print(f"🎮 GameService.create_game: session_id значение: {session_id}")
            
            # 1. Получаем сессию и проверяем её существование
            print(f"🎮 GameService.create_game: Шаг 1 - Получаем сессию")
            session_query = select(GameSession).where(GameSession.id == session_id)
            print(f"🎮 GameService.create_game: SQL запрос сессии: {session_query}")
            
            session_result = await db.execute(session_query)
            session = session_result.scalar_one_or_none()
            
            if not session:
                print(f"❌ GameService.create_game: Сессия не найдена!")
                raise ValueError(f"Session {session_id} not found")
            
            print(f"🎮 GameService.create_game: Сессия найдена: {session.id}, статус: {session.status}")
            print(f"🎮 GameService.create_game: Тип session.id: {type(session.id)}")
            print(f"🎮 GameService.create_game: session.id значение: {session.id}")
            
            # 2. Получаем участников сессии
            print(f"🎮 GameService.create_game: Шаг 2 - Получаем участников")
            participants_query = select(SessionParticipant).where(
                SessionParticipant.session_id == session_id
            )
            participants_result = await db.execute(participants_query)
            participants = participants_result.scalars().all()
            
            if not participants:
                print(f"❌ GameService.create_game: Участники не найдены!")
                raise ValueError(f"No participants found in session {session_id}")
            
            print(f"🎮 GameService.create_game: Найдено участников: {len(participants)}")
            for p in participants:
                print(f"🎮 GameService.create_game: Участник: {p.id}, {p.display_name}")
            
            # 3. Определяем номер следующей игры
            print(f"🎮 GameService.create_game: Шаг 3 - Определяем номер игры")
            game_number_query = select(func.coalesce(func.max(Game.game_number), 0)).where(
                Game.session_id == session_id
            )
            game_number_result = await db.execute(game_number_query)
            next_game_number = game_number_result.scalar() + 1
            
            print(f"🎮 GameService.create_game: Следующий номер игры: {next_game_number}")
            
            # 4. Генерируем очередность согласно алгоритму
            print(f"🎮 GameService.create_game: Шаг 4 - Генерируем очередность")
            queue_algorithm = request.queue_algorithm or "manual"  # Используем дефолт если None
            algorithm_func = get_queue_algorithm(queue_algorithm)
            
            print(f"🎮 GameService.create_game: Алгоритм: {queue_algorithm}")
            
            if queue_algorithm == "random_no_repeat":
                # Получаем историю предыдущих очередностей для random_no_repeat
                print(f"🎮 GameService.create_game: Получаем историю очередей")
                queue_history_query = select(GameQueue.queue_order).where(
                    GameQueue.session_id == session_id,
                    GameQueue.algorithm_used == "random_no_repeat"
                ).order_by(GameQueue.created_at.desc())
                
                queue_history_result = await db.execute(queue_history_query)
                previous_queues = [row[0] for row in queue_history_result.fetchall()]
                
                print(f"🎮 GameService.create_game: История очередей: {len(previous_queues)} записей")
                
                # Для random_no_repeat передаем только UUID из истории
                current_queue = algorithm_func(participants, session_id, previous_queues)
            else:
                # Для always_random и manual не нужна история
                current_queue = algorithm_func(participants)
            
            print(f"🎮 GameService.create_game: Сгенерирована очередь: {len(current_queue)} участников")
            
            # Извлекаем только ID участников из очереди для сохранения в БД
            current_queue_ids = [str(participant.id) for participant in current_queue]
            print(f"🎮 GameService.create_game: ID участников в очереди: {current_queue_ids}")
            
            # 5. Создаем игру в БД
            print(f"🎮 GameService.create_game: Шаг 5 - Создаем игру в БД")
            game = Game(
                session_id=session_id,
                game_number=next_game_number,
                status="active",
                queue_algorithm=queue_algorithm,
                current_queue=current_queue_ids
            )
            
            print(f"🎮 GameService.create_game: Объект игры создан: {game}")
            print(f"🎮 GameService.create_game: game.session_id: {game.session_id}")
            print(f"🎮 GameService.create_game: game.status: {game.status}")
            db.add(game)
            print(f"🎮 GameService.create_game: Игра добавлена в сессию")
            
            await db.flush()  # Получаем ID игры
            print(f"🎮 GameService.create_game: ID игры получен: {game.id}")
            
            # 6. Сохраняем очередность в историю (только для random_no_repeat)
            if queue_algorithm == "random_no_repeat":
                print(f"🎮 GameService.create_game: Шаг 6 - Сохраняем историю очереди")
                queue_record = GameQueue(
                    session_id=session_id,
                    game_id=game.id,
                    queue_order=current_queue_ids,
                    algorithm_used=queue_algorithm
                )
                db.add(queue_record)
                print(f"🎮 GameService.create_game: Запись истории очереди добавлена")
            
            # 7. Обновляем сессию - устанавливаем текущую игру
            print(f"🎮 GameService.create_game: Шаг 7 - Обновляем сессию")
            session.current_game_id = game.id
            session.status = "in_progress"
            
            print(f"🎮 GameService.create_game: Готовы к коммиту")
            await db.commit()
            print(f"🎮 GameService.create_game: Коммит выполнен успешно")
            
            # 8. Возвращаем созданную игру
            print(f"🎮 GameService.create_game: Шаг 8 - Возвращаем результат")
            result = GameResponse(
                id=game.id,
                session_id=game.session_id,
                game_number=game.game_number,
                status=GameService._map_db_status_to_frontend(game.status),  # 🔄 ИСПРАВЛЯЕМ: используем маппинг
                winner_participant_id=None,
                started_at=game.started_at,
                completed_at=game.completed_at,
                duration_seconds=None,
                game_data={
                    "queue_algorithm": game.queue_algorithm,
                    "current_queue": game.current_queue,
                    "custom_queue": request.custom_queue
                }
            )
            
            print(f"🎮 GameService.create_game: Игра создана успешно: {result.id}")
            print(f"🎮 GameService.create_game: result.session_id: {result.session_id}")
            print(f"🎮 GameService.create_game: result.status: {result.status}")
            print(f"🎮 GameService.create_game: Возвращаем объект: {result}")
            return result
            
        except Exception as e:
            print(f"❌ GameService.create_game: Ошибка: {str(e)}")
            print(f"❌ GameService.create_game: Тип ошибки: {type(e).__name__}")
            import traceback
            print(f"❌ GameService.create_game: Traceback: {traceback.format_exc()}")
            raise
    
    @staticmethod
    async def get_game(db: AsyncSession, game_id: UUID) -> Optional[GameResponse]:
        """Получение информации об игре"""
        
        game_query = select(Game).where(Game.id == game_id)
        game_result = await db.execute(game_query)
        game = game_result.scalar_one_or_none()
        
        if not game:
            return None
        
        return GameResponse(
            id=game.id,
            session_id=game.session_id,
            game_number=game.game_number,
            status=GameService._map_db_status_to_frontend(game.status),  # 🔄 ИСПРАВЛЯЕМ: используем маппинг
            winner_participant_id=None,
            started_at=game.started_at,
            completed_at=game.completed_at,
            duration_seconds=None,
            game_data={
                "queue_algorithm": game.queue_algorithm,
                "current_queue": game.current_queue
            }
        )
    
    @staticmethod
    async def get_session_games(
        db: AsyncSession, 
        session_id: UUID, 
        limit: int = 10, 
        offset: int = 0
    ) -> List[GameResponse]:
        """Получение списка игр в сессии"""
        
        print(f"🎮 GameService.get_session_games: Ищем игры для сессии {session_id}")
        
        games_query = select(Game).where(
            Game.session_id == session_id
        ).order_by(Game.game_number.desc()).offset(offset).limit(limit)
        
        print(f"🎮 GameService.get_session_games: SQL запрос: {games_query}")
        
        games_result = await db.execute(games_query)
        games = games_result.scalars().all()
        
        print(f"🎮 GameService.get_session_games: Найдено игр: {len(games)}")
        for game in games:
            print(f"🎮 GameService.get_session_games: Игра {game.id}, статус: {game.status}, session_id: {game.session_id}")
        
        result = [
            GameResponse(
                id=game.id,
                session_id=game.session_id,
                game_number=game.game_number,
                status=GameService._map_db_status_to_frontend(game.status),  # 🔄 ИСПРАВЛЯЕМ: используем маппинг
                winner_participant_id=None,
                started_at=game.started_at,
                completed_at=game.completed_at,
                duration_seconds=None,
                game_data={
                    "queue_algorithm": game.queue_algorithm,
                    "current_queue": game.current_queue
                }
            )
            for game in games
        ]
        
        print(f"🎮 GameService.get_session_games: Возвращаем {len(result)} игр")
        return result
    
    @staticmethod
    async def get_active_game(db: AsyncSession, session_id: UUID) -> Optional[GameResponse]:
        """Получение активной игры в сессии"""
        
        active_game_query = select(Game).where(
            Game.session_id == session_id,
            Game.status == "active"
        )
        
        active_game_result = await db.execute(active_game_query)
        active_game = active_game_result.scalar_one_or_none()
        
        if not active_game:
            return None
        
        return GameResponse(
            id=active_game.id,
            session_id=active_game.session_id,
            game_number=active_game.game_number,
            status=GameService._map_db_status_to_frontend(active_game.status),  # 🔄 ИСПРАВЛЯЕМ: используем маппинг
            winner_participant_id=None,
            started_at=active_game.started_at,
            completed_at=active_game.completed_at,
            duration_seconds=None,
            game_data={
                "queue_algorithm": active_game.queue_algorithm,
                "current_queue": active_game.current_queue
            }
        )
    
    @staticmethod
    async def complete_game(db: AsyncSession, game_id: UUID) -> GameResponse:
        """Завершение игры"""
        
        game_query = select(Game).where(Game.id == game_id)
        game_result = await db.execute(game_query)
        game = game_result.scalar_one_or_none()
        
        if not game:
            raise ValueError(f"Game {game_id} not found")
        
        if game.status != "active":
            raise ValueError(f"Game {game_id} is not active")
        
        # Обновляем статус игры
        game.status = "completed"
        game.completed_at = datetime.now()
        
        # Обновляем статус сессии если это была последняя активная игра
        session_query = select(GameSession).where(GameSession.id == game.session_id)
        session_result = await db.execute(session_query)
        session = session_result.scalar_one_or_none()
        
        if session and session.current_game_id == game_id:
            # Проверяем есть ли другие активные игры
            other_active_games_query = select(Game).where(
                Game.session_id == game.session_id,
                Game.status == "active",
                Game.id != game_id
            )
            other_active_games_result = await db.execute(other_active_games_query)
            other_active_games = other_active_games_result.scalars().all()
            
            if not other_active_games:
                session.current_game_id = None
                session.status = "completed"
        
        await db.commit()
        
        return GameResponse(
            id=game.id,
            session_id=game.session_id,
            game_number=game.game_number,
            status=GameStatus.COMPLETED,
            winner_participant_id=None,
            started_at=game.started_at,
            completed_at=game.completed_at,
            duration_seconds=None,
            game_data={
                "queue_algorithm": game.queue_algorithm,
                "current_queue": game.current_queue
            }
        )
    
    @staticmethod
    async def add_game_event(
        db: AsyncSession, 
        game_id: UUID, 
        request: GameEventRequest
    ) -> GameEventResponse:
        """Добавление игрового события"""
        
        # TODO: Реализовать добавление событий в БД
        # Пока возвращаем заглушку
        event_id = UUID("fedcba98-7654-3210-fedc-ba9876543210")
        
        return GameEventResponse(
            id=event_id,
            game_id=game_id,
            participant_id=request.participant_id,
            event_type=request.event_type,
            event_data=request.event_data,
            sequence_number=1,
            created_at=datetime.now()
        )
    
    @staticmethod
    async def get_game_scores(db: AsyncSession, game_id: UUID) -> GameScoresResponse:
        """Получение текущих счетов игры"""
        
        # TODO: Реализовать подсчет очков из событий игры
        # Пока возвращаем заглушку
        return GameScoresResponse(
            current_scores=[
                GameResultResponse(
                    id=UUID("score123-4567-8901-2345-678901234567"),
                    game_id=game_id,
                    participant_id=UUID("87654321-4321-8765-cba9-987654321abc"),
                    queue_position_in_game=1,
                    balls_potted=5,
                    points_scored=250,
                    rubles_earned=Decimal("125.00"),
                    rubles_paid=Decimal("75.00"),
                    net_result_rubles=Decimal("50.00"),
                    point_value_rubles=Decimal("50.00"),
                    created_at=datetime.now()
                )
            ],
            game_status=GameStatus.IN_PROGRESS,
            winner_participant_id=None
        )