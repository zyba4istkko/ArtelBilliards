#!/usr/bin/env python3
"""
Тестирование игровой логики Artel Billiards
"""

import asyncio
import httpx
import json

API_BASE_URL = "http://localhost:8000"
TIMEOUT = 30.0

class GameLogicTester:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=TIMEOUT)
        self.test_results = []
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    def log_test(self, test_name: str, success: bool, details: str = ""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
    
    async def test_api_gateway_health(self):
        try:
            response = await self.client.get(f"{API_BASE_URL}/health")
            if response.status_code == 200:
                self.log_test("API Gateway Health", True, f"Status: {response.status_code}")
                return True
            else:
                self.log_test("API Gateway Health", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Gateway Health", False, f"Error: {e}")
            return False
    
    async def test_get_templates(self):
        try:
            response = await self.client.get(f"{API_BASE_URL}/api/v1/templates/")
            if response.status_code == 200:
                data = response.json()
                templates_count = len(data.get("templates", []))
                self.log_test("Get Templates", True, f"Found {templates_count} templates")
                return data.get("templates", [])
            else:
                self.log_test("Get Templates", False, f"Status: {response.status_code}")
                return []
        except Exception as e:
            self.log_test("Get Templates", False, f"Error: {e}")
            return []
    
    async def test_create_session(self):
        try:
            session_data = {
                "game_type_id": 1,
                "name": "Test Session - Kolkhoz",
                "max_players": 4,
                "rules": {
                    "point_value_rubles": 100,
                    "payment_direction": "previous_pays_next",
                    "queue_algorithm": "always_random"
                }
            }
            
            response = await self.client.post(
                f"{API_BASE_URL}/api/v1/sessions/",
                json=session_data
            )
            
            if response.status_code == 200:
                data = response.json()
                session_id = data.get("id")
                self.log_test("Create Session", True, f"Session ID: {session_id}")
                return session_id
            else:
                self.log_test("Create Session", False, f"Status: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Create Session", False, f"Error: {e}")
            return None
    
    async def test_join_session(self, session_id: str):
        try:
            join_data = {"display_name": "Test Player"}
            response = await self.client.post(
                f"{API_BASE_URL}/api/v1/sessions/{session_id}/join",
                json=join_data
            )
            
            if response.status_code == 200:
                self.log_test("Join Session", True, "Player joined successfully")
                return True
            else:
                self.log_test("Join Session", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Join Session", False, f"Error: {e}")
            return False
    
    async def test_create_game(self, session_id: str):
        try:
            game_data = {"queue_algorithm": "always_random"}
            response = await self.client.post(
                f"{API_BASE_URL}/api/v1/sessions/{session_id}/games",
                json=game_data
            )
            
            if response.status_code == 200:
                data = response.json()
                game_id = data.get("id")
                self.log_test("Create Game", True, f"Game ID: {game_id}")
                return game_id
            else:
                self.log_test("Create Game", False, f"Status: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Create Game", False, f"Error: {e}")
            return None
    
    async def test_add_game_event(self, game_id: str):
        try:
            event_data = {
                "participant_id": "test-participant-1",
                "event_type": "ball_potted",
                "event_data": {"ball_color": "red", "points": 100}
            }
            
            response = await self.client.post(
                f"{API_BASE_URL}/api/v1/games/{game_id}/events",
                json=event_data
            )
            
            if response.status_code == 200:
                self.log_test("Add Game Event", True, "Event added successfully")
                return True
            else:
                self.log_test("Add Game Event", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Add Game Event", False, f"Error: {e}")
            return False
    
    def print_summary(self):
        print("\n" + "="*60)
        print("📊 ИТОГОВЫЙ ОТЧЕТ ТЕСТИРОВАНИЯ")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Всего тестов: {total_tests}")
        print(f"✅ Успешно: {passed_tests}")
        print(f"❌ Провалено: {failed_tests}")
        print(f"📈 Успешность: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Проваленные тесты:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['details']}")
        
        print("="*60)

async def main():
    print("🎯 Тестирование игровой логики Artel Billiards")
    print("="*60)
    
    async with GameLogicTester() as tester:
        await tester.test_api_gateway_health()
        await tester.test_get_templates()
        
        session_id = await tester.test_create_session()
        if session_id:
            await tester.test_join_session(session_id)
            game_id = await tester.test_create_game(session_id)
            if game_id:
                await tester.test_add_game_event(game_id)
        
        tester.print_summary()

if __name__ == "__main__":
    asyncio.run(main()) 