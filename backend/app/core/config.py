import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Employee Performance Prediction System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-epms-prediction-system-change-in-prod-2025")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for development/demo
    
    # Database config: defaults to SQLite for immediate local plug-and-play,
    # configurable via DATABASE_URL for PostgreSQL in production or docker-compose
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./epms.db"
    )
    
    # ML & Feature Weights (Configurable by Admin)
    WEIGHT_TASK_COMPLETION: float = 0.25
    WEIGHT_ON_TIME_DELIVERY: float = 0.25
    WEIGHT_CODE_QUALITY: float = 0.15
    WEIGHT_REVIEW_PARTICIPATION: float = 0.15
    WEIGHT_ESTIMATION_ACCURACY: float = 0.10
    WEIGHT_WORKLOAD_BALANCE: float = 0.10
    
    # Risk Alert Thresholds
    RISK_THRESHOLD_HIGH: float = 0.70
    RISK_THRESHOLD_MEDIUM: float = 0.40
    OVERDUE_RATIO_ALERT_THRESHOLD: float = 0.25
    
    # GitHub and Jira Integration defaults
    GITHUB_API_BASE: str = "https://api.github.com"
    JIRA_API_BASE: Optional[str] = None
    
    DEMO_MODE: bool = True

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
