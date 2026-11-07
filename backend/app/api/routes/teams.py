from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.models.entities import Team, Employee, Task
from backend.app.schemas.schemas import TeamOut, TeamCreate, TeamUpdate

router = APIRouter()

@router.get("", response_model=List[TeamOut])
def list_teams(db: Session = Depends(get_db)):
    teams = db.query(Team).all()
    results = []
    for t in teams:
        members = db.query(Employee).filter(Employee.team_id == t.id).all()
        avg_score = sum(m.current_score for m in members) / len(members) if members else 0.0
        out = TeamOut.model_validate(t)
        out.manager_name = t.manager.name if t.manager else "None"
        out.member_count = len(members)
        out.average_score = round(avg_score, 1)
        results.append(out)
    return results

@router.get("/{team_id}")
def get_team_detail(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    members = db.query(Employee).filter(Employee.team_id == team.id).all()
    avg_score = sum(m.current_score for m in members) / len(members) if members else 0.0
    
    # Calculate team risk breakdown
    low_risk = sum(1 for m in members if m.risk_level == "Low")
    med_risk = sum(1 for m in members if m.risk_level == "Medium")
    high_risk = sum(1 for m in members if m.risk_level == "High")

    return {
        "team": {
            "id": team.id,
            "name": team.name,
            "department": team.department,
            "description": team.description,
            "target_velocity": team.target_velocity,
            "manager_name": team.manager.name if team.manager else "None",
            "manager_email": team.manager.email if team.manager else "None",
            "member_count": len(members),
            "average_score": round(avg_score, 1),
            "risk_breakdown": {
                "low": low_risk,
                "medium": med_risk,
                "high": high_risk
            }
        },
        "members": members
    }

@router.post("", response_model=TeamOut)
def create_team(team_in: TeamCreate, db: Session = Depends(get_db)):
    team = Team(**team_in.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)
    out = TeamOut.model_validate(team)
    out.member_count = 0
    out.average_score = 0.0
    return out

@router.put("/{team_id}", response_model=TeamOut)
def update_team(team_id: int, team_in: TeamUpdate, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    for k, v in team_in.model_dump(exclude_unset=True).items():
        setattr(team, k, v)
    db.commit()
    db.refresh(team)
    out = TeamOut.model_validate(team)
    return out
