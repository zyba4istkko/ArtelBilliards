"""
Template Service API endpoints
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from ..core.database import get_db_session
from ..models.schemas import (
    TemplateCategoryCreate, TemplateCategoryUpdate, TemplateCategoryResponse,
    GameTemplateCreate, GameTemplateUpdate, GameTemplateResponse,
    TemplateRatingCreate, TemplateRatingUpdate, TemplateRatingResponse,
    TemplateFavoriteCreate, TemplateFavoriteResponse,
    GameTemplateSearchRequest, SuccessResponse, ErrorResponse, PaginatedResponse
)
from ..services.template_service import TemplateService

router = APIRouter(prefix="/templates", tags=["templates"])

# Category endpoints
@router.post("/categories", response_model=TemplateCategoryResponse)
async def create_category(
    category_data: TemplateCategoryCreate,
    db=Depends(get_db_session)
):
    """Создать новую категорию шаблонов"""
    try:
        return await TemplateService.create_category(category_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка создания категории: {str(e)}")

@router.get("/categories/{category_id}", response_model=TemplateCategoryResponse)
async def get_category(category_id: int, db=Depends(get_db_session)):
    """Получить категорию по ID"""
    category = await TemplateService.get_category(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return category

@router.get("/categories", response_model=List[TemplateCategoryResponse])
async def get_all_categories(db=Depends(get_db_session)):
    """Получить все категории"""
    return await TemplateService.get_all_categories()

@router.put("/categories/{category_id}", response_model=TemplateCategoryResponse)
async def update_category(
    category_id: int,
    category_data: TemplateCategoryUpdate,
    db=Depends(get_db_session)
):
    """Обновить категорию"""
    category = await TemplateService.update_category(category_id, category_data)
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return category

@router.delete("/categories/{category_id}", response_model=SuccessResponse)
async def delete_category(category_id: int, db=Depends(get_db_session)):
    """Удалить категорию"""
    success = await TemplateService.delete_category(category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return SuccessResponse(message="Категория успешно удалена")

# Template endpoints
@router.post("/", response_model=GameTemplateResponse)
async def create_template(
    template_data: GameTemplateCreate,
    db=Depends(get_db_session)
):
    """Создать новый шаблон игры"""
    try:
        return await TemplateService.create_template(template_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка создания шаблона: {str(e)}")

@router.get("/{template_id}", response_model=GameTemplateResponse)
async def get_template(template_id: UUID, db=Depends(get_db_session)):
    """Получить шаблон по ID"""
    template = await TemplateService.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Шаблон не найден")
    return template

@router.get("/", response_model=List[GameTemplateResponse])
async def get_templates(
    category_id: Optional[int] = Query(None, description="ID категории"),
    game_type: Optional[str] = Query(None, description="Тип игры"),
    is_public: Optional[bool] = Query(None, description="Публичный ли шаблон"),
    limit: int = Query(50, ge=1, le=100, description="Количество шаблонов"),
    offset: int = Query(0, ge=0, description="Смещение"),
    db=Depends(get_db_session)
):
    """Получить шаблоны с фильтрацией"""
    if category_id:
        return await TemplateService.get_templates_by_category(category_id, limit, offset)
    elif game_type or is_public is not None:
        search_params = GameTemplateSearchRequest(
            game_type=game_type,
            category_id=category_id,
            is_public=is_public,
            limit=limit,
            offset=offset
        )
        return await TemplateService.search_templates(search_params)
    else:
        return await TemplateService.get_public_templates(limit, offset)

@router.get("/category/{category_id}", response_model=List[GameTemplateResponse])
async def get_templates_by_category(
    category_id: int,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db=Depends(get_db_session)
):
    """Получить шаблоны по категории"""
    return await TemplateService.get_templates_by_category(category_id, limit, offset)

@router.get("/public/list", response_model=List[GameTemplateResponse])
async def get_public_templates(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db=Depends(get_db_session)
):
    """Получить публичные шаблоны"""
    return await TemplateService.get_public_templates(limit, offset)

@router.get("/system/list", response_model=List[GameTemplateResponse])
async def get_system_templates(db=Depends(get_db_session)):
    """Получить системные шаблоны"""
    return await TemplateService.get_system_templates()

@router.put("/{template_id}", response_model=GameTemplateResponse)
async def update_template(
    template_id: UUID,
    template_data: GameTemplateUpdate,
    db=Depends(get_db_session)
):
    """Обновить шаблон"""
    template = await TemplateService.update_template(template_id, template_data)
    if not template:
        raise HTTPException(status_code=404, detail="Шаблон не найден")
    return template

@router.delete("/{template_id}", response_model=SuccessResponse)
async def delete_template(template_id: UUID, db=Depends(get_db_session)):
    """Удалить шаблон"""
    success = await TemplateService.delete_template(template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Шаблон не найден")
    return SuccessResponse(message="Шаблон успешно удален")

@router.post("/{template_id}/usage", response_model=SuccessResponse)
async def increment_usage_count(template_id: UUID, db=Depends(get_db_session)):
    """Увеличить счетчик использования шаблона"""
    success = await TemplateService.increment_usage_count(template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Шаблон не найден")
    return SuccessResponse(message="Счетчик использования обновлен")

# Rating endpoints
@router.post("/{template_id}/ratings", response_model=TemplateRatingResponse)
async def create_rating(
    template_id: UUID,
    rating_data: TemplateRatingCreate,
    user_id: UUID = Query(..., description="ID пользователя"),  # В реальном приложении получаем из JWT
    db=Depends(get_db_session)
):
    """Создать рейтинг для шаблона"""
    try:
        return await TemplateService.create_rating(rating_data, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка создания рейтинга: {str(e)}")

@router.put("/ratings/{rating_id}", response_model=TemplateRatingResponse)
async def update_rating(
    rating_id: UUID,
    rating_data: TemplateRatingUpdate,
    user_id: UUID = Query(..., description="ID пользователя"),
    db=Depends(get_db_session)
):
    """Обновить рейтинг"""
    rating = await TemplateService.update_rating(rating_id, rating_data, user_id)
    if not rating:
        raise HTTPException(status_code=404, detail="Рейтинг не найден")
    return rating

@router.get("/{template_id}/ratings", response_model=List[TemplateRatingResponse])
async def get_template_ratings(template_id: UUID, db=Depends(get_db_session)):
    """Получить все рейтинги шаблона"""
    return await TemplateService.get_template_ratings(template_id)

# Favorite endpoints
@router.post("/{template_id}/favorites", response_model=TemplateFavoriteResponse)
async def add_to_favorites(
    template_id: UUID,
    user_id: UUID = Query(..., description="ID пользователя"),
    db=Depends(get_db_session)
):
    """Добавить шаблон в избранное"""
    try:
        return await TemplateService.add_to_favorites(template_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка добавления в избранное: {str(e)}")

@router.delete("/{template_id}/favorites", response_model=SuccessResponse)
async def remove_from_favorites(
    template_id: UUID,
    user_id: UUID = Query(..., description="ID пользователя"),
    db=Depends(get_db_session)
):
    """Убрать шаблон из избранного"""
    success = await TemplateService.remove_from_favorites(template_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Шаблон не найден в избранном")
    return SuccessResponse(message="Шаблон убран из избранного")

@router.get("/{template_id}/favorites/check", response_model=dict)
async def check_favorite(
    template_id: UUID,
    user_id: UUID = Query(..., description="ID пользователя"),
    db=Depends(get_db_session)
):
    """Проверить, в избранном ли шаблон"""
    is_favorite = await TemplateService.is_favorite(template_id, user_id)
    return {"is_favorite": is_favorite}

@router.get("/user/{user_id}/favorites", response_model=List[TemplateFavoriteResponse])
async def get_user_favorites(user_id: UUID, db=Depends(get_db_session)):
    """Получить избранные шаблоны пользователя"""
    return await TemplateService.get_user_favorites(user_id)

# Statistics endpoints
@router.get("/{template_id}/stats", response_model=dict)
async def get_template_stats(template_id: UUID, db=Depends(get_db_session)):
    """Получить статистику шаблона"""
    return await TemplateService.get_template_stats(template_id)

# Health check
@router.get("/health", response_model=dict)
async def health_check():
    """Проверка здоровья сервиса"""
    return {"status": "healthy", "service": "template-service"}