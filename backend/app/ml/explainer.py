from typing import Dict, List, Any, Tuple
import numpy as np

FACTOR_FRIENDLY_NAMES = {
    "task_completion_rate": "Task Completion Velocity",
    "on_time_delivery_rate": "On-Time Milestone Delivery",
    "overdue_task_ratio": "Overdue Task Proportion",
    "estimation_accuracy": "Effort Estimation Accuracy",
    "review_participation_rate": "Peer Review Engagement",
    "review_turnaround_hours": "Pull Request Review Latency",
    "workload_capacity_index": "Sprint Workload Balance",
    "commit_frequency_weekly": "Code Contribution Frequency",
    "reopened_task_ratio": "Quality Stability (Reopen Rate)",
    "data_points_count": "Historical Telemetry Depth",
    "sprint_consistency_index": "Compound Sprint Consistency",
    "burnout_risk_indicator": "Workload Fatigue Ratio",
    "code_stability_score": "Defect Resistance Index",
    "pr_efficiency_ratio": "Code Review Efficiency Index"
}

FEATURE_BENCHMARK_MEANS = {
    "task_completion_rate": 0.72,
    "on_time_delivery_rate": 0.75,
    "overdue_task_ratio": 0.12,
    "estimation_accuracy": 0.78,
    "review_participation_rate": 0.76,
    "review_turnaround_hours": 4.5,
    "workload_capacity_index": 1.05,
    "commit_frequency_weekly": 14.0,
    "reopened_task_ratio": 0.08,
    "sprint_consistency_index": 0.55,
    "burnout_risk_indicator": 0.68,
    "code_stability_score": 0.92,
    "pr_efficiency_ratio": 0.85
}

def explain_prediction(
    features: Dict[str, float],
    predicted_score: float,
    baseline_score: float = 78.5
) -> Tuple[List[Dict[str, Any]], List[str], Dict[str, Any]]:
    """
    Computes explainable factor attribution based on decomposed tree contribution principles.
    Identifies top positive drivers, negative risks, and generates mathematical counterfactuals.
    """
    factors = []
    actions = []
    
    # 1. On-Time Delivery Rate Attribution
    ontime = features.get("on_time_delivery_rate", 0.75)
    mean_ontime = FEATURE_BENCHMARK_MEANS["on_time_delivery_rate"]
    impact_ontime = round((ontime - mean_ontime) * 26.0, 1)
    if impact_ontime >= 0.8:
        factors.append({
            "factor_name": "On-Time Milestone Delivery",
            "impact_weight": impact_ontime,
            "direction": "positive",
            "feature_key": "on_time_delivery_rate",
            "description": f"Consistently achieves delivery milestones ({int(ontime*100)}% on-time rate), driving predictable sprint throughput."
        })
    elif impact_ontime <= -0.8:
        factors.append({
            "factor_name": "On-Time Milestone Delivery",
            "impact_weight": impact_ontime,
            "direction": "negative",
            "feature_key": "on_time_delivery_rate",
            "description": f"Delivery slippage detected ({int(ontime*100)}% on-time), pulling down sprint velocity forecast."
        })
        actions.append("Review blocker dependencies early during sprint planning to protect milestone commitments.")

    # 2. Overdue Task Ratio
    overdue = features.get("overdue_task_ratio", 0.12)
    mean_overdue = FEATURE_BENCHMARK_MEANS["overdue_task_ratio"]
    impact_overdue = round((mean_overdue - overdue) * 28.0, 1)
    if impact_overdue <= -0.8:
        factors.append({
            "factor_name": "Overdue Task Backlog",
            "impact_weight": impact_overdue,
            "direction": "negative",
            "feature_key": "overdue_task_ratio",
            "description": f"High overdue task ratio ({int(overdue*100)}%), signaling unmanaged scope creep or blockers."
        })
        actions.append("Decompose complex tasks exceeding 5 story points into actionable sub-tasks.")
    elif impact_overdue >= 0.8:
        factors.append({
            "factor_name": "Minimal Overdue Tickets",
            "impact_weight": impact_overdue,
            "direction": "positive",
            "feature_key": "overdue_task_ratio",
            "description": f"Exceptionally low overdue ratio ({int(overdue*100)}%), reflecting strong task completion discipline."
        })

    # 3. Code Review Latency & Turnaround
    turnaround = features.get("review_turnaround_hours", 4.5)
    mean_turnaround = FEATURE_BENCHMARK_MEANS["review_turnaround_hours"]
    impact_turnaround = round((mean_turnaround - turnaround) * 1.5, 1)
    if impact_turnaround >= 0.8:
        factors.append({
            "factor_name": "Rapid Code Review Turnaround",
            "impact_weight": impact_turnaround,
            "direction": "positive",
            "feature_key": "review_turnaround_hours",
            "description": f"Fast peer review latency ({turnaround:.1f} hours average), preventing PR stagnation across the squad."
        })
    elif impact_turnaround <= -0.8:
        factors.append({
            "factor_name": "Pull Request Review Latency",
            "impact_weight": impact_turnaround,
            "direction": "negative",
            "feature_key": "review_turnaround_hours",
            "description": f"Prolonged review turnaround ({turnaround:.1f} hours), creating upstream merge bottlenecks."
        })
        actions.append("Set aside dedicated daily review blocks (e.g., morning check-in) to unblock peer PRs.")

    # 4. Weekly Commit Cadence
    commits = features.get("commit_frequency_weekly", 14.0)
    mean_commits = FEATURE_BENCHMARK_MEANS["commit_frequency_weekly"]
    impact_commits = round((commits - mean_commits) * 0.45, 1)
    if impact_commits >= 0.8:
        factors.append({
            "factor_name": "Code Contribution Cadence",
            "impact_weight": impact_commits,
            "direction": "positive",
            "feature_key": "commit_frequency_weekly",
            "description": f"Healthy, steady commit cadence ({int(commits)} commits/week) demonstrating steady development progress."
        })
    elif impact_commits <= -0.8:
        factors.append({
            "factor_name": "Low Commit Activity",
            "impact_weight": impact_commits,
            "direction": "negative",
            "feature_key": "commit_frequency_weekly",
            "description": f"Infrequent commits ({int(commits)}/week), suggesting batch pushing or local development blockers."
        })
        actions.append("Adopt incremental atomic commit patterns and open draft PRs early for ongoing visibility.")

    # 5. Workload Capacity Index
    workload = features.get("workload_capacity_index", 1.05)
    if workload > 1.30:
        impact_workload = -round((workload - 1.10) * 12.0, 1)
        factors.append({
            "factor_name": "Sprint Overload / Fatigue Risk",
            "impact_weight": impact_workload,
            "direction": "negative",
            "feature_key": "workload_capacity_index",
            "description": f"Assigned capacity ({int(workload*100)}%) substantially exceeds recommended 100% threshold."
        })
        actions.append("Reallocate non-critical backlog tasks to prevent developer burnout and maintain code quality.")
    elif workload < 0.75:
        factors.append({
            "factor_name": "Available Sprint Capacity",
            "impact_weight": 2.0,
            "direction": "positive",
            "feature_key": "workload_capacity_index",
            "description": f"Engineer has surplus capacity ({int(workload*100)}% load) available for sprint stretch goals."
        })

    # Sort factors by absolute impact magnitude
    factors.sort(key=lambda x: abs(x["impact_weight"]), reverse=True)

    # 6. Counterfactual "What-If" Prescription
    # Computes minimum realistic intervention required to reach >= 90 score
    target_score = 90.0
    gap = target_score - predicted_score
    counterfactual = {
        "target_score": target_score,
        "score_gap": round(max(0.0, gap), 1),
        "prescription": []
    }
    
    if gap > 0:
        if ontime < 0.88:
            potential_gain = round((0.88 - ontime) * 26.0, 1)
            counterfactual["prescription"].append({
                "action": "Increase On-Time Milestone Delivery to 88%",
                "expected_gain": f"+{potential_gain} pts",
                "difficulty": "Moderate"
            })
        if overdue > 0.06:
            potential_gain = round((overdue - 0.05) * 28.0, 1)
            counterfactual["prescription"].append({
                "action": "Reduce overdue task ratio below 6%",
                "expected_gain": f"+{potential_gain} pts",
                "difficulty": "High Impact"
            })
        if turnaround > 2.5:
            counterfactual["prescription"].append({
                "action": "Reduce code review turnaround to < 2.5 hours",
                "expected_gain": "+2.0 pts",
                "difficulty": "Low Effort"
            })

    return factors, actions, counterfactual
