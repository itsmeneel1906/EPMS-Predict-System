from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.entities import Project, Task
from backend.app.schemas.schemas import ProjectOut, ProjectCreate, ProjectUpdate

router = APIRouter()

@router.get("", response_model=List[ProjectOut])
def list_projects(project_type: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Project)
    if project_type:
        query = query.filter(Project.project_type == project_type)
    if status:
        query = query.filter(Project.status == status)
    
    projects = query.all()
    results = []
    for p in projects:
        tasks = db.query(Task).filter(Task.project_id == p.id).all()
        completed = [t for t in tasks if t.status == "COMPLETED"]
        out = ProjectOut.model_validate(p)
        out.task_count = len(tasks)
        out.completed_task_count = len(completed)
        results.append(out)
    return results

@router.get("/{project_id}")
def get_project_detail(project_id: int, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    
    tasks = db.query(Task).filter(Task.project_id == proj.id).all()
    completed = [t for t in tasks if t.status == "COMPLETED"]
    in_progress = [t for t in tasks if t.status == "IN_PROGRESS"]
    blocked = [t for t in tasks if t.status == "BLOCKED"]
    
    total_sp = sum(t.story_points for t in tasks)
    completed_sp = sum(t.story_points for t in completed)
    progress_pct = round((completed_sp / total_sp * 100), 1) if total_sp > 0 else 0.0

    return {
        "project": {
            "id": proj.id,
            "name": proj.name,
            "code": proj.code,
            "description": proj.description,
            "project_type": proj.project_type,
            "tech_stack": proj.tech_stack,
            "client_name": proj.client_name,
            "repo_url": proj.repo_url,
            "start_date": proj.start_date,
            "due_date": proj.due_date,
            "status": proj.status,
            "delivery_risk": proj.delivery_risk,
            "risk_probability": proj.risk_probability,
            "progress_percentage": progress_pct,
            "task_counts": {
                "total": len(tasks),
                "completed": len(completed),
                "in_progress": len(in_progress),
                "blocked": len(blocked)
            }
        },
        "tasks": tasks
    }

@router.post("", response_model=ProjectOut)
def create_project(proj_in: ProjectCreate, db: Session = Depends(get_db)):
    existing = db.query(Project).filter(Project.code == proj_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Project code already exists")
    
    proj = Project(**proj_in.model_dump())
    db.add(proj)
    db.commit()
    db.refresh(proj)
    out = ProjectOut.model_validate(proj)
    out.task_count = 0
    out.completed_task_count = 0
    return out

@router.put("/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, proj_in: ProjectUpdate, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    for k, v in proj_in.model_dump(exclude_unset=True).items():
        setattr(proj, k, v)
    db.commit()
    db.refresh(proj)
    out = ProjectOut.model_validate(proj)
    return out
