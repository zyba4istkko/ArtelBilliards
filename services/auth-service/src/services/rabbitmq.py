"""
RabbitMQ менеджер для Auth Service
"""

import asyncio
import json
from typing import Dict, Any, Optional, Callable
from datetime import datetime
from uuid import uuid4
import aio_pika
from aio_pika import Connection, Channel, Exchange, Queue, Message
from aio_pika.patterns import MasterChannel

from ..core.config import settings


class RabbitMQManager:
    """Менеджер для работы с RabbitMQ"""
    
    def __init__(self, connection_url: str):
        self.connection_url = connection_url
        self.connection: Optional[Connection] = None
        self.channel: Optional[Channel] = None
        self.exchanges: Dict[str, Exchange] = {}
        self.queues: Dict[str, Queue] = {}
        
    async def connect(self):
        """Подключение к RabbitMQ"""
        try:
            self.connection = await aio_pika.connect_robust(
                self.connection_url,
                loop=asyncio.get_event_loop()
            )
            
            self.channel = await self.connection.channel()
            await self.channel.set_qos(prefetch_count=10)
            
            # Создаем exchanges
            await self._setup_exchanges()
            
            print("✅ Connected to RabbitMQ")
            
        except Exception as e:
            print(f"❌ Failed to connect to RabbitMQ: {e}")
            raise
    
    async def close(self):
        """Закрытие соединения с RabbitMQ"""
        try:
            if self.connection and not self.connection.is_closed:
                await self.connection.close()
                print("✅ Disconnected from RabbitMQ")
        except Exception as e:
            print(f"❌ Error closing RabbitMQ connection: {e}")
    
    async def _setup_exchanges(self):
        """Настройка exchanges"""
        if not self.channel:
            raise RuntimeError("Channel not initialized")
        
        # Exchange для пользовательских событий
        self.exchanges['user_events'] = await self.channel.declare_exchange(
            'user_events',
            aio_pika.ExchangeType.TOPIC,
            durable=True
        )
        
        # Exchange для аутентификационных событий
        self.exchanges['auth_events'] = await self.channel.declare_exchange(
            'auth_events', 
            aio_pika.ExchangeType.TOPIC,
            durable=True
        )
        
        # Exchange для системных событий
        self.exchanges['system_events'] = await self.channel.declare_exchange(
            'system_events',
            aio_pika.ExchangeType.TOPIC,
            durable=True
        )
    
    async def publish_user_event(
        self,
        event_type: str,
        user_id: str,
        data: Dict[str, Any],
        routing_key: Optional[str] = None
    ):
        """Публикация событий пользователей"""
        if routing_key is None:
            routing_key = f"user.{event_type}"
        
        event = {
            'event_id': str(uuid4()),
            'event_type': event_type,
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat(),
            'data': data,
            'source_service': 'auth-service'
        }
        
        await self._publish_message(
            exchange_name='user_events',
            routing_key=routing_key,
            message=event
        )
    
    async def publish_auth_event(
        self,
        event_type: str,
        user_id: Optional[str],
        data: Dict[str, Any],
        routing_key: Optional[str] = None
    ):
        """Публикация событий аутентификации"""
        if routing_key is None:
            routing_key = f"auth.{event_type}"
        
        event = {
            'event_id': str(uuid4()),
            'event_type': event_type,
            'user_id': user_id,
            'timestamp': datetime.utcnow().isoformat(),
            'data': data,
            'source_service': 'auth-service'
        }
        
        await self._publish_message(
            exchange_name='auth_events',
            routing_key=routing_key,
            message=event
        )
    
    async def publish_system_event(
        self,
        event_type: str,
        data: Dict[str, Any],
        routing_key: Optional[str] = None
    ):
        """Публикация системных событий"""
        if routing_key is None:
            routing_key = f"system.{event_type}"
        
        event = {
            'event_id': str(uuid4()),
            'event_type': event_type,
            'timestamp': datetime.utcnow().isoformat(),
            'data': data,
            'source_service': 'auth-service'
        }
        
        await self._publish_message(
            exchange_name='system_events',
            routing_key=routing_key,
            message=event
        )
    
    async def _publish_message(
        self,
        exchange_name: str,
        routing_key: str,
        message: Dict[str, Any]
    ):
        """Публикация сообщения в exchange"""
        try:
            if exchange_name not in self.exchanges:
                raise ValueError(f"Exchange {exchange_name} not found")
            
            exchange = self.exchanges[exchange_name]
            
            message_body = json.dumps(message, default=str).encode()
            
            aio_message = Message(
                message_body,
                content_type='application/json',
                delivery_mode=2,  # Persistent message
                message_id=message.get('event_id', str(uuid4())),
                timestamp=datetime.utcnow()
            )
            
            await exchange.publish(aio_message, routing_key=routing_key)
            
            print(f"✅ Published message to {exchange_name} with routing key {routing_key}")
            
        except Exception as e:
            print(f"❌ Failed to publish message: {e}")
            raise
    
    async def setup_consumer(
        self,
        queue_name: str,
        exchange_name: str,
        routing_keys: list,
        callback: Callable
    ):
        """Настройка consumer для обработки сообщений"""
        try:
            if not self.channel:
                raise RuntimeError("Channel not initialized")
            
            # Создаем очередь
            queue = await self.channel.declare_queue(
                queue_name,
                durable=True,
                arguments={
                    'x-message-ttl': 86400000,  # TTL 24 часа
                    'x-max-length': 10000  # Максимум сообщений в очереди
                }
            )
            
            # Привязываем к exchange
            if exchange_name in self.exchanges:
                exchange = self.exchanges[exchange_name]
                
                for routing_key in routing_keys:
                    await queue.bind(exchange, routing_key)
            
            # Настраиваем consumer
            await queue.consume(callback)
            
            self.queues[queue_name] = queue
            
            print(f"✅ Setup consumer for queue {queue_name}")
            
        except Exception as e:
            print(f"❌ Failed to setup consumer: {e}")
            raise
    
    async def health_check(self) -> bool:
        """Проверка здоровья RabbitMQ соединения"""
        try:
            if not self.connection or self.connection.is_closed:
                return False
            
            if not self.channel or self.channel.is_closed:
                return False
            
            # Пробуем отправить тестовое сообщение
            await self.publish_system_event(
                'health_check',
                {'timestamp': datetime.utcnow().isoformat()}
            )
            
            return True
            
        except Exception:
            return False


# Функции для специфичных событий Auth Service

async def publish_user_registered_event(
    rabbitmq: RabbitMQManager,
    user_id: str,
    user_data: Dict[str, Any]
):
    """Событие регистрации нового пользователя"""
    await rabbitmq.publish_user_event(
        event_type='registered',
        user_id=user_id,
        data={
            'username': user_data.get('username'),
            'email': user_data.get('email'),
            'first_name': user_data.get('first_name'),
            'last_name': user_data.get('last_name'),
            'role': user_data.get('role'),
            'language_code': user_data.get('language_code')
        }
    )


async def publish_user_login_event(
    rabbitmq: RabbitMQManager,
    user_id: str,
    provider: str,
    ip_address: Optional[str] = None
):
    """Событие успешного входа пользователя"""
    await rabbitmq.publish_auth_event(
        event_type='login_success',
        user_id=user_id,
        data={
            'provider': provider,
            'ip_address': ip_address,
            'timestamp': datetime.utcnow().isoformat()
        }
    )


async def publish_user_logout_event(
    rabbitmq: RabbitMQManager,
    user_id: str,
    session_id: str
):
    """Событие выхода пользователя"""
    await rabbitmq.publish_auth_event(
        event_type='logout',
        user_id=user_id,
        data={
            'session_id': session_id,
            'timestamp': datetime.utcnow().isoformat()
        }
    )


async def publish_login_failed_event(
    rabbitmq: RabbitMQManager,
    provider: str,
    error: str,
    ip_address: Optional[str] = None
):
    """Событие неудачной попытки входа"""
    await rabbitmq.publish_auth_event(
        event_type='login_failed',
        user_id=None,
        data={
            'provider': provider,
            'error': error,
            'ip_address': ip_address,
            'timestamp': datetime.utcnow().isoformat()
        }
    )


async def publish_session_created_event(
    rabbitmq: RabbitMQManager,
    user_id: str,
    session_id: str,
    device_info: Optional[Dict[str, Any]] = None
):
    """Событие создания новой сессии"""
    await rabbitmq.publish_auth_event(
        event_type='session_created',
        user_id=user_id,
        data={
            'session_id': session_id,
            'device_info': device_info,
            'timestamp': datetime.utcnow().isoformat()
        }
    )


async def publish_session_revoked_event(
    rabbitmq: RabbitMQManager,
    user_id: str,
    session_id: str,
    reason: str = 'user_logout'
):
    """Событие отзыва сессии"""
    await rabbitmq.publish_auth_event(
        event_type='session_revoked',
        user_id=user_id,
        data={
            'session_id': session_id,
            'reason': reason,
            'timestamp': datetime.utcnow().isoformat()
        }
    )