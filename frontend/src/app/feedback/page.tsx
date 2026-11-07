"use client";

import React, { useEffect, useState } from "react";
import {
  HeartHandshake,
  Target,
  Sparkles,
  Plus,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function FeedbackPage() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<number | "">("");
  const [autoRecs, setAutoRecs] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    target_metric: "PR Review Turnaround < 4h",
    target_value: 100,
    current_value: 0,
  });

  useEffect(() => {
    async function init() {
      try {
        const [fbRes, gRes, empRes] = await Promise.all([
          api.getFeedbacks(),
          api.getGoals(),
          api.getEmployees(),
        ]);
        setFeedbacks(fbRes);
        setGoals(gRes);
        setEmployees(empRes);
        if (empRes.length > 0) {
          setSelectedEmpId(empRes[0].id);
          loadRecs(empRes[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const loadRecs = async (empId: number) => {
    try {
      const res = await api.generateRecommendations(empId);
      setAutoRecs(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGoalProgress = async (goalId: number, currentProgress: number) => {
    const nextProgress = Math.min(100, currentProgress + 15);
    try {
      await api.updateGoal(goalId, { progress_pct: nextProgress });
      const updatedGoals = await api.getGoals();
      setGoals(updatedGoals);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    try {
      await api.createGoal({
        employee_id: Number(selectedEmpId),
        title: newGoal.title,
        target_metric: newGoal.target_metric,
        target_value: Number(newGoal.target_value),
        current_value: Number(newGoal.current_value),
      });
      setShowGoalModal(false);
      const updated = await api.getGoals();
      setGoals(updated);
    } catch (err: any) {
      alert(err.message || "Failed to create goal");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#292735] flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#4C4472]" />
            Personalized Feedback & Development Plans
          </h1>
          <p className="text-xs text-[#777482] mt-0.5">
            Constructive, evidence-based recommendations synthesized directly from verified engineering metrics.
          </p>
        </div>

        <button
          onClick={() => setShowGoalModal(true)}
          className="px-3.5 py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-medium hover:bg-[#34323D] transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-[#DCD6F7]" />
          Add Development Goal
        </button>
      </div>

      {/* Automated Recommendation Synthesizer Card */}
      <div className="pastel-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE6E0] pb-4">
          <div>
            <h3 className="font-semibold text-sm text-[#292735] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#645CBB]" />
              Metric-Grounded Development Recommendation Generator
            </h3>
            <p className="text-xs text-[#777482]">
              Select an engineer to inspect personalized strengths, focus areas, and actionable development recommendations.
            </p>
          </div>

          <select
            value={selectedEmpId}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSelectedEmpId(val);
              loadRecs(val);
            }}
            className="px-3 py-1.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] font-medium focus:outline-none"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role_title})
              </option>
            ))}
          </select>
        </div>

        {autoRecs && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
            <div className="p-4 rounded-xl bg-[#F3F7F0] border border-[#DCE8D5] space-y-2">
              <span className="font-bold text-[#385E30] uppercase text-[10px] tracking-wider">
                Observed Strengths
              </span>
              <p className="text-[#34323D] whitespace-pre-line leading-relaxed">
                {autoRecs.recommendations?.strengths}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FCF5EF] border border-[#F7E1D0] space-y-2">
              <span className="font-bold text-[#8C552A] uppercase text-[10px] tracking-wider">
                Growth & Support Areas
              </span>
              <p className="text-[#34323D] whitespace-pre-line leading-relaxed">
                {autoRecs.recommendations?.growth_areas}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F2EEFC] border border-[#DCD6F7] space-y-2">
              <span className="font-bold text-[#4C4472] uppercase text-[10px] tracking-wider">
                Actionable Next Steps
              </span>
              <p className="text-[#34323D] whitespace-pre-line leading-relaxed">
                {autoRecs.recommendations?.suggested_actions}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Development Goals Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-[#292735] flex items-center gap-2">
          <Target className="w-4 h-4 text-[#385E30]" />
          Active Development Goals ({goals.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => (
            <div key={g.id} className="pastel-card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`pastel-badge text-[10px] ${
                      g.status === "ACHIEVED" ? "badge-sage" : "badge-lavender"
                    }`}
                  >
                    {g.status}
                  </span>
                  <span className="text-[11px] font-bold text-[#292735]">{g.progress_pct}%</span>
                </div>
                <h4 className="font-bold text-xs text-[#292735]">{g.title}</h4>
                <p className="text-[11px] text-[#777482] mt-0.5">Target: {g.target_metric}</p>
              </div>

              <div>
                <div className="w-full bg-[#FAF8F5] h-2 rounded-full overflow-hidden border border-[#EAE6E0] mb-3">
                  <div
                    className="bg-[#DCD6F7] h-full rounded-full transition-all"
                    style={{ width: `${g.progress_pct}%` }}
                  />
                </div>

                {g.status !== "ACHIEVED" && (
                  <button
                    onClick={() => handleUpdateGoalProgress(g.id, g.progress_pct)}
                    className="w-full py-1.5 rounded-lg border border-[#EAE6E0] text-[11px] font-semibold text-[#4C4472] hover:bg-[#FAF8F5] transition-colors"
                  >
                    Log Progress (+15%)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Reviews History */}
      <div className="pastel-card p-6 space-y-4">
        <h3 className="font-semibold text-sm text-[#292735]">
          Quarterly Review Records & Self-Reflections
        </h3>
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="p-4 rounded-xl border border-[#EAE6E0] bg-[#FAF8F5] space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#EAE6E0]/60 pb-2">
                <span className="font-bold text-[#292735]">{fb.period} Evaluation Cycle</span>
                <span className="text-[#777482]">Reviewer: {fb.reviewer_name}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-[#385E30] mb-1">Strengths</h5>
                  <p className="text-[#777482] leading-relaxed">{fb.strengths}</p>
                </div>
                <div>
                  <h5 className="font-semibold text-[#83394C] mb-1">Growth & Next Steps</h5>
                  <p className="text-[#777482] leading-relaxed">{fb.growth_areas}</p>
                </div>
              </div>
              {fb.employee_reflection && (
                <div className="p-3 rounded-lg bg-[#FFFDF9] border border-[#EAE6E0] text-[#777482]">
                  <span className="font-semibold text-[#292735]">Engineer Reflection: </span>
                  {fb.employee_reflection}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-[#292735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-[22px] border border-[#EAE6E0] w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EAE6E0] pb-3">
              <h3 className="font-bold text-[#292735] text-sm">Create Measurable Development Goal</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-[#777482]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#777482] font-medium mb-1">Engineer</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#777482] font-medium mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct at least 4 pull-request reviews per sprint"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#777482] font-medium mb-1">Target Metric</label>
                <input
                  type="text"
                  value={newGoal.target_metric}
                  onChange={(e) => setNewGoal({ ...newGoal, target_metric: e.target.value })}
                  className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#EAE6E0] text-[#777482]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#292735] text-[#FFFDF9] font-medium"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
