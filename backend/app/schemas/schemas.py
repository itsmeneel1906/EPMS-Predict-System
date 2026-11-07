from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from datetime import datetime

# --- Auth & User Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "EMPLOYEE"
    employee_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    employee_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Employee Schemas ---
class EmployeeBase(BaseModel):
    employee_code: str
    name: str
    email: EmailStr
    avatar_url: Optional[str] = None
    role_title: str
    team_id: Optional[int] = None
    manager_id: Optional[int] = None
    experience_level: str = "Mid"
    skills: Optional[str] = "[]"
    employment_status: str = "ACTIVE"

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None
    role_title: Optional[str] = None
    team_id: Optional[int] = None
    manager_id: Optional[int] = None
    experience_level: Optional[str] = None
    skills: Optional[str] = None
    employment_status: Optional[str] = None
    current_score: Optional[float] = None
    productivity_outlook: Optional[str] = None
    risk_level: Optional[str] = None
    recent_trend: Optional[str] = None

class EmployeeOut(EmployeeBase):
    id: int
    current_score: float
    productivity_outlook: str
    risk_level: str
    recent_trend: str
    joining_date: datetime
    created_at: datetime
    team_name: Optional[str] = None
    manager_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Team Schemas ---
class TeamBase(BaseModel):
    name: str
    department: str = "Engineering"
    manager_id: Optional[int] = None
    description: Optional[str] = None
    target_velocity: float = 40.0

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    manager_id: Optional[int] = None
    description: Optional[str] = None
    target_velocity: Optional[float] = None

class TeamOut(TeamBase):
    id: int
    manager_name: Optional[str] = None
    member_count: int = 0
    average_score: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True


# --- Project Schemas ---
class ProjectBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    project_type: str = "Web"
    tech_stack: str = "Next.js, FastAPI, PostgreSQL"
    client_name: Optional[str] = None
    repo_url: Optional[str] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    status: str = "IN_PROGRESS"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    project_type: Optional[str] = None
    tech_stack: Optional[str] = None
    client_name: Optional[str] = None
    repo_url: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    delivery_risk: Optional[str] = None
    risk_probability: Optional[float] = None

class ProjectOut(ProjectBase):
    id: int
    delivery_risk: str
    risk_probability: float
    task_count: int = 0
    completed_task_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# --- Task Schemas ---
class TaskBase(BaseModel):
    task_key: str
    title: str
    description: Optional[str] = None
    project_id: int
    assignee_id: Optional[int] = None
    priority: str = "Medium"
    status: str = "TODO"
    story_points: int = 3
    estimated_hours: float = 8.0
    actual_hours: float = 0.0
    due_date: Optional[datetime] = None
    source: str = "MANUAL"

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[int] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    story_points: Optional[int] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    due_date: Optional[datetime] = None

class TaskOut(TaskBase):
    id: int
    completed_at: Optional[datetime] = None
    reopened_count: int = 0
    created_at: datetime
    assignee_name: Optional[str] = None
    project_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Activity Schemas ---
class CodeActivityOut(BaseModel):
    id: int
    employee_id: int
    repo_name: str
    commit_hash: str
    commit_message: str
    additions: int
    deletions: int
    committed_at: datetime

    class Config:
        from_attributes = True

class PullRequestOut(BaseModel):
    id: int
    employee_id: int
    repo_name: str
    pr_number: int
    title: str
    state: str
    additions: int
    deletions: int
    turnaround_hours: float
    changes_requested_count: int
    created_at: datetime
    merged_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PeerReviewOut(BaseModel):
    id: int
    reviewer_id: int
    pr_id: int
    status: str
    comments_count: int
    quality_rating: float
    turnaround_hours: float
    reviewed_at: datetime

    class Config:
        from_attributes = True

class TimeEntryOut(BaseModel):
    id: int
    employee_id: int
    task_id: Optional[int] = None
    log_date: datetime
    hours: float
    category: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True


# --- Metric & Prediction Schemas ---
class PerformanceMetricOut(BaseModel):
    id: int
    employee_id: int
    period_start: datetime
    period_end: datetime
    task_completion_rate: float
    on_time_delivery_rate: float
    overdue_task_ratio: float
    estimation_accuracy: float
    review_participation: float
    review_turnaround_hours: float
    workload_index: float
    composite_score: float
    data_freshness: str
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionFactorOut(BaseModel):
    id: int
    factor_name: str
    impact_weight: float
    direction: str
    description: str

    class Config:
        from_attributes = True

class PredictionOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    predicted_score: float
    productivity_outlook: str
    risk_level: str
    confidence: float
    model_version: str
    is_synthetic: bool
    prediction_period: str
    created_at: datetime
    factors: List[PredictionFactorOut] = []
    suggested_actions: List[str] = []

    class Config:
        from_attributes = True

class PredictionRequest(BaseModel):
    employee_id: int
    prediction_period_days: int = 30


# --- Alert Schemas ---
class AlertBase(BaseModel):
    severity: str = "Medium"
    alert_type: str
    title: str
    explanation: str
    supporting_metric: Optional[str] = None
    employee_id: Optional[int] = None
    team_id: Optional[int] = None
    project_id: Optional[int] = None
    suggested_action: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    status: Optional[str] = None  # NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED
    resolution_notes: Optional[str] = None
    assigned_manager_id: Optional[int] = None

class AlertOut(AlertBase):
    id: int
    status: str
    assigned_manager_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    employee_name: Optional[str] = None
    team_name: Optional[str] = None
    project_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Feedback & Goals Schemas ---
class FeedbackCreate(BaseModel):
    employee_id: int
    reviewer_id: Optional[int] = None
    period: str = "Q4 2025"
    strengths: str
    growth_areas: str
    suggested_actions: str
    manager_comments: Optional[str] = None
    employee_reflection: Optional[str] = None
    follow_up_date: Optional[datetime] = None

class FeedbackOut(BaseModel):
    id: int
    employee_id: int
    reviewer_id: Optional[int] = None
    reviewer_name: Optional[str] = None
    period: str
    strengths: str
    growth_areas: str
    suggested_actions: str
    manager_comments: Optional[str] = None
    employee_reflection: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DevelopmentGoalCreate(BaseModel):
    employee_id: int
    title: str
    target_metric: Optional[str] = None
    current_value: float = 0.0
    target_value: float = 100.0
    deadline: Optional[datetime] = None

class DevelopmentGoalUpdate(BaseModel):
    title: Optional[str] = None
    current_value: Optional[float] = None
    progress_pct: Optional[float] = None
    status: Optional[str] = None

class DevelopmentGoalOut(BaseModel):
    id: int
    employee_id: int
    title: str
    target_metric: Optional[str] = None
    current_value: float
    target_value: float
    deadline: Optional[datetime] = None
    progress_pct: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Integration Schemas ---
class IntegrationOut(BaseModel):
    id: int
    provider: str
    display_name: str
    is_connected: bool
    sync_status: str
    last_synced_at: Optional[datetime] = None
    api_base_url: Optional[str] = None
    repo_count: int
    issue_count: int
    sync_frequency_hours: int

    class Config:
        from_attributes = True

class IntegrationConnectRequest(BaseModel):
    provider: str  # github, jira
    api_token: str
    api_base_url: Optional[str] = None
    organization_or_repo: Optional[str] = None

class SyncRunOut(BaseModel):
    id: int
    provider: str
    status: str
    records_processed: int
    error_message: Optional[str] = None
    started_at: datetime
    finished_at: datetime

    class Config:
        from_attributes = True


# --- Analytics & Dashboard Schemas ---
class KPISummary(BaseModel):
    total_employees: int
    average_predicted_score: float
    average_task_completion_rate: float
    on_time_delivery_rate: float
    employees_requiring_support: int
    active_project_count: int
    high_risk_projects_count: int
    open_alerts_count: int

class TrendPoint(BaseModel):
    date: str
    observed_score: float
    predicted_score: float
    completion_rate: float
    on_time_rate: float

class RiskDistribution(BaseModel):
    low_risk: int
    medium_risk: int
    high_risk: int

class ProjectPerformance(BaseModel):
    project_id: int
    name: str
    code: str
    status: str
    delivery_risk: str
    completion_pct: float
    task_count: int

# --- Settings & Model Version Schemas ---
class ModelVersionOut(BaseModel):
    id: int
    version_tag: str
    algorithm_name: str
    task_type: str
    mae: float
    rmse: float
    r2_score: float
    accuracy: float
    f1_score: float
    roc_auc: float
    training_records_count: int
    is_active: bool
    trained_at: datetime

    class Config:
        from_attributes = True

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: str
    timestamp: datetime

    class Config:
        from_attributes = True
