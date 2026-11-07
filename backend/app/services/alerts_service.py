from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.models.entities import Alert, Employee, Project, Task, PeerReview

def get_naive_utc():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class AlertsService:
    @staticmethod
    def generate_system_alerts(db: Session) -> List[Alert]:
        """
        Scans projects, tasks, and employees to detect risk triggers.
        Avoids creating duplicates of existing open alerts.
        """
        created_alerts = []
        now = get_naive_utc()
        
        # 1. Project Deadline and Delivery Risks
        projects = db.query(Project).filter(Project.status == "IN_PROGRESS").all()
        for p in projects:
            tasks = db.query(Task).filter(Task.project_id == p.id).all()
            total_tasks = len(tasks)
            incomplete_tasks = [t for t in tasks if t.status != "COMPLETED"]
            
            if total_tasks > 0 and len(incomplete_tasks) > 0 and p.due_date:
                # Check if due date is within 14 days and incomplete > 40%
                p_due = p.due_date.replace(tzinfo=None) if hasattr(p.due_date, 'tzinfo') and p.due_date.tzinfo else p.due_date
                days_left = (p_due - now).days
                if days_left <= 14 and (len(incomplete_tasks) / total_tasks) > 0.40:
                    existing = db.query(Alert).filter(
                        Alert.project_id == p.id,
                        Alert.alert_type == "MILESTONE_DELIVERY_RISK",
                        Alert.status.in_(["NEW", "ACKNOWLEDGED", "IN_PROGRESS"])
                    ).first()
                    
                    if not existing:
                        alert = Alert(
                            severity="High" if days_left <= 7 else "Medium",
                            alert_type="MILESTONE_DELIVERY_RISK",
                            title=f"Delivery Squeeze: Project {p.name} Milestone Approaching",
                            explanation=f"{len(incomplete_tasks)} of {total_tasks} tasks remain uncompleted with deadline approaching in {days_left} days.",
                            supporting_metric=f"Incomplete Tasks: {int((len(incomplete_tasks)/total_tasks)*100)}%",
                            project_id=p.id,
                            status="NEW",
                            suggested_action="Review milestone scope; reallocate tasks from blocked streams."
                        )
                        db.add(alert)
                        created_alerts.append(alert)

        # 2. Employee Overdue Task Spikes
        employees = db.query(Employee).filter(Employee.employment_status == "ACTIVE").all()
        for emp in employees:
            tasks = db.query(Task).filter(Task.assignee_id == emp.id).all()
            if tasks:
                overdue = []
                for t in tasks:
                    if t.status != "COMPLETED" and t.due_date:
                        t_due = t.due_date.replace(tzinfo=None) if hasattr(t.due_date, 'tzinfo') and t.due_date.tzinfo else t.due_date
                        if t_due < now:
                            overdue.append(t)
                overdue_ratio = len(overdue) / len(tasks)
                
                if overdue_ratio >= 0.25 and len(overdue) >= 2:
                    existing = db.query(Alert).filter(
                        Alert.employee_id == emp.id,
                        Alert.alert_type == "OVERDUE_TASK_SPIKE",
                        Alert.status.in_(["NEW", "ACKNOWLEDGED", "IN_PROGRESS"])
                    ).first()
                    
                    if not existing:
                        alert = Alert(
                            severity="High" if overdue_ratio >= 0.40 else "Medium",
                            alert_type="OVERDUE_TASK_SPIKE",
                            title=f"Overdue Backlog Accumulation: {emp.name}",
                            explanation=f"{len(overdue)} assigned tasks are past their targeted due date ({int(overdue_ratio*100)}% of total workload).",
                            supporting_metric=f"Overdue Ratio: {int(overdue_ratio*100)}%",
                            employee_id=emp.id,
                            team_id=emp.team_id,
                            assigned_manager_id=emp.manager_id,
                            status="NEW",
                            suggested_action="Conduct brief 1-on-1 to identify technical blockers or external dependencies."
                        )
                        db.add(alert)
                        created_alerts.append(alert)

        # 3. ML Unsupervised Anomaly Detection (Isolation Forest)
        try:
            from backend.app.ml.anomaly import detect_telemetry_anomalies
            detected_anomalies = detect_telemetry_anomalies(db, contamination=0.15)
            for anom in detected_anomalies:
                existing = db.query(Alert).filter(
                    Alert.employee_id == anom["employee_id"],
                    Alert.alert_type == "ML_ISOLATION_FOREST_ANOMALY",
                    Alert.status.in_(["NEW", "ACKNOWLEDGED", "IN_PROGRESS"])
                ).first()
                if not existing:
                    dev_details = ", ".join([f"{d['feature']}: {d['value']} (z={d['z_score']})" for d in anom["top_deviations"][:2]])
                    alert = Alert(
                        severity=anom["severity"],
                        alert_type="ML_ISOLATION_FOREST_ANOMALY",
                        title=f"ML Anomaly Detected: {anom['employee_name']} Velocity Shift",
                        explanation=f"Isolation Forest identified statistical telemetry outlier (decision score: {anom['anomaly_score']}). Key deviations: {dev_details}.",
                        supporting_metric=f"Anomaly Score: {anom['anomaly_score']}",
                        employee_id=anom["employee_id"],
                        team_id=anom["team_id"],
                        status="NEW",
                        suggested_action="Review recent sprint allocation and PR review queue to mitigate velocity divergence."
                    )
                    db.add(alert)
                    created_alerts.append(alert)
        except Exception as e:
            # Fallback gracefully if insufficient data
            pass

        db.commit()
        return created_alerts

    @staticmethod
    def acknowledge_alert(alert_id: int, db: Session, manager_id: Optional[int] = None) -> Optional[Alert]:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.status = "ACKNOWLEDGED"
            if manager_id:
                alert.assigned_manager_id = manager_id
            db.commit()
            db.refresh(alert)
        return alert

    @staticmethod
    def resolve_alert(alert_id: int, notes: str, db: Session) -> Optional[Alert]:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.status = "RESOLVED"
            alert.resolution_notes = notes
            alert.resolved_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(alert)
        return alert
