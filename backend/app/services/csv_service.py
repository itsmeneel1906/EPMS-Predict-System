import io
import csv
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.entities import Task, TimeEntry, CodeActivity, Project, Employee

class CSVService:
    @staticmethod
    def preview_csv(file_content: str, max_rows: int = 5) -> Dict[str, Any]:
        """Parses CSV and returns column headers and first sample rows for column mapping."""
        reader = csv.reader(io.StringIO(file_content))
        rows = list(reader)
        if not rows:
            return {"headers": [], "rows": [], "total_rows": 0}
        headers = [h.strip() for h in rows[0]]
        sample_rows = rows[1:max_rows+1]
        return {
            "headers": headers,
            "sample_rows": sample_rows,
            "total_rows": len(rows) - 1
        }

    @staticmethod
    def import_tasks_csv(
        file_content: str,
        mapping: Dict[str, str],
        project_id: int,
        db: Session
    ) -> Dict[str, Any]:
        """
        Imports tasks from CSV with column mapping, validation, duplicate checks, and error report.
        """
        reader = csv.DictReader(io.StringIO(file_content))
        imported_count = 0
        skipped_count = 0
        errors = []

        # Verify project exists
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"success": False, "error": f"Project ID {project_id} does not exist"}

        employees = {emp.email.lower(): emp.id for emp in db.query(Employee).all()}
        employees.update({emp.name.lower(): emp.id for emp in db.query(Employee).all()})

        for row_idx, row in enumerate(reader, start=2):
            task_key = row.get(mapping.get("task_key", "task_key"), "").strip()
            title = row.get(mapping.get("title", "title"), "").strip()
            
            if not title:
                errors.append(f"Row {row_idx}: Title is required and was empty.")
                continue

            if not task_key:
                task_key = f"{project.code}-{db.query(Task).count() + 101}"

            # Check duplicate
            existing = db.query(Task).filter(Task.task_key == task_key).first()
            if existing:
                skipped_count += 1
                continue

            assignee_val = row.get(mapping.get("assignee", "assignee"), "").strip().lower()
            assignee_id = employees.get(assignee_val, None)

            # Parse story points / estimated hours
            try:
                story_points = int(row.get(mapping.get("story_points", "story_points"), 3) or 3)
            except ValueError:
                story_points = 3

            try:
                estimated_hours = float(row.get(mapping.get("estimated_hours", "estimated_hours"), 8.0) or 8.0)
            except ValueError:
                estimated_hours = 8.0

            status_val = row.get(mapping.get("status", "status"), "TODO").strip().upper()
            if status_val not in ["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED", "BLOCKED"]:
                status_val = "TODO"

            new_task = Task(
                task_key=task_key,
                title=title,
                description=row.get(mapping.get("description", "description"), ""),
                project_id=project_id,
                assignee_id=assignee_id,
                priority=row.get(mapping.get("priority", "priority"), "Medium").strip().capitalize() or "Medium",
                status=status_val,
                story_points=story_points,
                estimated_hours=estimated_hours,
                actual_hours=0.0,
                source="CSV",
                created_at=datetime.now(timezone.utc)
            )
            db.add(new_task)
            imported_count += 1

        db.commit()
        return {
            "success": True,
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "errors": errors
        }
