from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from routers import auth, courses, materials, quiz, ai, suggestions, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.app_name}...")
    yield
    print("Shutting down...")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api/auth",        tags=["auth"])
app.include_router(courses.router,     prefix="/api/courses",     tags=["courses"])
app.include_router(materials.router,   prefix="/api/materials",   tags=["materials"])
app.include_router(quiz.router,        prefix="/api/quiz",        tags=["quiz"])
app.include_router(ai.router,          prefix="/api/ai",          tags=["ai"])
app.include_router(suggestions.router, prefix="/api/suggestions", tags=["suggestions"])
app.include_router(admin.router,       prefix="/api/admin",       tags=["admin"])


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.app_name}
