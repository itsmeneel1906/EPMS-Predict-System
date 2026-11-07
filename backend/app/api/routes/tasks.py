from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.entities import Task, TaskActivity, Project, Employee
from backend.app.schemas.schemas import TaskOut, TaskCreate, TaskUpdate

router = APIRouter()

@router.get("", response_model=List[TaskOut])
def list_tasks(
    project_id: Optional[int] = None,
    assignee_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)

    tasks = query.order_by(Task.created_at.desc()).all()
    results = []
    for t in tasks:
        out = TaskOut.model_validate(t)
        out.assignee_name = t.assignee.name if t.assignee else "Unassigned"
        out.project_name = t.project.name if t.project else "None"
        results.append(out)
    return results

@router.post("", response_model=TaskOut)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    existing = db.query(Task).filter(Task.task_key == task_in.task_key).first()
    if existing:
        raise HTTPException(status_code=400, detail="Task key already exists")

    task = Task(**task_in.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)

    # Log initial activity
    activity = TaskActivity(
        task_id=task.id,
        employee_id=task.assignee_id,
        event_type="TASK_CREATED",
        details=f"Task {task.task_key} created with status {task.status}",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(activity)
    db.commit()

    out = TaskOut.model_validate(task)
    out.assignee_name = task.assignee.name if task.assignee else "Unassigned"
    out.project_name = task.project.name if task.project else "None"
    return out

@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_status = task.status
    update_data = task_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(task, k, v)

    if "status" in update_data:
        if update_data["status"] == "COMPLETED" and old_status != "COMPLETED":
            task.completed_at = datetime.now(timezone.utc)
        elif old_status == "COMPLETED" and update_data["status"] != "COMPLETED":
            task.reopened_count += 1

        db.add(TaskActivity(
            task_id=task.id,
            employee_id=task.assignee_id,
            event_type="STATUS_CHANGED",
            details=f"Status changed from {old_status} to {task.status}",
            timestamp=datetime.now(timezone.utc)
        ))

    db.commit()
    db.refresh(task)

    out = TaskOut.model_validate(task)
    out.assignee_name = task.assignee.name if task.assignee else "Unassigned"
    out.project_name = task.project.name if task.project else "None"
    return out
