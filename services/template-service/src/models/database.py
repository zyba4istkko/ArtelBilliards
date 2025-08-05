"""
Template Service Database Models (Stub for Python 3.13 compatibility)
"""

from datetime import datetime
from decimal import Decimal
from uuid import uuid4
from typing import Optional

# Stub models for Python 3.13 compatibility
# These would normally be SQLAlchemy models

class TemplateCategory:
    """Категории шаблонов (stub)"""
    def __init__(self, id: int, name: str, description: str, sort_order: int = 0):
        self.id = id
        self.name = name
        self.description = description
        self.sort_order = sort_order


class GameTemplate:
    """Шаблоны игр (stub)"""
    def __init__(
        self, 
        id: str = None,
        creator_user_id: str = None,
        name: str = "",
        description: str = None,
        game_type: str = "kolkhoz",
        rules: dict = None,
        settings: dict = None,
        category_id: int = None,
        is_public: bool = False,
        is_system: bool = False,
        tags: list = None,
        usage_count: int = 0,
        rating: float = 0.0
    ):
        self.id = id or str(uuid4())
        self.creator_user_id = creator_user_id or "00000000-0000-0000-0000-000000000000"
        self.name = name
        self.description = description
        self.game_type = game_type
        self.rules = rules or {}
        self.settings = settings or {}
        self.category_id = category_id
        self.is_public = is_public
        self.is_system = is_system
        self.tags = tags or []
        self.usage_count = usage_count
        self.rating = rating
        self.created_at = datetime.now()
        self.updated_at = datetime.now()


class TemplateFavorite:
    """Избранные шаблоны (stub)"""
    def __init__(self, user_id: str, template_id: str):
        self.id = str(uuid4())
        self.user_id = user_id
        self.template_id = template_id
        self.created_at = datetime.now()


class TemplateRating:
    """Рейтинги шаблонов (stub)"""
    def __init__(self, user_id: str, template_id: str, rating: int, comment: str = None):
        self.id = str(uuid4())
        self.user_id = user_id
        self.template_id = template_id
        self.rating = rating
        self.comment = comment
        self.created_at = datetime.now()


# Predefined system templates (stub data)
SYSTEM_TEMPLATES = [
    GameTemplate(
        id="11111111-1111-1111-1111-111111111111",
        name="Колхоз стандартный (50₽ за очко)",
        description="Стандартные правила игры Колхоз с оплатой 50 рублей за очко",
        game_type="kolkhoz",
        rules={
            "game_type": "kolkhoz",
            "max_players": 6,
            "min_players": 2,
            "point_value_rubles": 50.00,
            "balls": [
                {"color": "white", "points": 1, "order_priority": 1, "is_required": True},
                {"color": "yellow", "points": 2, "order_priority": 2, "is_required": True},
                {"color": "green", "points": 3, "order_priority": 3, "is_required": True},
                {"color": "brown", "points": 4, "order_priority": 4, "is_required": True},
                {"color": "blue", "points": 5, "order_priority": 5, "is_required": True},
                {"color": "pink", "points": 6, "order_priority": 6, "is_required": True},
                {"color": "black", "points": 7, "order_priority": 7, "is_required": True}
            ],
            "payment_direction": "clockwise",
            "allow_queue_change": True,
            "queue_algorithm": "random_no_repeat",
            "calculate_net_result": True
        },
        settings={
            "ui_theme": "classic",
            "show_running_total": True,
            "enable_sound_effects": True,
            "auto_calculate_results": True
        },
        category_id=1,
        is_public=True,
        is_system=True,
        tags=["стандарт", "колхоз", "средний"],
        usage_count=1250,
        rating=4.8
    ),
    GameTemplate(
        id="22222222-2222-2222-2222-222222222222",
        name="Колхоз бюджетный (25₽ за очко)",
        description="Бюджетный вариант игры Колхоз для начинающих",
        game_type="kolkhoz",
        rules={
            "game_type": "kolkhoz",
            "max_players": 4,
            "min_players": 2,
            "point_value_rubles": 25.00,
            "balls": [
                {"color": "white", "points": 1, "order_priority": 1, "is_required": True},
                {"color": "yellow", "points": 2, "order_priority": 2, "is_required": True},
                {"color": "green", "points": 3, "order_priority": 3, "is_required": True},
                {"color": "pink", "points": 4, "order_priority": 4, "is_required": True}
            ],
            "payment_direction": "clockwise",
            "allow_queue_change": True,
            "queue_algorithm": "always_random",
            "calculate_net_result": True
        },
        settings={
            "ui_theme": "modern",
            "show_running_total": True,
            "enable_tutorials": True
        },
        category_id=1,
        is_public=True,
        is_system=True,
        tags=["бюджет", "колхоз", "новички"],
        usage_count=890,
        rating=4.5
    ),
    GameTemplate(
        id="33333333-3333-3333-3333-333333333333",
        name="Колхоз премиум (200₽ за очко)",
        description="Премиум версия игры Колхоз с высокими ставками",
        game_type="kolkhoz",
        rules={
            "game_type": "kolkhoz",
            "max_players": 6,
            "min_players": 2,
            "point_value_rubles": 200.00,
            "time_limit_minutes": 30,
            "balls": [
                {"color": "white", "points": 1, "order_priority": 1, "is_required": True},
                {"color": "yellow", "points": 2, "order_priority": 2, "is_required": True},
                {"color": "green", "points": 3, "order_priority": 3, "is_required": True},
                {"color": "brown", "points": 4, "order_priority": 4, "is_required": True},
                {"color": "blue", "points": 5, "order_priority": 5, "is_required": True},
                {"color": "pink", "points": 6, "order_priority": 6, "is_required": True},
                {"color": "black", "points": 7, "order_priority": 7, "is_required": True}
            ],
            "payment_direction": "clockwise",
            "allow_queue_change": True,
            "queue_algorithm": "random_no_repeat",
            "calculate_net_result": True
        },
        settings={
            "ui_theme": "premium",
            "show_running_total": True,
            "require_confirmation": True,
            "show_money_warnings": True,
            "enable_advanced_stats": True
        },
        category_id=1,
        is_public=True,
        is_system=True,
        tags=["премиум", "колхоз", "высокие ставки"],
        usage_count=450,
        rating=4.9
    )
]


# Predefined categories (stub data)
SYSTEM_CATEGORIES = [
    TemplateCategory(1, "Колхоз", "Шаблоны для игры Колхоз", 1),
    TemplateCategory(2, "Американка", "Шаблоны для Американки", 2),
    TemplateCategory(3, "Московская пирамида", "Шаблоны для Московской пирамиды", 3),
    TemplateCategory(4, "Турниры", "Шаблоны для турнирных игр", 4),
    TemplateCategory(5, "Обучение", "Упрощенные шаблоны для новичков", 5),
    TemplateCategory(6, "Пользовательские", "Созданные пользователями", 6)
]