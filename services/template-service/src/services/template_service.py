"""
Template Service - Управление шаблонами игр
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID

from ..models.database import GameTemplate, TemplateCategory, SYSTEM_TEMPLATES, SYSTEM_CATEGORIES
from ..models.schemas import (
    GameTemplateCreate, GameTemplateUpdate, GameTemplateResponse, 
    GameTemplateListResponse, GameTemplateSearchRequest,
    TemplateCategoryResponse, GameType, TemplateStatsResponse,
    TemplateValidationRequest, TemplateValidationResponse
)


class TemplateService:
    """Сервис для управления шаблонами игр (stub implementation)"""
    
    @staticmethod
    async def get_templates(
        search_request: GameTemplateSearchRequest = None,
        user_id: Optional[UUID] = None,
        page: int = 1,
        page_size: int = 20
    ) -> GameTemplateListResponse:
        """Получение списка шаблонов с фильтрацией (stub)"""
        
        # Применяем фильтры к системным шаблонам
        filtered_templates = SYSTEM_TEMPLATES.copy()
        
        if search_request:
            if search_request.game_type:
                filtered_templates = [
                    t for t in filtered_templates 
                    if t.game_type == search_request.game_type
                ]
            
            if search_request.query:
                query_lower = search_request.query.lower()
                filtered_templates = [
                    t for t in filtered_templates 
                    if query_lower in t.name.lower() or 
                       (t.description and query_lower in t.description.lower())
                ]
            
            if search_request.category_id:
                filtered_templates = [
                    t for t in filtered_templates 
                    if t.category_id == search_request.category_id
                ]
        
        # Пагинация
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_templates = filtered_templates[start_idx:end_idx]
        
        # Конвертируем в response модели
        template_responses = []
        for template in paginated_templates:
            template_responses.append(
                await TemplateService._convert_to_response(template, user_id)
            )
        
        # Получаем категории
        categories = [
            TemplateCategoryResponse(
                id=cat.id,
                name=cat.name,
                description=cat.description,
                sort_order=cat.sort_order,
                templates_count=len([t for t in SYSTEM_TEMPLATES if t.category_id == cat.id])
            )
            for cat in SYSTEM_CATEGORIES
        ]
        
        return GameTemplateListResponse(
            templates=template_responses,
            total=len(filtered_templates),
            page=page,
            page_size=page_size,
            categories=categories
        )
    
    @staticmethod
    async def get_template_by_id(template_id: UUID, user_id: Optional[UUID] = None) -> Optional[GameTemplateResponse]:
        """Получение шаблона по ID (stub)"""
        
        # Ищем в системных шаблонах
        template = next((t for t in SYSTEM_TEMPLATES if t.id == str(template_id)), None)
        
        if not template:
            return None
        
        return await TemplateService._convert_to_response(template, user_id)
    
    @staticmethod
    async def create_template(
        template_data: GameTemplateCreate, 
        creator_user_id: UUID
    ) -> GameTemplateResponse:
        """Создание нового шаблона (stub)"""
        
        # Создаем новый шаблон
        new_template = GameTemplate(
            creator_user_id=str(creator_user_id),
            name=template_data.name,
            description=template_data.description,
            game_type=template_data.game_type,
            rules=template_data.rules,
            settings=template_data.settings,
            category_id=template_data.category_id,
            is_public=template_data.is_public,
            tags=template_data.tags
        )
        
        return await TemplateService._convert_to_response(new_template, creator_user_id)
    
    @staticmethod
    async def update_template(
        template_id: UUID,
        template_data: GameTemplateUpdate,
        user_id: UUID
    ) -> Optional[GameTemplateResponse]:
        """Обновление шаблона (stub)"""
        
        # В реальной реализации здесь была бы проверка прав и обновление в БД
        # Пока возвращаем исходный шаблон
        return await TemplateService.get_template_by_id(template_id, user_id)
    
    @staticmethod
    async def delete_template(template_id: UUID, user_id: UUID) -> bool:
        """Удаление шаблона (stub)"""
        
        # В реальной реализации здесь была бы проверка прав и удаление из БД
        return True
    
    @staticmethod
    async def get_popular_templates(
        game_type: Optional[GameType] = None,
        limit: int = 10
    ) -> List[GameTemplateResponse]:
        """Получение популярных шаблонов (stub)"""
        
        templates = SYSTEM_TEMPLATES.copy()
        
        if game_type:
            templates = [t for t in templates if t.game_type == game_type]
        
        # Сортируем по рейтингу и использованию
        templates.sort(key=lambda t: (t.rating, t.usage_count), reverse=True)
        
        popular_templates = []
        for template in templates[:limit]:
            popular_templates.append(
                await TemplateService._convert_to_response(template)
            )
        
        return popular_templates
    
    @staticmethod
    async def get_user_templates(
        user_id: UUID,
        page: int = 1,
        page_size: int = 20
    ) -> GameTemplateListResponse:
        """Получение шаблонов пользователя (stub)"""
        
        # В stub версии возвращаем пустой список пользовательских шаблонов
        return GameTemplateListResponse(
            templates=[],
            total=0,
            page=page,
            page_size=page_size,
            categories=[]
        )
    
    @staticmethod
    async def validate_template(
        validation_request: TemplateValidationRequest
    ) -> TemplateValidationResponse:
        """Валидация правил шаблона (stub)"""
        
        errors = []
        warnings = []
        
        rules = validation_request.rules
        
        # Базовая валидация
        if not rules.get("game_type"):
            errors.append("game_type is required")
        
        if rules.get("point_value_rubles", 0) <= 0:
            errors.append("point_value_rubles must be greater than 0")
        
        if rules.get("max_players", 0) > 8:
            errors.append("max_players cannot exceed 8")
        
        # Специфическая валидация для Колхоз
        if validation_request.game_type == GameType.KOLKHOZ:
            balls = rules.get("balls", [])
            if not balls:
                errors.append("balls configuration is required for Kolkhoz")
            elif len(balls) < 2:
                warnings.append("Recommend at least 2 balls for interesting gameplay")
        
        return TemplateValidationResponse(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            normalized_rules=rules if len(errors) == 0 else None
        )
    
    @staticmethod
    async def get_template_stats(template_id: UUID) -> Optional[TemplateStatsResponse]:
        """Получение статистики использования шаблона (stub)"""
        
        template = next((t for t in SYSTEM_TEMPLATES if t.id == str(template_id)), None)
        
        if not template:
            return None
        
        return TemplateStatsResponse(
            template_id=UUID(template.id),
            usage_count=template.usage_count,
            average_rating=template.rating,
            ratings_count=int(template.usage_count * 0.15),  # 15% пользователей оставляют рейтинг
            favorites_count=int(template.usage_count * 0.08),  # 8% добавляют в избранное
            last_used=datetime.now(),
            popular_settings={
                "most_used_point_value": template.rules.get("point_value_rubles"),
                "most_used_max_players": template.rules.get("max_players"),
                "preferred_queue_algorithm": template.rules.get("queue_algorithm")
            }
        )
    
    @staticmethod
    async def _convert_to_response(
        template: GameTemplate, 
        user_id: Optional[UUID] = None
    ) -> GameTemplateResponse:
        """Конвертация модели в response (stub)"""
        
        # Получаем название категории
        category_name = None
        if template.category_id:
            category = next((c for c in SYSTEM_CATEGORIES if c.id == template.category_id), None)
            if category:
                category_name = category.name
        
        return GameTemplateResponse(
            id=UUID(template.id),
            creator_user_id=UUID(template.creator_user_id),
            name=template.name,
            description=template.description,
            game_type=template.game_type,
            rules=template.rules,
            settings=template.settings,
            category_id=template.category_id,
            category_name=category_name,
            is_public=template.is_public,
            is_system=template.is_system,
            is_favorite=False,  # В реальной версии проверяем по user_id
            tags=template.tags,
            usage_count=template.usage_count,
            rating=template.rating,
            created_at=template.created_at,
            updated_at=template.updated_at
        )