"""
Game API Endpoints
"""

from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.schemas import (
    CreateGameRequest, GameResponse, GameListResponse,
    GameEventRequest, GameEventResponse, GameEventsResponse,
    GameScoresResponse, BaseResponse
)
from ..services.game_service import GameService
from ..core.database import get_db

router = APIRouter(tags=["games"])


# Dependency для получения текущего пользователя (заглушка)
async def get_current_user() -> UUID:
    """Получение текущего пользователя из JWT токена"""
    # TODO: Интеграция с Auth Service
    return UUID("00000000-0000-0000-0000-000000000001")


@router.post("/sessions/{session_id}/games", response_model=GameResponse)
async def create_game(
    session_id: UUID,
    request: CreateGameRequest,
    current_user: UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Создание новой игры в сессии"""
    try:
        print(f"🎮 API create_game: Запрос создания игры для сессии {session_id}")
        print(f"🎮 API create_game: Request body: {request}")
        print(f"🎮 API create_game: current_user: {current_user}")
        
        result = await GameService.create_game(db, session_id, request)
        
        print(f"🎮 API create_game: Игра создана сервисом: {result}")
        print(f"🎮 API create_game: Возвращаем результат: {result}")
        
        return result
        
    except ValueError as e:
        print(f"❌ API create_game: ValueError: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ API create_game: Exception: {str(e)}")
        print(f"❌ API create_game: Тип ошибки: {type(e).__name__}")
        import traceback
        print(f"❌ API create_game: Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/sessions/{session_id}/games", response_model=GameListResponse)
async def get_session_games(
    session_id: UUID,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Получение списка игр в сессии"""
    try:
        print(f"🎮 API get_session_games: Запрос игр для сессии {session_id}")
        
        games = await GameService.get_session_games(db, session_id, limit, offset)
        
        print(f"🎮 API get_session_games: Получено игр от сервиса: {len(games)}")
        
        response = GameListResponse(
            games=games,
            total=len(games)
        )
        
        print(f"🎮 API get_session_games: Возвращаем ответ: {response}")
        return response
        
    except Exception as e:
        print(f"❌ API get_session_games: Ошибка: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{game_id}", response_model=GameResponse)
async def get_game(
    game_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Получение детальной информации об игре"""
    try:
        game = await GameService.get_game(db, game_id)
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
        return game
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/sessions/{session_id}/active-game", response_model=GameResponse)
async def get_active_game(
    session_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Получение активной игры в сессии"""
    try:
        active_game = await GameService.get_active_game(db, session_id)
        if not active_game:
            raise HTTPException(status_code=404, detail="No active game found in session")
        return active_game
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{game_id}/start", response_model=GameResponse)
async def start_game(
    game_id: UUID,
    current_user: UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Начало игры"""
    try:
        # TODO: Реализовать логику начала игры
        game = await GameService.get_game(db, game_id)
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
        
        return game
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{game_id}/end", response_model=GameResponse)
async def end_game(
    game_id: UUID,
    current_user: UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Завершение игры"""
    try:
        return await GameService.complete_game(db, game_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{game_id}/events", response_model=GameEventResponse)
async def add_game_event(
    game_id: UUID,
    request: GameEventRequest,
    current_user: UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Добавление игрового события"""
    try:
        return await GameService.add_game_event(db, game_id, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{game_id}/events", response_model=GameEventsResponse)
async def get_game_events(
    game_id: UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Получение истории событий игры"""
    try:
        # TODO: Реализовать получение событий из БД
        events = []
        
        return GameEventsResponse(
            events=events,
            total=len(events)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{game_id}/scores", response_model=GameScoresResponse)
async def get_game_scores(
    game_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Получение текущих счетов игры"""
    try:
        return await GameService.get_game_scores(db, game_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Queue Management Endpoints
@router.post("/sessions/{session_id}/games/{game_number}/queue", response_model=BaseResponse)
async def generate_queue(
    session_id: UUID,
    game_number: int,
    algorithm: str = Query(..., pattern="^(always_random|random_no_repeat|manual)$"),
    current_user: UUID = Depends(get_current_user)
):
    """Генерация очереди игроков"""
    try:
        # TODO: Реализовать генерацию очереди
        return BaseResponse(
            success=True,
            message=f"Queue generated using {algorithm} algorithm"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/sessions/{session_id}/games/{game_number}/queue/manual", response_model=BaseResponse)
async def set_manual_queue(
    session_id: UUID,
    game_number: int,
    queue: List[UUID],
    current_user: UUID = Depends(get_current_user)
):
    """Ручная настройка очереди игроков"""
    try:
        # TODO: Реализовать ручную настройку очереди
        return BaseResponse(
            success=True,
            message="Manual queue set successfully"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/sessions/{session_id}/queue/analytics")
async def get_queue_analytics(session_id: UUID):
    """Получение аналитики справедливости очередей"""
    try:
        # TODO: Реализовать аналитику очередей
        return {
            "total_games": 0,
            "algorithm_distribution": {
                "always_random": 0,
                "random_no_repeat": 0,
                "manual": 0
            },
            "fairness_score": 100.0,
            "player_statistics": {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")