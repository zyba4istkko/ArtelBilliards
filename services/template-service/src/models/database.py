"""
Template Service Database Models - SQLAlchemy
"""

from datetime import datetime
from typing import Optional
from uuid import uuid4
from sqlalchemy import Column, String, Integer, Boolean, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class TemplateCategory(Base):
    """Категория шаблонов"""
    __tablename__ = "template_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связи
    templates = relationship("GameTemplate", back_populates="category")

class GameTemplate(Base):
    """Шаблон игры"""
    __tablename__ = "game_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    creator_user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    game_type = Column(String(50), nullable=False, index=True)
    rules = Column(JSONB, nullable=False)
    settings = Column(JSONB)
    category_id = Column(Integer, ForeignKey("template_categories.id"), nullable=False)
    is_public = Column(Boolean, default=True, index=True)
    is_system = Column(Boolean, default=False, index=True)
    tags = Column(JSONB, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связи
    category = relationship("TemplateCategory", back_populates="templates")
    favorites = relationship("TemplateFavorite", back_populates="template")

class TemplateFavorite(Base):
    """Избранные шаблоны пользователей"""
    __tablename__ = "template_favorites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey("game_templates.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Связи
    template = relationship("GameTemplate", back_populates="favorites")

# Initial data for system categories
SYSTEM_CATEGORIES = [
    {"name": "Колхоз", "description": "Шаблоны для игры Колхоз", "sort_order": 1},
    {"name": "Американка", "description": "Шаблоны для Американки", "sort_order": 2},
    {"name": "Московская пирамида", "description": "Шаблоны для Московской пирамиды", "sort_order": 3},
    {"name": "Турниры", "description": "Шаблоны для турнирных игр", "sort_order": 4},
    {"name": "Обучение", "description": "Упрощенные шаблоны для новичков", "sort_order": 5},
    {"name": "Пользовательские", "description": "Созданные пользователями", "sort_order": 6}
]

# Initial data for system templates (will be inserted via migrations)
SYSTEM_TEMPLATES = [
    {
        "name": "Колхоз стандартный (50₽ за очко)",
        "description": "Стандартные правила игры Колхоз с оплатой 50 рублей за очко",
        "game_type": "kolkhoz",
        "rules": {
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
        "settings": {
            "ui_theme": "classic",
            "show_running_total": True,
            "enable_sound_effects": True,
            "auto_calculate_results": True
        },
        "category_id": 1,
        "is_public": True,
        "is_system": True,
        "tags": ["стандарт", "колхоз", "средний"],
        "usage_count": 1250,
        "rating": 4.8
    },
    {
        "name": "Колхоз бюджетный (25₽ за очко)",
        "description": "Бюджетный вариант игры Колхоз для начинающих",
        "game_type": "kolkhoz",
        "rules": {
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
        "settings": {
            "ui_theme": "modern",
            "show_running_total": True,
            "enable_tutorials": True
        },
        "category_id": 1,
        "is_public": True,
        "is_system": True,
        "tags": ["бюджет", "колхоз", "новички"],
        "usage_count": 890,
        "rating": 4.5
    },
    {
        "name": "Колхоз премиум (200₽ за очко)",
        "description": "Премиум версия игры Колхоз с высокими ставками",
        "game_type": "kolkhoz",
        "rules": {
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
        "settings": {
            "ui_theme": "premium",
            "show_running_total": True,
            "require_confirmation": True,
            "show_money_warnings": True,
            "enable_advanced_stats": True
        },
        "category_id": 1,
        "is_public": True,
        "is_system": True,
        "tags": ["премиум", "колхоз", "высокие ставки"],
        "usage_count": 450,
        "rating": 4.9
    }
]