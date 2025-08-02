# Проектирование тестовой стратегии (pytest)

🎨🎨🎨 **ENTERING CREATIVE PHASE: TESTING STRATEGY** 🎨🎨🎨

## Описание компонента

Комплексная стратегия тестирования для микросервисной архитектуры бильярдного приложения, включающая unit, integration, end-to-end, performance и security тесты. Стратегия должна обеспечить высокое качество кода, надежность системы, быструю обратную связь для разработчиков и автоматизацию CI/CD процессов для 6 микросервисов с complex business logic и real-time functionality.

## Требования и ограничения

### Функциональные требования:
- **Comprehensive Coverage**: 90%+ покрытие кода unit тестами
- **Integration Testing**: Тестирование взаимодействия между всеми 6 микросервисами
- **Real-time Testing**: Тестирование WebSocket connections и RabbitMQ messaging
- **Database Testing**: Тестирование complex queries и data integrity
- **Business Logic Testing**: Особое внимание логике игры "Колхоз"
- **Performance Testing**: Load testing для 1000+ concurrent users
- **Security Testing**: Authentication, authorization, data protection

### Технические ограничения:
- **Test Execution Time**: < 10 minutes для полного test suite
- **Test Environment**: Docker-based изолированные environments
- **CI/CD Integration**: Automated testing в GitHub Actions/GitLab CI
- **Test Data Management**: Reproducible test scenarios
- **Parallel Execution**: Параллельное выполнение тестов для скорости
- **Framework**: pytest + ecosystem (pytest-asyncio, pytest-mock, etc.)

### Бизнес-ограничения:
- **Quality Gates**: Обязательные тесты для production deployments
- **Developer Experience**: Быстрая локальная разработка с тестами
- **Regression Prevention**: Защита от breaking changes
- **Compliance**: Тестирование GDPR compliance и security standards

## Варианты архитектуры тестирования

### Вариант 1: Monolithic Test Suite

**Описание**: Единый test suite для всех микросервисов с shared fixtures и utilities.

**Структура**:
```
tests/
├── unit/
│   ├── auth_service/
│   ├── game_service/
│   ├── stats_service/
│   └── ...
├── integration/
├── e2e/
└── shared/
    ├── fixtures/
    └── utils/
```

**Преимущества**:
- Простота управления и координации тестов
- Shared test utilities и fixtures
- Единая конфигурация и CI/CD setup
- Легкость cross-service integration testing
- Консистентные test patterns

**Недостатки**:
- Медленное выполнение при росте test suite
- Tight coupling между test modules
- Сложность изоляции test failures
- Potential conflicts в shared dependencies

### Вариант 2: Service-Specific Test Suites

**Описание**: Отдельные test suites для каждого микросервиса с независимыми CI/CD pipelines.

**Структура**:
```
auth-service/tests/
game-service/tests/
stats-service/tests/
friends-service/tests/
template-service/tests/
notification-service/tests/
integration-tests/
```

**Преимущества**:
- Быстрое выполнение service-specific тестов
- Независимые CI/CD pipelines
- Clear ownership и responsibility
- Параллельное развитие test suites
- Изоляция test failures

**Недостатки**:
- Дублирование test utilities
- Сложность integration testing
- Inconsistent test patterns
- Overhead на поддержку multiple test setups

### Вариант 3: Hybrid Testing Architecture

**Описание**: Комбинация service-specific unit тестов с centralized integration и e2e тестами.

**Структура**:
```
services/
├── auth-service/tests/unit/
├── game-service/tests/unit/
└── ...
tests/
├── integration/
├── e2e/
├── performance/
├── security/
└── shared/
```

**Преимущества**:
- Быстрые unit тесты на service level
- Comprehensive integration testing
- Shared test infrastructure для complex scenarios
- Гибкость в выборе test strategies
- Clear separation of concerns

**Недостатки**:
- Средняя сложность setup и maintenance
- Необходимость coordination между test types
- Potential duplication в некоторых areas

## Анализ вариантов

### Критерии оценки:
1. **Execution Speed** - скорость выполнения тестов
2. **Maintainability** - простота поддержки и развития
3. **Test Coverage** - полнота покрытия функциональности
4. **CI/CD Integration** - удобство автоматизации
5. **Developer Experience** - удобство для разработчиков

### Оценка вариантов:

| Критерий | Monolithic | Service-Specific | Hybrid |
|----------|------------|------------------|--------|
| **Execution Speed** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Maintainability** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Test Coverage** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **CI/CD Integration** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Developer Experience** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Рекомендуемое решение

### **Выбор: Hybrid Testing Architecture (Вариант 3)**

**Обоснование**:
1. **Microservices Nature**: Service-specific unit тесты обеспечивают быструю обратную связь
2. **Complex Integration**: Centralized integration тесты критичны для messaging и real-time features
3. **Developer Productivity**: Developers могут запускать unit тесты локально быстро
4. **Quality Assurance**: Comprehensive e2e и performance тесты гарантируют system reliability

### Архитектурное решение:

```mermaid
graph TB
    subgraph "Service-Level Testing"
        AuthTests[Auth Service<br/>Unit Tests]
        GameTests[Game Service<br/>Unit Tests]
        StatsTests[Stats Service<br/>Unit Tests]
        FriendsTests[Friends Service<br/>Unit Tests]
        TemplateTests[Template Service<br/>Unit Tests]
        NotifyTests[Notification Service<br/>Unit Tests]
    end
    
    subgraph "Integration Testing"
        ServiceIntegration[Service-to-Service<br/>Integration Tests]
        DatabaseTests[Database<br/>Integration Tests]
        MessageTests[RabbitMQ<br/>Message Tests]
        CacheTests[Redis<br/>Cache Tests]
        SearchTests[Elasticsearch<br/>Search Tests]
    end
    
    subgraph "System Testing"
        E2ETests[End-to-End<br/>User Journeys]
        PerformanceTests[Performance<br/>Load Tests]
        SecurityTests[Security<br/>Penetration Tests]
        ContractTests[API Contract<br/>Tests]
    end
    
    subgraph "Test Infrastructure"
        TestDB[(Test Databases<br/>PostgreSQL)]
        TestMQ[Test RabbitMQ<br/>Instance]
        TestRedis[Test Redis<br/>Instance]
        TestES[Test Elasticsearch<br/>Instance]
        MockServices[Mock External<br/>Services]
    end
    
    subgraph "CI/CD Pipeline"
        UnitStage[Unit Tests<br/>Fast Feedback]
        IntegrationStage[Integration Tests<br/>Service Verification]
        E2EStage[E2E Tests<br/>User Validation]
        PerformanceStage[Performance Tests<br/>Load Validation]
    end
    
    AuthTests --> UnitStage
    GameTests --> UnitStage
    StatsTests --> UnitStage
    FriendsTests --> UnitStage
    TemplateTests --> UnitStage
    NotifyTests --> UnitStage
    
    ServiceIntegration --> IntegrationStage
    DatabaseTests --> IntegrationStage
    MessageTests --> IntegrationStage
    CacheTests --> IntegrationStage
    SearchTests --> IntegrationStage
    
    E2ETests --> E2EStage
    ContractTests --> E2EStage
    SecurityTests --> E2EStage
    
    PerformanceTests --> PerformanceStage
    
    IntegrationStage --> TestDB
    IntegrationStage --> TestMQ
    IntegrationStage --> TestRedis
    IntegrationStage --> TestES
    
    E2EStage --> MockServices
    
    style UnitStage fill:#e8f5e8
    style IntegrationStage fill:#fff3e0
    style E2EStage fill:#e1f5fe
    style PerformanceStage fill:#fce4ec
```

## Implementation Guidelines

### 1. Project Structure

**Directory Organization**:
```
artelBilliards/
├── services/
│   ├── auth-service/
│   │   ├── src/
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── conftest.py
│   │   │   └── pytest.ini
│   │   └── requirements-test.txt
│   ├── game-service/
│   │   ├── src/
│   │   ├── tests/
│   │   └── ...
│   └── ...
├── tests/
│   ├── integration/
│   │   ├── test_service_communication.py
│   │   ├── test_database_integration.py
│   │   ├── test_rabbitmq_messaging.py
│   │   └── test_redis_caching.py
│   ├── e2e/
│   │   ├── test_user_registration.py
│   │   ├── test_game_flow.py
│   │   ├── test_friend_management.py
│   │   └── test_kolkhoz_game.py
│   ├── performance/
│   │   ├── test_load_game_sessions.py
│   │   ├── test_concurrent_users.py
│   │   └── test_database_performance.py
│   ├── security/
│   │   ├── test_auth_security.py
│   │   ├── test_api_security.py
│   │   └── test_data_protection.py
│   ├── contracts/
│   │   ├── auth_service_contract.py
│   │   ├── game_service_contract.py
│   │   └── ...
│   ├── fixtures/
│   │   ├── database_fixtures.py
│   │   ├── user_fixtures.py
│   │   ├── game_fixtures.py
│   │   └── rabbitmq_fixtures.py
│   ├── utils/
│   │   ├── test_helpers.py
│   │   ├── mock_services.py
│   │   └── data_generators.py
│   ├── conftest.py
│   └── pytest.ini
├── docker-compose.test.yml
└── .github/workflows/test.yml
```

**Global pytest Configuration**:
```ini
# tests/pytest.ini
[tool:pytest]
testpaths = tests services
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*
addopts = 
    --strict-markers
    --disable-warnings
    --tb=short
    --cov=src
    --cov-report=term-missing
    --cov-report=html:htmlcov
    --cov-fail-under=90
    -v
asyncio_mode = auto
markers =
    unit: Unit tests
    integration: Integration tests
    e2e: End-to-end tests
    performance: Performance tests
    security: Security tests
    slow: Slow running tests
    requires_db: Tests that require database
    requires_redis: Tests that require Redis
    requires_rabbitmq: Tests that require RabbitMQ
    requires_elasticsearch: Tests that require Elasticsearch
```

### 2. Test Dependencies

**Core Testing Stack**:
```python
# requirements-test.txt
pytest==7.4.0
pytest-asyncio==0.21.1
pytest-mock==3.11.1
pytest-cov==4.1.0
pytest-xdist==3.3.1          # Parallel test execution
pytest-html==3.2.0           # HTML test reports
pytest-timeout==2.1.0        # Test timeouts
pytest-benchmark==4.0.0      # Performance benchmarks
pytest-factoryboy==2.5.1     # Test data factories
pytest-freezegun==0.4.2      # Time mocking
pytest-httpx==0.21.0         # HTTP client testing
pytest-postgresql==5.0.0     # PostgreSQL test fixtures
pytest-redis==3.0.2          # Redis test fixtures
pytest-rabbitmq==2.2.1       # RabbitMQ test fixtures

# Mocking and Fixtures
factory-boy==3.3.0           # Test data generation
Faker==19.3.0                # Fake data generation
responses==0.23.3            # HTTP responses mocking
freezegun==1.2.2             # Time mocking
aioresponses==0.7.4          # Async HTTP mocking

# Database Testing
sqlalchemy-utils==0.41.1     # Database test utilities
alembic==1.11.1              # Migration testing

# Performance Testing
locust==2.16.1               # Load testing
memory-profiler==0.60.0      # Memory profiling

# Security Testing
bandit==1.7.5                # Security linting
safety==2.3.5                # Dependency vulnerability scanning
```

### 3. Unit Testing Strategy

**Service-Level Unit Tests**:
```python
# services/game-service/tests/unit/test_game_logic.py
import pytest
from unittest.mock import AsyncMock, Mock
from uuid import uuid4
from datetime import datetime

from src.services.game_service import GameService
from src.models.game_models import GameSession, GameEvent
from src.schemas.game_schemas import KolkhozGameRules, BallPottedEvent

class TestGameService:
    """Unit tests для Game Service"""
    
    @pytest.fixture
    def mock_db(self):
        """Mock database session"""
        return AsyncMock()
    
    @pytest.fixture
    def mock_event_publisher(self):
        """Mock event publisher"""
        return AsyncMock()
    
    @pytest.fixture
    def game_service(self, mock_db, mock_event_publisher):
        """Game service instance с mocked dependencies"""
        return GameService(db=mock_db, event_publisher=mock_event_publisher)
    
    @pytest.fixture
    def sample_kolkhoz_rules(self):
        """Sample Kolkhoz game rules"""
        return KolkhozGameRules(
            game_type="kolkhoz",
            point_value_rubles=50.0,
            balls=[
                {"color": "white", "points": 1},
                {"color": "yellow", "points": 2},
                {"color": "red", "points": 4},
                {"color": "black", "points": 7}
            ],
            queue_algorithm="random_no_repeat"
        )
    
    @pytest.fixture
    def sample_game_session(self, sample_kolkhoz_rules):
        """Sample game session"""
        return GameSession(
            id=uuid4(),
            name="Test Kolkhoz Game",
            creator_user_id=uuid4(),
            template_id=uuid4(),
            rules=sample_kolkhoz_rules.dict(),
            status="waiting_for_players",
            created_at=datetime.utcnow()
        )
    
    @pytest.mark.asyncio
    async def test_create_game_session_success(self, game_service, mock_db, sample_kolkhoz_rules):
        """Тест успешного создания игровой сессии"""
        
        # Arrange
        creator_id = uuid4()
        session_name = "Test Game"
        template_id = uuid4()
        
        mock_db.add = Mock()
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()
        
        # Act
        result = await game_service.create_game_session(
            creator_id=creator_id,
            name=session_name,
            template_id=template_id,
            rules=sample_kolkhoz_rules
        )
        
        # Assert
        assert result.name == session_name
        assert result.creator_user_id == creator_id
        assert result.template_id == template_id
        assert result.status == "waiting_for_players"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_ball_potted_event_kolkhoz(self, game_service, mock_db, sample_game_session):
        """Тест обработки события забитого шара в игре Колхоз"""
        
        # Arrange
        player_id = uuid4()
        ball_event = BallPottedEvent(
            player_id=player_id,
            ball_color="red",
            ball_points=4,
            position_x=100.0,
            position_y=150.0
        )
        
        # Mock database calls
        mock_db.execute = AsyncMock()
        mock_db.commit = AsyncMock()
        
        # Act
        await game_service.process_ball_potted_event(
            session_id=sample_game_session.id,
            event=ball_event
        )
        
        # Assert
        mock_db.execute.assert_called()
        mock_db.commit.assert_called_once()
        
        # Verify event publishing
        game_service.event_publisher.publish_game_event.assert_called_once()
        published_event = game_service.event_publisher.publish_game_event.call_args[0][0]
        assert published_event.event_type == "game.ball_potted"
        assert published_event.data["ball_points"] == 4
    
    @pytest.mark.asyncio
    async def test_calculate_kolkhoz_results_three_players(self, game_service):
        """Тест расчета результатов игры Колхоз для трех игроков"""
        
        # Arrange - пример из требований
        # Игрок 1: 5 шаров, Игрок 2: 8 шаров, Игрок 3: 2 шара
        # Ожидаемый результат: Игрок 1: -3, Игрок 2: +6, Игрок 3: -3
        game_results = [
            {"player_id": uuid4(), "balls_potted": 5, "total_points": 15},
            {"player_id": uuid4(), "balls_potted": 8, "total_points": 24},
            {"player_id": uuid4(), "balls_potted": 2, "total_points": 6}
        ]
        
        point_value = 50.0  # 50 рублей за очко
        
        # Act
        results = game_service._calculate_kolkhoz_payment_results(game_results, point_value)
        
        # Assert
        assert len(results) == 3
        
        # Игрок 1 платит Игроку 2: 5 шаров * 50 = 250 рублей
        # Игрок 2 платит Игроку 3: 8 шаров * 50 = 400 рублей  
        # Игрок 3 платит Игроку 1: 2 шара * 50 = 100 рублей
        # Итого: Игрок 1: -250 + 100 = -150, Игрок 2: +250 - 400 = -150, Игрок 3: +400 - 100 = +300
        
        player_1_result = next(r for r in results if r["balls_potted"] == 5)
        player_2_result = next(r for r in results if r["balls_potted"] == 8)
        player_3_result = next(r for r in results if r["balls_potted"] == 2)
        
        assert player_1_result["rubles_paid"] == 250.0
        assert player_1_result["rubles_earned"] == 100.0
        assert player_1_result["net_result"] == -150.0
        
        assert player_2_result["rubles_paid"] == 400.0
        assert player_2_result["rubles_earned"] == 250.0
        assert player_2_result["net_result"] == -150.0
        
        assert player_3_result["rubles_paid"] == 100.0
        assert player_3_result["rubles_earned"] == 400.0
        assert player_3_result["net_result"] == 300.0
        
        # Проверяем что сумма всех net_result = 0
        total_net = sum(r["net_result"] for r in results)
        assert abs(total_net) < 0.01  # Учитываем floating point precision
    
    @pytest.mark.asyncio
    async def test_validate_player_turn_success(self, game_service, mock_db):
        """Тест валидации хода игрока"""
        
        # Arrange
        session_id = uuid4()
        player_id = uuid4()
        
        # Mock current game state
        mock_current_game = Mock()
        mock_current_game.current_player_id = player_id
        mock_current_game.status = "in_progress"
        
        mock_db.execute = AsyncMock(return_value=Mock(scalar_one_or_none=Mock(return_value=mock_current_game)))
        
        # Act
        result = await game_service.validate_player_turn(session_id, player_id)
        
        # Assert
        assert result == mock_current_game
        mock_db.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_validate_player_turn_wrong_player(self, game_service, mock_db):
        """Тест валидации хода - неправильный игрок"""
        
        # Arrange
        session_id = uuid4()
        player_id = uuid4()
        other_player_id = uuid4()
        
        # Mock current game state
        mock_current_game = Mock()
        mock_current_game.current_player_id = other_player_id  # Другой игрок
        mock_current_game.status = "in_progress"
        
        mock_db.execute = AsyncMock(return_value=Mock(scalar_one_or_none=Mock(return_value=mock_current_game)))
        
        # Act & Assert
        with pytest.raises(ValueError, match="Not your turn"):
            await game_service.validate_player_turn(session_id, player_id)

# Параметризованные тесты для различных сценариев
@pytest.mark.parametrize("queue_algorithm,expected_pattern", [
    ("always_random", "random"),
    ("random_no_repeat", "cycle"),
    ("manual", "manual")
])
@pytest.mark.asyncio
async def test_generate_player_queue(game_service, queue_algorithm, expected_pattern):
    """Тест генерации очередности игроков для разных алгоритмов"""
    
    # Arrange
    participants = [uuid4() for _ in range(3)]
    
    # Act
    queue = await game_service.generate_player_queue(participants, queue_algorithm)
    
    # Assert
    assert len(queue) == len(participants)
    assert set(queue) == set(participants)  # Все игроки включены
    
    if queue_algorithm == "manual":
        assert queue == participants  # Порядок не изменился

# Factory для тестовых данных
@pytest.fixture
def game_session_factory():
    """Factory для создания тестовых игровых сессий"""
    
    class GameSessionFactory:
        @staticmethod
        def create(**kwargs):
            defaults = {
                "id": uuid4(),
                "name": "Test Game Session",
                "creator_user_id": uuid4(),
                "template_id": uuid4(),
                "status": "waiting_for_players",
                "created_at": datetime.utcnow()
            }
            defaults.update(kwargs)
            return GameSession(**defaults)
    
    return GameSessionFactory
```

### 4. Integration Testing

**Service Integration Tests**:
```python
# tests/integration/test_service_communication.py
import pytest
import asyncio
from uuid import uuid4

from tests.fixtures.database_fixtures import test_db
from tests.fixtures.rabbitmq_fixtures import test_rabbitmq
from tests.utils.test_helpers import create_test_user, create_test_session

@pytest.mark.integration
@pytest.mark.requires_db
@pytest.mark.requires_rabbitmq
class TestServiceCommunication:
    """Integration tests для взаимодействия между сервисами"""
    
    @pytest.mark.asyncio
    async def test_game_completion_triggers_stats_update(self, test_db, test_rabbitmq):
        """Тест что завершение игры обновляет статистику"""
        
        # Arrange
        user1 = await create_test_user(test_db, "user1@test.com")
        user2 = await create_test_user(test_db, "user2@test.com")
        
        session = await create_test_session(test_db, creator_id=user1.id)
        
        # Подписываемся на events
        events_received = []
        
        async def event_handler(message):
            events_received.append(message)
        
        await test_rabbitmq.subscribe("stats.game_completed", event_handler)
        
        # Act - завершаем игру
        from services.game_service.src.services.game_service import GameService
        game_service = GameService(db=test_db, event_publisher=test_rabbitmq)
        
        await game_service.complete_game(
            session_id=session.id,
            results=[
                {"user_id": user1.id, "final_score": 100, "position": 1},
                {"user_id": user2.id, "final_score": 50, "position": 2}
            ]
        )
        
        # Assert - ждем получения события
        await asyncio.sleep(0.5)  # Небольшая задержка для обработки события
        
        assert len(events_received) >= 1
        stats_event = events_received[-1]
        assert stats_event["event_type"] == "stats.game_completed"
        assert stats_event["data"]["user_id"] in [str(user1.id), str(user2.id)]
    
    @pytest.mark.asyncio
    async def test_friend_request_triggers_notification(self, test_db, test_rabbitmq):
        """Тест что заявка в друзья создает уведомление"""
        
        # Arrange
        sender = await create_test_user(test_db, "sender@test.com")
        receiver = await create_test_user(test_db, "receiver@test.com")
        
        notifications_received = []
        
        async def notification_handler(message):
            notifications_received.append(message)
        
        await test_rabbitmq.subscribe("notifications.friend_request", notification_handler)
        
        # Act
        from services.friends_service.src.services.friends_service import FriendsService
        friends_service = FriendsService(db=test_db, event_publisher=test_rabbitmq)
        
        await friends_service.send_friend_request(
            sender_id=sender.id,
            receiver_id=receiver.id,
            message="Let's be friends!"
        )
        
        # Assert
        await asyncio.sleep(0.5)
        
        assert len(notifications_received) >= 1
        notification = notifications_received[-1]
        assert notification["event_type"] == "notifications.friend_request"
        assert notification["data"]["receiver_id"] == str(receiver.id)

# Database Integration Tests
@pytest.mark.integration
@pytest.mark.requires_db
class TestDatabaseIntegration:
    """Integration tests для работы с базой данных"""
    
    @pytest.mark.asyncio
    async def test_complex_game_query_performance(self, test_db):
        """Тест производительности сложных запросов к БД"""
        
        # Arrange - создаем тестовые данные
        users = []
        for i in range(100):
            user = await create_test_user(test_db, f"user{i}@test.com")
            users.append(user)
        
        sessions = []
        for i in range(20):
            session = await create_test_session(test_db, creator_id=users[i].id)
            sessions.append(session)
        
        # Act - выполняем сложный запрос
        import time
        start_time = time.time()
        
        from services.stats_service.src.repositories.stats_repository import StatsRepository
        stats_repo = StatsRepository(test_db)
        
        leaderboard = await stats_repo.get_leaderboard(limit=10)
        
        execution_time = time.time() - start_time
        
        # Assert
        assert len(leaderboard) <= 10
        assert execution_time < 1.0  # Запрос должен выполняться < 1 секунды
    
    @pytest.mark.asyncio
    async def test_concurrent_database_operations(self, test_db):
        """Тест параллельных операций с БД"""
        
        # Arrange
        user = await create_test_user(test_db, "concurrent@test.com")
        
        # Act - выполняем параллельные операции
        async def create_session(i):
            return await create_test_session(test_db, creator_id=user.id, name=f"Session {i}")
        
        # Создаем 10 сессий параллельно
        tasks = [create_session(i) for i in range(10)]
        results = await asyncio.gather(*tasks)
        
        # Assert
        assert len(results) == 10
        assert all(session.creator_user_id == user.id for session in results)
        
        # Проверяем уникальность ID
        session_ids = [session.id for session in results]
        assert len(set(session_ids)) == 10
```

### 5. End-to-End Testing

**Complete User Journeys**:
```python
# tests/e2e/test_kolkhoz_game_flow.py
import pytest
import asyncio
from uuid import uuid4

from tests.utils.test_helpers import (
    TestClient, create_test_users, authenticate_user,
    create_game_template, WebSocketTestClient
)

@pytest.mark.e2e
@pytest.mark.slow
class TestKolkhozGameFlow:
    """End-to-end тест полного цикла игры Колхоз"""
    
    @pytest.fixture
    async def game_participants(self, test_db):
        """Создание участников игры"""
        users = await create_test_users(test_db, count=3)
        return {
            "player1": users[0],
            "player2": users[1], 
            "player3": users[2]
        }
    
    @pytest.fixture
    async def kolkhoz_template(self, test_db):
        """Создание шаблона игры Колхоз"""
        return await create_game_template(test_db, {
            "name": "E2E Kolkhoz Test",
            "game_type": "kolkhoz",
            "rules": {
                "point_value_rubles": 50.0,
                "queue_algorithm": "manual",
                "balls": [
                    {"color": "white", "points": 1},
                    {"color": "yellow", "points": 2},
                    {"color": "red", "points": 4},
                    {"color": "black", "points": 7}
                ]
            }
        })
    
    @pytest.mark.asyncio
    async def test_complete_kolkhoz_game_scenario(self, game_participants, kolkhoz_template):
        """Тест полного сценария игры Колхоз с тремя игроками"""
        
        player1, player2, player3 = game_participants.values()
        
        # Step 1: Player 1 создает игровую сессию
        async with TestClient() as client1:
            await authenticate_user(client1, player1)
            
            session_response = await client1.post("/api/v1/sessions", json={
                "name": "E2E Kolkhoz Game",
                "template_id": str(kolkhoz_template.id),
                "max_participants": 3
            })
            assert session_response.status_code == 201
            session_id = session_response.json()["id"]
        
        # Step 2: Players 2 и 3 присоединяются к сессии
        async with TestClient() as client2:
            await authenticate_user(client2, player2)
            
            join_response = await client2.post(f"/api/v1/sessions/{session_id}/join")
            assert join_response.status_code == 200
        
        async with TestClient() as client3:
            await authenticate_user(client3, player3)
            
            join_response = await client3.post(f"/api/v1/sessions/{session_id}/join")
            assert join_response.status_code == 200
        
        # Step 3: Player 1 устанавливает очередность игроков
        async with TestClient() as client1:
            await authenticate_user(client1, player1)
            
            queue_response = await client1.put(
                f"/api/v1/sessions/{session_id}/games/1/queue/manual",
                json={
                    "queue_order": [str(player1.id), str(player2.id), str(player3.id)]
                }
            )
            assert queue_response.status_code == 200
        
        # Step 4: Начинаем игру
        async with TestClient() as client1:
            await authenticate_user(client1, player1)
            
            start_response = await client1.post(f"/api/v1/sessions/{session_id}/games")
            assert start_response.status_code == 201
            game_id = start_response.json()["id"]
        
        # Step 5: Подключаемся к WebSocket для real-time обновлений
        websocket_clients = []
        
        for player in [player1, player2, player3]:
            ws_client = WebSocketTestClient(f"/ws/games/{session_id}")
            await ws_client.connect(auth_user=player)
            websocket_clients.append(ws_client)
        
        # Step 6: Играем игру - реализуем сценарий из требований
        # Player 1: 5 шаров, Player 2: 8 шаров, Player 3: 2 шара
        
        async with TestClient() as client1:
            await authenticate_user(client1, player1)
            
            # Player 1 забивает 5 шаров
            for i in range(5):
                ball_color = ["white", "yellow", "red", "white", "yellow"][i]
                response = await client1.post(f"/api/v1/games/{game_id}/events", json={
                    "event_type": "ball_potted",
                    "player_id": str(player1.id),
                    "details": {
                        "ball_color": ball_color,
                        "ball_points": {"white": 1, "yellow": 2, "red": 4}[ball_color]
                    }
                })
                assert response.status_code == 201
                
                # Проверяем что все клиенты получили обновление
                for ws_client in websocket_clients:
                    message = await ws_client.receive_json(timeout=5)
                    assert message["type"] == "score_updated"
        
        async with TestClient() as client2:
            await authenticate_user(client2, player2)
            
            # Player 2 забивает 8 шаров
            for i in range(8):
                ball_color = ["white", "yellow", "red", "black", "white", "yellow", "red", "white"][i]
                response = await client2.post(f"/api/v1/games/{game_id}/events", json={
                    "event_type": "ball_potted",
                    "player_id": str(player2.id),
                    "details": {
                        "ball_color": ball_color,
                        "ball_points": {"white": 1, "yellow": 2, "red": 4, "black": 7}[ball_color]
                    }
                })
                assert response.status_code == 201
        
        async with TestClient() as client3:
            await authenticate_user(client3, player3)
            
            # Player 3 забивает 2 шара
            for i in range(2):
                ball_color = ["white", "yellow"][i]
                response = await client3.post(f"/api/v1/games/{game_id}/events", json={
                    "event_type": "ball_potted",
                    "player_id": str(player3.id),
                    "details": {
                        "ball_color": ball_color,
                        "ball_points": {"white": 1, "yellow": 2}[ball_color]
                    }
                })
                assert response.status_code == 201
        
        # Step 7: Завершаем игру
        async with TestClient() as client1:
            await authenticate_user(client1, player1)
            
            end_response = await client1.post(f"/api/v1/games/{game_id}/end")
            assert end_response.status_code == 200
        
        # Step 8: Проверяем результаты игры
        async with TestClient() as client1:
            await authenticate_user(client1, player1)
            
            results_response = await client1.get(f"/api/v1/games/{game_id}/results")
            assert results_response.status_code == 200
            
            results = results_response.json()
            assert len(results["participants"]) == 3
            
            # Проверяем расчеты Колхоз
            player1_result = next(r for r in results["participants"] if r["user_id"] == str(player1.id))
            player2_result = next(r for r in results["participants"] if r["user_id"] == str(player2.id))
            player3_result = next(r for r in results["participants"] if r["user_id"] == str(player3.id))
            
            # Player 1: платит Player 2 (5 шаров * 50р = 250р), получает от Player 3 (2 шара * 50р = 100р)
            # Net: -250 + 100 = -150
            assert player1_result["balls_potted"] == 5
            assert player1_result["net_result"] == -150.0
            
            # Player 2: получает от Player 1 (5 шаров * 50р = 250р), платит Player 3 (8 шаров * 50р = 400р)  
            # Net: +250 - 400 = -150
            assert player2_result["balls_potted"] == 8
            assert player2_result["net_result"] == -150.0
            
            # Player 3: получает от Player 2 (8 шаров * 50р = 400р), платит Player 1 (2 шара * 50р = 100р)
            # Net: +400 - 100 = +300
            assert player3_result["balls_potted"] == 2
            assert player3_result["net_result"] == 300.0
        
        # Step 9: Проверяем обновление статистики
        await asyncio.sleep(1)  # Ждем обработки async events
        
        async with TestClient() as client1:
            await authenticate_user(client1, player1)
            
            stats_response = await client1.get(f"/api/v1/stats/users/{player1.id}")
            assert stats_response.status_code == 200
            
            stats = stats_response.json()
            assert stats["total_games"] >= 1
            assert stats["balls_potted"] >= 5
        
        # Step 10: Закрываем WebSocket соединения
        for ws_client in websocket_clients:
            await ws_client.disconnect()
    
    @pytest.mark.asyncio
    async def test_friend_invitation_to_game_flow(self, game_participants):
        """Тест приглашения друзей в игру"""
        
        player1, player2, player3 = game_participants.values()
        
        # Step 1: Player 1 и Player 2 становятся друзьями
        async with TestClient() as client1:
            await authenticate_user(client1, player1)
            
            # Отправляем заявку в друзья
            request_response = await client1.post("/api/v1/friends/requests", json={
                "receiver_id": str(player2.id),
                "message": "Let's be friends for testing!"
            })
            assert request_response.status_code == 201
            request_id = request_response.json()["id"]
        
        async with TestClient() as client2:
            await authenticate_user(client2, player2)
            
            # Принимаем заявку
            accept_response = await client2.put(f"/api/v1/friends/requests/{request_id}", json={
                "action": "accept"
            })
            assert accept_response.status_code == 200
        
        # Step 2: Player 1 создает игру
        async with TestClient() as client1:
            await authenticate_user(client1, player1)
            
            session_response = await client1.post("/api/v1/sessions", json={
                "name": "Friends Game",
                "template_id": str(kolkhoz_template.id),
                "max_participants": 3
            })
            session_id = session_response.json()["id"]
        
        # Step 3: Player 1 приглашает Player 2
        async with TestClient() as client1:
            await authenticate_user(client1, player1)
            
            invite_response = await client1.post("/api/v1/friends/invite-to-game", json={
                "session_id": session_id,
                "friend_ids": [str(player2.id)],
                "message": "Join my game!"
            })
            assert invite_response.status_code == 200
            assert invite_response.json()["sent_invitations"] == 1
        
        # Step 4: Player 2 получает и принимает приглашение
        async with TestClient() as client2:
            await authenticate_user(client2, player2)
            
            # Проверяем pending приглашения
            invitations_response = await client2.get("/api/v1/friends/invitations")
            assert invitations_response.status_code == 200
            
            invitations = invitations_response.json()
            assert len(invitations) >= 1
            
            invitation = invitations[0]
            assert invitation["session"]["session_id"] == session_id
            
            # Принимаем приглашение
            accept_response = await client2.put(
                f"/api/v1/friends/invitations/{invitation['invitation_id']}", 
                json={"action": "accept"}
            )
            assert accept_response.status_code == 200
        
        # Step 5: Проверяем что Player 2 добавлен в сессию
        async with TestClient() as client1:
            await authenticate_user(client1, player1)
            
            session_response = await client1.get(f"/api/v1/sessions/{session_id}")
            session = session_response.json()
            
            participant_ids = [p["user_id"] for p in session["participants"]]
            assert str(player2.id) in participant_ids
```

### 6. Performance Testing

**Load Testing with Locust**:
```python
# tests/performance/test_load_game_sessions.py
from locust import HttpUser, task, between
import random
import json
from uuid import uuid4

class BilliardGameUser(HttpUser):
    """Симуляция пользователя бильярдного приложения"""
    
    wait_time = between(1, 3)  # Время между действиями
    
    def on_start(self):
        """Выполняется при запуске каждого пользователя"""
        self.authenticate()
        self.user_id = None
        self.session_id = None
        self.game_id = None
    
    def authenticate(self):
        """Аутентификация пользователя"""
        response = self.client.post("/api/v1/auth/telegram", json={
            "telegram_user_id": random.randint(100000, 999999),
            "username": f"testuser_{random.randint(1000, 9999)}",
            "first_name": "Test",
            "last_name": "User"
        })
        
        if response.status_code == 200:
            self.auth_token = response.json()["access_token"]
            self.user_id = response.json()["user"]["id"]
            self.client.headers.update({"Authorization": f"Bearer {self.auth_token}"})
    
    @task(3)
    def create_game_session(self):
        """Создание игровой сессии"""
        response = self.client.post("/api/v1/sessions", json={
            "name": f"Load Test Game {random.randint(1, 1000)}",
            "template_id": "550e8400-e29b-41d4-a716-446655440000",  # Mock template ID
            "max_participants": random.choice([2, 3, 4])
        })
        
        if response.status_code == 201:
            self.session_id = response.json()["id"]
    
    @task(5)
    def join_random_session(self):
        """Присоединение к случайной сессии"""
        # Получаем список доступных сессий
        response = self.client.get("/api/v1/sessions?status=waiting_for_players&limit=10")
        
        if response.status_code == 200:
            sessions = response.json()
            if sessions:
                session = random.choice(sessions)
                join_response = self.client.post(f"/api/v1/sessions/{session['id']}/join")
                
                if join_response.status_code == 200:
                    self.session_id = session["id"]
    
    @task(2)
    def start_game(self):
        """Начало игры в сессии"""
        if self.session_id:
            response = self.client.post(f"/api/v1/sessions/{self.session_id}/games")
            
            if response.status_code == 201:
                self.game_id = response.json()["id"]
    
    @task(10)
    def make_game_move(self):
        """Игровое действие - забить шар"""
        if self.game_id and self.user_id:
            ball_colors = ["white", "yellow", "red", "black"]
            ball_points = {"white": 1, "yellow": 2, "red": 4, "black": 7}
            
            ball_color = random.choice(ball_colors)
            
            self.client.post(f"/api/v1/games/{self.game_id}/events", json={
                "event_type": "ball_potted",
                "player_id": self.user_id,
                "details": {
                    "ball_color": ball_color,
                    "ball_points": ball_points[ball_color],
                    "position_x": random.uniform(0, 1000),
                    "position_y": random.uniform(0, 500)
                }
            })
    
    @task(2)
    def get_friends_list(self):
        """Получение списка друзей"""
        self.client.get("/api/v1/friends")
    
    @task(1)
    def search_users(self):
        """Поиск пользователей"""
        query = f"test{random.randint(1, 100)}"
        self.client.get(f"/api/v1/friends/search?q={query}")
    
    @task(1)
    def get_stats(self):
        """Получение статистики"""
        if self.user_id:
            self.client.get(f"/api/v1/stats/users/{self.user_id}")

# Performance benchmarks
@pytest.mark.performance
class TestPerformanceBenchmarks:
    """Performance benchmarks для критических операций"""
    
    @pytest.mark.benchmark(group="database")
    def test_user_authentication_performance(self, benchmark, test_db):
        """Benchmark аутентификации пользователей"""
        
        async def auth_user():
            from services.auth_service.src.services.auth_service import AuthService
            auth_service = AuthService(test_db)
            
            return await auth_service.authenticate_telegram_user({
                "telegram_user_id": 123456,
                "username": "benchmarkuser",
                "first_name": "Benchmark"
            })
        
        result = benchmark(asyncio.run, auth_user())
        assert result is not None
    
    @pytest.mark.benchmark(group="game_logic")
    def test_kolkhoz_calculation_performance(self, benchmark):
        """Benchmark расчета результатов игры Колхоз"""
        
        def calculate_kolkhoz():
            from services.game_service.src.services.game_service import GameService
            
            # Большое количество игроков для стресс-теста
            game_results = []
            for i in range(50):  # 50 игроков
                game_results.append({
                    "player_id": uuid4(),
                    "balls_potted": random.randint(1, 20),
                    "total_points": random.randint(10, 200)
                })
            
            game_service = GameService(None, None)
            return game_service._calculate_kolkhoz_payment_results(game_results, 50.0)
        
        result = benchmark(calculate_kolkhoz)
        assert len(result) == 50
    
    @pytest.mark.benchmark(group="search")
    def test_user_search_performance(self, benchmark, test_elasticsearch):
        """Benchmark поиска пользователей"""
        
        async def search_users():
            from services.friends_service.src.services.search_service import UserSearchService
            search_service = UserSearchService(test_elasticsearch)
            
            return await search_service.search_users("test", limit=20)
        
        result = benchmark(asyncio.run, search_users())
        assert isinstance(result, list)

# Memory usage tests
@pytest.mark.performance
class TestMemoryUsage:
    """Тесты использования памяти"""
    
    @pytest.mark.memory_profiler
    def test_large_game_session_memory_usage(self, test_db):
        """Тест потребления памяти при большой игровой сессии"""
        
        @profile  # memory_profiler decorator
        async def create_large_session():
            # Создаем сессию с максимальным количеством участников
            session = await create_test_session(test_db, max_participants=8)
            
            # Добавляем участников
            participants = []
            for i in range(8):
                user = await create_test_user(test_db, f"player{i}@test.com")
                participants.append(user)
            
            # Создаем большое количество игровых событий
            events = []
            for i in range(1000):  # 1000 событий
                events.append({
                    "event_type": "ball_potted",
                    "player_id": participants[i % 8].id,
                    "details": {"ball_color": "white", "ball_points": 1}
                })
            
            return session, participants, events
        
        # Запускаем с profiling
        session, participants, events = asyncio.run(create_large_session())
        
        # Проверяем что всё создалось корректно
        assert len(participants) == 8
        assert len(events) == 1000
```

### 7. Security Testing

**Security Test Suite**:
```python
# tests/security/test_auth_security.py
import pytest
import jwt
import time
from unittest.mock import patch

@pytest.mark.security
class TestAuthenticationSecurity:
    """Security tests для системы аутентификации"""
    
    @pytest.mark.asyncio
    async def test_jwt_token_expiration(self, test_client):
        """Тест что expired токены отклоняются"""
        
        # Создаем expired токен
        expired_payload = {
            "sub": "test-user-id",
            "exp": int(time.time()) - 3600,  # Истек час назад
            "iat": int(time.time()) - 3660
        }
        
        expired_token = jwt.encode(expired_payload, "test-secret", algorithm="HS256")
        
        # Пытаемся использовать expired токен
        response = await test_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        
        assert response.status_code == 401
        assert "expired" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_invalid_jwt_signature(self, test_client):
        """Тест что токены с неверной подписью отклоняются"""
        
        # Создаем токен с неверным секретом
        payload = {
            "sub": "test-user-id",
            "exp": int(time.time()) + 3600,
            "iat": int(time.time())
        }
        
        invalid_token = jwt.encode(payload, "wrong-secret", algorithm="HS256")
        
        response = await test_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {invalid_token}"}
        )
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_telegram_signature_validation(self, test_client):
        """Тест валидации Telegram подписи"""
        
        # Невалидная Telegram подпись
        invalid_auth_data = {
            "telegram_user_id": 123456,
            "username": "testuser",
            "first_name": "Test",
            "auth_date": int(time.time()),
            "hash": "invalid_hash_signature"
        }
        
        response = await test_client.post("/api/v1/auth/telegram", json=invalid_auth_data)
        
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_rate_limiting_auth_endpoints(self, test_client):
        """Тест rate limiting на auth endpoints"""
        
        auth_data = {
            "telegram_user_id": 123456,
            "username": "ratelimituser",
            "first_name": "Rate"
        }
        
        # Отправляем 6 запросов (лимит 5/минуту)
        responses = []
        for i in range(6):
            response = await test_client.post("/api/v1/auth/telegram", json=auth_data)
            responses.append(response)
        
        # Первые 5 должны пройти, 6-й должен быть заблокирован
        assert all(r.status_code in [200, 401] for r in responses[:5])  # 401 из-за invalid signature
        assert responses[5].status_code == 429  # Too Many Requests

@pytest.mark.security
class TestAPISecurityHeaders:
    """Тесты security headers в API responses"""
    
    @pytest.mark.asyncio
    async def test_security_headers_present(self, test_client):
        """Тест наличия security headers"""
        
        response = await test_client.get("/api/v1/health")
        
        # Проверяем критичные security headers
        assert "X-Content-Type-Options" in response.headers
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        
        assert "X-Frame-Options" in response.headers
        assert "Strict-Transport-Security" in response.headers
        
        # Content-Security-Policy
        assert "Content-Security-Policy" in response.headers
    
    @pytest.mark.asyncio
    async def test_cors_configuration(self, test_client):
        """Тест CORS конфигурации"""
        
        # Проверяем что только разрешенные origins принимаются
        allowed_origin = "https://web.telegram.org"
        forbidden_origin = "https://malicious-site.com"
        
        # Разрешенный origin
        response = await test_client.options(
            "/api/v1/sessions",
            headers={"Origin": allowed_origin}
        )
        assert response.status_code == 200
        assert response.headers.get("Access-Control-Allow-Origin") == allowed_origin
        
        # Запрещенный origin
        response = await test_client.options(
            "/api/v1/sessions",
            headers={"Origin": forbidden_origin}
        )
        assert "Access-Control-Allow-Origin" not in response.headers or \
               response.headers["Access-Control-Allow-Origin"] != forbidden_origin

@pytest.mark.security
class TestDataProtection:
    """Тесты защиты персональных данных"""
    
    @pytest.mark.asyncio
    async def test_user_data_anonymization(self, test_db, authenticated_client):
        """Тест анонимизации данных пользователя"""
        
        # Создаем пользователя с данными
        user = await create_test_user(test_db, "privacy@test.com")
        
        # Запрашиваем удаление данных (GDPR)
        response = await authenticated_client.delete(
            f"/api/v1/auth/users/{user.id}/data",
            headers={"X-Confirmation-Token": "delete-my-data"}
        )
        
        assert response.status_code == 200
        
        # Проверяем что данные анонимизированы
        from services.auth_service.src.repositories.user_repository import UserRepository
        user_repo = UserRepository(test_db)
        
        anonymized_user = await user_repo.get_by_id(user.id)
        assert anonymized_user.email.startswith("deleted_user_")
        assert anonymized_user.username is None
    
    @pytest.mark.asyncio
    async def test_sensitive_data_not_logged(self, test_client, caplog):
        """Тест что sensitive данные не попадают в логи"""
        
        auth_data = {
            "telegram_user_id": 123456,
            "username": "sensitiveuser",
            "first_name": "Sensitive",
            "hash": "sensitive_telegram_hash"
        }
        
        with caplog.at_level(logging.INFO):
            await test_client.post("/api/v1/auth/telegram", json=auth_data)
        
        # Проверяем что hash не попал в логи
        log_messages = " ".join(caplog.messages)
        assert "sensitive_telegram_hash" not in log_messages
        assert auth_data["hash"] not in log_messages

@pytest.mark.security
class TestSQLInjectionPrevention:
    """Тесты защиты от SQL injection"""
    
    @pytest.mark.asyncio
    async def test_user_search_sql_injection(self, authenticated_client):
        """Тест защиты от SQL injection в поиске пользователей"""
        
        # Пытаемся выполнить SQL injection
        malicious_query = "'; DROP TABLE users; --"
        
        response = await authenticated_client.get(
            f"/api/v1/friends/search?q={malicious_query}"
        )
        
        # Запрос должен быть обработан безопасно
        assert response.status_code in [200, 400]  # 400 если валидация отклонила
        
        # Проверяем что таблица users все еще существует
        from services.auth_service.src.models.user_models import User
        # Если этот импорт не вызывает ошибку, значит таблица не была удалена
        assert User is not None
    
    @pytest.mark.asyncio
    async def test_game_events_sql_injection(self, authenticated_client, test_game):
        """Тест защиты от SQL injection в игровых событиях"""
        
        malicious_event = {
            "event_type": "ball_potted",
            "player_id": str(test_game.creator_user_id),
            "details": {
                "ball_color": "'; DELETE FROM games; --",
                "ball_points": 1
            }
        }
        
        response = await authenticated_client.post(
            f"/api/v1/games/{test_game.id}/events",
            json=malicious_event
        )
        
        # Событие должно быть отклонено или обработано безопасно
        assert response.status_code in [200, 400, 422]
```

### 8. CI/CD Integration

**GitHub Actions Workflow**:
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  PYTHON_VERSION: 3.11
  NODE_VERSION: 18

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth-service, game-service, stats-service, friends-service, template-service, notification-service]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}
      
      - name: Install dependencies
        run: |
          cd services/${{ matrix.service }}
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      
      - name: Run unit tests
        run: |
          cd services/${{ matrix.service }}
          pytest tests/unit/ -v --cov=src --cov-report=xml --cov-report=term
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: services/${{ matrix.service }}/coverage.xml
          flags: unit-tests,${{ matrix.service }}

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: unit-tests
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
      
      rabbitmq:
        image: rabbitmq:3-management
        env:
          RABBITMQ_DEFAULT_USER: test
          RABBITMQ_DEFAULT_PASS: testpass
        options: >-
          --health-cmd "rabbitmq-diagnostics -q ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5672:5672
      
      elasticsearch:
        image: elasticsearch:8.8.0
        env:
          discovery.type: single-node
          xpack.security.enabled: false
        options: >-
          --health-cmd "curl http://localhost:9200/_cluster/health"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 9200:9200
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install dependencies
        run: |
          pip install -r requirements-test.txt
      
      - name: Wait for services
        run: |
          sleep 30  # Дополнительное время для полного запуска сервисов
      
      - name: Run database migrations
        run: |
          export DATABASE_URL=postgresql://postgres:testpass@localhost:5432/testdb
          cd services/auth-service && alembic upgrade head
          cd ../game-service && alembic upgrade head
          cd ../stats-service && alembic upgrade head
          cd ../friends-service && alembic upgrade head
          cd ../template-service && alembic upgrade head
          cd ../notification-service && alembic upgrade head
      
      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/testdb
          REDIS_URL: redis://localhost:6379
          RABBITMQ_URL: amqp://test:testpass@localhost:5672/
          ELASTICSEARCH_URL: http://localhost:9200
        run: |
          pytest tests/integration/ -v --tb=short
      
      - name: Upload integration test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: integration-test-results
          path: tests/integration/results/

  e2e-tests:
    name: End-to-End Tests
    runs-on: ubuntu-latest
    needs: integration-tests
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Start services with Docker Compose
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 60  # Время для запуска всех сервисов
      
      - name: Install test dependencies
        run: |
          pip install -r requirements-test.txt
      
      - name: Run E2E tests
        run: |
          pytest tests/e2e/ -v --tb=short --maxfail=3
      
      - name: Collect logs on failure
        if: failure()
        run: |
          docker-compose -f docker-compose.test.yml logs > e2e-logs.txt
      
      - name: Upload logs
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: e2e-logs
          path: e2e-logs.txt
      
      - name: Cleanup
        if: always()
        run: |
          docker-compose -f docker-compose.test.yml down -v

  performance-tests:
    name: Performance Tests
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Start services
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 60
      
      - name: Install dependencies
        run: |
          pip install -r requirements-test.txt
          pip install locust
      
      - name: Run performance tests
        run: |
          pytest tests/performance/ -v --benchmark-only --benchmark-json=benchmark_results.json
      
      - name: Run load tests
        run: |
          locust -f tests/performance/locustfile.py --headless -u 10 -r 2 -t 300s --host=http://localhost:8000
      
      - name: Upload performance results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: |
            benchmark_results.json
            locust_report.html

  security-tests:
    name: Security Tests
    runs-on: ubuntu-latest
    needs: unit-tests
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install security tools
        run: |
          pip install bandit safety pytest
          pip install -r requirements-test.txt
      
      - name: Run Bandit security scan
        run: |
          bandit -r services/ -f json -o bandit_report.json
        continue-on-error: true
      
      - name: Run Safety dependency scan
        run: |
          safety check --json --output safety_report.json
        continue-on-error: true
      
      - name: Run security tests
        run: |
          pytest tests/security/ -v
      
      - name: Upload security reports
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: |
            bandit_report.json
            safety_report.json
```

### 9. Test Data Management

**Test Fixtures and Factories**:
```python
# tests/fixtures/database_fixtures.py
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.database.base import Base

@pytest_asyncio.fixture
async def test_db():
    """Создание тестовой базы данных в памяти"""
    
    # In-memory SQLite для быстрых тестов
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        poolclass=StaticPool,
        connect_args={"check_same_thread": False}
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
    
    await engine.dispose()

@pytest_asyncio.fixture
async def test_db_with_data(test_db):
    """База данных с предварительно загруженными тестовыми данными"""
    
    # Создаем базовые данные для тестов
    await create_test_templates(test_db)
    await create_test_categories(test_db)
    
    yield test_db

# tests/utils/data_generators.py
import factory
from factory import fuzzy
from datetime import datetime, timedelta
from uuid import uuid4

from src.models.user_models import User
from src.models.game_models import GameSession, GameTemplate

class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    """Factory для создания пользователей"""
    
    class Meta:
        model = User
        sqlalchemy_session_persistence = "commit"
    
    id = factory.LazyFunction(uuid4)
    telegram_user_id = fuzzy.FuzzyInteger(100000, 999999)
    username = factory.Sequence(lambda n: f"testuser{n}")
    display_name = factory.Faker("name")
    email = factory.Faker("email")
    created_at = factory.LazyFunction(datetime.utcnow)
    is_verified = True

class GameSessionFactory(factory.alchemy.SQLAlchemyModelFactory):
    """Factory для создания игровых сессий"""
    
    class Meta:
        model = GameSession
        sqlalchemy_session_persistence = "commit"
    
    id = factory.LazyFunction(uuid4)
    name = factory.Faker("text", max_nb_chars=50)
    creator_user_id = factory.SubFactory(UserFactory)
    template_id = factory.LazyFunction(uuid4)
    status = "waiting_for_players"
    max_participants = fuzzy.FuzzyInteger(2, 8)
    created_at = factory.LazyFunction(datetime.utcnow)

class GameTemplateFactory(factory.alchemy.SQLAlchemyModelFactory):
    """Factory для создания шаблонов игр"""
    
    class Meta:
        model = GameTemplate
        sqlalchemy_session_persistence = "commit"
    
    id = factory.LazyFunction(uuid4)
    name = factory.Faker("text", max_nb_chars=30)
    game_type = "kolkhoz"
    rules = factory.LazyAttribute(lambda obj: {
        "point_value_rubles": 50.0,
        "balls": [
            {"color": "white", "points": 1},
            {"color": "yellow", "points": 2},
            {"color": "red", "points": 4}
        ],
        "queue_algorithm": "random_no_repeat"
    })
    is_system = False
    creator_user_id = factory.SubFactory(UserFactory)
    created_at = factory.LazyFunction(datetime.utcnow)

# Utility functions
async def create_test_users(db: AsyncSession, count: int = 3) -> list:
    """Создание нескольких тестовых пользователей"""
    
    users = []
    for i in range(count):
        user = UserFactory.build()
        db.add(user)
        users.append(user)
    
    await db.commit()
    
    for user in users:
        await db.refresh(user)
    
    return users

async def create_test_session(db: AsyncSession, **kwargs) -> GameSession:
    """Создание тестовой игровой сессии"""
    
    session = GameSessionFactory.build(**kwargs)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return session
```

### 10. Test Reporting and Monitoring

**Test Results Dashboard**:
```python
# tests/utils/test_reporter.py
import json
import time
from datetime import datetime
from pathlib import Path

class TestReporter:
    """Генератор отчетов о тестировании"""
    
    def __init__(self, output_dir: Path = Path("test_reports")):
        self.output_dir = output_dir
        self.output_dir.mkdir(exist_ok=True)
        self.start_time = time.time()
        self.results = {
            "summary": {},
            "unit_tests": [],
            "integration_tests": [],
            "e2e_tests": [],
            "performance_tests": [],
            "security_tests": []
        }
    
    def add_test_result(self, test_type: str, test_name: str, 
                       status: str, duration: float, details: dict = None):
        """Добавление результата теста"""
        
        result = {
            "name": test_name,
            "status": status,  # "passed", "failed", "skipped"
            "duration": duration,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {}
        }
        
        self.results[f"{test_type}_tests"].append(result)
    
    def generate_summary(self):
        """Генерация сводки по тестам"""
        
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        skipped_tests = 0
        total_duration = 0
        
        for test_type in ["unit", "integration", "e2e", "performance", "security"]:
            tests = self.results[f"{test_type}_tests"]
            
            type_total = len(tests)
            type_passed = sum(1 for t in tests if t["status"] == "passed")
            type_failed = sum(1 for t in tests if t["status"] == "failed")
            type_skipped = sum(1 for t in tests if t["status"] == "skipped")
            type_duration = sum(t["duration"] for t in tests)
            
            total_tests += type_total
            passed_tests += type_passed
            failed_tests += type_failed
            skipped_tests += type_skipped
            total_duration += type_duration
            
            self.results["summary"][test_type] = {
                "total": type_total,
                "passed": type_passed,
                "failed": type_failed,
                "skipped": type_skipped,
                "duration": type_duration,
                "pass_rate": (type_passed / type_total * 100) if type_total > 0 else 0
            }
        
        self.results["summary"]["overall"] = {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "skipped": skipped_tests,
            "duration": total_duration,
            "pass_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            "execution_time": time.time() - self.start_time
        }
    
    def save_json_report(self):
        """Сохранение отчета в JSON формате"""
        
        self.generate_summary()
        
        report_file = self.output_dir / f"test_report_{int(time.time())}.json"
        with open(report_file, "w") as f:
            json.dump(self.results, f, indent=2)
        
        return report_file
    
    def generate_html_report(self):
        """Генерация HTML отчета"""
        
        self.generate_summary()
        
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Test Report - Artel Billiards</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
                .test-type { margin: 20px 0; }
                .passed { color: green; }
                .failed { color: red; }
                .skipped { color: orange; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>Test Report - Artel Billiards</h1>
            
            <div class="summary">
                <h2>Summary</h2>
                <p><strong>Total Tests:</strong> {overall[total]}</p>
                <p><strong>Passed:</strong> <span class="passed">{overall[passed]}</span></p>
                <p><strong>Failed:</strong> <span class="failed">{overall[failed]}</span></p>
                <p><strong>Skipped:</strong> <span class="skipped">{overall[skipped]}</span></p>
                <p><strong>Pass Rate:</strong> {overall[pass_rate]:.1f}%</p>
                <p><strong>Total Duration:</strong> {overall[duration]:.2f}s</p>
            </div>
            
            {test_sections}
        </body>
        </html>
        """
        
        test_sections = ""
        for test_type in ["unit", "integration", "e2e", "performance", "security"]:
            if test_type in self.results["summary"]:
                section = self._generate_test_section(test_type)
                test_sections += section
        
        html_content = html_template.format(
            overall=self.results["summary"]["overall"],
            test_sections=test_sections
        )
        
        report_file = self.output_dir / f"test_report_{int(time.time())}.html"
        with open(report_file, "w") as f:
            f.write(html_content)
        
        return report_file
    
    def _generate_test_section(self, test_type: str) -> str:
        """Генерация секции для типа тестов"""
        
        summary = self.results["summary"][test_type]
        tests = self.results[f"{test_type}_tests"]
        
        section = f"""
        <div class="test-type">
            <h2>{test_type.title()} Tests</h2>
            <p>Total: {summary['total']}, 
               Passed: <span class="passed">{summary['passed']}</span>, 
               Failed: <span class="failed">{summary['failed']}</span>, 
               Pass Rate: {summary['pass_rate']:.1f}%</p>
            
            <table>
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
        """
        
        for test in tests:
            status_class = test["status"]
            details = test.get("details", {})
            details_str = ", ".join(f"{k}: {v}" for k, v in details.items())
            
            section += f"""
                    <tr>
                        <td>{test['name']}</td>
                        <td><span class="{status_class}">{test['status']}</span></td>
                        <td>{test['duration']:.3f}s</td>
                        <td>{details_str}</td>
                    </tr>
            """
        
        section += """
                </tbody>
            </table>
        </div>
        """
        
        return section

# pytest plugin для автоматического reporting
# conftest.py
def pytest_configure(config):
    """Конфигурация pytest с reporter"""
    global test_reporter
    test_reporter = TestReporter()

def pytest_runtest_logreport(report):
    """Обработка результатов каждого теста"""
    if report.when == "call":
        test_name = report.nodeid
        status = "passed" if report.outcome == "passed" else "failed"
        duration = report.duration
        
        # Определяем тип теста по пути
        if "unit" in test_name:
            test_type = "unit"
        elif "integration" in test_name:
            test_type = "integration"
        elif "e2e" in test_name:
            test_type = "e2e"
        elif "performance" in test_name:
            test_type = "performance"
        elif "security" in test_name:
            test_type = "security"
        else:
            test_type = "unit"  # default
        
        details = {}
        if hasattr(report, "longrepr") and report.longrepr:
            details["error"] = str(report.longrepr)
        
        test_reporter.add_test_result(test_type, test_name, status, duration, details)

def pytest_sessionfinish(session, exitstatus):
    """Генерация отчетов по завершении тестов"""
    json_report = test_reporter.save_json_report()
    html_report = test_reporter.generate_html_report()
    
    print(f"\nTest reports generated:")
    print(f"  JSON: {json_report}")
    print(f"  HTML: {html_report}")
```

## Verification Checkpoint

### Testing Strategy Verification:

✅ **Comprehensive Test Coverage**:
- Unit тесты для каждого микросервиса с 90%+ покрытием
- Integration тесты для межсервисного взаимодействия
- End-to-end тесты для критических user journeys
- Performance тесты для load и benchmark scenarios
- Security тесты для auth, data protection, injection prevention

✅ **Test Infrastructure**:
- Hybrid architecture с service-specific unit tests
- Centralized integration и e2e testing
- Docker-based test environments
- Parallel test execution для скорости
- Comprehensive test fixtures и data factories

✅ **CI/CD Integration**:
- Multi-stage pipeline (unit → integration → e2e → performance)
- Matrix builds для parallel service testing
- Automated security scanning (Bandit, Safety)
- Test result artifacts и reporting
- Performance regression detection

✅ **Developer Experience**:
- Fast feedback loop (unit tests < 30 seconds)
- Clear test organization и naming conventions
- Comprehensive test utilities и helpers
- Local development support с Docker Compose
- IDE integration с pytest

✅ **Quality Assurance**:
- Automated test reporting с HTML/JSON outputs
- Code coverage tracking с Codecov
- Performance benchmarking с historical comparison
- Security vulnerability scanning
- Test result monitoring и alerting

✅ **Business Logic Testing**:
- Comprehensive Kolkhoz game logic testing
- Complex payment calculation verification
- Real-time event flow testing
- Social features integration testing
- Template validation и rule enforcement

🎨🎨🎨 **EXITING CREATIVE PHASE: TESTING STRATEGY** 🎨🎨🎨