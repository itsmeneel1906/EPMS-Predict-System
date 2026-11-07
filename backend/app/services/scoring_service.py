from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.models.entities import Employee, PerformanceMetric, Task, CodeActivity, PullRequest, PeerReview, TimeEntry

class ScoringService:
    @staticmethod
    def calculate_employee_rule_score(
        employee_id: int,
        db: Session,
        weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Calculates a transparent, rule-based normalized composite performance score (0-100).
        Explicitly distinguishes rule-based score from ML model predictions.
        """
        if weights is None:
            weights = {
                "task_completion": settings.WEIGHT_TASK_COMPLETION,
                "on_time_delivery": settings.WEIGHT_ON_TIME_DELIVERY,
                "code_quality": settings.WEIGHT_CODE_QUALITY,
                "review_participation": settings.WEIGHT_REVIEW_PARTICIPATION,
                "estimation_accuracy": settings.WEIGHT_ESTIMATION_ACCURACY,
                "workload_balance": settings.WEIGHT_WORKLOAD_BALANCE,
            }

        # Query tasks
        tasks = db.query(Task).filter(Task.assignee_id == employee_id).all()
        total_tasks = len(tasks)
        completed_tasks = [t for t in tasks if t.status == "COMPLETED"]
        
        if total_tasks > 0:
            task_completion_rate = len(completed_tasks) / total_tasks
            # On-time delivery
            ontime_count = sum(1 for t in completed_tasks if t.due_date and t.completed_at and t.completed_at <= t.due_date)
            on_time_delivery_rate = ontime_count / len(completed_tasks) if completed_tasks else 0.8
            overdue_count = sum(1 for t in tasks if t.status != "COMPLETED" and t.due_date and t.due_date < t.created_at)
            overdue_ratio = overdue_count / total_tasks
            
            # Estimation accuracy
            tasks_with_hours = [t for t in completed_tasks if t.actual_hours > 0 and t.estimated_hours > 0]
            if tasks_with_hours:
                acc_sum = sum(min(1.0, t.estimated_hours / t.actual_hours) if t.actual_hours >= t.estimated_hours 
                              else min(1.0, t.actual_hours / t.estimated_hours) for t in tasks_with_hours)
                estimation_accuracy = acc_sum / len(tasks_with_hours)
            else:
                estimation_accuracy = 0.82
        else:
            task_completion_rate = 0.80
            on_time_delivery_rate = 0.85
            overdue_ratio = 0.08
            estimation_accuracy = 0.80

        # Query reviews
        reviews = db.query(PeerReview).filter(PeerReview.reviewer_id == employee_id).all()
        review_count = len(reviews)
        if review_count > 0:
            review_participation = min(1.0, review_count / 10.0)
            avg_turnaround = sum(r.turnaround_hours for r in reviews) / review_count
        else:
            review_participation = 0.75
            avg_turnaround = 4.5

        # Code quality & reopen rate
        reopened_tasks = [t for t in tasks if t.reopened_count > 0]
        reopen_ratio = len(reopened_tasks) / total_tasks if total_tasks > 0 else 0.05
        quality_score = max(0.0, 1.0 - (reopen_ratio * 1.5))

        # Workload balance
        workload_index = 1.05  # baseline

        # Calculate composite score
        composite = (
            (task_completion_rate * 100.0) * weights["task_completion"] +
            (on_time_delivery_rate * 100.0) * weights["on_time_delivery"] +
            (quality_score * 100.0) * weights["code_quality"] +
            (review_participation * 100.0) * weights["review_participation"] +
            (estimation_accuracy * 100.0) * weights["estimation_accuracy"] +
            (max(0.0, 100.0 - abs(workload_index - 1.0) * 40.0)) * weights["workload_balance"]
        )
        
        final_score = round(max(40.0, min(99.0, composite)), 1)
        
        return {
            "rule_based_score": final_score,
            "weights_used": weights,
            "components": {
                "task_completion_rate": round(task_completion_rate, 3),
                "on_time_delivery_rate": round(on_time_delivery_rate, 3),
                "overdue_ratio": round(overdue_ratio, 3),
                "estimation_accuracy": round(estimation_accuracy, 3),
                "review_participation": round(review_participation, 3),
                "avg_turnaround_hours": round(avg_turnaround, 1),
                "quality_score": round(quality_score, 3),
                "workload_index": round(workload_index, 2)
            }
        }
