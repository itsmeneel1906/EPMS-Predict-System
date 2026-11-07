from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.entities import Alert
from backend.app.schemas.schemas import AlertOut, AlertCreate, AlertUpdate
from backend.app.services.alerts_service import AlertsService

router = APIRouter()

@router.get("", response_model=List[AlertOut])
def list_alerts(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    employee_id: Optional[int] = None,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if status:
        query = query.filter(Alert.status == status)
    if employee_id:
        query = query.filter(Alert.employee_id == employee_id)
    if project_id:
        query = query.filter(Alert.project_id == project_id)

    alerts = query.order_by(Alert.created_at.desc()).all()
    results = []
    for a in alerts:
        out = AlertOut.model_validate(a)
        out.employee_name = a.employee.name if a.employee else None
        out.team_name = a.team.name if a.team else None
        out.project_name = a.project.name if a.project else None
        results.append(out)
    return results

@router.post("/scan")
def trigger_alert_scan(db: Session = Depends(get_db)):
    """Scans all projects and employees for delivery risks, overdue spikes, and bottlenecks."""
    new_alerts = AlertsService.generate_system_alerts(db)
    return {
        "status": "SUCCESS",
        "new_alerts_detected": len(new_alerts),
        "message": f"Scan completed. Detected {len(new_alerts)} new risk warning(s)."
    }

@router.post("/{alert_id}/acknowledge", response_model=AlertOut)
def acknowledge_alert(alert_id: int, manager_id: Optional[int] = None, db: Session = Depends(get_db)):
    alert = AlertsService.acknowledge_alert(alert_id, db, manager_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    out = AlertOut.model_validate(alert)
    out.employee_name = alert.employee.name if alert.employee else None
    out.project_name = alert.project.name if alert.project else None
    return out

@router.post("/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(alert_id: int, body: AlertUpdate, db: Session = Depends(get_db)):
    notes = body.resolution_notes or "Mitigation plan applied."
    alert = AlertsService.resolve_alert(alert_id, notes, db)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    out = AlertOut.model_validate(alert)
    out.employee_name = alert.employee.name if alert.employee else None
    out.project_name = alert.project.name if alert.project else None
    return out
