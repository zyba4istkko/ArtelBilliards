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
from ..models.database import Game, GameQueue, GameSession, SessionParticipant, GameEvent
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
            
            # 🔄 ИСПРАВЛЯЕМ: Автоматически определяем queue_algorithm из шаблона сессии
            if session.template_id:
                print(f"🎮 GameService.create_game: Сессия имеет шаблон: {session.template_id}")
                # Получаем шаблон из template-service
                try:
                    # Временно используем дефолтный алгоритм, пока не настроим интеграцию с template-service
                    queue_algorithm = "random_no_repeat"
                    print(f"🎮 GameService.create_game: Используем алгоритм из шаблона: {queue_algorithm}")
                except Exception as e:
                    print(f"⚠️ GameService.create_game: Ошибка получения шаблона: {e}")
                    queue_algorithm = "random_no_repeat"  # fallback
            else:
                print(f"🎮 GameService.create_game: Сессия не имеет шаблона, используем дефолтный алгоритм")
                queue_algorithm = "random_no_repeat"  # дефолтный алгоритм
            
            # 🔄 УБИРАЕМ: Не полагаемся на frontend для queue_algorithm
            # queue_algorithm = request.queue_algorithm or "manual"
            
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
                print(f"🎮 GameService.create_game: Детали истории очередей:")
                for i, queue in enumerate(previous_queues):
                    print(f"🎮 GameService.create_game:   Очередь {i+1}: {queue}")
                
                # 🔄 ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ВЫЗОВА АЛГОРИТМА
                print(f"🎮 GameService.create_game: ВЫЗЫВАЕМ АЛГОРИТМ random_no_repeat")
                print(f"🎮 GameService.create_game: algorithm_func: {algorithm_func}")
                print(f"🎮 GameService.create_game: participants: {[f'{p.id}:{p.display_name}' for p in participants]}")
                print(f"🎮 GameService.create_game: session_id: {session_id}")
                print(f"🎮 GameService.create_game: previous_queues: {previous_queues}")
                
                # Для random_no_repeat передаем только UUID из истории
                current_queue = algorithm_func(participants, session_id, previous_queues)
                
                print(f"🎮 GameService.create_game: АЛГОРИТМ ВЫПОЛНЕН")
                print(f"🎮 GameService.create_game: Результат алгоритма: {[f'{p.id}:{p.display_name}' for p in current_queue]}")
            else:
                # Для always_random и manual не нужна история
                print(f"🎮 GameService.create_game: ВЫЗЫВАЕМ АЛГОРИТМ {queue_algorithm}")
                current_queue = algorithm_func(participants)
                print(f"🎮 GameService.create_game: Результат алгоритма: {[f'{p.id}:{p.display_name}' for p in current_queue]}")
            
            print(f"🎮 GameService.create_game: Сгенерирована очередь: {len(current_queue)} участников")
            
            # 🔄 ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ФОРМИРОВАНИЯ current_queue_ids
            print(f"🎮 GameService.create_game: ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ФОРМИРОВАНИЯ current_queue_ids")
            print(f"🎮 GameService.create_game: current_queue (объекты): {current_queue}")
            print(f"🎮 GameService.create_game: Тип current_queue: {type(current_queue)}")
            print(f"🎮 GameService.create_game: Длина current_queue: {len(current_queue)}")
            
            for i, participant in enumerate(current_queue):
                print(f"🎮 GameService.create_game:   Участник {i+1}: id={participant.id}, display_name={participant.display_name}")
                print(f"🎮 GameService.create_game:   Тип participant.id: {type(participant.id)}")
                print(f"🎮 GameService.create_game:   participant.id значение: {participant.id}")
            
            # Извлекаем только ID участников из очереди для сохранения в БД
            current_queue_ids = [str(participant.id) for participant in current_queue]
            print(f"🎮 GameService.create_game: ID участников в очереди: {current_queue_ids}")
            print(f"🎮 GameService.create_game: Тип current_queue_ids: {type(current_queue_ids)}")
            print(f"🎮 GameService.create_game: Длина current_queue_ids: {len(current_queue_ids)}")
            
            # 🔄 ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ СОЗДАНИЯ ОБЪЕКТА GAME
            print(f"🎮 GameService.create_game: ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ СОЗДАНИЯ ОБЪЕКТА GAME")
            print(f"🎮 GameService.create_game: session_id: {session_id}")
            print(f"🎮 GameService.create_game: next_game_number: {next_game_number}")
            print(f"🎮 GameService.create_game: queue_algorithm: {queue_algorithm}")
            print(f"🎮 GameService.create_game: current_queue_ids: {current_queue_ids}")
            
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
            print(f"🎮 GameService.create_game: game.current_queue: {game.current_queue}")
            print(f"🎮 GameService.create_game: Тип game.current_queue: {type(game.current_queue)}")
            db.add(game)
            print(f"🎮 GameService.create_game: Игра добавлена в сессию")
            
            await db.flush()  # Получаем ID игры
            print(f"🎮 GameService.create_game: ID игры получен: {game.id}")
            
            # 6. Сохраняем очередность в историю (только для random_no_repeat)
            if queue_algorithm == "random_no_repeat":
                print(f"🎮 GameService.create_game: Шаг 6 - Сохраняем историю очереди")
                print(f"🎮 GameService.create_game: ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ СОХРАНЕНИЯ В GAME_QUEUES")
                print(f"🎮 GameService.create_game: session_id: {session_id}")
                print(f"🎮 GameService.create_game: game.id: {game.id}")
                print(f"🎮 GameService.create_game: current_queue_ids: {current_queue_ids}")
                print(f"🎮 GameService.create_game: queue_algorithm: {queue_algorithm}")
                
                queue_record = GameQueue(
                    session_id=session_id,
                    game_id=game.id,
                    queue_order=current_queue_ids,
                    algorithm_used=queue_algorithm
                )
                print(f"🎮 GameService.create_game: Объект GameQueue создан: {queue_record}")
                print(f"🎮 GameService.create_game: queue_record.queue_order: {queue_record.queue_order}")
                print(f"🎮 GameService.create_game: Тип queue_record.queue_order: {type(queue_record.queue_order)}")
                
                db.add(queue_record)
                print(f"🎮 GameService.create_game: Запись истории очереди добавлена")
            
            # 6.5. 🔄 НОВЫЙ ШАГ: Обновляем queue_position в session_participants
            print(f"🎮 GameService.create_game: Шаг 6.5 - Обновляем queue_position в session_participants")
            for position, participant in enumerate(current_queue):
                # Обновляем queue_position для каждого участника
                participant.queue_position = position + 1
                print(f"🎮 GameService.create_game: {participant.display_name} -> queue_position: {position + 1}")
            
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
        
        # 🔄 ДОБАВЛЯЕМ: Определяем победителя на основе событий игры
        winner_participant_id = None
        game_statistics = {}
        
        try:
            # Получаем все события игры для расчета статистики
            events_query = select(GameEvent).where(
                GameEvent.game_id == game_id,
                GameEvent.is_deleted == False
            ).order_by(GameEvent.sequence_number)
            
            events_result = await db.execute(events_query)
            game_events = events_result.scalars().all()
            
            # Собираем статистику по участникам
            participant_stats = {}
            
            for event in game_events:
                participant_id = event.participant_id
                
                if participant_id not in participant_stats:
                    participant_stats[participant_id] = {
                        'points': 0,
                        'money': 0,
                        'balls': 0,
                        'fouls': 0
                    }
                
                # Обрабатываем события забитых шаров
                if event.event_type == 'ball_potted':
                    participant_stats[participant_id]['balls'] += 1
                    
                    # Получаем очки и деньги из event_data
                    event_data = event.event_data or {}
                    points = event_data.get('points', 0)
                    money = event_data.get('money', 0)
                    
                    participant_stats[participant_id]['points'] += points
                    participant_stats[participant_id]['money'] += money
                
                # Обрабатываем штрафы
                elif event.event_type == 'foul':
                    participant_stats[participant_id]['fouls'] += 1
                    
                    # Получаем штраф из event_data
                    event_data = event.event_data or {}
                    penalty = event_data.get('penalty', 0)
                    
                    participant_stats[participant_id]['money'] -= penalty
            
            # Определяем победителя по очкам
            if participant_stats:
                winner_id = max(participant_stats.keys(), 
                              key=lambda pid: participant_stats[pid]['points'])
                winner_participant_id = winner_id
                
                # Сохраняем статистику в game_data
                game_statistics = {
                    'participant_stats': participant_stats,
                    'winner_participant_id': str(winner_participant_id),
                    'total_balls': sum(stats['balls'] for stats in participant_stats.values()),
                    'total_fouls': sum(stats['fouls'] for stats in participant_stats.values()),
                    'completion_timestamp': datetime.now().isoformat()
                }
                
                print(f"🎯 GameService.complete_game: Победитель определен: {winner_participant_id}")
                print(f"🎯 GameService.complete_game: Статистика: {game_statistics}")
            
        except Exception as e:
            print(f"⚠️ GameService.complete_game: Ошибка при определении победителя: {e}")
            # Продолжаем выполнение без статистики
        
        # Обновляем статус игры
        game.status = "completed"
        game.completed_at = datetime.now()
        
        # 🔄 ИСПРАВЛЯЕМ: НЕ завершаем сессию автоматически!
        # Сессия должна оставаться активной для создания новых игр
        session_query = select(GameSession).where(GameSession.id == game.session_id)
        session_result = await db.execute(session_query)
        session = session_result.scalar_one_or_none()
        
        if session and session.current_game_id == game_id:
            # Просто убираем ссылку на текущую игру
            session.current_game_id = None
            # 🔄 НЕ меняем статус сессии на "completed"!
            # session.status остается как есть (обычно "active")
        
        await db.commit()
        
        return GameResponse(
            id=game.id,
            session_id=game.session_id,
            game_number=game.game_number,
            status=GameStatus.COMPLETED,
            winner_participant_id=winner_participant_id,
            started_at=game.started_at,
            completed_at=game.completed_at,
            duration_seconds=None,
            game_data={
                "queue_algorithm": game.queue_algorithm,
                "current_queue": game.current_queue,
                "statistics": game_statistics  # 🔄 ДОБАВЛЯЕМ: финальная статистика
            }
        )
    
    @staticmethod
    async def add_game_event(
        db: AsyncSession, 
        game_id: UUID, 
        request: GameEventRequest
    ) -> GameEventResponse:
        """Добавление игрового события"""
        
        try:
            print(f"🎮 GameService.add_game_event: Начинаем добавление события для игры {game_id}")
            print(f"🎮 GameService.add_game_event: Request: {request}")
            
            # 1. Проверяем существование игры
            game_query = select(Game).where(Game.id == game_id)
            game_result = await db.execute(game_query)
            game = game_result.scalar_one_or_none()
            
            if not game:
                print(f"❌ GameService.add_game_event: Игра {game_id} не найдена!")
                raise ValueError(f"Game {game_id} not found")
            
            print(f"🎮 GameService.add_game_event: Игра найдена: {game.id}, статус: {game.status}")
            
            # 2. Проверяем существование участника
            participant_query = select(SessionParticipant).where(SessionParticipant.id == request.participant_id)
            participant_result = await db.execute(participant_query)
            participant = participant_result.scalar_one_or_none()
            
            if not participant:
                print(f"❌ GameService.add_game_event: Участник {request.participant_id} не найден!")
                raise ValueError(f"Participant {request.participant_id} not found")
            
            print(f"🎮 GameService.add_game_event: Участник найден: {participant.id}, {participant.display_name}")
            
            # 3. Определяем следующий номер последовательности
            sequence_query = select(func.coalesce(func.max(GameEvent.sequence_number), 0)).where(
                GameEvent.game_id == game_id
            )
            sequence_result = await db.execute(sequence_query)
            next_sequence = sequence_result.scalar() + 1
            
            print(f"🎮 GameService.add_game_event: Следующий номер последовательности: {next_sequence}")
            
            # 4. Создаем событие в базе данных
            new_event = GameEvent(
                game_id=game_id,
                participant_id=request.participant_id,
                event_type=request.event_type.value if hasattr(request.event_type, 'value') else str(request.event_type),
                event_data=request.event_data,
                sequence_number=next_sequence
            )
            
            db.add(new_event)
            await db.commit()
            await db.refresh(new_event)
            
            print(f"✅ GameService.add_game_event: Событие сохранено в БД с ID: {new_event.id}")
            
            # 5. Возвращаем ответ
            return GameEventResponse(
                id=new_event.id,
                game_id=new_event.game_id,
                participant_id=new_event.participant_id,
                event_type=request.event_type,
                event_data=new_event.event_data,
                sequence_number=new_event.sequence_number,
                created_at=new_event.created_at
            )
            
        except Exception as e:
            print(f"❌ GameService.add_game_event: Ошибка: {str(e)}")
            await db.rollback()
            raise
    
    @staticmethod
    async def get_game_events(
        db: AsyncSession, 
        game_id: UUID, 
        limit: int = 50, 
        offset: int = 0
    ) -> List[GameEventResponse]:
        """Получение событий игры"""
        
        try:
            print(f"🎮 GameService.get_game_events: Получаем события для игры {game_id}")
            print(f"🎮 GameService.get_game_events: limit={limit}, offset={offset}")
            
            # 1. Проверяем существование игры
            game_query = select(Game).where(Game.id == game_id)
            game_result = await db.execute(game_query)
            game = game_result.scalar_one_or_none()
            
            if not game:
                print(f"❌ GameService.get_game_events: Игра {game_id} не найдена!")
                return []
            
            print(f"🎮 GameService.get_game_events: Игра найдена: {game.id}, статус: {game.status}")
            
            # 2. Получаем события из БД
            events_query = select(GameEvent).where(
                GameEvent.game_id == game_id
            ).order_by(
                GameEvent.sequence_number.desc()
            ).offset(offset).limit(limit)
            
            print(f"🎮 GameService.get_game_events: SQL запрос: {events_query}")
            
            events_result = await db.execute(events_query)
            events = events_result.scalars().all()
            
            print(f"🎮 GameService.get_game_events: Найдено событий: {len(events)}")
            for event in events:
                print(f"🎮 GameService.get_game_events: Событие {event.id}: {event.event_type}, участник: {event.participant_id}, удалено: {getattr(event, 'is_deleted', False)}")
            
            # 3. Преобразуем в GameEventResponse
            from ..models.schemas import GameEventType
            
            result = []
            for event in events:
                # Определяем тип события
                try:
                    event_type = GameEventType(event.event_type)
                except ValueError:
                    # Если тип не распознан, используем как есть
                    event_type = event.event_type
                
                # Добавляем информацию об удалении в event_data
                event_data = event.event_data or {}
                if hasattr(event, 'is_deleted') and event.is_deleted:
                    event_data['is_deleted'] = True
                
                response = GameEventResponse(
                    id=event.id,
                    game_id=event.game_id,
                    participant_id=event.participant_id,
                    event_type=event_type,
                    event_data=event_data,
                    sequence_number=event.sequence_number,
                    created_at=event.created_at
                )
                result.append(response)
            
            print(f"🎮 GameService.get_game_events: Возвращаем {len(result)} событий")
            return result
            
        except Exception as e:
            print(f"❌ GameService.get_game_events: Ошибка: {str(e)}")
            return []
    
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

    @staticmethod
    async def delete_game_event(
        db: AsyncSession, 
        game_id: UUID, 
        event_id: UUID, 
        current_user: UUID
    ) -> Dict[str, Any]:
        """Удаление события игры (помечаем как удаленное)"""
        
        try:
            print(f"🎮 GameService.delete_game_event: Начинаем удаление события {event_id} для игры {game_id}")
            print(f"🎮 GameService.delete_game_event: current_user: {current_user}")
            
            # 1. Проверяем существование игры
            game_query = select(Game).where(Game.id == game_id)
            game_result = await db.execute(game_query)
            game = game_result.scalar_one_or_none()
            
            if not game:
                print(f"❌ GameService.delete_game_event: Игра {game_id} не найдена!")
                raise ValueError(f"Game {game_id} not found")
            
            print(f"🎮 GameService.delete_game_event: Игра найдена: {game.id}, статус: {game.status}")
            
            # 2. Проверяем существование события
            event_query = select(GameEvent).where(
                GameEvent.id == event_id,
                GameEvent.game_id == game_id
            )
            event_result = await db.execute(event_query)
            event = event_result.scalar_one_or_none()
            
            if not event:
                print(f"❌ GameService.delete_game_event: Событие {event_id} не найдено!")
                raise ValueError(f"Event {event_id} not found")
            
            print(f"🎮 GameService.delete_game_event: Событие найдено: {event.id}, тип: {event.event_type}")
            
            # 3. Проверяем права доступа (только creator сессии может удалять события)
            # TODO: Добавить проверку прав доступа через Auth Service
            print(f"🎮 GameService.delete_game_event: Проверка прав доступа (пока пропускаем)")
            
            # 4. Помечаем событие как удаленное
            event.is_deleted = True
            await db.commit()
            
            print(f"🎮 GameService.delete_game_event: Событие помечено как удаленное")
            
            return {
                "success": True,
                "message": f"Event {event_id} marked as deleted"
            }
            
        except Exception as e:
            print(f"❌ GameService.delete_game_event: Ошибка: {str(e)}")
            await db.rollback()
            raise