"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Shield,
  Sliders,
  Scale,
  Users,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { role, resetDemoData } = useAuth();
  const [settingsData, setSettingsData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingWeights, setSavingWeights] = useState(false);
  const [weightsMsg, setWeightsMsg] = useState<string | null>(null);

  // Form weights state
  const [weights, setWeights] = useState({
    weight_task_completion: 0.25,
    weight_on_time_delivery: 0.25,
    weight_code_quality: 0.15,
    weight_review_participation: 0.15,
    weight_estimation_accuracy: 0.10,
    weight_workload_balance: 0.10,
  });

  useEffect(() => {
    async function init() {
      try {
        const [st, logs, usr, m] = await Promise.all([
          api.getSettings(),
          api.getAuditLogs(),
          api.getUsers(),
          api.getModelVersions(),
        ]);
        setSettingsData(st);
        setAuditLogs(logs);
        setUsers(usr);
        setModels(m);
        if (st.metric_weights) {
          setWeights({
            weight_task_completion: st.metric_weights.task_completion,
            weight_on_time_delivery: st.metric_weights.on_time_delivery,
            weight_code_quality: st.metric_weights.code_quality,
            weight_review_participation: st.metric_weights.review_participation,
            weight_estimation_accuracy: st.metric_weights.estimation_accuracy,
            weight_workload_balance: st.metric_weights.workload_balance,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWeights(true);
    setWeightsMsg(null);
    try {
      await api.updateWeights(weights);
      setWeightsMsg("Metric weights saved successfully and applied to scoring engine!");
      const updatedLogs = await api.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      alert(err.message || "Failed to save weights");
    } finally {
      setSavingWeights(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#292735] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#4C4472]" />
            Settings & System Governance
          </h1>
          <p className="text-xs text-[#777482] mt-0.5">
            Configure transparent performance metric weights, prediction thresholds, and audit logs.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm("Reset demo database back to clean initial state?")) {
              resetDemoData();
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#EAE6E0] text-xs font-medium text-[#83394C] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Telemetry
        </button>
      </div>

      {/* Metric Weights Configuration (Interactive Form) */}
      <div className="pastel-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAE6E0] pb-3">
          <div>
            <h3 className="font-semibold text-sm text-[#292735] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#4C4472]" />
              Transparent Performance Metric Weights
            </h3>
            <p className="text-xs text-[#777482]">
              Configurable scoring components. All weights must sum to exactly 1.0 (100%).
            </p>
          </div>
          <span
            className={`pastel-badge text-xs ${
              Math.abs(totalWeight - 1.0) < 0.001 ? "badge-sage" : "badge-pink"
            }`}
          >
            Total: {Math.round(totalWeight * 100)}%
          </span>
        </div>

        {weightsMsg && (
          <div className="p-3 rounded-xl bg-[#F3F7F0] border border-[#DCE8D5] text-xs text-[#385E30]">
            {weightsMsg}
          </div>
        )}

        <form onSubmit={handleSaveWeights} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#777482] font-medium mb-1">
                Task Completion Velocity ({Math.round(weights.weight_task_completion * 100)}%)
              </label>
              <input
                type="range"
                min={0}
                max={0.5}
                step={0.05}
                value={weights.weight_task_completion}
                onChange={(e) =>
                  setWeights({ ...weights, weight_task_completion: parseFloat(e.target.value) })
                }
                className="w-full accent-[#4C4472]"
              />
            </div>

            <div>
              <label className="block text-[#777482] font-medium mb-1">
                On-Time Milestone Delivery ({Math.round(weights.weight_on_time_delivery * 100)}%)
              </label>
              <input
                type="range"
                min={0}
                max={0.5}
                step={0.05}
                value={weights.weight_on_time_delivery}
                onChange={(e) =>
                  setWeights({ ...weights, weight_on_time_delivery: parseFloat(e.target.value) })
                }
                className="w-full accent-[#4C4472]"
              />
            </div>

            <div>
              <label className="block text-[#777482] font-medium mb-1">
                Code Quality & Reopen Rate ({Math.round(weights.weight_code_quality * 100)}%)
              </label>
              <input
                type="range"
                min={0}
                max={0.4}
                step={0.05}
                value={weights.weight_code_quality}
                onChange={(e) =>
                  setWeights({ ...weights, weight_code_quality: parseFloat(e.target.value) })
                }
                className="w-full accent-[#4C4472]"
              />
            </div>

            <div>
              <label className="block text-[#777482] font-medium mb-1">
                Peer Review Engagement ({Math.round(weights.weight_review_participation * 100)}%)
              </label>
              <input
                type="range"
                min={0}
                max={0.4}
                step={0.05}
                value={weights.weight_review_participation}
                onChange={(e) =>
                  setWeights({ ...weights, weight_review_participation: parseFloat(e.target.value) })
                }
                className="w-full accent-[#4C4472]"
              />
            </div>

            <div>
              <label className="block text-[#777482] font-medium mb-1">
                Story Point Estimation Accuracy ({Math.round(weights.weight_estimation_accuracy * 100)}%)
              </label>
              <input
                type="range"
                min={0}
                max={0.3}
                step={0.05}
                value={weights.weight_estimation_accuracy}
                onChange={(e) =>
                  setWeights({ ...weights, weight_estimation_accuracy: parseFloat(e.target.value) })
                }
                className="w-full accent-[#4C4472]"
              />
            </div>

            <div>
              <label className="block text-[#777482] font-medium mb-1">
                Workload Balance Factor ({Math.round(weights.weight_workload_balance * 100)}%)
              </label>
              <input
                type="range"
                min={0}
                max={0.3}
                step={0.05}
                value={weights.weight_workload_balance}
                onChange={(e) =>
                  setWeights({ ...weights, weight_workload_balance: parseFloat(e.target.value) })
                }
                className="w-full accent-[#4C4472]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingWeights || Math.abs(totalWeight - 1.0) >= 0.01}
              className="px-4 py-2 rounded-xl bg-[#292735] text-[#FFFDF9] font-medium hover:bg-[#34323D] transition-colors disabled:opacity-50"
            >
              {savingWeights ? "Saving Weights..." : "Apply Scoring Weights"}
            </button>
          </div>
        </form>
      </div>

      {/* Role-Based Access Control Users List */}
      <div className="pastel-card p-6 space-y-3">
        <h3 className="font-semibold text-sm text-[#292735] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#4C4472]" />
          System Accounts & RBAC Permissions
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#EAE6E0] text-[10px] text-[#777482] uppercase">
              <th className="py-2">User Email</th>
              <th className="py-2">Full Name</th>
              <th className="py-2">Assigned Role</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE6E0]/60">
            {users.map((u) => (
              <tr key={u.id} className="py-2">
                <td className="py-2 font-semibold text-[#292735]">{u.email}</td>
                <td className="py-2 text-[#777482]">{u.full_name}</td>
                <td className="py-2">
                  <span
                    className={`pastel-badge text-[10px] ${
                      u.role === "ADMIN"
                        ? "badge-lavender"
                        : u.role === "MANAGER"
                        ? "badge-sage"
                        : "badge-blue"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-2 text-[#385E30]">Active</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Log Entries */}
      <div className="pastel-card p-6 space-y-3">
        <h3 className="font-semibold text-sm text-[#292735] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#4C4472]" />
          System Audit Trail & Compliance Log
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#EAE6E0] text-[10px] text-[#777482] uppercase">
              <th className="py-2">Timestamp</th>
              <th className="py-2">Action</th>
              <th className="py-2">Details</th>
              <th className="py-2">Triggered By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE6E0]/60">
            {auditLogs.map((log) => (
              <tr key={log.id} className="py-2">
                <td className="py-2 text-[#777482] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-2 font-mono text-[11px] font-bold text-[#4C4472]">
                  {log.action}
                </td>
                <td className="py-2 text-[#777482]">{log.details}</td>
                <td className="py-2 font-medium text-[#292735]">{log.user_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
