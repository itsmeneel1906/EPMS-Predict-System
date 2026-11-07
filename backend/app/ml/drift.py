import numpy as np
from typing import Dict, Any, List

def calculate_psi(expected_vals: List[float], actual_val: float, num_buckets: int = 5) -> float:
    """
    Computes a single-point continuous Population Stability Index (PSI) approximation
    measuring feature divergence from the training distribution.
    """
    expected = np.array(expected_vals)
    if len(expected) == 0 or np.std(expected) == 0:
        return 0.0
    
    mean = np.mean(expected)
    std = np.std(expected)
    z = abs(actual_val - mean) / (std + 1e-6)
    
    # Sigmoidal PSI mapping
    psi = float(np.round((z ** 2) / (1.0 + (z ** 2)) * 0.35, 4))
    return psi

def assess_employee_feature_drift(
    features: Dict[str, float],
    baseline_stats: Dict[str, Dict[str, float]]
) -> Dict[str, Any]:
    """
    Evaluates multi-feature distribution drift and anomaly confidence for an incoming employee feature vector.
    """
    feature_psis = {}
    max_z = 0.0
    anomalous_features = []
    
    for feat_name, val in features.items():
        if feat_name in baseline_stats:
            stats = baseline_stats[feat_name]
            mean = stats.get("mean", val)
            std = stats.get("std", 1.0)
            z = abs(val - mean) / (std + 1e-6)
            
            # Feature PSI
            feat_psi = round(float((z ** 2) / (1.0 + (z ** 2)) * 0.30), 4)
            feature_psis[feat_name] = feat_psi
            
            if z > max_z:
                max_z = z
            if z > 2.2:
                anomalous_features.append({
                    "feature": feat_name,
                    "observed_value": val,
                    "expected_mean": round(mean, 2),
                    "z_score": round(z, 2)
                })

    avg_psi = round(float(np.mean(list(feature_psis.values()))) if feature_psis else 0.0, 3)
    
    if avg_psi < 0.10:
        drift_status = "STABLE"
        drift_message = "Feature distribution aligns closely with model training telemetry baseline."
    elif avg_psi < 0.20:
        drift_status = "MODERATE_DRIFT"
        drift_message = "Minor telemetry drift detected; within acceptable generalization bounds."
    else:
        drift_status = "SIGNIFICANT_DRIFT"
        drift_message = "Notable feature distribution shift detected; consider scheduled model retraining."

    is_anomaly = max_z > 2.8

    return {
        "psi_score": avg_psi,
        "drift_status": drift_status,
        "drift_message": drift_message,
        "is_anomaly": is_anomaly,
        "anomaly_confidence": round(min(1.0, max_z / 3.5), 2),
        "anomalous_features": anomalous_features,
        "feature_psi_breakdown": feature_psis
    }
