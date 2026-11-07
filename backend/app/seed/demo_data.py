import random
import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.core.security import hash_password
from backend.app.models.entities import (
    User, Employee, Team, Project, Task, TaskActivity, CodeActivity,
    PullRequest, PeerReview, TimeEntry, PerformanceMetric,
    PerformancePrediction, PredictionFactor, Alert, Feedback,
    DevelopmentGoal, Integration, SyncRun, ModelVersion, AuditLog
)

def seed_database(db: Session, reset: bool = True):
    """
    Populates the database with realistic, high-fidelity demo data.
    Uses fixed random seed for 100% reproducible demo scenarios.
    """
    random.seed(42)
    now = datetime.now(timezone.utc)
    
    if reset:
        # Recreate tables cleanly
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    # 1. Create Teams
    teams_data = [
        {"name": "Frontend Experience", "dept": "Product Engineering", "desc": "Next.js, React, UI design system, and client-facing web applications", "vel": 48.0},
        {"name": "Backend & Cloud Services", "dept": "Platform Engineering", "desc": "FastAPI, Microservices, PostgreSQL, and high-throughput APIs", "vel": 42.0},
        {"name": "Mobile Engineering (iOS/Android)", "dept": "Mobile Applications", "desc": "React Native, Swift, Kotlin, and offline-first mobile sync", "vel": 36.0},
        {"name": "DevOps & Infrastructure", "dept": "Platform Operations", "desc": "CI/CD pipelines, Kubernetes, monitoring, and developer tooling", "vel": 32.0},
    ]
    created_teams = []
    for td in teams_data:
        team = Team(
            name=td["name"],
            department=td["dept"],
            description=td["desc"],
            target_velocity=td["vel"],
            created_at=now - timedelta(days=180)
        )
        db.add(team)
        created_teams.append(team)
    db.commit()

    # 2. Create Employees (16 engineers across Web & App domains)
    employees_data = [
        # Team 1: Frontend Experience
        {"code": "EMP-101", "name": "Elena Rostova", "email": "elena.rostova@epms.dev", "role": "Staff Frontend Architect", "team_idx": 0, "exp": "Lead", "skills": ["Next.js", "TypeScript", "Tailwind CSS", "Architecture", "Design Systems"], "score": 92.5, "outlook": "High", "risk": "Low", "trend": "up", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"},
        {"code": "EMP-102", "name": "Alex Chen", "email": "alex.chen@epms.dev", "role": "Senior Frontend Engineer", "team_idx": 0, "exp": "Senior", "skills": ["React", "Next.js", "TypeScript", "Web Performance", "State Management"], "score": 87.4, "outlook": "High", "risk": "Low", "trend": "up", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"},
        {"code": "EMP-103", "name": "Sophia Martinez", "email": "sophia.martinez@epms.dev", "role": "Frontend Developer", "team_idx": 0, "exp": "Mid", "skills": ["React", "JavaScript", "CSS3", "Responsive UI", "REST APIs"], "score": 81.2, "outlook": "Moderate", "risk": "Low", "trend": "stable", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"},
        {"code": "EMP-104", "name": "Devin Wright", "email": "devin.wright@epms.dev", "role": "Junior UI Engineer", "team_idx": 0, "exp": "Junior", "skills": ["HTML5", "CSS", "JavaScript", "Tailwind", "Git"], "score": 68.0, "outlook": "Needs Attention", "risk": "Medium", "trend": "down", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"},

        # Team 2: Backend & Cloud Services
        {"code": "EMP-201", "name": "Marcus Vance", "email": "marcus.vance@epms.dev", "role": "Principal Backend Architect", "team_idx": 1, "exp": "Lead", "skills": ["Python", "FastAPI", "PostgreSQL", "System Design", "Distributed Systems"], "score": 94.0, "outlook": "High", "risk": "Low", "trend": "up", "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"},
        {"code": "EMP-202", "name": "Priya Sharma", "email": "priya.sharma@epms.dev", "role": "Senior Backend Engineer", "team_idx": 1, "exp": "Senior", "skills": ["Python", "SQLAlchemy", "Redis", "Kafka", "Docker"], "score": 89.2, "outlook": "High", "risk": "Low", "trend": "up", "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"},
        {"code": "EMP-203", "name": "Liam O'Connor", "email": "liam.oconnor@epms.dev", "role": "Backend Engineer", "team_idx": 1, "exp": "Mid", "skills": ["Python", "FastAPI", "SQL", "Unit Testing", "Microservices"], "score": 74.8, "outlook": "Moderate", "risk": "Medium", "trend": "down", "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"},
        {"code": "EMP-204", "name": "Amina Al-Mansoor", "email": "amina.almansoor@epms.dev", "role": "Database & API Specialist", "team_idx": 1, "exp": "Mid", "skills": ["PostgreSQL", "Query Optimization", "Python", "ETL", "Security"], "score": 83.5, "outlook": "Moderate", "risk": "Low", "trend": "stable", "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"},

        # Team 3: Mobile Engineering
        {"code": "EMP-301", "name": "Kenji Takahashi", "email": "kenji.takahashi@epms.dev", "role": "Lead Mobile Architect", "team_idx": 2, "exp": "Lead", "skills": ["iOS", "Swift", "Kotlin", "React Native", "Offline Sync"], "score": 91.0, "outlook": "High", "risk": "Low", "trend": "up", "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"},
        {"code": "EMP-302", "name": "Chloe Dubois", "email": "chloe.dubois@epms.dev", "role": "Senior iOS Developer", "team_idx": 2, "exp": "Senior", "skills": ["SwiftUI", "Combine", "CoreData", "Unit Testing", "App Store CI"], "score": 86.8, "outlook": "High", "risk": "Low", "trend": "stable", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"},
        {"code": "EMP-303", "name": "Diego Ramirez", "email": "diego.ramirez@epms.dev", "role": "Android Developer", "team_idx": 2, "exp": "Mid", "skills": ["Kotlin", "Jetpack Compose", "Coroutines", "Room", "Material 3"], "score": 64.5, "outlook": "Needs Attention", "risk": "High", "trend": "down", "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"},
        {"code": "EMP-304", "name": "Maya Patel", "email": "maya.patel@epms.dev", "role": "React Native Developer", "team_idx": 2, "exp": "Mid", "skills": ["React Native", "TypeScript", "Redux", "Native Modules", "Mobile UI"], "score": 84.0, "outlook": "Moderate", "risk": "Low", "trend": "up", "avatar": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80"},

        # Team 4: DevOps & Infrastructure
        {"code": "EMP-401", "name": "Nathan Brooks", "email": "nathan.brooks@epms.dev", "role": "Platform Engineering Lead", "team_idx": 3, "exp": "Lead", "skills": ["Kubernetes", "Terraform", "AWS", "GitHub Actions", "Observability"], "score": 93.0, "outlook": "High", "risk": "Low", "trend": "stable", "avatar": "https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150&auto=format&fit=crop&q=80"},
        {"code": "EMP-402", "name": "Sarah Lindqvist", "email": "sarah.lindqvist@epms.dev", "role": "Site Reliability Engineer", "team_idx": 3, "exp": "Senior", "skills": ["Prometheus", "Grafana", "Python", "Incident Management", "Networking"], "score": 88.5, "outlook": "High", "risk": "Low", "trend": "up", "avatar": "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80"},
        {"code": "EMP-403", "name": "Tariq Washington", "email": "tariq.washington@epms.dev", "role": "DevOps Engineer", "team_idx": 3, "exp": "Mid", "skills": ["Docker", "CI/CD", "Bash", "Linux", "Security Scanning"], "score": 79.0, "outlook": "Moderate", "risk": "Medium", "trend": "stable", "avatar": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80"},
        {"code": "EMP-404", "name": "Zoe Kravitz-Lee", "email": "zoe.lee@epms.dev", "role": "Cloud Infrastructure Associate", "team_idx": 3, "exp": "Junior", "skills": ["Terraform", "AWS Cloud", "Git", "Python Scripting"], "score": 72.0, "outlook": "Moderate", "risk": "Medium", "trend": "up", "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"},
    ]

    created_employees = []
    for ed in employees_data:
        emp = Employee(
            employee_code=ed["code"],
            name=ed["name"],
            email=ed["email"],
            avatar_url=ed["avatar"],
            role_title=ed["role"],
            team_id=created_teams[ed["team_idx"]].id,
            experience_level=ed["exp"],
            skills=json.dumps(ed["skills"]),
            joining_date=now - timedelta(days=random.randint(90, 720)),
            employment_status="ACTIVE",
            current_score=ed["score"],
            productivity_outlook=ed["outlook"],
            risk_level=ed["risk"],
            recent_trend=ed["trend"],
            created_at=now - timedelta(days=180)
        )
        db.add(emp)
        created_employees.append(emp)
    db.commit()

    # Assign team managers
    created_teams[0].manager_id = created_employees[0].id  # Elena leads Frontend
    created_teams[1].manager_id = created_employees[4].id  # Marcus leads Backend
    created_teams[2].manager_id = created_employees[8].id  # Kenji leads Mobile
    created_teams[3].manager_id = created_employees[12].id # Nathan leads DevOps
    
    # Assign employee manager IDs
    for i, emp in enumerate(created_employees):
        if i in [0, 4, 8, 12]:
            continue
        team_lead_idx = (emp.team_id - created_teams[0].id) * 4
        emp.manager_id = created_employees[team_lead_idx].id
    db.commit()

    # 3. Create Seed Users for Authentication & RBAC
    # Admin User
    admin_user = User(
        email="admin@epms.dev",
        hashed_password=hash_password("Admin123!"),
        full_name="Sarah Sterling (Admin)",
        role="ADMIN",
        is_active=True,
        created_at=now - timedelta(days=120)
    )
    db.add(admin_user)

    # Manager User (Elena)
    manager_user = User(
        email="manager@epms.dev",
        hashed_password=hash_password("Manager123!"),
        full_name="Elena Rostova (Manager)",
        role="MANAGER",
        is_active=True,
        employee_id=created_employees[0].id,
        created_at=now - timedelta(days=120)
    )
    db.add(manager_user)

    # Employee User (Alex Chen)
    emp_user = User(
        email="alex.chen@epms.dev",
        hashed_password=hash_password("Employee123!"),
        full_name="Alex Chen (Developer)",
        role="EMPLOYEE",
        is_active=True,
        employee_id=created_employees[1].id,
        created_at=now - timedelta(days=120)
    )
    db.add(emp_user)

    # Additional Manager & Employee accounts
    for emp in created_employees:
        if emp.email not in ["alex.chen@epms.dev", "elena.rostova@epms.dev"]:
            u = User(
                email=emp.email,
                hashed_password=hash_password("Password123!"),
                full_name=emp.name,
                role="MANAGER" if emp.id in [e.id for e in [created_employees[0], created_employees[4], created_employees[8], created_employees[12]]] else "EMPLOYEE",
                is_active=True,
                employee_id=emp.id,
                created_at=now - timedelta(days=90)
            )
            db.add(u)
    db.commit()

    # 4. Create Web and App Development Projects
    projects_data = [
        {"name": "SaaS Analytics Web Portal", "code": "WEB", "type": "Web", "stack": "Next.js 14, Tailwind, TypeScript", "client": "Enterprise FinTech", "repo": "https://github.com/acme/saas-portal", "days_due": 24, "status": "IN_PROGRESS", "risk": "Low", "prob": 0.12},
        {"name": "iOS Banking Companion App", "code": "IOS", "type": "Mobile", "stack": "SwiftUI, Combine, Biometrics", "client": "Global Retail Bank", "repo": "https://github.com/acme/ios-banking", "days_due": 12, "status": "IN_PROGRESS", "risk": "High", "prob": 0.68},
        {"name": "Customer Android Application", "code": "AND", "type": "Mobile", "stack": "Kotlin, Jetpack Compose, Room", "client": "Global Retail Bank", "repo": "https://github.com/acme/android-banking", "days_due": 35, "status": "IN_PROGRESS", "risk": "Medium", "prob": 0.38},
        {"name": "Real-Time Telemetry & Core API", "code": "API", "type": "Web", "stack": "FastAPI, PostgreSQL, Redis", "client": "Internal Platform", "repo": "https://github.com/acme/core-telemetry", "days_due": 45, "status": "IN_PROGRESS", "risk": "Low", "prob": 0.08},
        {"name": "NextGen Cloud CI/CD Pipeline", "code": "OPS", "type": "Web", "stack": "Kubernetes, Helm, GitHub Actions", "client": "Infrastructure Corp", "repo": "https://github.com/acme/infra-automation", "days_due": 60, "status": "IN_PROGRESS", "risk": "Low", "prob": 0.14},
    ]

    created_projects = []
    for pd in projects_data:
        proj = Project(
            name=pd["name"],
            code=pd["code"],
            description=f"Strategic development for {pd['client']} focusing on modern {pd['type']} engineering.",
            project_type=pd["type"],
            tech_stack=pd["stack"],
            client_name=pd["client"],
            repo_url=pd["repo"],
            start_date=now - timedelta(days=60),
            due_date=now + timedelta(days=pd["days_due"]),
            status=pd["status"],
            delivery_risk=pd["risk"],
            risk_probability=pd["prob"],
            created_at=now - timedelta(days=60)
        )
        db.add(proj)
        created_projects.append(proj)
    db.commit()

    # 5. Create 60+ Realistic Tasks
    task_templates = [
        ("Implement JWT token rotation and session refresh", 5, 12.0, "High"),
        ("Build responsive pastel dashboard KPI cards", 3, 8.0, "Medium"),
        ("Optimize PostgreSQL query indexes for metrics table", 5, 14.0, "High"),
        ("Design biometric FaceID login flow for iOS app", 5, 16.0, "Critical"),
        ("Refactor Jetpack Compose state hoisting in profile screen", 3, 6.0, "Medium"),
        ("Integrate Recharts interactive line visualization", 3, 8.0, "Low"),
        ("Implement GitHub webhook listener for push events", 5, 12.0, "High"),
        ("Set up automated unit testing in GitHub Actions CI", 2, 4.0, "Medium"),
        ("Fix crash on Android 14 during camera permission request", 8, 20.0, "Critical"),
        ("Create CSV task import mapping modal and parser", 5, 10.0, "High"),
        ("Configure Kubernetes ingress controller with SSL", 3, 6.0, "Medium"),
        ("Audit API endpoints for role-based permission checks", 3, 8.0, "High"),
        ("Write end-to-end integration tests for checkout flow", 5, 14.0, "Medium"),
        ("Refactor navigation sidebar for collapsible tablet layout", 2, 4.0, "Low"),
        ("Implement export table to CSV with authorized headers", 3, 6.0, "Medium"),
    ]

    created_tasks = []
    for proj_idx, proj in enumerate(created_projects):
        for i in range(12):
            tmpl = task_templates[(proj_idx * 3 + i) % len(task_templates)]
            assignee = created_employees[(proj_idx * 3 + i) % len(created_employees)]
            
            # Determine realistic status
            if i < 6:
                status = "COMPLETED"
                completed_at = now - timedelta(days=random.randint(1, 20))
                actual_hours = tmpl[2] + random.uniform(-2.0, 3.0)
                due_date = completed_at + timedelta(days=random.choice([-1, 1, 2, 3]))
            elif i < 9:
                status = "IN_PROGRESS"
                completed_at = None
                actual_hours = tmpl[2] * random.uniform(0.3, 0.8)
                # Some intentionally overdue for Diego & Devin to demonstrate alert triggers
                if assignee.employee_code in ["EMP-303", "EMP-104"] and i == 7:
                    due_date = now - timedelta(days=random.randint(2, 6))
                else:
                    due_date = now + timedelta(days=random.randint(2, 10))
            elif i == 9:
                status = "IN_REVIEW"
                completed_at = None
                actual_hours = tmpl[2] * 0.9
                due_date = now + timedelta(days=2)
            elif i == 10 and proj.delivery_risk == "High":
                status = "BLOCKED"
                completed_at = None
                actual_hours = tmpl[2] * 0.4
                due_date = now - timedelta(days=1)
            else:
                status = "TODO"
                completed_at = None
                actual_hours = 0.0
                due_date = now + timedelta(days=random.randint(7, 21))

            task = Task(
                task_key=f"{proj.code}-{100 + i}",
                title=f"{tmpl[0]} (#{100 + i})",
                description=f"Detailed engineering ticket for {proj.name}. Requires unit tests and code review.",
                project_id=proj.id,
                assignee_id=assignee.id,
                priority=tmpl[3],
                status=status,
                story_points=tmpl[1],
                estimated_hours=tmpl[2],
                actual_hours=round(max(0.0, actual_hours), 1),
                due_date=due_date,
                completed_at=completed_at,
                reopened_count=1 if (status == "COMPLETED" and random.random() < 0.15) else 0,
                source=random.choice(["JIRA", "GITHUB", "MANUAL"]),
                created_at=now - timedelta(days=35)
            )
            db.add(task)
            created_tasks.append(task)
    db.commit()

    # 6. Create Code Activities & Pull Requests
    for emp in created_employees:
        # Commits
        num_commits = random.randint(12, 38)
        for c_idx in range(num_commits):
            commit = CodeActivity(
                employee_id=emp.id,
                repo_name=random.choice(["saas-portal", "ios-banking", "android-banking", "core-telemetry"]),
                commit_hash=f"{emp.employee_code.lower()}-{random.randint(1000, 9999):x}{c_idx}",
                commit_message=random.choice([
                    "feat(auth): add biometric token validation",
                    "fix(ui): pastel theme contrast enhancement",
                    "refactor(db): batch query optimization",
                    "test: add unit specs for regression pipeline",
                    "perf: minimize bundle size and tree-shake lucide icons",
                    "style: adjust card padding and corner radius"
                ]),
                additions=random.randint(12, 140),
                deletions=random.randint(2, 40),
                committed_at=now - timedelta(days=random.randint(1, 30), hours=random.randint(1, 23))
            )
            db.add(commit)

        # Pull Requests
        for pr_idx in range(random.randint(3, 7)):
            pr = PullRequest(
                employee_id=emp.id,
                repo_name=random.choice(["saas-portal", "core-telemetry"]),
                pr_number=random.randint(100, 900),
                title=f"Feature: {emp.role_title} enhancement module #{pr_idx+1}",
                state="MERGED" if pr_idx > 1 else "OPEN",
                additions=random.randint(45, 320),
                deletions=random.randint(10, 85),
                turnaround_hours=round(random.uniform(1.5, 8.5), 1),
                changes_requested_count=1 if random.random() < 0.25 else 0,
                created_at=now - timedelta(days=random.randint(2, 25)),
                merged_at=now - timedelta(days=random.randint(1, 15)) if pr_idx > 1 else None
            )
            db.add(pr)
            db.flush()

            # Peer review for this PR by a teammate
            peer = random.choice([e for e in created_employees if e.id != emp.id and e.team_id == emp.team_id] or created_employees)
            review = PeerReview(
                reviewer_id=peer.id,
                pr_id=pr.id,
                status="APPROVED" if pr.state == "MERGED" else "CHANGES_REQUESTED",
                comments_count=random.randint(1, 6),
                quality_rating=round(random.uniform(4.0, 5.0), 1),
                turnaround_hours=round(random.uniform(2.0, 6.0), 1),
                reviewed_at=now - timedelta(days=random.randint(1, 10))
            )
            db.add(review)

    db.commit()

    # 7. Create Time Entries
    for emp in created_employees:
        for day_back in range(1, 15):
            t_entry = TimeEntry(
                employee_id=emp.id,
                log_date=now - timedelta(days=day_back),
                hours=round(random.uniform(6.5, 8.5), 1),
                category=random.choice(["DEVELOPMENT", "DEVELOPMENT", "CODE_REVIEW", "BUG_FIX"]),
                notes="Sprint deliverable implementation and active peer review",
                created_at=now - timedelta(days=day_back)
            )
            db.add(t_entry)
    db.commit()

    # 8. Create Performance Metrics & ML Predictions (Seed realistic features)
    for emp in created_employees:
        # Base indicators
        ontime = 0.92 if emp.current_score >= 88 else (0.82 if emp.current_score >= 75 else 0.62)
        completion = 0.90 if emp.current_score >= 88 else (0.78 if emp.current_score >= 75 else 0.65)
        overdue_r = 0.04 if emp.current_score >= 88 else (0.12 if emp.current_score >= 75 else 0.32)
        turnaround = 2.8 if emp.current_score >= 88 else (4.5 if emp.current_score >= 75 else 9.2)

        metric = PerformanceMetric(
            employee_id=emp.id,
            period_start=now - timedelta(days=30),
            period_end=now,
            task_completion_rate=completion,
            on_time_delivery_rate=ontime,
            overdue_task_ratio=overdue_r,
            estimation_accuracy=0.85 if emp.current_score >= 80 else 0.65,
            review_participation=0.92 if emp.current_score >= 80 else 0.70,
            review_turnaround_hours=turnaround,
            workload_index=1.05 if emp.risk_level == "Low" else (1.38 if emp.employee_code == "EMP-303" else 1.20),
            composite_score=emp.current_score,
            data_freshness="synced_today",
            created_at=now - timedelta(days=1)
        )
        db.add(metric)

        # ML Prediction record
        pred = PerformancePrediction(
            employee_id=emp.id,
            predicted_score=emp.current_score + round(random.uniform(-1.5, 1.8), 1),
            productivity_outlook=emp.productivity_outlook,
            risk_level=emp.risk_level,
            confidence=0.89,
            model_version="v1.2.0-rf",
            is_synthetic=True,
            prediction_period="Next 30 Days",
            created_at=now
        )
        db.add(pred)
        db.flush()

        # Add explainable factors for each prediction
        if emp.current_score >= 85:
            db.add(PredictionFactor(
                prediction_id=pred.id,
                factor_name="On-Time Milestone Delivery",
                impact_weight=4.2,
                direction="positive",
                description=f"Consistently delivers tasks on-time ({int(ontime*100)}% on-time completion)."
            ))
            db.add(PredictionFactor(
                prediction_id=pred.id,
                factor_name="Peer Review Responsiveness",
                impact_weight=2.8,
                direction="positive",
                description=f"Quick PR turnaround ({turnaround}h avg) reduces team delivery blockers."
            ))
        else:
            db.add(PredictionFactor(
                prediction_id=pred.id,
                factor_name="Overdue Task Backlog",
                impact_weight=-4.8,
                direction="negative",
                description=f"Elevated overdue task ratio ({int(overdue_r*100)}%), introducing milestone slippage risk."
            ))
            db.add(PredictionFactor(
                prediction_id=pred.id,
                factor_name="PR Review Queue Latency",
                impact_weight=-2.4,
                direction="negative",
                description=f"Longer turnaround time ({turnaround}h) slows down branch integration."
            ))

    db.commit()

    # 9. Create Early Warning Alerts
    alerts_data = [
        {
            "sev": "High", "type": "OVERDUE_TASK_SPIKE", "title": "Overdue Task Spike: Diego Ramirez",
            "emp_code": "EMP-303", "proj_idx": 1,
            "exp": "3 assigned Android banking tasks have exceeded their due dates, with workload currently at 138% of nominal sprint capacity.",
            "metric": "Overdue Ratio: 38%",
            "action": "Hold a 1-on-1 sprint review to reassign camera permission and bio-auth tickets to an available peer."
        },
        {
            "sev": "High", "type": "MILESTONE_DELIVERY_RISK", "title": "Delivery Squeeze: iOS Banking Companion App",
            "emp_code": None, "proj_idx": 1,
            "exp": "Release candidate deadline is in 12 days, but 4 high-priority tasks remain in progress or blocked.",
            "metric": "Milestone Slippage Risk: 68%",
            "action": "Convene technical triage with Mobile Engineering Lead to descope optional animation polish."
        },
        {
            "sev": "Medium", "type": "REVIEW_BOTTLENECK", "title": "Code Review Turnaround Delay: Liam O'Connor",
            "emp_code": "EMP-203", "proj_idx": 3,
            "exp": "Average code review turnaround time has reached 9.2 hours over the last 14 days, delaying backend API merges.",
            "metric": "Avg PR Turnaround: 9.2h",
            "action": "Allocate a 30-minute dedicated review window during morning standup."
        },
        {
            "sev": "Medium", "type": "ESTIMATION_DRIFT", "title": "Story Point Estimation Drift: Devin Wright",
            "emp_code": "EMP-104", "proj_idx": 0,
            "exp": "Actual hours logged consistently exceed initial estimates by 45% across recent UI tasks.",
            "metric": "Estimation Accuracy: 55%",
            "action": "Pair with Senior Engineer Alex Chen during next sprint planning poker session."
        }
    ]

    for ad in alerts_data:
        emp = next((e for e in created_employees if e.employee_code == ad["emp_code"]), None) if ad["emp_code"] else None
        proj = created_projects[ad["proj_idx"]]
        alert = Alert(
            severity=ad["sev"],
            alert_type=ad["type"],
            title=ad["title"],
            explanation=ad["exp"],
            supporting_metric=ad["metric"],
            employee_id=emp.id if emp else None,
            team_id=emp.team_id if emp else None,
            project_id=proj.id,
            status="NEW",
            assigned_manager_id=emp.manager_id if emp else created_employees[0].id,
            suggested_action=ad["action"],
            created_at=now - timedelta(hours=random.randint(2, 36))
        )
        db.add(alert)
    db.commit()

    # 10. Create Personalized Feedback & Development Goals
    for emp in created_employees[:6]:
        fb = Feedback(
            employee_id=emp.id,
            reviewer_id=emp.manager_id or created_employees[0].id,
            period="Q4 2025",
            strengths=f"Strong engineering competence in {emp.role_title}. Consistently demonstrates high attention to code clarity and responsive communication.",
            growth_areas="Continue deepening architecture ownership and driving proactive review turnaround for cross-functional teams.",
            suggested_actions="Lead an internal brown-bag on component modularity; establish clear daily review rituals.",
            manager_comments="Valued team contributor. Recommended for leading key feature milestones in the upcoming quarter.",
            employee_reflection="Looking forward to expanding our automated test coverage and helping junior teammates onboard faster.",
            follow_up_date=now + timedelta(days=45),
            created_at=now - timedelta(days=15)
        )
        db.add(fb)

        # Development Goal
        goal = DevelopmentGoal(
            employee_id=emp.id,
            title=f"Optimize PR Review Turnaround Time to < 4 Hours",
            target_metric="Turnaround Hours",
            current_value=3.5 if emp.current_score >= 85 else 6.2,
            target_value=4.0,
            deadline=now + timedelta(days=60),
            progress_pct=85.0 if emp.current_score >= 85 else 45.0,
            status="IN_PROGRESS",
            created_at=now - timedelta(days=20)
        )
        db.add(goal)
    db.commit()

    # 11. Create Integrations
    github_int = Integration(
        provider="github",
        display_name="GitHub Enterprise",
        is_connected=True,
        sync_status="IDLE",
        last_synced_at=now - timedelta(minutes=42),
        api_base_url="https://api.github.com",
        repo_count=5,
        issue_count=142,
        auth_credentials="demo_gh_token_configured_for_epms_preview",
        sync_frequency_hours=6,
        created_at=now - timedelta(days=60)
    )
    jira_int = Integration(
        provider="jira",
        display_name="Atlassian Jira Software",
        is_connected=True,
        sync_status="IDLE",
        last_synced_at=now - timedelta(hours=2),
        api_base_url="https://acme-engineering.atlassian.net",
        repo_count=0,
        issue_count=78,
        auth_credentials="demo_jira_token_configured_for_epms_preview",
        sync_frequency_hours=6,
        created_at=now - timedelta(days=60)
    )
    db.add(github_int)
    db.add(jira_int)

    # Initial Sync Runs
    db.add(SyncRun(provider="github", status="SUCCESS", records_processed=48, started_at=now - timedelta(minutes=45), finished_at=now - timedelta(minutes=42)))
    db.add(SyncRun(provider="jira", status="SUCCESS", records_processed=24, started_at=now - timedelta(hours=2, minutes=5), finished_at=now - timedelta(hours=2)))
    db.commit()

    # 12. Create Model Version record
    mv = ModelVersion(
        version_tag="v1.2.0-rf",
        algorithm_name="RandomForestRegressor + CalibratedClassifier",
        task_type="PERFORMANCE_REGRESSION",
        mae=3.24,
        rmse=4.12,
        r2_score=0.864,
        accuracy=0.892,
        f1_score=0.875,
        roc_auc=0.914,
        training_records_count=1800,
        is_active=True,
        trained_at=now - timedelta(days=5)
    )
    db.add(mv)

    # 13. Audit Log
    db.add(AuditLog(
        user_id=admin_user.id,
        action="DATABASE_SEED",
        resource_type="SYSTEM",
        resource_id="ALL",
        details="Reproducible high-fidelity engineering demo dataset initialized with 16 employees, 5 projects, and ML baseline.",
        ip_address="127.0.0.1",
        timestamp=now
    ))
    db.commit()
    print("Database successfully seeded with realistic engineering data!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db, reset=True)
    finally:
        db.close()
