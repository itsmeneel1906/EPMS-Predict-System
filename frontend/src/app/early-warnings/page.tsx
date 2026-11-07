"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Check,
  UserCheck,
  RotateCcw,
  Sparkles,
  X,
  Cpu,
  BrainCircuit,
} from "lucide-react";
import { api } from "@/lib/api";

export default function EarlyWarningsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [resolvingAlertId, setResolvingAlertId] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>("");

  useEffect(() => {
    loadAlerts();
  }, [selectedSeverity, selectedStatus]);

  const loadAlerts = async () => {
    try {
      const params: any = {};
      if (selectedSeverity) params.severity = selectedSeverity;
      if (selectedStatus) params.status = selectedStatus;
      const res = await api.getAlerts(params);
      setAlerts(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      await api.scanAlerts();
      await loadAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleAcknowledge = async (id: number) => {
    try {
      await api.acknowledgeAlert(id);
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingAlertId) return;
    try {
      await api.resolveAlert(resolvingAlertId, resolutionNotes || "Mitigated in sprint review.");
      setResolvingAlertId(null);
      setResolutionNotes("");
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#292735] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#83394C]" />
            Early Warning & Risk Alerts Center
          </h1>
          <p className="text-xs text-[#777482] mt-0.5">
            Proactive triage of overdue task backlogs, review latency, and milestone delivery delays.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="px-3.5 py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-medium hover:bg-[#34323D] transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-[#DCD6F7] ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Scanning Signals..." : "Scan Risk Signals"}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="pastel-card p-4 flex flex-wrap items-center gap-3">
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
        >
          <option value="">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High Severity</option>
          <option value="Medium">Medium Severity</option>
          <option value="Low">Low Severity</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New (Unreviewed)</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="pastel-card p-12 text-center text-xs text-[#777482]">
            <CheckCircle2 className="w-8 h-8 text-[#385E30] mx-auto mb-2" />
            No matching risk alerts found. All engineering indicators are healthy!
          </div>
        ) : (
          alerts.map((alert) => {
            const isResolved = alert.status === "RESOLVED";
            return (
              <div
                key={alert.id}
                className={`pastel-card p-5 space-y-3 transition-all ${
                  isResolved ? "opacity-60 bg-[#FAF8F5]" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`pastel-badge text-[10px] ${
                        alert.severity === "Critical" || alert.severity === "High"
                          ? "badge-pink"
                          : alert.severity === "Medium"
                          ? "badge-peach"
                          : "badge-sage"
                      }`}
                    >
                      {alert.severity} Severity
                    </span>
                    {alert.alert_type === "ML_ISOLATION_FOREST_ANOMALY" ? (
                      <span className="text-[11px] font-bold text-[#645CBB] px-2.5 py-0.5 rounded-full bg-[#DCD6F7]/50 border border-[#B8B2E8] flex items-center gap-1 shadow-xs">
                        <BrainCircuit className="w-3.5 h-3.5 text-[#645CBB]" />
                        ML Isolation Forest Anomaly
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#4C4472] px-2 py-0.5 rounded-md bg-[#DCD6F7]/30">
                        {alert.alert_type.replace(/_/g, " ")}
                      </span>
                    )}
                    <span className="text-xs text-[#777482]">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`pastel-badge text-[10px] ${
                      alert.status === "NEW"
                        ? "badge-pink font-bold"
                        : alert.status === "RESOLVED"
                        ? "badge-sage"
                        : "badge-blue"
                    }`}
                  >
                    Status: {alert.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#292735]">{alert.title}</h3>
                  <p className="text-xs text-[#777482] mt-1 leading-relaxed">{alert.explanation}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-[#292735]">Supporting Telemetry: </span>
                    <span className="text-[#83394C] font-bold">{alert.supporting_metric}</span>
                    {alert.employee_name && (
                      <span className="text-[#777482] ml-2">
                        • Affected: {alert.employee_name}
                      </span>
                    )}
                    {alert.project_name && (
                      <span className="text-[#777482] ml-2">
                        • Project: {alert.project_name}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-[#777482]">
                    <strong>Action: </strong> {alert.suggested_action}
                  </div>
                </div>

                {alert.resolution_notes && (
                  <div className="text-[11px] text-[#385E30] bg-[#F3F7F0] p-2.5 rounded-xl border border-[#DCE8D5]">
                    <strong>Resolution Note: </strong> {alert.resolution_notes}
                  </div>
                )}

                {/* Triage Actions */}
                {!isResolved && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE6E0]/60">
                    {alert.status === "NEW" && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-xs font-medium text-[#292735] hover:bg-[#EAE6E0]/50 transition-colors flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#4C4472]" />
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => setResolvingAlertId(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#DCE8D5] text-[#292735] text-xs font-semibold hover:bg-[#D1E0C9] transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 text-[#385E30]" />
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Resolution Notes Modal */}
      {resolvingAlertId && (
        <div className="fixed inset-0 z-50 bg-[#292735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-[22px] border border-[#EAE6E0] w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EAE6E0] pb-3">
              <h3 className="font-bold text-[#292735] text-sm">Resolve Early Warning Alert</h3>
              <button onClick={() => setResolvingAlertId(null)} className="text-[#777482]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#777482] font-medium mb-1">
                  Mitigation Action / Resolution Notes
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Conducted 1-on-1 sprint review. Reallocated blocked tickets to peer."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingAlertId(null)}
                  className="px-3 py-1.5 rounded-xl border border-[#EAE6E0] text-[#777482]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#292735] text-[#FFFDF9] font-medium"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
