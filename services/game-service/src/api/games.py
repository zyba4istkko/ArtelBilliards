"""
Game API Endpoints
"""

from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, Query

from ..models.schemas import (
    CreateGameRequest, GameResponse, GameListResponse,
    GameEventRequest, GameEventResponse, GameEventsResponse,
    GameScoresResponse, BaseResponse
)
from ..services.game_service import GameService

router = APIRouter(prefix="/games", tags=["games"])


# Dependency для получения текущего пользователя (заглушка)
async def get_current_user() -> UUID:
    """Получение текущего пользователя из JWT токена"""
    # TODO: Интеграция с Auth Service
    return UUID("00000000-0000-0000-0000-000000000001")


@router.post("/sessions/{session_id}/games", response_model=GameResponse)
async def create_game(
    session_id: UUID,
    request: CreateGameRequest,
    current_user: UUID = Depends(get_current_user)
):
    """Создание новой игры в сессии"""
    try:
        return await GameService.create_game(session_id, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/sessions/{session_id}/games", response_model=GameListResponse)
async def get_session_games(
    session_id: UUID,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Получение списка игр в сессии"""
    try:
        games = await GameService.get_session_games(session_id, limit, offset)
        
        return GameListResponse(
            games=games,
            total=len(games)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{game_id}", response_model=GameResponse)
async def get_game(game_id: UUID):
    """Получение детальной информации об игре"""
    try:
        game = await GameService.get_game(game_id)
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
        return game
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{game_id}/start", response_model=GameResponse)
async def start_game(
    game_id: UUID,
    current_user: UUID = Depends(get_current_user)
):
    """Начало игры"""
    try:
        # TODO: Реализовать логику начала игры
        game = await GameService.get_game(game_id)
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
    current_user: UUID = Depends(get_current_user)
):
    """Завершение игры"""
    try:
        return await GameService.end_game(game_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{game_id}/events", response_model=GameEventResponse)
async def add_game_event(
    game_id: UUID,
    request: GameEventRequest,
    current_user: UUID = Depends(get_current_user)
):
    """Добавление игрового события"""
    try:
        return await GameService.add_game_event(game_id, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{game_id}/events", response_model=GameEventsResponse)
async def get_game_events(
    game_id: UUID,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0)
):
    """Получение истории событий игры (stub)"""
    try:
        # Заглушка - возвращаем примерное событие
        event = GameEventResponse(
            id=UUID("event123-4567-8901-2345-678901234567"),
            game_id=game_id,
            participant_id=UUID("87654321-4321-8765-cba9-987654321abc"),
            event_type=GameEventType.BALL_POTTED,
            event_data={"ball_color": "red", "ball_points": 4},
            sequence_number=1,
            created_at=datetime.now()
        )
        
        return GameEventsResponse(
            events=[event],
            total=1
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{game_id}/scores", response_model=GameScoresResponse)
async def get_game_scores(game_id: UUID):
    """Получение текущих счетов игры"""
    try:
        return await GameService.get_game_scores(game_id)
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