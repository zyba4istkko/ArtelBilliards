"""
Template API Endpoints
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, Query

from ..models.schemas import (
    GameTemplateCreate, GameTemplateUpdate, GameTemplateResponse, 
    GameTemplateListResponse, GameTemplateSearchRequest,
    TemplateStatsResponse, TemplateValidationRequest, TemplateValidationResponse,
    BaseResponse, GameType
)
from ..services.template_service import TemplateService

router = APIRouter(prefix="/templates", tags=["templates"])


# Dependency для получения текущего пользователя (заглушка)
def get_current_user() -> UUID:
    """Получение текущего пользователя из JWT токена"""
    # TODO: Интеграция с Auth Service
    return UUID("00000000-0000-0000-0000-000000000001")


@router.get("/", response_model=GameTemplateListResponse)
async def get_templates(
    game_type: Optional[GameType] = None,
    category_id: Optional[int] = None,
    query: Optional[str] = None,
    is_public: bool = True,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: UUID = Depends(get_current_user)
):
    """Получение списка шаблонов с фильтрацией"""
    try:
        search_request = GameTemplateSearchRequest(
            query=query,
            game_type=game_type,
            category_id=category_id,
            is_public=is_public
        )
        
        return await TemplateService.get_templates(
            search_request=search_request,
            user_id=current_user,
            page=page,
            page_size=page_size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/popular", response_model=List[GameTemplateResponse])
async def get_popular_templates(
    game_type: Optional[GameType] = None,
    limit: int = Query(10, ge=1, le=50)
):
    """Получение популярных шаблонов"""
    try:
        return await TemplateService.get_popular_templates(
            game_type=game_type,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/my", response_model=GameTemplateListResponse)
async def get_my_templates(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: UUID = Depends(get_current_user)
):
    """Получение шаблонов текущего пользователя"""
    try:
        return await TemplateService.get_user_templates(
            user_id=current_user,
            page=page,
            page_size=page_size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/", response_model=GameTemplateResponse)
async def create_template(
    template_data: GameTemplateCreate,
    current_user: UUID = Depends(get_current_user)
):
    """Создание нового шаблона"""
    try:
        return await TemplateService.create_template(template_data, current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{template_id}", response_model=GameTemplateResponse)
async def get_template(
    template_id: UUID,
    current_user: UUID = Depends(get_current_user)
):
    """Получение шаблона по ID"""
    try:
        template = await TemplateService.get_template_by_id(template_id, current_user)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        return template
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.put("/{template_id}", response_model=GameTemplateResponse)
async def update_template(
    template_id: UUID,
    template_data: GameTemplateUpdate,
    current_user: UUID = Depends(get_current_user)
):
    """Обновление шаблона"""
    try:
        template = await TemplateService.update_template(template_id, template_data, current_user)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        return template
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{template_id}", response_model=BaseResponse)
async def delete_template(
    template_id: UUID,
    current_user: UUID = Depends(get_current_user)
):
    """Удаление шаблона"""
    try:
        success = await TemplateService.delete_template(template_id, current_user)
        if not success:
            raise HTTPException(status_code=404, detail="Template not found")
        
        return BaseResponse(
            success=True,
            message="Template deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/validate", response_model=TemplateValidationResponse)
async def validate_template(
    validation_request: TemplateValidationRequest,
    current_user: UUID = Depends(get_current_user)
):
    """Валидация правил шаблона"""
    try:
        return await TemplateService.validate_template(validation_request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{template_id}/stats", response_model=TemplateStatsResponse)
async def get_template_stats(
    template_id: UUID,
    current_user: UUID = Depends(get_current_user)
):
    """Получение статистики использования шаблона"""
    try:
        stats = await TemplateService.get_template_stats(template_id)
        if not stats:
            raise HTTPException(status_code=404, detail="Template not found")
        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{template_id}/favorite", response_model=BaseResponse)
async def toggle_favorite(
    template_id: UUID,
    is_favorite: bool,
    current_user: UUID = Depends(get_current_user)
):
    """Добавление/удаление шаблона из избранного"""
    try:
        # TODO: Реализовать логику избранного
        action = "added to" if is_favorite else "removed from"
        return BaseResponse(
            success=True,
            message=f"Template {action} favorites"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/{template_id}/rate", response_model=BaseResponse)
async def rate_template(
    template_id: UUID,
    rating: int,
    comment: Optional[str] = None,
    current_user: UUID = Depends(get_current_user)
):
    """Оценка шаблона"""
    try:
        if not (1 <= rating <= 5):
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        # TODO: Реализовать логику рейтингов
        return BaseResponse(
            success=True,
            message=f"Template rated {rating} stars"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{template_id}/clone", response_model=GameTemplateResponse)
async def clone_template(
    template_id: UUID,
    name: str,
    current_user: UUID = Depends(get_current_user)
):
    """Клонирование шаблона"""
    try:
        # Получаем исходный шаблон
        original = await TemplateService.get_template_by_id(template_id, current_user)
        if not original:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Создаем копию
        clone_data = GameTemplateCreate(
            name=name,
            description=f"Копия: {original.description}" if original.description else None,
            game_type=original.game_type,
            rules=original.rules,
            settings=original.settings,
            category_id=original.category_id,
            is_public=False,  # Копии по умолчанию приватные
            tags=original.tags + ["копия"]
        )
        
        return await TemplateService.create_template(clone_data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")