#!/usr/bin/env python3
"""
Test script for API Gateway connectivity
"""

import asyncio
import httpx

async def test_services():
    """Test all services through API Gateway"""
    
    # Test API Gateway health
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://localhost:8000/health")
            print(f"✅ API Gateway Health: {response.status_code}")
            print(f"   Response: {response.json()}")
        except Exception as e:
            print(f"❌ API Gateway Health failed: {e}")
    
    # Test Auth Service through Gateway
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://localhost:8000/auth/health")
            print(f"✅ Auth Service Health: {response.status_code}")
            print(f"   Response: {response.json()}")
        except Exception as e:
            print(f"❌ Auth Service Health failed: {e}")
    
    # Test Game Service through Gateway
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://localhost:8000/game/health")
            print(f"✅ Game Service Health: {response.status_code}")
            print(f"   Response: {response.json()}")
        except Exception as e:
            print(f"❌ Game Service Health failed: {e}")
    
    # Test Template Service through Gateway
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://localhost:8000/template/health")
            print(f"✅ Template Service Health: {response.status_code}")
            print(f"   Response: {response.json()}")
        except Exception as e:
            print(f"❌ Template Service Health failed: {e}")
    
    # Test Auth API through Gateway
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://localhost:8000/auth/me")
            print(f"✅ Auth API /me: {response.status_code}")
            print(f"   Response: {response.json()}")
        except Exception as e:
            print(f"❌ Auth API /me failed: {e}")
    
    # Test Game Sessions API through Gateway (with trailing slash)
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://localhost:8000/api/v1/sessions/")
            print(f"✅ Game Sessions API: {response.status_code}")
            if response.status_code == 200:
                print(f"   Response: {response.json()}")
            else:
                print(f"   Redirect to: {response.headers.get('location', 'unknown')}")
        except Exception as e:
            print(f"❌ Game Sessions API failed: {e}")
    
    # Test Template API through Gateway (with trailing slash)
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://localhost:8000/api/v1/templates/")
            print(f"✅ Template API: {response.status_code}")
            if response.status_code == 200:
                print(f"   Response: {response.json()}")
            else:
                print(f"   Redirect to: {response.headers.get('location', 'unknown')}")
        except Exception as e:
            print(f"❌ Template API failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_services()) 