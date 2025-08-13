"""
Template Repository - Database operations for templates
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_
from sqlalchemy.orm import selectinload
from ..models.database import TemplateCategory, GameTemplate, TemplateRating, TemplateFavorite

class TemplateRepository:
    """Репозиторий для работы с шаблонами"""

    def __init__(self, db: AsyncSession):
        self.db = db

    # Category operations
    async def create_category(self, category: TemplateCategory) -> TemplateCategory:
        """Создать категорию"""
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def get_category_by_id(self, category_id: int) -> Optional[TemplateCategory]:
        """Получить категорию по ID"""
        result = await self.db.execute(
            select(TemplateCategory).where(TemplateCategory.id == category_id)
        )
        return result.scalar_one_or_none()

    async def get_category_by_name(self, name: str) -> Optional[TemplateCategory]:
        """Получить категорию по названию"""
        result = await self.db.execute(
            select(TemplateCategory).where(TemplateCategory.name == name)
        )
        return result.scalar_one_or_none()

    async def get_all_categories(self) -> List[TemplateCategory]:
        """Получить все категории"""
        result = await self.db.execute(
            select(TemplateCategory).order_by(TemplateCategory.sort_order, TemplateCategory.name)
        )
        return result.scalars().all()

    async def update_category(self, category_id: int, **kwargs) -> Optional[TemplateCategory]:
        """Обновить категорию"""
        result = await self.db.execute(
            update(TemplateCategory)
            .where(TemplateCategory.id == category_id)
            .values(**kwargs)
            .returning(TemplateCategory)
        )
        await self.db.commit()
        return result.scalar_one_or_none()

    async def delete_category(self, category_id: int) -> bool:
        """Удалить категорию"""
        result = await self.db.execute(
            delete(TemplateCategory).where(TemplateCategory.id == category_id)
        )
        await self.db.commit()
        return result.rowcount > 0

    # Template operations
    async def create_template(self, template: GameTemplate) -> GameTemplate:
        """Создать шаблон"""
        self.db.add(template)
        await self.db.commit()
        await self.db.refresh(template)
        return template

    async def get_template_by_id(self, template_id: UUID) -> Optional[GameTemplate]:
        """Получить шаблон по ID с загрузкой связей"""
        result = await self.db.execute(
            select(GameTemplate)
            .options(selectinload(GameTemplate.category))
            .where(GameTemplate.id == template_id)
        )
        return result.scalar_one_or_none()

    async def get_templates_by_category(self, category_id: int, limit: int = 50, offset: int = 0) -> List[GameTemplate]:
        """Получить шаблоны по категории"""
        result = await self.db.execute(
            select(GameTemplate)
            .options(selectinload(GameTemplate.category))
            .where(GameTemplate.category_id == category_id)
            .order_by(GameTemplate.rating.desc(), GameTemplate.usage_count.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()

    async def search_templates(self, search_params: Dict[str, Any], limit: int = 50, offset: int = 0) -> List[GameTemplate]:
        """Поиск шаблонов по параметрам"""
        query = select(GameTemplate).options(selectinload(GameTemplate.category))
        
        # Применяем фильтры
        conditions = []
        
        if search_params.get('game_type'):
            conditions.append(GameTemplate.game_type == search_params['game_type'])
        
        if search_params.get('category_id'):
            conditions.append(GameTemplate.category_id == search_params['category_id'])
        
        if search_params.get('is_public') is not None:
            conditions.append(GameTemplate.is_public == search_params['is_public'])
        
        if search_params.get('is_system') is not None:
            conditions.append(GameTemplate.is_system == search_params['is_system'])
        
        if search_params.get('tags'):
            tags = search_params['tags']
            if isinstance(tags, list):
                for tag in tags:
                    conditions.append(GameTemplate.tags.contains([tag]))
        
        if search_params.get('min_rating'):
            conditions.append(GameTemplate.rating >= search_params['min_rating'])
        
        if search_params.get('max_rating'):
            conditions.append(GameTemplate.rating <= search_params['max_rating'])
        
        if conditions:
            query = query.where(and_(*conditions))
        
        # Сортировка и пагинация
        query = query.order_by(GameTemplate.rating.desc(), GameTemplate.usage_count.desc())
        query = query.limit(limit).offset(offset)
        
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_public_templates(self, limit: int = 50, offset: int = 0) -> List[GameTemplate]:
        """Получить публичные шаблоны"""
        result = await self.db.execute(
            select(GameTemplate)
            .options(selectinload(GameTemplate.category))
            .where(GameTemplate.is_public == True)
            .order_by(GameTemplate.rating.desc(), GameTemplate.usage_count.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()

    async def get_system_templates(self) -> List[GameTemplate]:
        """Получить системные шаблоны"""
        result = await self.db.execute(
            select(GameTemplate)
            .options(selectinload(GameTemplate.category))
            .where(GameTemplate.is_system == True)
            .order_by(GameTemplate.name)
        )
        return result.scalars().all()

    async def update_template(self, template_id: UUID, **kwargs) -> Optional[GameTemplate]:
        """Обновить шаблон"""
        result = await self.db.execute(
            update(GameTemplate)
            .where(GameTemplate.id == template_id)
            .values(**kwargs)
            .returning(GameTemplate)
        )
        await self.db.commit()
        return result.scalar_one_or_none()

    async def delete_template(self, template_id: UUID) -> bool:
        """Удалить шаблон"""
        result = await self.db.execute(
            delete(GameTemplate).where(GameTemplate.id == template_id)
        )
        await self.db.commit()
        return result.rowcount > 0

    async def increment_usage_count(self, template_id: UUID) -> bool:
        """Увеличить счетчик использования"""
        result = await self.db.execute(
            update(GameTemplate)
            .where(GameTemplate.id == template_id)
            .values(usage_count=GameTemplate.usage_count + 1)
        )
        await self.db.commit()
        return result.rowcount > 0

    # Rating operations
    async def create_rating(self, rating: TemplateRating) -> TemplateRating:
        """Создать рейтинг"""
        self.db.add(rating)
        await self.db.commit()
        await self.db.refresh(rating)
        return rating

    async def get_rating_by_user_and_template(self, user_id: UUID, template_id: UUID) -> Optional[TemplateRating]:
        """Получить рейтинг пользователя для шаблона"""
        result = await self.db.execute(
            select(TemplateRating)
            .where(
                and_(
                    TemplateRating.user_id == user_id,
                    TemplateRating.template_id == template_id
                )
            )
        )
        return result.scalar_one_or_none()

    async def update_rating(self, rating_id: UUID, **kwargs) -> Optional[TemplateRating]:
        """Обновить рейтинг"""
        result = await self.db.execute(
            update(TemplateRating)
            .where(TemplateRating.id == rating_id)
            .values(**kwargs)
            .returning(TemplateRating)
        )
        await self.db.commit()
        return result.scalar_one_or_none()

    async def get_template_ratings(self, template_id: UUID) -> List[TemplateRating]:
        """Получить все рейтинги шаблона"""
        result = await self.db.execute(
            select(TemplateRating)
            .where(TemplateRating.template_id == template_id)
            .order_by(TemplateRating.created_at.desc())
        )
        return result.scalars().all()

    async def calculate_template_rating(self, template_id: UUID) -> float:
        """Рассчитать средний рейтинг шаблона"""
        result = await self.db.execute(
            select(func.avg(TemplateRating.rating))
            .where(TemplateRating.template_id == template_id)
        )
        avg_rating = result.scalar()
        return float(avg_rating) if avg_rating else 0.0

    # Favorite operations
    async def add_to_favorites(self, favorite: TemplateFavorite) -> TemplateFavorite:
        """Добавить в избранное"""
        self.db.add(favorite)
        await self.db.commit()
        await self.db.refresh(favorite)
        return favorite

    async def remove_from_favorites(self, user_id: UUID, template_id: UUID) -> bool:
        """Убрать из избранного"""
        result = await self.db.execute(
            delete(TemplateFavorite)
            .where(
                and_(
                    TemplateFavorite.user_id == user_id,
                    TemplateFavorite.template_id == template_id
                )
            )
        )
        await self.db.commit()
        return result.rowcount > 0

    async def is_favorite(self, user_id: UUID, template_id: UUID) -> bool:
        """Проверить, в избранном ли шаблон"""
        result = await self.db.execute(
            select(TemplateFavorite)
            .where(
                and_(
                    TemplateFavorite.user_id == user_id,
                    TemplateFavorite.template_id == template_id
                )
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_user_favorites(self, user_id: UUID) -> List[TemplateFavorite]:
        """Получить избранные шаблоны пользователя"""
        result = await self.db.execute(
            select(TemplateFavorite)
            .options(selectinload(TemplateFavorite.template).selectinload(GameTemplate.category))
            .where(TemplateFavorite.user_id == user_id)
            .order_by(TemplateFavorite.created_at.desc())
        )
        return result.scalars().all()

    # Statistics
    async def get_template_stats(self, template_id: UUID) -> Dict[str, Any]:
        """Получить статистику шаблона"""
        # Количество рейтингов
        ratings_count = await self.db.execute(
            select(func.count(TemplateRating.id))
            .where(TemplateRating.template_id == template_id)
        )
        ratings_count = ratings_count.scalar() or 0

        # Средний рейтинг
        avg_rating = await self.calculate_template_rating(template_id)

        # Количество в избранном
        favorites_count = await self.db.execute(
            select(func.count(TemplateFavorite.id))
            .where(TemplateFavorite.template_id == template_id)
        )
        favorites_count = favorites_count.scalar() or 0

        return {
            "ratings_count": ratings_count,
            "average_rating": avg_rating,
            "favorites_count": favorites_count
        }
