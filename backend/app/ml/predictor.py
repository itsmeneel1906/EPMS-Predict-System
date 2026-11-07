from typing import Dict, Any, Optional
import pandas as pd
import numpy as np

from backend.app.ml.pipeline import load_models
from backend.app.ml.dataset import FEATURE_COLUMNS, BASE_FEATURE_COLUMNS, compute_engineered_features
from backend.app.ml.explainer import explain_prediction
from backend.app.ml.drift import assess_employee_feature_drift

class PredictionEngine:
    _instance = None

    def __init__(self):
        self.regressor, self.classifier, self.metadata = load_models()
        self.baseline_stats = self.metadata.get("baseline_feature_stats", {})

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = PredictionEngine()
        return cls._instance

    def reload(self):
        self.regressor, self.classifier, self.metadata = load_models()
        self.baseline_stats = self.metadata.get("baseline_feature_stats", {})

    def prepare_feature_row(self, raw_features: Dict[str, float]) -> pd.DataFrame:
        """Enriches raw features with non-linear interaction features and formats columns."""
        # Fill base features
        base_data = {col: [raw_features.get(col, 0.5)] for col in BASE_FEATURE_COLUMNS}
        df_base = pd.DataFrame(base_data)
        
        # Add engineered features
        df_full = compute_engineered_features(df_base)
        
        # Ensure exact column order
        return df_full[FEATURE_COLUMNS]

    def predict_employee(
        self,
        features: Dict[str, float],
        min_required_datapoints: int = 4
    ) -> Dict[str, Any]:
        """
        Executes ML inference with model governance, data drift check, XAI attribution, and counterfactuals.
        """
        datapoints = features.get("data_points_count", 0)
        
        # Insufficient data safeguard check
        if datapoints < min_required_datapoints:
            return {
                "status": "INSUFFICIENT_DATA",
                "message": (
                    f"Insufficient engineering activity recorded ({datapoints} points; "
                    f"minimum {min_required_datapoints} required for statistically grounded inference). "
                    "Connect GitHub/Jira integrations or import activity CSV to unlock predictive analytics."
                ),
                "is_sufficient": False,
                "confidence": 0.0,
                "predicted_score": None,
                "productivity_outlook": "Unknown",
                "risk_level": "Unknown",
                "factors": [],
                "suggested_actions": ["Sync GitHub repositories or Jira tasks to gather initial baseline activity."]
            }

        # Format input feature vector
        df_input = self.prepare_feature_row(features)

        # 1. Regression Inference (Performance Score)
        predicted_score = float(self.regressor.predict(df_input)[0])
        predicted_score = round(max(35.0, min(99.0, predicted_score)), 1)

        # 2. Classification Inference (Delivery Delay Risk)
        if hasattr(self.classifier, "predict_proba"):
            risk_prob = float(self.classifier.predict_proba(df_input)[0][1])
        else:
            risk_prob = float(self.classifier.predict(df_input)[0])

        if risk_prob >= 0.65:
            risk_level = "High"
        elif risk_prob >= 0.35:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Productivity Outlook
        if predicted_score >= 88.0:
            outlook = "High"
        elif predicted_score >= 75.0:
            outlook = "Moderate"
        else:
            outlook = "Needs Support"

        # Model confidence grounded in data volume
        confidence = round(min(0.96, 0.70 + (datapoints / 100.0)), 2)

        # 3. Explainable AI & Counterfactual Prescription
        baseline_expected = self.metadata.get("baseline_expected_score", 78.5)
        factors, actions, counterfactual = explain_prediction(features, predicted_score, baseline_expected)

        # 4. Data Drift & Anomaly Assessment (PSI)
        drift_assessment = assess_employee_feature_drift(features, self.baseline_stats)

        return {
            "status": "SUCCESS",
            "is_sufficient": True,
            "predicted_score": predicted_score,
            "productivity_outlook": outlook,
            "risk_level": risk_level,
            "risk_probability": round(risk_prob, 3),
            "confidence": confidence,
            "model_version": self.metadata.get("version", "v2.0.0-deepml"),
            "champion_algorithm": self.metadata.get("champion_regressor", "RandomForestRegressor"),
            "is_synthetic": True,
            "prediction_period": "Next 30 Days",
            "factors": factors,
            "suggested_actions": actions,
            "counterfactual": counterfactual,
            "data_drift": drift_assessment,
            "metadata": self.metadata
        }

    def simulate_counterfactual(
        self,
        base_features: Dict[str, float],
        tweaked_features: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Runs a What-If counterfactual simulation:
        Compares base prediction vs simulated prediction after adjusting hypothetical telemetry sliders.
        """
        merged_features = {**base_features, **tweaked_features}
        
        base_pred = self.predict_employee(base_features)
        sim_pred = self.predict_employee(merged_features)
        
        base_score = base_pred.get("predicted_score") or 75.0
        sim_score = sim_pred.get("predicted_score") or 75.0
        
        score_delta = round(sim_score - base_score, 1)
        base_prob = base_pred.get("risk_probability") or 0.3
        sim_prob = sim_pred.get("risk_probability") or 0.3
        risk_delta = round(sim_prob - base_prob, 3)
        
        return {
            "status": "SUCCESS",
            "base_score": base_score,
            "simulated_score": sim_score,
            "score_delta": score_delta,
            "base_risk_level": base_pred.get("risk_level", "Medium"),
            "simulated_risk_level": sim_pred.get("risk_level", "Low"),
            "base_risk_probability": base_prob,
            "simulated_risk_probability": sim_prob,
            "risk_delta": risk_delta,
            "applied_tweaks": tweaked_features
        }
