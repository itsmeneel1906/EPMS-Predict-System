from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.entities import Feedback, DevelopmentGoal, Employee, Task, PeerReview

class FeedbackService:
    @staticmethod
    def generate_personalized_recommendations(employee: Employee, db: Session) -> Dict[str, Any]:
        """
        Synthesizes respectful, evidence-based development recommendations and strengths
        anchored directly to observed metrics rather than subjective claims.
        """
        strengths = []
        growth_areas = []
        actions = []
        
        score = employee.current_score
        
        # Check task completion
        tasks = db.query(Task).filter(Task.assignee_id == employee.id).all()
        completed = [t for t in tasks if t.status == "COMPLETED"]
        total = len(tasks)
        
        if total > 0 and len(completed) / total >= 0.85:
            strengths.append(f"High task execution reliability with {int((len(completed)/total)*100)}% completion rate.")
        
        # Check peer review
        reviews = db.query(PeerReview).filter(PeerReview.reviewer_id == employee.id).all()
        if reviews:
            avg_speed = sum(r.turnaround_hours for r in reviews) / len(reviews)
            if avg_speed <= 4.0:
                strengths.append(f"Prompt code review participation (average turnaround {avg_speed:.1f} hours).")
            else:
                growth_areas.append(f"PR review turnaround currently averages {avg_speed:.1f} hours.")
                actions.append("Dedicate 20-30 minutes at the start of each morning to clear pending peer reviews.")
        else:
            growth_areas.append("Low code review involvement across active repositories.")
            actions.append("Engage in at least 2 code reviews per week to support team velocity.")

        # Check overdue tasks
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        overdue = []
        for t in tasks:
            if t.status != "COMPLETED" and t.due_date:
                t_due = t.due_date.replace(tzinfo=None) if hasattr(t.due_date, 'tzinfo') and t.due_date.tzinfo else t.due_date
                if t_due < now:
                    overdue.append(t)
        if overdue:
            growth_areas.append(f"{len(overdue)} tasks past scheduled delivery deadline.")
            actions.append("Break complex tasks into smaller sub-milestones (1-2 days each) to track progress granularly.")
        else:
            strengths.append("Consistent deadline adherence with zero current overdue deliverables.")

        # Seniority / Leadership recommendations
        if score >= 88.0:
            strengths.append("Consistently high technical output and delivery predictability.")
            actions.append("Facilitate architecture knowledge-sharing and mentor associate engineers.")

        if not strengths:
            strengths.append("Steady commitment to ongoing sprint assignments and active project participation.")
        if not growth_areas:
            growth_areas.append("Explore cross-functional architecture and advanced cloud/mobile optimization.")
            actions.append("Participate in quarterly technical architecture refinement sessions.")

        return {
            "strengths": "\n".join(f"• {s}" for s in strengths),
            "growth_areas": "\n".join(f"• {g}" for g in growth_areas),
            "suggested_actions": "\n".join(f"• {a}" for a in actions)
        }
