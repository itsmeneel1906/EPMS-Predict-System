from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.models.entities import Integration, SyncRun, AuditLog
from backend.app.schemas.schemas import IntegrationOut, IntegrationConnectRequest, SyncRunOut
from backend.app.services.integration_service import IntegrationService

router = APIRouter()

@router.get("", response_model=List[IntegrationOut])
def list_integrations(db: Session = Depends(get_db)):
    return db.query(Integration).all()

@router.post("/connect")
def connect_integration(req: IntegrationConnectRequest, db: Session = Depends(get_db)):
    integ = db.query(Integration).filter(Integration.provider == req.provider).first()
    if not integ:
        raise HTTPException(status_code=404, detail="Integration provider not found")
    
    integ.is_connected = True
    integ.auth_credentials = req.api_token
    if req.api_base_url:
        integ.api_base_url = req.api_base_url
    db.commit()

    db.add(AuditLog(
        action="CONNECT_INTEGRATION",
        resource_type="INTEGRATION",
        resource_id=req.provider,
        details=f"Integration {integ.display_name} connected.",
        ip_address="127.0.0.1"
    ))
    db.commit()
    return {"status": "SUCCESS", "message": f"{integ.display_name} connected successfully."}

@router.post("/{provider}/disconnect")
def disconnect_integration(provider: str, db: Session = Depends(get_db)):
    integ = db.query(Integration).filter(Integration.provider == provider).first()
    if not integ:
        raise HTTPException(status_code=404, detail="Integration provider not found")
    integ.is_connected = False
    integ.auth_credentials = None
    db.commit()
    return {"status": "SUCCESS", "message": f"{integ.display_name} disconnected."}

@router.post("/{provider}/sync")
def sync_integration(provider: str, db: Session = Depends(get_db)):
    integ = db.query(Integration).filter(Integration.provider == provider).first()
    if not integ:
        raise HTTPException(status_code=404, detail="Integration provider not found")
    
    if provider == "github":
        res = IntegrationService.sync_github(integ, db)
    elif provider == "jira":
        res = IntegrationService.sync_jira(integ, db)
    else:
        raise HTTPException(status_code=400, detail="Unsupported integration provider")

    db.add(AuditLog(
        action="TRIGGER_SYNC",
        resource_type="INTEGRATION",
        resource_id=provider,
        details=f"Triggered manual synchronization for {integ.display_name}. Result: {res.get('status')}.",
        ip_address="127.0.0.1"
    ))
    db.commit()
    return res

@router.get("/sync-history", response_model=List[SyncRunOut])
def get_sync_history(limit: int = 15, db: Session = Depends(get_db)):
    return db.query(SyncRun).order_by(SyncRun.started_at.desc()).limit(limit).all()
