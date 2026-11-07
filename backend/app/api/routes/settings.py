from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.models.entities import AuditLog, User
from backend.app.schemas.schemas import AuditLogOut, UserOut
from backend.app.seed.demo_data import seed_database
from backend.app.api.deps import require_admin, require_manager_or_admin

router = APIRouter()

class MetricWeightsUpdate(BaseModel):
    weight_task_completion: float
    weight_on_time_delivery: float
    weight_code_quality: float
    weight_review_participation: float
    weight_estimation_accuracy: float
    weight_workload_balance: float

@router.get("")
def get_system_settings():
    return {
        "project_name": settings.PROJECT_NAME,
        "demo_mode": settings.DEMO_MODE,
        "metric_weights": {
            "task_completion": settings.WEIGHT_TASK_COMPLETION,
            "on_time_delivery": settings.WEIGHT_ON_TIME_DELIVERY,
            "code_quality": settings.WEIGHT_CODE_QUALITY,
            "review_participation": settings.WEIGHT_REVIEW_PARTICIPATION,
            "estimation_accuracy": settings.WEIGHT_ESTIMATION_ACCURACY,
            "workload_balance": settings.WEIGHT_WORKLOAD_BALANCE,
        },
        "risk_thresholds": {
            "high_risk": settings.RISK_THRESHOLD_HIGH,
            "medium_risk": settings.RISK_THRESHOLD_MEDIUM,
            "overdue_ratio_alert": settings.OVERDUE_RATIO_ALERT_THRESHOLD
        },
        "retention_policy": "Strict 365-day automated rolling window; anonymized audit archives."
    }

@router.post("/weights")
def update_metric_weights(
    weights: MetricWeightsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    total = (
        weights.weight_task_completion +
        weights.weight_on_time_delivery +
        weights.weight_code_quality +
        weights.weight_review_participation +
        weights.weight_estimation_accuracy +
        weights.weight_workload_balance
    )
    if abs(total - 1.0) > 0.01:
        raise HTTPException(status_code=400, detail=f"Weights must sum to 1.0 (currently sums to {total:.2f})")

    settings.WEIGHT_TASK_COMPLETION = weights.weight_task_completion
    settings.WEIGHT_ON_TIME_DELIVERY = weights.weight_on_time_delivery
    settings.WEIGHT_CODE_QUALITY = weights.weight_code_quality
    settings.WEIGHT_REVIEW_PARTICIPATION = weights.weight_review_participation
    settings.WEIGHT_ESTIMATION_ACCURACY = weights.weight_estimation_accuracy
    settings.WEIGHT_WORKLOAD_BALANCE = weights.weight_workload_balance

    db.add(AuditLog(
        action="UPDATE_METRIC_WEIGHTS",
        resource_type="SETTINGS",
        resource_id="CONFIG",
        details="Administrative adjustment to transparent performance scoring weights.",
        ip_address="127.0.0.1"
    ))
    db.commit()
    return {"status": "SUCCESS", "message": "Scoring metric weights updated successfully."}

@router.post("/reset-demo")
def reset_demo_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Resets the database back to clean, reproducible demo data state."""
    seed_database(db, reset=True)
    return {"status": "SUCCESS", "message": "Demo data successfully reset to clean default state!"}

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(limit: int = 30, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    results = []
    for l in logs:
        out = AuditLogOut.model_validate(l)
        out.user_name = l.user.full_name if l.user else "System"
        results.append(out)
    return results

@router.get("/users", response_model=List[UserOut])
def list_system_users(db: Session = Depends(get_db)):
    return db.query(User).all()
