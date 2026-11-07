# Employee Performance Prediction System (EPMS)
## AI-Powered Predictive HR Analytics & Delivery Risk Prevention for Web and App Development Teams

A full-stack, production-style software engineering analytics platform. It ingests multi-source engineering activity data (GitHub commits/PRs, Jira sprint tasks, peer reviews, time tracking), evaluates transparent productivity metrics, executes machine learning models for future performance regression and delivery risk classification, detects early warning alerts, and generates personalized development recommendations.

---

## ⚡ Current Live Status
Both services are already configured and running locally:
- **Frontend Dashboard:** [http://localhost:3001](http://localhost:3001)
- **FastAPI Backend & Interactive Swagger API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **API Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 🚀 How to Run the Project (Step-by-Step)

### Prerequisites
- **Python 3.10+** (Python 3.13 tested)
- **Node.js 18+** (Node v22 tested) and **npm**

---

### Step 1: Run the Backend (FastAPI + ML Engine + Database)

Open a terminal or PowerShell in the project root:

```powershell
# 1. Navigate to the project root
cd "c:\Users\Neel\OneDrive\Desktop\neel wad"

# 2. Run the Python backend using any of these commands:
python run.py
# or:
python backend/app/main.py
# or:
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

> 💡 **One-Command Full-Stack Launch:** Run `python run.py --all` to automatically start both the Python FastAPI backend and the Next.js frontend together!

> **Note:** The backend automatically trains and loads the scikit-learn Machine Learning pipeline (`RandomForestRegressor` and `CalibratedClassifier`) and seeds the database with realistic engineering data on initial startup!

---

### Step 2: Run the Frontend (Next.js 16 + Tailwind CSS)

Open a second terminal window:

```powershell
# 1. Navigate to the frontend directory
cd "c:\Users\Neel\OneDrive\Desktop\neel wad\frontend"

# 2. Install dependencies (if not already installed)
npm install

# 3. Launch the Next.js development server
npm run dev
```

The frontend will be accessible at [http://localhost:3001](http://localhost:3001).

---

## 🔑 Demo Accounts & Instant Role Switcher

You can switch between any role instantly using the **"View as: [Admin] [Manager] [Dev]"** buttons in the top navbar, or log in with the following seeded accounts:

| Role | Email | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@epms.dev` | `Admin123!` | System settings, metric weights, users, integrations, organization-wide analytics |
| **Manager** | `manager@epms.dev` | `Manager123!` | Team velocity trends, alerts triage, employee reviews & development plans |
| **Employee** | `alex.chen@epms.dev` | `Employee123!` | Personal performance dashboard, assigned tasks, goals & self-reflection |

---

## 🧭 Navigation & Core Modules

1. **Overview Dashboard (`/`):** KPI summary cards, Recharts velocity trends (observed vs predicted), delivery risk distribution donut, active early warnings, and recent activity.
2. **Employees (`/employees`):** Full engineering directory with filters, add engineer modal, CSV export, and detailed profile tabs (*Overview*, *Performance History*, *Tasks*, *Predictions*, *Feedback*).
3. **Teams & Projects (`/teams-projects`):** Multi-platform Web & Mobile App project milestones, delivery risk slip probabilities, and team capacity distribution.
4. **Performance Analytics (`/analytics`):** Transparent weighted metric model, historical trajectories, team velocity comparison, and printable report view.
5. **Predictions Hub (`/predictions`):** Live Machine Learning inference, active model governance metadata (`v1.2.0-rf`: MAE, RMSE, R², ROC-AUC), explainable waterfall factors (positive drivers vs negative risks), and batch recalculate.
6. **Early Warnings (`/early-warnings`):** Risk alert center with severity filter, live telemetry scanner, acknowledgement, and resolution workflows with mitigation notes.
7. **Personalized Feedback (`/feedback`):** Metric-grounded recommendation generator, feedback cards, and measurable development goals with progress bars.
8. **Tasks & Activity (`/tasks-activity`):** Interactive task status transitions (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`, `BLOCKED`), story points, and task creation.
9. **Integrations (`/integrations`):** GitHub and Jira connection cards, synchronization triggers, audit history, and CSV data ingestion pipeline with column mapping preview.
10. **Reports (`/reports`):** Executive delivery report, printable summary sheet, and CSV data export.
11. **Settings (`/settings`):** Interactive performance metric weight sliders (normalized to 100%), RBAC user permissions, and audit log.

---

## 🐳 Production Containerization (Docker Compose)

Run the entire multi-container production stack (PostgreSQL + FastAPI + Next.js) with a single command:

```powershell
docker compose up --build
```
- **Frontend Dashboard:** `http://localhost:3000`
- **FastAPI API & Docs:** `http://localhost:8000/docs`
- **PostgreSQL Database:** `localhost:5432`

---

## 🗄️ Database Migrations (Alembic)

To manage schema migrations with Alembic:

```powershell
# Run pending migrations
alembic upgrade head

# Generate a new migration after editing SQLAlchemy models
alembic revision --autogenerate -m "add_new_telemetry_fields"
```

---

## 🔗 Real Webhook Telemetry Ingestion

The backend supports live real-time event ingestion:
- **GitHub Webhook:** `POST http://127.0.0.1:8000/api/webhooks/github` (Supports `push` and `pull_request` with HMAC-SHA256 signature verification).
- **Jira Webhook:** `POST http://127.0.0.1:8000/api/webhooks/jira` (Supports sprint issue transitions).
- **Continuous ML Retraining:** `POST http://127.0.0.1:8000/api/predictions/retrain`

---

## 🧪 Running Automated Tests

To run the automated backend test suite:

```powershell
python -m pytest backend/tests/test_api.py -v
```

All automated tests verify:
- API Health Check
- RBAC Demo Login for Admin, Manager, and Employee
- Employee list and detailed profile tabs
- ML prediction generation and explainable factor attribution
- Early warning alerts scanning and resolution
- Real-time KPI analytics aggregation
- Live GitHub & Jira Webhooks telemetry ingestion pipelines

---

## 🔄 Resetting Demo Data
To reset the database back to clean reproducible seed state at any time:
- Click the **"Reset Demo"** button in the top navigation bar, or
- Go to **Settings** → **"Reset Demo Telemetry"**, or
- Send a `POST` request to `http://127.0.0.1:8000/api/settings/reset-demo`.
