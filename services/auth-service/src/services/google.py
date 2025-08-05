"""
Google OAuth аутентификация сервис
"""

from typing import Optional, Dict, Any
import json
import base64
from datetime import datetime
import httpx

from ..core.config import settings


class GoogleAuthService:
    """Сервис для аутентификации через Google OAuth"""
    
    def __init__(self, client_id: Optional[str], client_secret: Optional[str]):
        self.client_id = client_id
        self.client_secret = client_secret
        
        if not client_id or not client_secret:
            print("⚠️ Warning: Google OAuth credentials not configured")
    
    async def validate_id_token(self, id_token: str) -> Optional[Dict[str, Any]]:
        """
        Валидация Google ID Token
        
        Args:
            id_token: JWT токен от Google
            
        Returns:
            Данные пользователя или None если токен невалиден
        """
        if not self.client_id:
            print("❌ Cannot validate Google token: client_id not configured")
            return None
        
        try:
            # В продакшене следует использовать Google API для валидации
            # Здесь упрощенная версия для демонстрации
            
            # Декодируем JWT токен (без проверки подписи!)
            # ВНИМАНИЕ: Это небезопасно для продакшена!
            payload = self._decode_jwt_payload(id_token)
            
            if not payload:
                print("❌ Google token validation failed: invalid JWT format")
                return None
            
            # Проверяем обязательные поля
            if not payload.get('sub') or not payload.get('email'):
                print("❌ Google token validation failed: missing required fields")
                return None
            
            # Проверяем audience (должен совпадать с нашим client_id)
            if payload.get('aud') != self.client_id:
                print("❌ Google token validation failed: invalid audience")
                return None
            
            # Проверяем issuer
            valid_issuers = ['https://accounts.google.com', 'accounts.google.com']
            if payload.get('iss') not in valid_issuers:
                print("❌ Google token validation failed: invalid issuer")
                return None
            
            # Проверяем время истечения
            exp = payload.get('exp')
            if exp and datetime.utcnow().timestamp() > exp:
                print("❌ Google token validation failed: token expired")
                return None
            
            print(f"✅ Google token validation successful for user {payload.get('email')}")
            return payload
            
        except Exception as e:
            print(f"❌ Google token validation error: {e}")
            return None
    
    def _decode_jwt_payload(self, jwt_token: str) -> Optional[Dict[str, Any]]:
        """
        Декодирование payload из JWT токена
        
        ВНИМАНИЕ: Это упрощенная версия без проверки подписи!
        В продакшене используйте google-auth библиотеку для полной валидации.
        """
        try:
            # JWT состоит из трех частей: header.payload.signature
            parts = jwt_token.split('.')
            if len(parts) != 3:
                return None
            
            # Декодируем payload (вторая часть)
            payload_encoded = parts[1]
            
            # Добавляем padding если нужно
            payload_encoded += '=' * (4 - len(payload_encoded) % 4)
            
            # Декодируем base64
            payload_bytes = base64.urlsafe_b64decode(payload_encoded)
            payload_str = payload_bytes.decode('utf-8')
            
            # Парсим JSON
            payload = json.loads(payload_str)
            
            return payload
            
        except Exception as e:
            print(f"❌ JWT decode error: {e}")
            return None
    
    async def validate_id_token_with_google_api(self, id_token: str) -> Optional[Dict[str, Any]]:
        """
        Валидация ID токена через Google API (рекомендуемый способ)
        
        Этот метод делает запрос к Google API для проверки токена
        """
        if not self.client_id:
            return None
        
        try:
            # URL для валидации токенов Google
            validation_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(validation_url)
                
                if response.status_code != 200:
                    print(f"❌ Google API validation failed: {response.status_code}")
                    return None
                
                token_info = response.json()
                
                # Проверяем audience
                if token_info.get('aud') != self.client_id:
                    print("❌ Google API validation failed: invalid audience")
                    return None
                
                print(f"✅ Google API validation successful for user {token_info.get('email')}")
                return token_info
                
        except Exception as e:
            print(f"❌ Google API validation error: {e}")
            return None
    
    def extract_user_info(self, google_data: Dict[str, Any]) -> Dict[str, Any]:
        """Извлечение информации о пользователе из Google данных"""
        return {
            'google_id': google_data.get('sub'),
            'email': google_data.get('email'),
            'email_verified': google_data.get('email_verified', False),
            'name': google_data.get('name'),
            'given_name': google_data.get('given_name'),
            'family_name': google_data.get('family_name'),
            'picture': google_data.get('picture'),
            'locale': google_data.get('locale', 'en'),
            'hd': google_data.get('hd')  # Hosted domain (для G Suite)
        }
    
    def get_authorization_url(
        self, 
        redirect_uri: str, 
        state: Optional[str] = None,
        scopes: Optional[list] = None
    ) -> str:
        """
        Генерация URL для OAuth авторизации Google
        
        Args:
            redirect_uri: URL для редиректа после авторизации
            state: Случайная строка для защиты от CSRF
            scopes: Список разрешений (по умолчанию: email, profile)
        
        Returns:
            URL для редиректа пользователя на Google OAuth
        """
        if not self.client_id:
            raise ValueError("Google client_id not configured")
        
        if scopes is None:
            scopes = ['openid', 'email', 'profile']
        
        params = {
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': ' '.join(scopes),
            'access_type': 'offline',
            'prompt': 'consent'
        }
        
        if state:
            params['state'] = state
        
        # Формируем URL
        query_string = '&'.join([f"{key}={value}" for key, value in params.items()])
        return f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"
    
    async def exchange_code_for_tokens(
        self, 
        code: str, 
        redirect_uri: str
    ) -> Optional[Dict[str, Any]]:
        """
        Обмен authorization code на access token и ID token
        
        Args:
            code: Authorization code от Google
            redirect_uri: Redirect URI (должен совпадать с использованным в authorization URL)
        
        Returns:
            Словарь с токенами или None при ошибке
        """
        if not self.client_id or not self.client_secret:
            print("❌ Cannot exchange code: Google credentials not configured")
            return None
        
        try:
            token_url = "https://oauth2.googleapis.com/token"
            
            data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': redirect_uri
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(token_url, data=data)
                
                if response.status_code != 200:
                    print(f"❌ Token exchange failed: {response.status_code}")
                    print(f"Response: {response.text}")
                    return None
                
                tokens = response.json()
                print("✅ Successfully exchanged code for tokens")
                return tokens
                
        except Exception as e:
            print(f"❌ Token exchange error: {e}")
            return None
    
    async def refresh_access_token(self, refresh_token: str) -> Optional[Dict[str, Any]]:
        """
        Обновление access token используя refresh token
        
        Args:
            refresh_token: Refresh token от Google
        
        Returns:
            Новые токены или None при ошибке
        """
        if not self.client_id or not self.client_secret:
            return None
        
        try:
            token_url = "https://oauth2.googleapis.com/token"
            
            data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token'
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(token_url, data=data)
                
                if response.status_code != 200:
                    print(f"❌ Token refresh failed: {response.status_code}")
                    return None
                
                tokens = response.json()
                print("✅ Successfully refreshed access token")
                return tokens
                
        except Exception as e:
            print(f"❌ Token refresh error: {e}")
            return None