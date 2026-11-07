import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

# Core telemetry features + Advanced interaction features
BASE_FEATURE_COLUMNS = [
    "task_completion_rate",        # 0.0 to 1.0 (velocity proportion)
    "on_time_delivery_rate",       # 0.0 to 1.0 (sprint deadline compliance)
    "overdue_task_ratio",          # 0.0 to 1.0 (slipping milestones)
    "estimation_accuracy",         # 0.0 to 1.0 (story points estimated vs actual)
    "review_participation_rate",   # 0.0 to 1.0 (code review engagement)
    "review_turnaround_hours",     # 1.0 to 32.0 (PR latency in hours)
    "workload_capacity_index",     # 0.5 to 2.0 (1.0 = balanced, >1.3 = overload)
    "commit_frequency_weekly",     # 2 to 45 (weekly commits across repos)
    "reopened_task_ratio",         # 0.0 to 0.40 (QA bug rework rate)
    "data_points_count"            # observation depth / sample size
]

# Advanced non-linear interaction features
ENGINEERED_FEATURE_COLUMNS = [
    "sprint_consistency_index",    # completion_rate * on_time_rate
    "burnout_risk_indicator",      # workload / (review_turnaround + 1.0)
    "code_stability_score",        # 1.0 - reopened_task_ratio
    "pr_efficiency_ratio"          # review_participation / (turnaround / 12.0 + 0.5)
]

ALL_FEATURE_COLUMNS = BASE_FEATURE_COLUMNS + ENGINEERED_FEATURE_COLUMNS
FEATURE_COLUMNS = ALL_FEATURE_COLUMNS

def compute_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """Computes advanced non-linear interaction features for enhanced model expressiveness."""
    df = df.copy()
    
    # 1. Sprint Consistency: Compound reliability across completion and deadlines
    df["sprint_consistency_index"] = (df["task_completion_rate"] * df["on_time_delivery_rate"]).round(3)
    
    # 2. Burnout Risk Indicator: High workload coupled with slow review latency signals fatigue
    df["burnout_risk_indicator"] = (df["workload_capacity_index"] / (df["review_turnaround_hours"] / 8.0 + 1.0)).round(3)
    
    # 3. Code Stability Score: Inverse of reopened QA tasks
    df["code_stability_score"] = (1.0 - df["reopened_task_ratio"]).round(3)
    
    # 4. PR Efficiency Ratio: High engagement with low latency
    df["pr_efficiency_ratio"] = (df["review_participation_rate"] / (df["review_turnaround_hours"] / 10.0 + 0.5)).round(3)
    
    return df

def generate_synthetic_engineering_dataset(num_records: int = 1800, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic, statistically grounded dataset of engineering activity telemetry.
    Models latent developer capability, workload pressures, and non-linear delivery dynamics.
    """
    np.random.seed(random_seed)
    
    # 1. Latent capability factor (normally distributed around 1.0)
    latent_capability = np.random.normal(loc=1.0, scale=0.20, size=num_records)
    latent_capability = np.clip(latent_capability, 0.45, 1.55)
    
    # 2. Workload capacity index (1.0 = balanced sprint load)
    workload = np.random.normal(loc=1.05, scale=0.24, size=num_records)
    workload = np.clip(workload, 0.50, 1.95)
    
    # 3. Task completion rate
    raw_completion = 0.72 + 0.18 * (latent_capability - 1.0) - 0.14 * np.maximum(0, workload - 1.15) + np.random.normal(0, 0.04, num_records)
    task_completion_rate = np.clip(raw_completion, 0.35, 0.99)
    
    # 4. On-time delivery rate
    raw_ontime = task_completion_rate - 0.10 * np.maximum(0, workload - 1.0) - np.random.exponential(0.03, num_records)
    on_time_delivery_rate = np.clip(raw_ontime, 0.30, 0.99)
    
    # 5. Overdue task ratio (strongly correlated with late delivery)
    overdue_task_ratio = np.clip((1.0 - on_time_delivery_rate) * 0.72 + np.random.normal(0, 0.025, num_records), 0.01, 0.80)
    
    # 6. Estimation accuracy (story point precision)
    estimation_accuracy = np.clip(0.78 + 0.14 * (latent_capability - 1.0) - 0.08 * (workload - 1.0) + np.random.normal(0, 0.06, num_records), 0.32, 0.98)
    
    # 7. Code review participation
    review_participation_rate = np.clip(0.76 + 0.16 * (latent_capability - 1.0) + np.random.normal(0, 0.07, num_records), 0.25, 1.0)
    
    # 8. Review turnaround hours
    review_turnaround_hours = np.clip(3.2 + 4.2 * np.maximum(0, workload - 1.0) - 1.8 * (latent_capability - 1.0) + np.random.exponential(1.8, num_records), 0.8, 30.0)
    
    # 9. Commit frequency weekly
    commit_frequency_weekly = np.clip(13 + 9 * (latent_capability - 1.0) + np.random.normal(0, 3.5, num_records), 2, 45).astype(int)
    
    # 10. Reopened task ratio (QA defect rework)
    reopened_task_ratio = np.clip(0.07 - 0.03 * (latent_capability - 1.0) + 0.04 * np.maximum(0, workload - 1.1) + np.random.normal(0, 0.02, num_records), 0.0, 0.35)
    
    # 11. Observation completeness (data points count)
    data_points_count = np.random.randint(10, 48, size=num_records)
    
    # Base DataFrame
    df_raw = pd.DataFrame({
        "task_completion_rate": task_completion_rate.round(3),
        "on_time_delivery_rate": on_time_delivery_rate.round(3),
        "overdue_task_ratio": overdue_task_ratio.round(3),
        "estimation_accuracy": estimation_accuracy.round(3),
        "review_participation_rate": review_participation_rate.round(3),
        "review_turnaround_hours": review_turnaround_hours.round(1),
        "workload_capacity_index": workload.round(2),
        "commit_frequency_weekly": commit_frequency_weekly,
        "reopened_task_ratio": reopened_task_ratio.round(3),
        "data_points_count": data_points_count,
    })
    
    # Compute non-linear interaction features
    df = compute_engineered_features(df_raw)
    
    # Target 1: Continuous Performance Score (0 - 100)
    score = (
        df["task_completion_rate"] * 24.0 +
        df["on_time_delivery_rate"] * 28.0 +
        (1.0 - df["overdue_task_ratio"]) * 14.0 +
        df["estimation_accuracy"] * 12.0 +
        df["review_participation_rate"] * 10.0 +
        np.clip(1.0 - (df["review_turnaround_hours"] / 24.0), 0, 1) * 8.0 +
        df["code_stability_score"] * 4.0
    )
    score += np.random.normal(0, 1.8, num_records)
    df["performance_score"] = np.clip(score, 45.0, 99.5).round(1)
    
    # Target 2: Delivery Risk Classification (0 = Low Risk, 1 = High Delivery Risk)
    risk_logit = (
        -3.8 +
        6.2 * df["overdue_task_ratio"] +
        4.1 * (1.0 - df["on_time_delivery_rate"]) +
        3.0 * np.maximum(0, df["workload_capacity_index"] - 1.15) +
        2.8 * df["reopened_task_ratio"] -
        2.5 * df["sprint_consistency_index"]
    )
    risk_probability = 1.0 / (1.0 + np.exp(-risk_logit))
    df["delivery_risk"] = (np.random.rand(num_records) < risk_probability).astype(int)
    
    return df

def get_feature_distribution_stats(df: pd.DataFrame) -> Dict[str, Dict[str, float]]:
    """Calculates baseline distribution parameters for data drift / PSI tracking."""
    stats = {}
    for col in FEATURE_COLUMNS:
        stats[col] = {
            "mean": float(df[col].mean()),
            "std": float(df[col].std()),
            "min": float(df[col].min()),
            "p25": float(df[col].quantile(0.25)),
            "p50": float(df[col].median()),
            "p75": float(df[col].quantile(0.75)),
            "max": float(df[col].max())
        }
    return stats
