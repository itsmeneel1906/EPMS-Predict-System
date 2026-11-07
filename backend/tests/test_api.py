import pytest
from fastapi.testclient import TestClient
import sys
sys.path.insert(0, ".")
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_demo_login_roles():
    for role in ["admin", "manager", "employee"]:
        res = client.post(f"/api/auth/demo-login/{role}")
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["role"] == role.upper()

def test_employees_list_and_detail():
    res = client.get("/api/employees")
    assert res.status_code == 200
    employees = res.json()
    assert len(employees) >= 10
    
    first_id = employees[0]["id"]
    detail_res = client.get(f"/api/employees/{first_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert "employee" in detail
    assert "metrics_history" in detail
    assert "tasks" in detail

def test_predictions_generation():
    emp_res = client.get("/api/employees")
    emp_id = emp_res.json()[0]["id"]
    pred_res = client.post("/api/predictions/generate", json={"employee_id": emp_id, "prediction_period_days": 30})
    assert pred_res.status_code == 200
    data = pred_res.json()
    assert data["status"] == "SUCCESS"
    assert "predicted_score" in data
    assert "factors" in data

def test_alerts_scan_and_list():
    scan_res = client.post("/api/alerts/scan")
    assert scan_res.status_code == 200
    alerts_res = client.get("/api/alerts")
    assert alerts_res.status_code == 200
    assert len(alerts_res.json()) >= 1

def test_kpi_summary():
    res = client.get("/api/analytics/kpis")
    assert res.status_code == 200
    kpis = res.json()
    assert kpis["total_employees"] >= 10
    assert kpis["average_predicted_score"] > 50

def test_webhooks_pipeline():
    # 1. Status Check
    status_res = client.get("/api/webhooks/status")
    assert status_res.status_code == 200
    assert "github" in status_res.json()["supported_providers"]

    # 2. GitHub Push Telemetry Ingestion
    gh_payload = {
        "event": "push",
        "repository": {"name": "frontend-web"},
        "ref": "refs/heads/feature-auth",
        "commits": [
            {
                "id": "c1a2b3c4d5",
                "message": "feat: implement biometric passkey authentication",
                "added": ["auth.ts", "passkey.ts"],
                "removed": []
            }
        ]
    }
    gh_res = client.post("/api/webhooks/github", json=gh_payload)
    assert gh_res.status_code == 200
    assert gh_res.json()["status"] == "SUCCESS"

    # 3. Jira Task Transition Webhook
    jira_payload = {
        "webhookEvent": "jira:issue_updated",
        "issue": {
            "key": "EPMS-402",
            "fields": {
                "summary": "Implement Redis session cache",
                "status": {"name": "In Review"},
                "priority": {"name": "High"}
            }
        }
    }
    jira_res = client.post("/api/webhooks/jira", json=jira_payload)
    assert jira_res.status_code == 200
    assert jira_res.json()["status"] == "SUCCESS"
    assert jira_res.json()["mapped_status"] == "IN_REVIEW"
