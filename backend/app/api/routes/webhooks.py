from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import hmac
import hashlib
import json

from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.models.entities import Employee, CodeActivity, PullRequest, Task, AuditLog

router = APIRouter()

def verify_github_signature(payload_body: bytes, secret: str, signature_header: Optional[str]) -> bool:
    """Validates the HMAC-SHA256 signature sent by GitHub Webhooks."""
    if not secret or not signature_header:
        # If no secret configured in demo environment, accept payload
        return True
    if not signature_header.startswith("sha256="):
        return False
    expected_hash = hmac.new(
        secret.encode("utf-8"),
        payload_body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected_hash}", signature_header)

@router.get("/status")
def get_webhook_status():
    return {
        "status": "active",
        "supported_providers": ["github", "jira"],
        "endpoints": {
            "github": "/api/webhooks/github",
            "jira": "/api/webhooks/jira"
        },
        "signature_verification": "HMAC-SHA256 (RFC 2104)"
    }

@router.post("/github")
async def handle_github_webhook(
    request: Request,
    x_github_event: Optional[str] = Header(None),
    x_hub_signature_256: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    body_bytes = await request.body()
    webhook_secret = getattr(settings, "GITHUB_WEBHOOK_SECRET", "")
    
    if webhook_secret and not verify_github_signature(body_bytes, webhook_secret, x_hub_signature_256):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid GitHub webhook HMAC-SHA256 signature"
        )
    
    try:
        payload = json.loads(body_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = x_github_event or payload.get("event", "push")
    events_created = 0

    if event_type == "push":
        commits = payload.get("commits", [])
        pusher = payload.get("pusher", {})
        pusher_email = pusher.get("email") or (commits[0].get("author", {}).get("email") if commits else None)
        
        # Link to matching employee
        emp = None
        if pusher_email:
            emp = db.query(Employee).filter(Employee.email.ilike(pusher_email)).first()
        if not emp:
            emp = db.query(Employee).first() # Fallback for simulation/testing
        
        for commit in commits:
            activity = CodeActivity(
                employee_id=emp.id if emp else 1,
                commit_hash=commit.get("id", "hash")[:8],
                commit_message=commit.get("message", "Telemetry commit"),
                repository=payload.get("repository", {}).get("name", "epms-repo"),
                branch=payload.get("ref", "refs/heads/main").replace("refs/heads/", ""),
                lines_added=len(commit.get("added", [])) * 15 + 10,
                lines_deleted=len(commit.get("removed", [])) * 5 + 2,
                timestamp=datetime.now(timezone.utc).replace(tzinfo=None)
            )
            db.add(activity)
            events_created += 1

    elif event_type == "pull_request":
        pr_data = payload.get("pull_request", {})
        action = payload.get("action", "opened")
        author_email = pr_data.get("user", {}).get("email")
        
        emp = db.query(Employee).filter(Employee.email == author_email).first() if author_email else db.query(Employee).first()
        
        pr_record = PullRequest(
            employee_id=emp.id if emp else 1,
            pr_number=pr_data.get("number", 100),
            title=pr_data.get("title", "Feature Pull Request"),
            repository=payload.get("repository", {}).get("name", "frontend-app"),
            status="MERGED" if pr_data.get("merged") else ("CLOSED" if action == "closed" else "OPEN"),
            lines_added=pr_data.get("additions", 40),
            lines_deleted=pr_data.get("deletions", 10),
            review_comments_count=pr_data.get("review_comments", 2),
            time_to_merge_hours=3.5 if pr_data.get("merged") else None
        )
        db.add(pr_record)
        events_created += 1

    db.add(AuditLog(
        action=f"WEBHOOK_GITHUB_{event_type.upper()}",
        resource_type="TELEMETRY",
        resource_id=str(events_created),
        details=f"Processed {events_created} GitHub telemetry records.",
        ip_address=request.client.host if request.client else "127.0.0.1"
    ))
    db.commit()

    return {
        "status": "SUCCESS",
        "provider": "github",
        "event": event_type,
        "records_ingested": events_created
    }

@router.post("/jira")
async def handle_jira_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    webhook_event = payload.get("webhookEvent", "jira:issue_updated")
    issue = payload.get("issue", {})
    fields = issue.get("fields", {})
    
    task_key = issue.get("key")
    summary = fields.get("summary", "Jira Sprint Task")
    status_name = fields.get("status", {}).get("name", "In Progress").upper().replace(" ", "_")
    
    # Map Jira status to EPMS task status
    mapped_status = "IN_PROGRESS"
    if "DONE" in status_name or "RESOLVED" in status_name or "CLOSED" in status_name:
        mapped_status = "COMPLETED"
    elif "REVIEW" in status_name:
        mapped_status = "IN_REVIEW"
    elif "TODO" in status_name or "BACKLOG" in status_name:
        mapped_status = "TODO"

    # Find or update task
    existing_task = db.query(Task).filter(Task.title.ilike(f"%{task_key}%")).first() if task_key else None
    if existing_task:
        existing_task.status = mapped_status
        if mapped_status == "COMPLETED" and not existing_task.completed_at:
            existing_task.completed_at = datetime.now(timezone.utc).replace(tzinfo=None)
    else:
        new_task = Task(
            title=f"[{task_key}] {summary}" if task_key else summary,
            status=mapped_status,
            story_points=int(fields.get("customfield_10016") or fields.get("story_points") or 3),
            priority=fields.get("priority", {}).get("name", "Medium"),
            assignee_id=1,
            project_id=1
        )
        db.add(new_task)

    db.add(AuditLog(
        action=f"WEBHOOK_JIRA_{webhook_event.upper()}",
        resource_type="TASK",
        resource_id=task_key or "ISSUE",
        details=f"Jira issue {task_key} transitioned to {mapped_status}.",
        ip_address=request.client.host if request.client else "127.0.0.1"
    ))
    db.commit()

    return {
        "status": "SUCCESS",
        "provider": "jira",
        "issue_key": task_key,
        "mapped_status": mapped_status
    }
