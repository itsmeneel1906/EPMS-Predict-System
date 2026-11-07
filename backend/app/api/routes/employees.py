from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import csv
from backend.app.core.database import get_db
from backend.app.models.entities import Employee, Team, PerformanceMetric, PerformancePrediction, Task, PullRequest, CodeActivity, Feedback, DevelopmentGoal
from backend.app.schemas.schemas import EmployeeOut, EmployeeCreate, EmployeeUpdate

router = APIRouter()

@router.get("", response_model=List[EmployeeOut])
def list_employees(
    team_id: Optional[int] = None,
    risk_level: Optional[str] = None,
    role_title: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Employee)
    if team_id:
        query = query.filter(Employee.team_id == team_id)
    if risk_level:
        query = query.filter(Employee.risk_level == risk_level)
    if role_title:
        query = query.filter(Employee.role_title.ilike(f"%{role_title}%"))
    if search:
        s = f"%{search}%"
        query = query.filter((Employee.name.ilike(s)) | (Employee.employee_code.ilike(s)) | (Employee.email.ilike(s)))
    
    employees = query.order_by(Employee.current_score.desc()).all()
    results = []
    for emp in employees:
        out = EmployeeOut.model_validate(emp)
        out.team_name = emp.team.name if emp.team else "Unassigned"
        out.manager_name = emp.manager.name if emp.manager else "None"
        results.append(out)
    return results

@router.get("/export/csv")
def export_employees_csv(db: Session = Depends(get_db)):
    """Export authorized employee reports to CSV (Section 6)."""
    employees = db.query(Employee).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Employee ID", "Name", "Email", "Role Title", "Team", 
        "Experience Level", "Current Performance Score", "Productivity Outlook", 
        "Risk Level", "Trend", "Status"
    ])
    for emp in employees:
        writer.writerow([
            emp.employee_code,
            emp.name,
            emp.email,
            emp.role_title,
            emp.team.name if emp.team else "N/A",
            emp.experience_level,
            emp.current_score,
            emp.productivity_outlook,
            emp.risk_level,
            emp.recent_trend,
            emp.employment_status
        ])
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=employees_report.csv"}
    )

@router.get("/{employee_id}")
def get_employee_detail(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Fetch related history
    metrics = db.query(PerformanceMetric).filter(PerformanceMetric.employee_id == emp.id).order_by(PerformanceMetric.created_at.desc()).limit(10).all()
    predictions = db.query(PerformancePrediction).filter(PerformancePrediction.employee_id == emp.id).order_by(PerformancePrediction.created_at.desc()).limit(5).all()
    tasks = db.query(Task).filter(Task.assignee_id == emp.id).order_by(Task.created_at.desc()).limit(15).all()
    feedbacks = db.query(Feedback).filter(Feedback.employee_id == emp.id).order_by(Feedback.created_at.desc()).all()
    goals = db.query(DevelopmentGoal).filter(DevelopmentGoal.employee_id == emp.id).all()
    commits = db.query(CodeActivity).filter(CodeActivity.employee_id == emp.id).order_by(CodeActivity.committed_at.desc()).limit(10).all()
    prs = db.query(PullRequest).filter(PullRequest.employee_id == emp.id).order_by(PullRequest.created_at.desc()).limit(10).all()

    return {
        "employee": {
            "id": emp.id,
            "employee_code": emp.employee_code,
            "name": emp.name,
            "email": emp.email,
            "avatar_url": emp.avatar_url,
            "role_title": emp.role_title,
            "team_id": emp.team_id,
            "team_name": emp.team.name if emp.team else "Unassigned",
            "manager_id": emp.manager_id,
            "manager_name": emp.manager.name if emp.manager else "None",
            "experience_level": emp.experience_level,
            "skills": emp.skills,
            "employment_status": emp.employment_status,
            "current_score": emp.current_score,
            "productivity_outlook": emp.productivity_outlook,
            "risk_level": emp.risk_level,
            "recent_trend": emp.recent_trend,
            "joining_date": emp.joining_date
        },
        "metrics_history": metrics,
        "predictions": predictions,
        "tasks": tasks,
        "feedbacks": feedbacks,
        "goals": goals,
        "recent_commits": commits,
        "recent_pull_requests": prs
    }

@router.post("", response_model=EmployeeOut)
def create_employee(emp_in: EmployeeCreate, db: Session = Depends(get_db)):
    existing = db.query(Employee).filter(
        (Employee.email == emp_in.email) | (Employee.employee_code == emp_in.employee_code)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee code or email already exists")

    emp = Employee(**emp_in.model_dump())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    
    out = EmployeeOut.model_validate(emp)
    out.team_name = emp.team.name if emp.team else "Unassigned"
    return out

@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: int, emp_update: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = emp_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(emp, field, val)

    db.commit()
    db.refresh(emp)
    out = EmployeeOut.model_validate(emp)
    out.team_name = emp.team.name if emp.team else "Unassigned"
    return out

@router.post("/{employee_id}/deactivate")
def deactivate_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    emp.employment_status = "INACTIVE"
    db.commit()
    return {"status": "SUCCESS", "message": f"Employee {emp.name} marked as inactive"}
