from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.entities import Feedback, DevelopmentGoal, Employee
from backend.app.schemas.schemas import FeedbackOut, FeedbackCreate, DevelopmentGoalOut, DevelopmentGoalCreate, DevelopmentGoalUpdate
from backend.app.services.feedback_service import FeedbackService

router = APIRouter()

@router.get("", response_model=List[FeedbackOut])
def list_feedbacks(employee_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Feedback)
    if employee_id:
        query = query.filter(Feedback.employee_id == employee_id)
    feedbacks = query.order_by(Feedback.created_at.desc()).all()
    results = []
    for f in feedbacks:
        out = FeedbackOut.model_validate(f)
        out.reviewer_name = f.reviewer.name if f.reviewer else "Manager"
        results.append(out)
    return results

@router.get("/generate-recommendations/{employee_id}")
def generate_recommendations(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    recs = FeedbackService.generate_personalized_recommendations(emp, db)
    return {
        "employee_id": emp.id,
        "employee_name": emp.name,
        "current_score": emp.current_score,
        "recommendations": recs
    }

@router.post("", response_model=FeedbackOut)
def create_feedback(feedback_in: FeedbackCreate, db: Session = Depends(get_db)):
    fb = Feedback(**feedback_in.model_dump())
    db.add(fb)
    db.commit()
    db.refresh(fb)
    out = FeedbackOut.model_validate(fb)
    out.reviewer_name = fb.reviewer.name if fb.reviewer else "Manager"
    return out

@router.get("/goals", response_model=List[DevelopmentGoalOut])
def list_goals(employee_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(DevelopmentGoal)
    if employee_id:
        query = query.filter(DevelopmentGoal.employee_id == employee_id)
    return query.order_by(DevelopmentGoal.created_at.desc()).all()

@router.post("/goals", response_model=DevelopmentGoalOut)
def create_goal(goal_in: DevelopmentGoalCreate, db: Session = Depends(get_db)):
    goal = DevelopmentGoal(**goal_in.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.put("/goals/{goal_id}", response_model=DevelopmentGoalOut)
def update_goal(goal_id: int, goal_in: DevelopmentGoalUpdate, db: Session = Depends(get_db)):
    goal = db.query(DevelopmentGoal).filter(DevelopmentGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Development goal not found")
    for k, v in goal_in.model_dump(exclude_unset=True).items():
        setattr(goal, k, v)
    if goal.progress_pct >= 100.0:
        goal.status = "ACHIEVED"
    db.commit()
    db.refresh(goal)
    return goal
