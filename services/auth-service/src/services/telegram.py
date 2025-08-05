"""
Telegram аутентификация сервис
"""

from typing import Optional, Dict, Any
import urllib.parse
import json
import hashlib
import hmac
from datetime import datetime

from ..core.config import settings


class TelegramAuthService:
    """Сервис для аутентификации через Telegram Mini App"""
    
    def __init__(self, bot_token: Optional[str]):
        self.bot_token = bot_token
        
        if not bot_token:
            print("⚠️ Warning: TELEGRAM_BOT_TOKEN not set")
    
    async def validate_init_data(self, init_data: str) -> Optional[Dict[str, Any]]:
        """
        Валидация init_data от Telegram Mini App
        
        Документация:
        https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
        """
        if not self.bot_token:
            print("❌ Cannot validate Telegram data: bot token not configured")
            return None
        
        try:
            # Парсим query string
            parsed_data = urllib.parse.parse_qs(init_data)
            
            # Извлекаем hash
            received_hash = parsed_data.get('hash', [None])[0]
            if not received_hash:
                print("❌ Telegram validation failed: no hash provided")
                return None
            
            # Создаем строку для проверки (все параметры кроме hash)
            check_items = []
            for key, values in sorted(parsed_data.items()):
                if key != 'hash' and values:
                    check_items.append(f"{key}={values[0]}")
            
            check_string = '\n'.join(check_items)
            
            # Создаем секретный ключ для проверки
            secret_key = hmac.new(
                b"WebAppData",
                self.bot_token.encode(),
                hashlib.sha256
            ).digest()
            
            # Вычисляем ожидаемый hash
            calculated_hash = hmac.new(
                secret_key,
                check_string.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Проверяем hash
            if not hmac.compare_digest(received_hash, calculated_hash):
                print("❌ Telegram validation failed: hash mismatch")
                return None
            
            # Проверяем время (данные не должны быть старше 1 часа)
            auth_date = parsed_data.get('auth_date', [None])[0]
            if auth_date:
                try:
                    auth_timestamp = int(auth_date)
                    current_timestamp = int(datetime.utcnow().timestamp())
                    
                    # Данные старше 1 часа считаем недействительными
                    if current_timestamp - auth_timestamp > 3600:
                        print("❌ Telegram validation failed: data too old")
                        return None
                except ValueError:
                    print("❌ Telegram validation failed: invalid auth_date")
                    return None
            
            # Парсим данные пользователя
            user_data = None
            if 'user' in parsed_data and parsed_data['user'][0]:
                try:
                    user_data = json.loads(parsed_data['user'][0])
                except json.JSONDecodeError:
                    print("❌ Telegram validation failed: invalid user data JSON")
                    return None
            
            if not user_data or not user_data.get('id'):
                print("❌ Telegram validation failed: no user data")
                return None
            
            # Возвращаем валидированные данные
            result = {
                'user': user_data,
                'auth_date': auth_date,
                'start_param': parsed_data.get('start_param', [None])[0],
                'query_id': parsed_data.get('query_id', [None])[0],
                'chat_type': parsed_data.get('chat_type', [None])[0],
                'chat_instance': parsed_data.get('chat_instance', [None])[0]
            }
            
            print(f"✅ Telegram validation successful for user {user_data.get('id')}")
            return result
            
        except Exception as e:
            print(f"❌ Telegram validation error: {e}")
            return None
    
    def extract_user_info(self, telegram_data: Dict[str, Any]) -> Dict[str, Any]:
        """Извлечение информации о пользователе из Telegram данных"""
        user = telegram_data.get('user', {})
        
        return {
            'telegram_id': user.get('id'),
            'username': user.get('username'),
            'first_name': user.get('first_name'),
            'last_name': user.get('last_name'),
            'language_code': user.get('language_code', 'ru'),
            'is_premium': user.get('is_premium', False),
            'photo_url': user.get('photo_url'),
            'start_param': telegram_data.get('start_param'),
            'auth_date': telegram_data.get('auth_date')
        }
    
    def validate_webhook_data(self, webhook_data: Dict[str, Any]) -> bool:
        """
        Валидация данных от Telegram webhook
        Используется для Bot API webhooks (не Mini App)
        """
        if not self.bot_token:
            return False
        
        try:
            # Проверяем структуру данных
            if 'update_id' not in webhook_data:
                return False
            
            # Дополнительные проверки можно добавить здесь
            return True
            
        except Exception as e:
            print(f"❌ Webhook validation error: {e}")
            return False
    
    async def get_bot_info(self) -> Optional[Dict[str, Any]]:
        """
        Получение информации о боте (для отладки)
        Требует HTTP клиент для запроса к Telegram API
        """
        if not self.bot_token:
            return None
        
        # В реальном приложении здесь был бы HTTP запрос к Telegram API
        # https://api.telegram.org/bot{token}/getMe
        
        return {
            'bot_token_configured': True,
            'bot_token_length': len(self.bot_token),
            'bot_token_prefix': self.bot_token[:10] + "..." if len(self.bot_token) > 10 else self.bot_token
        }
    
    def generate_mini_app_url(
        self, 
        webapp_url: str, 
        start_param: Optional[str] = None
    ) -> str:
        """
        Генерация URL для Telegram Mini App
        
        Args:
            webapp_url: URL вашего веб-приложения
            start_param: Опциональный параметр запуска
        
        Returns:
            URL для Telegram Mini App
        """
        base_url = f"https://t.me/your_bot_username/webapp"
        
        if start_param:
            return f"{base_url}?startapp={start_param}"
        
        return base_url
    
    def is_telegram_environment(self, user_agent: Optional[str] = None) -> bool:
        """
        Проверка, запущено ли приложение в Telegram
        
        Args:
            user_agent: User-Agent из HTTP заголовков
        
        Returns:
            True если приложение запущено в Telegram
        """
        if not user_agent:
            return False
        
        # Telegram Mini Apps имеют специфичные User-Agent строки
        telegram_indicators = [
            'TelegramWebApp',
            'Telegram',
            'TMA'  # Telegram Mini App
        ]
        
        user_agent_lower = user_agent.lower()
        return any(indicator.lower() in user_agent_lower for indicator in telegram_indicators)