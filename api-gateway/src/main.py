"""
API Gateway для Artel Billiards
Простой прокси для маршрутизации запросов к микросервисам
"""

import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

app = FastAPI(
    title="Artel Billiards API Gateway",
    version="1.0.0",
    description="API Gateway для маршрутизации запросов"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001",
        "http://localhost:5173",  # Vite dev server (production build)
        "http://localhost:5174",  # Vite dev server (hot reload)
        "https://plenty-pants-flash.loca.lt"  # Localtunnel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")
GAME_SERVICE_URL = os.getenv("GAME_SERVICE_URL", "http://game-service:8002")
TEMPLATE_SERVICE_URL = os.getenv("TEMPLATE_SERVICE_URL", "http://template-service:8003")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "api-gateway"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Artel Billiards API Gateway",
        "version": "1.0.0",
        "services": {
            "auth_service": AUTH_SERVICE_URL,
            "game_service": GAME_SERVICE_URL,
            "template_service": TEMPLATE_SERVICE_URL
        },
        "routes": {
            "health": "/health",
            "auth": "/auth/*",
            "sessions": "/api/v1/sessions/*",
            "games": "/api/v1/games/*",
            "session_games": "/api/v1/sessions/{session_id}/games",
            "active_game": "/api/v1/sessions/{session_id}/active-game",
            "templates": "/api/v1/templates"
        },
        "new_features": {
            "queue_algorithms": "always_random, random_no_repeat, manual",
            "game_creation": "POST /api/v1/sessions/{session_id}/games",
            "active_game": "GET /api/v1/sessions/{session_id}/active-game",
            "game_completion": "POST /api/v1/games/{game_id}/end"
        }
    }

# Health check routes for each service
@app.get("/auth/health")
async def auth_health():
    """Health check for Auth Service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{AUTH_SERVICE_URL}/health", timeout=5.0)
            return JSONResponse(
                content=response.json(),
                status_code=response.status_code
            )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Auth Service unavailable: {str(e)}")

@app.get("/game/health")
async def game_health():
    """Health check for Game Service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{GAME_SERVICE_URL}/health", timeout=5.0)
            return JSONResponse(
                content=response.json(),
                status_code=response.status_code
            )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Game Service unavailable: {str(e)}")

@app.get("/template/health")
async def template_health():
    """Health check for Template Service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{TEMPLATE_SERVICE_URL}/health", timeout=5.0)
            return JSONResponse(
                content=response.json(),
                status_code=response.status_code
            )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Template Service unavailable: {str(e)}")

# Auth Service proxy routes
@app.api_route("/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_auth(request: Request, path: str):
    """Proxy requests to Auth Service"""
    url = f"{AUTH_SERVICE_URL}/auth/{path}"
    
    # Forward headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove host header
    
    # Get request body
    body = await request.body()
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=30.0
            )
            
            # Remove problematic headers
            response_headers = dict(response.headers)
            response_headers.pop("content-length", None)
            response_headers.pop("content-encoding", None)
            
            return JSONResponse(
                content=response.json() if response.content else None,
                status_code=response.status_code,
                headers=response_headers
            )
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

# Game Service proxy routes
@app.api_route("/api/v1/sessions", methods=["GET", "POST"])
async def proxy_game_sessions_root(request: Request):
    """Proxy requests to Game Service - Sessions API root"""
    url = f"{GAME_SERVICE_URL}/api/v1/sessions"
    
    # Forward headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove host header
    
    # Get request body
    body = await request.body()
    
    print(f"🔍 API Gateway: Proxying {request.method} to {url}")
    print(f"🔍 API Gateway: Request body: {body}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=30.0
            )
            
            print(f"🔍 API Gateway: Response status: {response.status_code}")
            print(f"🔍 API Gateway: Response content: {response.content}")
            print(f"🔍 API Gateway: Response headers: {dict(response.headers)}")
            
            # Remove problematic headers
            response_headers = dict(response.headers)
            response_headers.pop("content-length", None)
            response_headers.pop("content-encoding", None)
            
            response_content = response.json() if response.content else None
            print(f"🔍 API Gateway: Final response content: {response_content}")
            
            return JSONResponse(
                content=response_content,
                status_code=response.status_code,
                headers=response_headers
            )
            
    except httpx.RequestError as e:
        print(f"❌ API Gateway: Request error: {e}")
        raise HTTPException(status_code=503, detail=f"Game Service unavailable: {str(e)}")
    except Exception as e:
        print(f"❌ API Gateway: Internal error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.api_route("/api/v1/sessions/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_game_sessions(request: Request, path: str):
    """Proxy requests to Game Service - Sessions API"""
    url = f"{GAME_SERVICE_URL}/api/v1/sessions/{path}"
    
    print(f"🔍 API Gateway: Proxying {request.method} /api/v1/sessions/{path} to {url}")
    print(f"🔍 API Gateway: Headers: {dict(request.headers)}")
    print(f"🔍 API Gateway: Query params: {request.query_params}")
    
    # Forward headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove host header
    
    # Get request body
    body = await request.body()
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=30.0
            )
            
            # Remove problematic headers
            response_headers = dict(response.headers)
            response_headers.pop("content-length", None)
            response_headers.pop("content-encoding", None)
            
            return JSONResponse(
                content=response.json() if response.content else None,
                status_code=response.status_code,
                headers=response_headers
            )
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Game Service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

# Новые специфичные роуты для игр
@app.api_route("/api/v1/sessions/{session_id}/games", methods=["GET", "POST"])
async def proxy_session_games(request: Request, session_id: str):
    """Proxy requests to Game Service - Create/Get games in session"""
    url = f"{GAME_SERVICE_URL}/api/v1/sessions/{session_id}/games"
    
    # Forward headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove host header
    
    # Get request body
    body = await request.body()
    
    print(f"🎮 API Gateway: Proxying {request.method} to {url}")
    print(f"🎮 API Gateway: Session ID: {session_id}")
    print(f"🎮 API Gateway: Request body: {body}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=30.0
            )
            
            print(f"🎮 API Gateway: Response status: {response.status_code}")
            print(f"🎮 API Gateway: Response content: {response.content}")
            
            # Remove problematic headers
            response_headers = dict(response.headers)
            response_headers.pop("content-length", None)
            response_headers.pop("content-encoding", None)
            
            return JSONResponse(
                content=response.json() if response.content else None,
                status_code=response.status_code,
                headers=response_headers
            )
            
    except httpx.RequestError as e:
        print(f"❌ API Gateway: Request error: {e}")
        raise HTTPException(status_code=503, detail=f"Game Service unavailable: {str(e)}")
    except Exception as e:
        print(f"❌ API Gateway: Internal error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

# Template Service proxy routes
@app.api_route("/api/v1/templates", methods=["GET", "POST"])
async def proxy_templates_root(request: Request):
    """Proxy requests to Template Service - Templates API root"""
    url = f"{TEMPLATE_SERVICE_URL}/api/v1/templates"
    
    # Forward headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove host header
    
    # Get request body
    body = await request.body()
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=30.0
            )
            
            # Remove problematic headers
            response_headers = dict(response.headers)
            response_headers.pop("content-length", None)
            response_headers.pop("content-encoding", None)
            
            return JSONResponse(
                content=response.json() if response.content else None,
                status_code=response.status_code,
                headers=response_headers
            )
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Template Service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.api_route("/api/v1/templates/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_templates(request: Request, path: str):
    """Proxy requests to Template Service - Templates API"""
    url = f"{TEMPLATE_SERVICE_URL}/api/v1/templates/{path}"
    
    # Forward headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove host header
    
    # Get request body
    body = await request.body()
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=30.0
            )
            
            # Remove problematic headers
            response_headers = dict(response.headers)
            response_headers.pop("content-length", None)
            response_headers.pop("content-encoding", None)
            
            return JSONResponse(
                content=response.json() if response.content else None,
                status_code=response.status_code,
                headers=response_headers
            )
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Template Service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

# 🔄 ДОБАВЛЯЕМ: маршрут для отдельных игр по ID
@app.api_route("/api/v1/{game_id}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_game_by_id(request: Request, game_id: str):
    """Proxy requests to Game Service - Individual game by ID"""
    url = f"{GAME_SERVICE_URL}/api/v1/{game_id}"
    
    # Forward headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove host header
    
    # Get request body
    body = await request.body()
    
    print(f"🎮 API Gateway: Proxying {request.method} /api/v1/{game_id} to {url}")
    print(f"🎮 API Gateway: Game ID: {game_id}")
    print(f"🎮 API Gateway: Request body: {body}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=30.0
            )
            
            print(f"🎮 API Gateway: Response status: {response.status_code}")
            print(f"🎮 API Gateway: Response content: {response.content}")
            
            # Remove problematic headers
            response_headers = dict(response.headers)
            response_headers.pop("content-length", None)
            response_headers.pop("content-encoding", None)
            
            return JSONResponse(
                content=response.json() if response.content else None,
                status_code=response.status_code,
                headers=response_headers
            )
            
    except httpx.RequestError as e:
        print(f"❌ API Gateway: Request error: {e}")
        raise HTTPException(status_code=503, detail=f"Game Service unavailable: {str(e)}")
    except Exception as e:
        print(f"❌ API Gateway: Internal error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.api_route("/api/v1/sessions/{session_id}/active-game", methods=["GET"])
async def proxy_session_active_game(request: Request, session_id: str):
    """Proxy requests to Game Service - Get active game in session"""
    url = f"{GAME_SERVICE_URL}/api/v1/sessions/{session_id}/active-game"
    
    # Forward headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove host header
    
    print(f"🎯 API Gateway: Proxying GET to {url}")
    print(f"🎯 API Gateway: Session ID: {session_id}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url=url,
                headers=headers,
                params=request.query_params,
                timeout=30.0
            )
            
            print(f"🎯 API Gateway: Response status: {response.status_code}")
            print(f"🎯 API Gateway: Response content: {response.content}")
            
            # Remove problematic headers
            response_headers = dict(response.headers)
            response_headers.pop("content-length", None)
            response_headers.pop("content-encoding", None)
            
            return JSONResponse(
                content=response.json() if response.content else None,
                status_code=response.status_code,
                headers=response_headers
            )
            
    except httpx.RequestError as e:
        print(f"❌ API Gateway: Request error: {e}")
        raise HTTPException(status_code=503, detail=f"Game Service unavailable: {str(e)}")
    except Exception as e:
        print(f"❌ API Gateway: Internal error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.api_route("/api/v1/games", methods=["GET", "POST"])
async def proxy_games_root(request: Request):
    """Proxy requests to Game Service - Games API root"""
    url = f"{GAME_SERVICE_URL}/api/v1/games"
    
    # Forward headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove host header
    
    # Get request body
    body = await request.body()
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=30.0
            )
            
            # Remove problematic headers
            response_headers = dict(response.headers)
            response_headers.pop("content-length", None)
            response_headers.pop("content-encoding", None)
            
            return JSONResponse(
                content=response.json() if response.content else None,
                status_code=response.status_code,
                headers=response_headers
            )
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Game Service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.api_route("/api/v1/games/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_games(request: Request, path: str):
    """Proxy requests to Game Service - Games API"""
    # ✅ Правильно: backend endpoint находится по /api/v1/{game_id}
    url = f"{GAME_SERVICE_URL}/api/v1/{path}"
    
    # Forward headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove host header
    
    # Get request body
    body = await request.body()
    
    print(f"🎮 API Gateway: Proxying {request.method} to {url}")
    print(f"🎮 API Gateway: Path: {path}")
    print(f"🎮 API Gateway: Request body: {body}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=30.0
            )
            
            print(f"🎮 API Gateway: Response status: {response.status_code}")
            print(f"🎮 API Gateway: Response content: {response.content}")
            
            # Remove problematic headers
            response_headers = dict(response.headers)
            response_headers.pop("content-length", None)
            response_headers.pop("content-encoding", None)
            
            return JSONResponse(
                content=response.json() if response.content else None,
                status_code=response.status_code,
                headers=response_headers
            )
            
    except httpx.RequestError as e:
        print(f"❌ API Gateway: Request error: {e}")
        raise HTTPException(status_code=503, detail=f"Game Service unavailable: {str(e)}")
    except Exception as e:
        print(f"❌ API Gateway: Internal error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)