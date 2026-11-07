import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.app.core.config import settings
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.seed.demo_data import seed_database
from backend.app.ml.pipeline import load_models
from backend.app.models.entities import User

# Routers
from backend.app.api.routes import (
    auth,
    employees,
    teams,
    projects,
    tasks,
    predictions,
    alerts,
    feedback,
    integrations,
    analytics,
    csv_import,
    settings as sys_settings,
    webhooks
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Train or load ML models
    load_models()
    
    # Ensure seed data exists
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            seed_database(db, reset=False)
    finally:
        db.close()
        
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-style Employee Performance Prediction System for Web and App Development Teams",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employees"])
app.include_router(teams.router, prefix="/api/teams", tags=["Teams"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Early Warnings"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Personalized Feedback"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["Integrations"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(csv_import.router, prefix="/api/csv", tags=["CSV Ingestion"])
app.include_router(sys_settings.router, prefix="/api/settings", tags=["Administration & Settings"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks & Real Ingestion"])

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "demo_mode": settings.DEMO_MODE,
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
