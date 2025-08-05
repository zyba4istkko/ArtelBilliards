"""
Game Service Database Models
"""

from datetime import datetime
from decimal import Decimal
from uuid import uuid4
from typing import Optional

from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text, 
    ForeignKey, Numeric, Index, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..core.database import Base


class GameType(Base):
    """Типы игр (справочник)"""
    __tablename__ = "game_types"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)  # 'americana', 'moscow_pyramid', 'kolkhoz'
    display_name = Column(String(255), nullable=False)
    description = Column(Text)
    default_rules = Column(JSON)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    sessions = relationship("GameSession", back_populates="game_type")


class GameSession(Base):
    """Игровые сессии"""
    __tablename__ = "game_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    creator_user_id = Column(UUID(as_uuid=True), nullable=False)  # Ссылка на Auth Service
    game_type_id = Column(Integer, ForeignKey("game_types.id"), nullable=False)
    template_id = Column(UUID(as_uuid=True))  # Ссылка на Template Service
    name = Column(String(255), nullable=False)
    status = Column(String(50), default="waiting")  # waiting, in_progress, completed, cancelled
    max_players = Column(Integer, default=8)
    current_players_count = Column(Integer, default=0)
    rules = Column(JSON)  # Конкретные правила для сессии
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    game_type = relationship("GameType", back_populates="sessions")
    participants = relationship("SessionParticipant", back_populates="session", cascade="all, delete-orphan")
    games = relationship("Game", back_populates="session", cascade="all, delete-orphan")


class SessionParticipant(Base):
    """Участники сессий"""
    __tablename__ = "session_participants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("game_sessions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True))  # NULL для пустых пользователей
    display_name = Column(String(255), nullable=False)
    session_role = Column(String(50), default="participant")  # 'creator', 'participant', 'spectator'
    is_empty_user = Column(Boolean, default=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    left_at = Column(DateTime(timezone=True))
    queue_position = Column(Integer)
    current_score = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # Права в сессии
    can_modify_settings = Column(Boolean, default=False)
    can_kick_players = Column(Boolean, default=False)
    can_change_rules = Column(Boolean, default=False)
    invited_by_user_id = Column(UUID(as_uuid=True))
    
    # Накопительный баланс для игры "Колхоз"
    session_balance_rubles = Column(Numeric(10, 2), default=0.00)
    total_games_played = Column(Integer, default=0)
    total_balls_potted = Column(Integer, default=0)
    
    # Relationships
    session = relationship("GameSession", back_populates="participants")
    game_results = relationship("GameResult", back_populates="participant")
    game_events = relationship("GameEvent", back_populates="participant")


class Game(Base):
    """Отдельные игры в рамках сессии"""
    __tablename__ = "games"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("game_sessions.id", ondelete="CASCADE"), nullable=False)
    game_number = Column(Integer, nullable=False)  # Порядковый номер игры в сессии
    status = Column(String(50), default="in_progress")  # in_progress, completed, cancelled
    winner_participant_id = Column(UUID(as_uuid=True), ForeignKey("session_participants.id"))
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    duration_seconds = Column(Integer)
    game_data = Column(JSON)  # Специфичные данные игры
    
    # Relationships
    session = relationship("GameSession", back_populates="games")
    winner = relationship("SessionParticipant", foreign_keys=[winner_participant_id])
    events = relationship("GameEvent", back_populates="game", cascade="all, delete-orphan")
    results = relationship("GameResult", back_populates="game", cascade="all, delete-orphan")


class GameEvent(Base):
    """События в играх (удары, фолы, etc.)"""
    __tablename__ = "game_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("session_participants.id"), nullable=False)
    event_type = Column(String(100), nullable=False)  # 'shot', 'foul', 'combo', 'break', etc.
    event_data = Column(JSON)  # Детали события
    sequence_number = Column(Integer, nullable=False)  # Порядок событий
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    game = relationship("Game", back_populates="events")
    participant = relationship("SessionParticipant", back_populates="game_events")


class GameResult(Base):
    """Результаты игроков в каждой игре (для игры "Колхоз")"""
    __tablename__ = "game_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("session_participants.id"), nullable=False)
    queue_position_in_game = Column(Integer, nullable=False)  # Позиция в очереди в этой игре
    balls_potted = Column(Integer, default=0)  # Количество забитых шаров в игре
    points_scored = Column(Integer, default=0)  # Очки в игре (сумма стоимости шаров)
    rubles_earned = Column(Numeric(10, 2), default=0.00)  # Заработано рублей (от предыдущего игрока)
    rubles_paid = Column(Numeric(10, 2), default=0.00)  # Заплачено рублей (следующему игроку)
    net_result_rubles = Column(Numeric(10, 2), default=0.00)  # Чистый результат (earned - paid)
    point_value_rubles = Column(Numeric(5, 2), nullable=False)  # Стоимость одного очка в рублях
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    game = relationship("Game", back_populates="results")
    participant = relationship("SessionParticipant", back_populates="game_results")


# Индексы
Index("idx_sessions_creator", GameSession.creator_user_id)
Index("idx_sessions_status", GameSession.status)
Index("idx_sessions_type", GameSession.game_type_id)
Index("idx_participants_session", SessionParticipant.session_id)
Index("idx_participants_user", SessionParticipant.user_id)
Index("idx_participants_role", SessionParticipant.session_id, SessionParticipant.session_role)
Index("idx_participants_invited_by", SessionParticipant.invited_by_user_id)
Index("idx_games_session", Game.session_id)
Index("idx_events_game", GameEvent.game_id)
Index("idx_events_sequence", GameEvent.game_id, GameEvent.sequence_number)
Index("idx_results_game", GameResult.game_id)
Index("idx_results_participant", GameResult.participant_id)
Index("idx_results_queue", GameResult.game_id, GameResult.queue_position_in_game)