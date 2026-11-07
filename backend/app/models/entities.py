from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="EMPLOYEE")  # ADMIN, MANAGER, EMPLOYEE
    is_active = Column(Boolean, default=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    employee = relationship("Employee", foreign_keys=[employee_id], back_populates="user_account")
    audit_logs = relationship("AuditLog", back_populates="user")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    role_title = Column(String(100), nullable=False)  # Frontend Engineer, Backend Engineer, Mobile Developer, etc.
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    manager_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    experience_level = Column(String(50), default="Mid")  # Junior, Mid, Senior, Lead
    skills = Column(Text, default="[]")  # JSON string list of skills
    joining_date = Column(DateTime, default=utc_now)
    employment_status = Column(String(50), default="ACTIVE")  # ACTIVE, ON_LEAVE, INACTIVE
    current_score = Column(Float, default=80.0)
    productivity_outlook = Column(String(50), default="Moderate")  # High, Moderate, Needs Attention
    risk_level = Column(String(50), default="Low")  # Low, Medium, High
    recent_trend = Column(String(50), default="stable")  # up, down, stable
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user_account = relationship("User", uselist=False, back_populates="employee")
    team = relationship("Team", foreign_keys=[team_id], back_populates="members")
    manager = relationship("Employee", remote_side=[id], foreign_keys=[manager_id])
    tasks = relationship("Task", back_populates="assignee")
    code_activities = relationship("CodeActivity", back_populates="employee")
    pull_requests = relationship("PullRequest", back_populates="employee")
    peer_reviews = relationship("PeerReview", foreign_keys="PeerReview.reviewer_id", back_populates="reviewer")
    time_entries = relationship("TimeEntry", back_populates="employee")
    metrics = relationship("PerformanceMetric", back_populates="employee")
    predictions = relationship("PerformancePrediction", back_populates="employee")
    alerts = relationship("Alert", foreign_keys="Alert.employee_id", back_populates="employee")
    feedbacks = relationship("Feedback", foreign_keys="Feedback.employee_id", back_populates="employee")
    development_goals = relationship("DevelopmentGoal", back_populates="employee")


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    department = Column(String(100), default="Engineering")
    manager_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    description = Column(Text, nullable=True)
    target_velocity = Column(Float, default=40.0)  # Story points per sprint
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    members = relationship("Employee", foreign_keys=[Employee.team_id], back_populates="team")
    manager = relationship("Employee", foreign_keys=[manager_id])
    alerts = relationship("Alert", foreign_keys="Alert.team_id", back_populates="team")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True, nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    project_type = Column(String(50), default="Web")  # Web, Mobile (iOS/Android), Fullstack
    tech_stack = Column(String(255), default="Next.js, FastAPI, PostgreSQL")
    client_name = Column(String(100), nullable=True)
    repo_url = Column(String(500), nullable=True)
    start_date = Column(DateTime, default=utc_now)
    due_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="IN_PROGRESS")  # PLANNING, IN_PROGRESS, REVIEW, COMPLETED, ON_HOLD
    delivery_risk = Column(String(50), default="Low")  # Low, Medium, High
    risk_probability = Column(Float, default=0.15)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    tasks = relationship("Task", back_populates="project")
    alerts = relationship("Alert", foreign_keys="Alert.project_id", back_populates="project")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_key = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    priority = Column(String(50), default="Medium")  # Low, Medium, High, Critical
    status = Column(String(50), default="TODO")  # TODO, IN_PROGRESS, IN_REVIEW, COMPLETED, BLOCKED
    story_points = Column(Integer, default=3)
    estimated_hours = Column(Float, default=8.0)
    actual_hours = Column(Float, default=0.0)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    reopened_count = Column(Integer, default=0)
    source = Column(String(50), default="MANUAL")  # MANUAL, JIRA, GITHUB, CSV
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("Employee", back_populates="tasks")
    activities = relationship("TaskActivity", back_populates="task")
    time_entries = relationship("TimeEntry", back_populates="task")


class TaskActivity(Base):
    __tablename__ = "task_activity"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    event_type = Column(String(50), nullable=False)  # STATUS_CHANGE, COMMENT, REOPENED, ESTIMATE_UPDATE
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now)

    task = relationship("Task", back_populates="activities")


class CodeActivity(Base):
    __tablename__ = "code_activity"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    repo_name = Column(String(150), nullable=False)
    commit_hash = Column(String(100), unique=True, index=True, nullable=False)
    commit_message = Column(Text, nullable=False)
    additions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    committed_at = Column(DateTime, default=utc_now)

    employee = relationship("Employee", back_populates="code_activities")


class PullRequest(Base):
    __tablename__ = "pull_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    repo_name = Column(String(150), nullable=False)
    pr_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    state = Column(String(50), default="OPEN")  # OPEN, MERGED, CLOSED
    additions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    turnaround_hours = Column(Float, default=4.0)
    changes_requested_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    merged_at = Column(DateTime, nullable=True)

    employee = relationship("Employee", back_populates="pull_requests")
    reviews = relationship("PeerReview", back_populates="pull_request")


class PeerReview(Base):
    __tablename__ = "peer_reviews"

    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    pr_id = Column(Integer, ForeignKey("pull_requests.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="APPROVED")  # APPROVED, CHANGES_REQUESTED, COMMENTED
    comments_count = Column(Integer, default=2)
    quality_rating = Column(Float, default=4.5)  # 1.0 to 5.0
    turnaround_hours = Column(Float, default=3.5)
    reviewed_at = Column(DateTime, default=utc_now)

    reviewer = relationship("Employee", foreign_keys=[reviewer_id], back_populates="peer_reviews")
    pull_request = relationship("PullRequest", back_populates="reviews")


class TimeEntry(Base):
    __tablename__ = "time_entries"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    log_date = Column(DateTime, default=utc_now)
    hours = Column(Float, nullable=False)
    category = Column(String(50), default="DEVELOPMENT")  # DEVELOPMENT, CODE_REVIEW, BUG_FIX, MEETING
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    employee = relationship("Employee", back_populates="time_entries")
    task = relationship("Task", back_populates="time_entries")


class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    task_completion_rate = Column(Float, default=0.85)  # 0.0 - 1.0
    on_time_delivery_rate = Column(Float, default=0.88)
    overdue_task_ratio = Column(Float, default=0.10)
    estimation_accuracy = Column(Float, default=0.82)
    review_participation = Column(Float, default=0.90)
    review_turnaround_hours = Column(Float, default=4.2)
    workload_index = Column(Float, default=1.0)  # 1.0 = normal capacity
    composite_score = Column(Float, default=85.0)  # 0 - 100
    data_freshness = Column(String(50), default="synced_today")
    created_at = Column(DateTime, default=utc_now)

    employee = relationship("Employee", back_populates="metrics")


class PerformancePrediction(Base):
    __tablename__ = "performance_predictions"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    predicted_score = Column(Float, nullable=False)  # e.g. 87.4
    productivity_outlook = Column(String(50), default="Moderate")  # High, Moderate, Needs Attention
    risk_level = Column(String(50), default="Low")  # Low, Medium, High
    confidence = Column(Float, default=0.88)
    model_version = Column(String(50), default="v1.2.0-rf")
    is_synthetic = Column(Boolean, default=True)  # Clearly labels demo/synthetic data
    prediction_period = Column(String(50), default="Next 30 Days")
    created_at = Column(DateTime, default=utc_now)

    employee = relationship("Employee", back_populates="predictions")
    factors = relationship("PredictionFactor", back_populates="prediction", cascade="all, delete-orphan")


class PredictionFactor(Base):
    __tablename__ = "prediction_factors"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("performance_predictions.id", ondelete="CASCADE"), nullable=False)
    factor_name = Column(String(100), nullable=False)  # e.g. "On-Time Completion Rate"
    impact_weight = Column(Float, nullable=False)  # e.g. +0.28 or -0.15
    direction = Column(String(20), default="positive")  # positive, negative
    description = Column(String(255), nullable=False)

    prediction = relationship("PerformancePrediction", back_populates="factors")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String(50), default="Medium")  # Low, Medium, High, Critical
    alert_type = Column(String(100), nullable=False)  # OVERDUE_TASK_SPIKE, DEADLINE_RISK, REVIEW_BOTTLENECK, CAPACITY_OVERLOAD
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    supporting_metric = Column(String(255), nullable=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="NEW")  # NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED
    assigned_manager_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    suggested_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    employee = relationship("Employee", foreign_keys=[employee_id], back_populates="alerts")
    team = relationship("Team", foreign_keys=[team_id], back_populates="alerts")
    project = relationship("Project", foreign_keys=[project_id], back_populates="alerts")
    assigned_manager = relationship("Employee", foreign_keys=[assigned_manager_id])


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    period = Column(String(50), default="Q4 2025")
    strengths = Column(Text, nullable=False)
    growth_areas = Column(Text, nullable=False)
    suggested_actions = Column(Text, nullable=False)
    manager_comments = Column(Text, nullable=True)
    employee_reflection = Column(Text, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    employee = relationship("Employee", foreign_keys=[employee_id], back_populates="feedbacks")
    reviewer = relationship("Employee", foreign_keys=[reviewer_id])


class DevelopmentGoal(Base):
    __tablename__ = "development_goals"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    target_metric = Column(String(100), nullable=True)  # e.g., "PR Turnaround < 4 hours"
    current_value = Column(Float, default=0.0)
    target_value = Column(Float, default=100.0)
    deadline = Column(DateTime, nullable=True)
    progress_pct = Column(Float, default=0.0)
    status = Column(String(50), default="IN_PROGRESS")  # NOT_STARTED, IN_PROGRESS, ACHIEVED, CANCELLED
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    employee = relationship("Employee", back_populates="development_goals")


class Integration(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), unique=True, nullable=False)  # github, jira
    display_name = Column(String(100), nullable=False)
    is_connected = Column(Boolean, default=False)
    sync_status = Column(String(50), default="IDLE")  # IDLE, SYNCING, SUCCESS, ERROR
    last_synced_at = Column(DateTime, nullable=True)
    api_base_url = Column(String(255), nullable=True)
    repo_count = Column(Integer, default=0)
    issue_count = Column(Integer, default=0)
    auth_credentials = Column(Text, nullable=True)  # Simulated token/encrypted
    sync_frequency_hours = Column(Integer, default=6)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class SyncRun(Base):
    __tablename__ = "sync_runs"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)  # SUCCESS, PARTIAL, FAILED
    records_processed = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=utc_now)
    finished_at = Column(DateTime, default=utc_now)


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    version_tag = Column(String(50), unique=True, nullable=False)
    algorithm_name = Column(String(100), nullable=False)  # Random Forest Regressor / Gradient Boosting
    task_type = Column(String(50), default="PERFORMANCE_REGRESSION")  # PERFORMANCE_REGRESSION, DELIVERY_RISK_CLASSIFICATION
    mae = Column(Float, default=3.24)
    rmse = Column(Float, default=4.12)
    r2_score = Column(Float, default=0.86)
    accuracy = Column(Float, default=0.89)
    f1_score = Column(Float, default=0.87)
    roc_auc = Column(Float, default=0.91)
    training_records_count = Column(Integer, default=1200)
    is_active = Column(Boolean, default=True)
    trained_at = Column(DateTime, default=utc_now)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)  # LOGIN, PREDICTION_RUN, DATA_IMPORT, THRESHOLD_UPDATE, EXPORT
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="audit_logs")
