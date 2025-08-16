"""
Migration: Add games and game_queues tables
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_games_and_queues'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Создание таблиц games и game_queues"""
    
    # Создаем enum для статуса игры (с проверкой существования)
    connection = op.get_bind()
    
    # Создаем enum типы с помощью SQL команд
    connection.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE game_status_enum AS ENUM ('active', 'completed', 'cancelled');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """))
    
    connection.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE queue_algorithm_enum AS ENUM ('always_random', 'random_no_repeat', 'manual');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """))
    
    # Таблица игр
    op.create_table(
        'games',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('game_number', sa.Integer, nullable=False),
        sa.Column('status', sa.String(20), nullable=False, default='active'),  # Используем String вместо Enum
        sa.Column('queue_algorithm', sa.String(20), nullable=False),  # Используем String вместо Enum
        sa.Column('current_queue', postgresql.JSONB, nullable=True),
        sa.Column('started_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('completed_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        
        # Индексы
        sa.Index('idx_games_session_id', 'session_id'),
        sa.Index('idx_games_status', 'status'),
        sa.Index('idx_games_created_at', 'created_at'),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['session_id'], ['game_sessions.id'], ondelete='CASCADE')
    )
    
    # Таблица истории очередностей (только для random_no_repeat)
    op.create_table(
        'game_queues',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('game_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('queue_order', postgresql.JSONB, nullable=False),
        sa.Column('algorithm_used', sa.String(20), nullable=False),  # Используем String вместо Enum
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        
        # Индексы
        sa.Index('idx_game_queues_session_id', 'session_id'),
        sa.Index('idx_game_queues_game_id', 'game_id'),
        sa.Index('idx_game_queues_created_at', 'created_at'),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['session_id'], ['game_sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['game_id'], ['games.id'], ondelete='CASCADE')
    )
    
    # Добавляем поле current_game_id в game_sessions для отслеживания активной игры
    # Проверяем существование колонки
    inspector = sa.inspect(connection)
    columns = [col['name'] for col in inspector.get_columns('game_sessions')]
    
    if 'current_game_id' not in columns:
        op.add_column('game_sessions', sa.Column('current_game_id', postgresql.UUID(as_uuid=True), nullable=True))
        op.create_index('idx_game_sessions_current_game_id', 'game_sessions', ['current_game_id'])
        op.create_foreign_key('fk_game_sessions_current_game_id', 'game_sessions', 'games', ['current_game_id'], ['id'])


def downgrade():
    """Откат изменений"""
    
    # Удаляем foreign key и индекс для current_game_id
    op.drop_constraint('fk_game_sessions_current_game_id', 'game_sessions', type_='foreignkey')
    op.drop_index('idx_game_sessions_current_game_id', 'game_sessions')
    op.drop_column('game_sessions', 'current_game_id')
    
    # Удаляем таблицы
    op.drop_table('game_queues')
    op.drop_table('games')
    
    # Удаляем enums
    op.execute("DROP TYPE IF EXISTS queue_algorithm_enum")
    op.execute("DROP TYPE IF EXISTS game_status_enum")
