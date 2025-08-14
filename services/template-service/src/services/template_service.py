"""
Template Service - Business logic for templates
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from ..core.database import get_db_session_context
from ..models.database import TemplateCategory, GameTemplate, TemplateFavorite
from ..models.schemas import (
    TemplateCategoryCreate, TemplateCategoryUpdate, TemplateCategoryResponse,
    GameTemplateCreate, GameTemplateUpdate, GameTemplateResponse,
    TemplateFavoriteCreate, TemplateFavoriteResponse,
    GameTemplateSearchRequest
)
from ..repositories.template_repository import TemplateRepository

class TemplateService:
    """Сервис для работы с шаблонами"""

    @staticmethod
    async def create_category(category_data: TemplateCategoryCreate) -> TemplateCategoryResponse:
        """Создать категорию"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            
            # Проверяем, не существует ли уже категория с таким именем
            existing = await repo.get_category_by_name(category_data.name)
            if existing:
                raise ValueError(f"Категория с названием '{category_data.name}' уже существует")
            
            # Создаем новую категорию
            category = TemplateCategory(**category_data.dict())
            created_category = await repo.create_category(category)
            
            return TemplateCategoryResponse.from_orm(created_category)

    @staticmethod
    async def get_category(category_id: int) -> Optional[TemplateCategoryResponse]:
        """Получить категорию по ID"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            category = await repo.get_category_by_id(category_id)
            return TemplateCategoryResponse.from_orm(category) if category else None

    @staticmethod
    async def get_all_categories() -> List[TemplateCategoryResponse]:
        """Получить все категории"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            categories = await repo.get_all_categories()
            return [TemplateCategoryResponse.from_orm(cat) for cat in categories]

    @staticmethod
    async def update_category(category_id: int, category_data: TemplateCategoryUpdate) -> Optional[TemplateCategoryResponse]:
        """Обновить категорию"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            
            # Проверяем существование категории
            existing = await repo.get_category_by_id(category_id)
            if not existing:
                return None
            
            # Обновляем категорию
            updated_category = await repo.update_category(category_id, **category_data.dict(exclude_unset=True))
            return TemplateCategoryResponse.from_orm(updated_category) if updated_category else None

    @staticmethod
    async def delete_category(category_id: int) -> bool:
        """Удалить категорию"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            return await repo.delete_category(category_id)

    @staticmethod
    async def create_template(template_data: GameTemplateCreate) -> GameTemplateResponse:
        """Создать шаблон"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            
            # Проверяем существование категории
            category = await repo.get_category_by_id(template_data.category_id)
            if not category:
                raise ValueError(f"Категория с ID {template_data.category_id} не найдена")
            
            # Создаем шаблон
            template = GameTemplate(**template_data.dict())
            created_template = await repo.create_template(template)
            
            # Загружаем связанные данные
            await db.refresh(created_template, ['category'])
            
            return GameTemplateResponse.from_orm(created_template)

    @staticmethod
    async def get_template(template_id: UUID) -> Optional[GameTemplateResponse]:
        """Получить шаблон по ID"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            template = await repo.get_template_by_id(template_id)
            return GameTemplateResponse.from_orm(template) if template else None

    @staticmethod
    async def get_templates_by_category(category_id: int, limit: int = 50, offset: int = 0) -> List[GameTemplateResponse]:
        """Получить шаблоны по категории"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            templates = await repo.get_templates_by_category(category_id, limit, offset)
            return [GameTemplateResponse.from_orm(template) for template in templates]

    @staticmethod
    async def search_templates(search_params: GameTemplateSearchRequest) -> List[GameTemplateResponse]:
        """Поиск шаблонов"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            templates = await repo.search_templates(search_params.dict(), search_params.limit, search_params.offset)
            return [GameTemplateResponse.from_orm(template) for template in templates]

    @staticmethod
    async def get_public_templates(limit: int = 50, offset: int = 0) -> List[GameTemplateResponse]:
        """Получить публичные шаблоны"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            templates = await repo.get_public_templates(limit, offset)
            return [GameTemplateResponse.from_orm(template) for template in templates]

    @staticmethod
    async def get_system_templates() -> List[GameTemplateResponse]:
        """Получить системные шаблоны"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            templates = await repo.get_system_templates()
            return [GameTemplateResponse.from_orm(template) for template in templates]

    @staticmethod
    async def update_template(template_id: UUID, template_data: GameTemplateUpdate) -> Optional[GameTemplateResponse]:
        """Обновить шаблон"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            
            # Проверяем существование шаблона
            existing = await repo.get_template_by_id(template_id)
            if not existing:
                return None
            
            # Обновляем шаблон
            updated_template = await repo.update_template(template_id, **template_data.dict(exclude_unset=True))
            if updated_template:
                # Загружаем связанные данные
                await db.refresh(updated_template, ['category'])
                return GameTemplateResponse.from_orm(updated_template)
            return None

    @staticmethod
    async def delete_template(template_id: UUID) -> bool:
        """Удалить шаблон"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            return await repo.delete_template(template_id)

    # Favorite operations
    @staticmethod
    async def add_to_favorites(template_id: UUID, user_id: UUID) -> TemplateFavoriteResponse:
        """Добавить в избранное"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            
            # Проверяем существование шаблона
            template = await repo.get_template_by_id(template_id)
            if not template:
                raise ValueError(f"Шаблон с ID {template_id} не найден")
            
            # Проверяем, не в избранном ли уже
            if await repo.is_favorite(user_id, template_id):
                raise ValueError("Шаблон уже в избранном")
            
            # Добавляем в избранное
            favorite = TemplateFavorite(template_id=template_id, user_id=user_id)
            created_favorite = await repo.add_to_favorites(favorite)
            
            return TemplateFavoriteResponse.from_orm(created_favorite)

    @staticmethod
    async def remove_from_favorites(template_id: UUID, user_id: UUID) -> bool:
        """Убрать из избранного"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            return await repo.remove_from_favorites(user_id, template_id)

    @staticmethod
    async def is_favorite(template_id: UUID, user_id: UUID) -> bool:
        """Проверить, в избранном ли шаблон"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            return await repo.is_favorite(user_id, template_id)

    @staticmethod
    async def get_user_favorites(user_id: UUID) -> List[TemplateFavoriteResponse]:
        """Получить избранные шаблоны пользователя"""
        async with get_db_session_context() as db:
            repo = TemplateRepository(db)
            favorites = await repo.get_user_favorites(user_id)
            return [TemplateFavoriteResponse.from_orm(fav) for fav in favorites]