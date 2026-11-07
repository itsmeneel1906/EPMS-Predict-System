"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  BrainCircuit,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderGit2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Plus,
  Play,
  RotateCcw,
  Shield,
  Briefcase,
  User as UserIcon,
  Cable,
  FileSpreadsheet,
  Settings as SettingsIcon,
  Award,
  CheckSquare,
  MessageSquare,
  Activity,
  Layers,
  GitCommit,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function OverviewPage() {
  const { role, user } = useAuth();
  const [kpis, setKpis] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [devTasks, setDevTasks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [kpiRes, trendsRes, riskRes, alertsRes, empRes, tasksRes, auditRes] =
          await Promise.all([
            api.getKPIs(),
            api.getProductivityTrends(),
            api.getRiskDistribution(),
            api.getAlerts({ status: "NEW" }),
            api.getEmployees(),
            api.getTasks({ assignee_id: 2 }),
            api.getAuditLogs().catch(() => []),
          ]);
        setKpis(kpiRes);
        setTrends(trendsRes);
        setRiskData(riskRes);
        setAlerts(alertsRes.slice(0, 4));
        setEmployees(empRes.slice(0, 5));
        setDevTasks(tasksRes);
        setAuditLogs(auditRes.slice(0, 5));
      } catch (err) {
        console.error("Dashboard data load error", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [role]);

  const handleTriggerAlertScan = async () => {
    setIsScanning(true);
    setScanMessage(null);
    try {
      const res = await api.scanAlerts();
      setScanMessage(res.message);
      const updatedAlerts = await api.getAlerts({ status: "NEW" });
      setAlerts(updatedAlerts.slice(0, 4));
      const updatedKpis = await api.getKPIs();
      setKpis(updatedKpis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      await api.updateTask(taskId, { status: newStatus });
      const updated = await api.getTasks({ assignee_id: 2 });
      setDevTasks(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const pieData = riskData
    ? [
        { name: "Low Risk", value: riskData.low_risk, color: "#DCE8D5" },
        { name: "Medium Risk", value: riskData.medium_risk, color: "#F7E1D0" },
        { name: "High Risk", value: riskData.high_risk, color: "#F4DDE3" },
      ]
    : [];

  const teamCapacityData = [
    { team: "Frontend", velocity: 92, capacity: 85, onTime: 94 },
    { team: "Backend & Cloud", velocity: 88, capacity: 90, onTime: 86 },
    { team: "Mobile Eng", velocity: 84, capacity: 78, onTime: 82 },
    { team: "DevOps & SRE", velocity: 95, capacity: 92, onTime: 96 },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-[#FFFDF9] rounded-[22px] border border-[#EAE6E0]" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-[#FFFDF9] rounded-[20px] border border-[#EAE6E0]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* =========================================================================
          VIEW 1: ADMIN DASHBOARD
      ========================================================================= */}
      {role === "ADMIN" && (
        <div className="space-y-8">
          {/* Admin Banner */}
          <div className="p-6 rounded-[22px] bg-gradient-to-r from-[#DCD6F7]/40 via-[#FAF8F5] to-[#FFFDF9] border border-[#EAE6E0] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#DCD6F7] text-[#292735] border border-[#C5BDEB] flex items-center gap-1.5 shadow-xs">
                  <Shield className="w-3.5 h-3.5 text-[#4C4472]" />
                  System Administrator Command Center
                </span>
                <span className="text-xs text-[#777482]">Organization-Wide Governance</span>
              </div>
              <h1 className="text-xl font-bold text-[#292735]">
                Organization Intelligence & Platform Governance
              </h1>
              <p className="text-xs text-[#777482] mt-0.5">
                Full-stack system health, ML model versioning, telemetry integration status, and security audit logs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/settings"
                className="px-3.5 py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-medium hover:bg-[#34323D] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-[#DCD6F7]" />
                Configure Metric Weights
              </Link>
              <Link
                href="/integrations"
                className="px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#EAE6E0] text-xs font-medium text-[#292735] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Cable className="w-3.5 h-3.5 text-[#4C4472]" />
                Manage Integrations
              </Link>
            </div>
          </div>

          {/* Admin KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Total Engineers</span>
                <div className="w-7 h-7 rounded-lg bg-[#DCD6F7]/50 flex items-center justify-center text-[#4C4472]">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">{kpis?.total_employees || 16}</div>
                <div className="text-[10px] text-[#385E30] font-medium mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  Across 4 Departments
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">ML Governance</span>
                <div className="w-7 h-7 rounded-lg bg-[#DCE8D5]/60 flex items-center justify-center text-[#385E30]">
                  <BrainCircuit className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-[#292735]">v1.2.0-rf</div>
                <div className="text-[10px] text-[#777482] font-medium mt-1">
                  Random Forest (R²=0.88)
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">System Telemetry</span>
                <div className="w-7 h-7 rounded-lg bg-[#DCE8D5] flex items-center justify-center text-[#385E30]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#385E30]">100%</div>
                <div className="text-[10px] text-[#385E30] font-medium mt-1">
                  All Systems Operational
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Metric Weights</span>
                <div className="w-7 h-7 rounded-lg bg-[#F7E1D0]/60 flex items-center justify-center text-[#8C552A]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">6 Weights</div>
                <div className="text-[10px] text-[#777482] font-medium mt-1">
                  Calibrated to 100%
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Connected Repos</span>
                <div className="w-7 h-7 rounded-lg bg-[#DCD6F7]/50 flex items-center justify-center text-[#4C4472]">
                  <FolderGit2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">8 Repos</div>
                <div className="text-[10px] text-[#385E30] font-medium mt-1">
                  GitHub & Jira Synced
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Security Audits</span>
                <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#EAE6E0] flex items-center justify-center text-[#777482]">
                  <Activity className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">24 Events</div>
                <div className="text-[10px] text-[#777482] font-medium mt-1">
                  All Logged Securely
                </div>
              </div>
            </div>
          </div>

          {/* Admin Cross-Team Capacity Chart & Risk Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 pastel-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#292735]">
                    Cross-Department Velocity & Engineering Capacity
                  </h3>
                  <p className="text-xs text-[#777482]">
                    Capacity vs. on-time milestone delivery across all engineering departments
                  </p>
                </div>
                <span className="badge-lavender pastel-badge text-[10px]">
                  All Teams Monitored
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamCapacityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAE6E0" vertical={false} />
                    <XAxis dataKey="team" stroke="#777482" fontSize={11} tickLine={false} />
                    <YAxis stroke="#777482" fontSize={11} domain={[70, 100]} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFDF9",
                        borderColor: "#EAE6E0",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Bar dataKey="velocity" name="Velocity %" fill="#DCD6F7" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="onTime" name="On-Time Delivery %" fill="#DCE8D5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform Integration Status */}
            <div className="pastel-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#292735] mb-1">
                  Platform Ingestion Status
                </h3>
                <p className="text-xs text-[#777482] mb-4">Live telemetry connectors and sync feeds</p>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#292735] text-[#FFFDF9] flex items-center justify-center text-xs font-bold">
                        GH
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#292735]">GitHub Activity Sync</h4>
                        <p className="text-[10px] text-[#777482]">Commits & PR telemetry</p>
                      </div>
                    </div>
                    <span className="badge-sage pastel-badge text-[10px]">Connected</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#2B577E] text-[#FFFDF9] flex items-center justify-center text-xs font-bold">
                        JR
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#292735]">Jira Sprint Tracker</h4>
                        <p className="text-[10px] text-[#777482]">Story points & issue status</p>
                      </div>
                    </div>
                    <span className="badge-sage pastel-badge text-[10px]">Connected</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#4C4472] text-[#FFFDF9] flex items-center justify-center text-xs font-bold">
                        DB
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#292735]">SQLite / PostgreSQL</h4>
                        <p className="text-[10px] text-[#777482]">Relational ORM storage</p>
                      </div>
                    </div>
                    <span className="badge-sage pastel-badge text-[10px]">Healthy</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE6E0]">
                <Link
                  href="/settings"
                  className="w-full py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-medium flex items-center justify-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5" />
                  View Security & Role Logs
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: MANAGER DASHBOARD
      ========================================================================= */}
      {role === "MANAGER" && (
        <div className="space-y-8">
          {/* Manager Banner */}
          <div className="p-6 rounded-[22px] bg-gradient-to-r from-[#DCE8D5]/40 via-[#FAF8F5] to-[#FFFDF9] border border-[#EAE6E0] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#DCE8D5] text-[#292735] border border-[#C3D7B8] flex items-center gap-1.5 shadow-xs">
                  <Briefcase className="w-3.5 h-3.5 text-[#385E30]" />
                  Engineering Delivery & Sprint Velocity Hub
                </span>
                <span className="text-xs text-[#777482]">Elena Rostova's Team Scope</span>
              </div>
              <h1 className="text-xl font-bold text-[#292735]">
                Sprint Delivery & Risk Prevention Hub
              </h1>
              <p className="text-xs text-[#777482] mt-0.5">
                Real-time developer telemetry, predictive AI velocity scores, and early delivery risk triage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/predictions"
                className="px-3.5 py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-medium hover:bg-[#34323D] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-[#DCD6F7]" />
                Generate Predictions
              </Link>
              <button
                onClick={handleTriggerAlertScan}
                disabled={isScanning}
                className="px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#EAE6E0] text-xs font-medium text-[#292735] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <AlertTriangle className={`w-3.5 h-3.5 text-[#83394C] ${isScanning ? "animate-spin" : ""}`} />
                Scan Delivery Risks
              </button>
            </div>
          </div>

          {scanMessage && (
            <div className="p-3.5 rounded-xl bg-[#F3F7F0] border border-[#DCE8D5] text-xs text-[#385E30] flex items-center justify-between">
              <span>{scanMessage}</span>
              <button onClick={() => setScanMessage(null)} className="font-bold ml-2">×</button>
            </div>
          )}

          {/* Manager KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Team Velocity</span>
                <div className="w-7 h-7 rounded-lg bg-[#DCE8D5]/60 flex items-center justify-center text-[#385E30]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">92.4%</div>
                <div className="text-[10px] text-[#385E30] font-medium mt-1">
                  +4% vs last sprint
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Avg AI Score</span>
                <div className="w-7 h-7 rounded-lg bg-[#DCD6F7]/50 flex items-center justify-center text-[#4C4472]">
                  <BrainCircuit className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">{kpis?.average_predicted_score || 87.0}%</div>
                <div className="text-[10px] text-[#777482] font-medium mt-1">
                  RandomForest model
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">On-Time Rate</span>
                <div className="w-7 h-7 rounded-lg bg-[#D8E9F7]/60 flex items-center justify-center text-[#2B577E]">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">
                  {Math.round((kpis?.on_time_delivery_rate || 0.88) * 100)}%
                </div>
                <div className="text-[10px] text-[#777482] font-medium mt-1">
                  Sprint milestones
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Needs Support</span>
                <div className="w-7 h-7 rounded-lg bg-[#F4DDE3] flex items-center justify-center text-[#83394C]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#83394C]">{kpis?.employees_requiring_support || 2}</div>
                <div className="text-[10px] text-[#83394C] font-medium mt-1">
                  1 High Risk Flagged
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Direct Reports</span>
                <div className="w-7 h-7 rounded-lg bg-[#DCD6F7]/50 flex items-center justify-center text-[#4C4472]">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">6 Engineers</div>
                <div className="text-[10px] text-[#385E30] font-medium mt-1">
                  Frontend Experience
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Sprints In Flight</span>
                <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#EAE6E0] flex items-center justify-center text-[#777482]">
                  <FolderGit2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">Sprint Q4</div>
                <div className="text-[10px] text-[#777482] font-medium mt-1">
                  5 Days Remaining
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section: Area Chart & Risk Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 pastel-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#292735]">
                    Engineering Productivity Trends
                  </h3>
                  <p className="text-xs text-[#777482]">
                    Observed score vs. Machine Learning predicted trajectory (0–100 scale)
                  </p>
                </div>
                <span className="badge-sage pastel-badge text-[10px]">
                  R² = 0.864 • MAE = 3.24
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorObserved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DCD6F7" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#DCD6F7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DCE8D5" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#DCE8D5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAE6E0" vertical={false} />
                    <XAxis dataKey="period" stroke="#777482" fontSize={11} tickLine={false} />
                    <YAxis stroke="#777482" fontSize={11} domain={[70, 95]} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFDF9",
                        borderColor: "#EAE6E0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        fontSize: "12px",
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Area
                      type="monotone"
                      dataKey="observed_score"
                      name="Observed Performance"
                      stroke="#645CBB"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorObserved)"
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted_score"
                      name="ML Prediction Forecast"
                      stroke="#385E30"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorPredicted)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Distribution Donut */}
            <div className="pastel-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-[#292735]">
                    Delivery Risk Distribution
                  </h3>
                  <span className="badge-pink pastel-badge text-[10px]">
                    {kpis?.high_risk_projects_count || 1} High Risk
                  </span>
                </div>
                <p className="text-xs text-[#777482] mb-4">
                  Categorized probability of sprint delay
                </p>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#EAE6E0" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFDF9",
                          borderColor: "#EAE6E0",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#EAE6E0]/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-[#777482]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DCE8D5]" />
                    Low Delivery Risk
                  </span>
                  <span className="font-semibold text-[#292735]">{riskData?.low_risk || 11}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-[#777482]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F7E1D0]" />
                    Medium Delivery Risk
                  </span>
                  <span className="font-semibold text-[#292735]">{riskData?.medium_risk || 3}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-[#777482]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F4DDE3]" />
                    High Delivery Risk
                  </span>
                  <span className="font-semibold text-[#83394C]">{riskData?.high_risk || 2}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Manager Early Warnings Panel & Direct Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="pastel-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#292735] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#83394C]" />
                    Urgent Early Warnings
                  </h3>
                  <p className="text-xs text-[#777482]">Risk alerts requiring manager acknowledgment</p>
                </div>
                <Link
                  href="/early-warnings"
                  className="text-xs text-[#4C4472] font-semibold hover:underline flex items-center gap-1"
                >
                  Alerts Triage <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-3.5 rounded-xl border border-[#EAE6E0] bg-[#FAF8F5]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="pastel-badge text-[10px] badge-pink">{alert.severity} Severity</span>
                      <span className="text-[10px] text-[#777482]">{alert.supporting_metric}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#292735]">{alert.title}</h4>
                    <p className="text-[11px] text-[#777482] mt-1">{alert.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pastel-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#292735] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#4C4472]" />
                    Direct Reports Velocity Spotlight
                  </h3>
                  <p className="text-xs text-[#777482]">Active engineers under your supervision</p>
                </div>
                <Link
                  href="/employees"
                  className="text-xs text-[#4C4472] font-semibold hover:underline flex items-center gap-1"
                >
                  Team Directory <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-[#EAE6E0]/60">
                {employees.map((emp) => (
                  <div key={emp.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#D8E9F7] text-[#2B577E] flex items-center justify-center text-xs font-bold">
                        {emp.name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#292735]">{emp.name}</h4>
                        <p className="text-[11px] text-[#777482]">{emp.role_title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#292735]">{emp.current_score}%</div>
                      <span className="pastel-badge text-[9px] badge-sage">{emp.risk_level} Risk</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: DEVELOPER DASHBOARD (DEV / ALEX CHEN)
      ========================================================================= */}
      {role === "EMPLOYEE" && (
        <div className="space-y-8">
          {/* Developer Banner */}
          <div className="p-6 rounded-[22px] bg-gradient-to-r from-[#D8E9F7]/40 via-[#FAF8F5] to-[#FFFDF9] border border-[#EAE6E0] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#D8E9F7] text-[#292735] border border-[#BBDDF7] flex items-center gap-1.5 shadow-xs">
                  <UserIcon className="w-3.5 h-3.5 text-[#2B577E]" />
                  Developer Portal • Alex Chen
                </span>
                <span className="text-xs text-[#777482]">Frontend Experience Squad</span>
              </div>
              <h1 className="text-xl font-bold text-[#292735]">
                Welcome back, Alex! Here is your sprint velocity overview.
              </h1>
              <p className="text-xs text-[#777482] mt-0.5">
                Track your active sprint tasks, personal AI performance telemetry, and manager reviews.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/tasks-activity"
                className="px-3.5 py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-medium hover:bg-[#34323D] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckSquare className="w-3.5 h-3.5 text-[#D8E9F7]" />
                My Sprint Kanban
              </Link>
              <Link
                href="/feedback"
                className="px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#EAE6E0] text-xs font-medium text-[#292735] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Award className="w-3.5 h-3.5 text-[#645CBB]" />
                My Growth Goals
              </Link>
            </div>
          </div>

          {/* Developer Personal KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">My AI Score</span>
                <div className="w-7 h-7 rounded-lg bg-[#DCE8D5] flex items-center justify-center text-[#385E30]">
                  <BrainCircuit className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">87.4%</div>
                <div className="text-[10px] text-[#385E30] font-medium mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  High Outlook • Low Risk
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Sprint Tasks</span>
                <div className="w-7 h-7 rounded-lg bg-[#D8E9F7]/60 flex items-center justify-center text-[#2B577E]">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">{devTasks.length || 4} Tasks</div>
                <div className="text-[10px] text-[#777482] font-medium mt-1">
                  2 In Progress • 1 In Review
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">On-Time Rate</span>
                <div className="w-7 h-7 rounded-lg bg-[#DCE8D5]/60 flex items-center justify-center text-[#385E30]">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#385E30]">94.0%</div>
                <div className="text-[10px] text-[#777482] font-medium mt-1">
                  Target: &gt; 85%
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Review Speed</span>
                <div className="w-7 h-7 rounded-lg bg-[#DCD6F7]/50 flex items-center justify-center text-[#4C4472]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">1.8 hrs</div>
                <div className="text-[10px] text-[#385E30] font-medium mt-1">
                  Top 10% on Team
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Weekly Commits</span>
                <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#EAE6E0] flex items-center justify-center text-[#777482]">
                  <GitCommit className="w-3.5 h-3.5 text-[#645CBB]" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292735]">28 Commits</div>
                <div className="text-[10px] text-[#777482] font-medium mt-1">
                  Across 3 Repos
                </div>
              </div>
            </div>

            <div className="pastel-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#777482] mb-2">
                <span className="text-[11px] font-medium">Goal Progress</span>
                <div className="w-7 h-7 rounded-lg bg-[#DCE8D5] flex items-center justify-center text-[#385E30]">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#385E30]">75%</div>
                <div className="text-[10px] text-[#777482] font-medium mt-1">
                  Sprint Q4 Milestone
                </div>
              </div>
            </div>
          </div>

          {/* Developer Tasks List & AI Attribution Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Tasks Widget */}
            <div className="pastel-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#292735] flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#2B577E]" />
                    My Active Sprint Tasks
                  </h3>
                  <p className="text-xs text-[#777482]">Update status directly as you complete work</p>
                </div>
                <Link
                  href="/tasks-activity"
                  className="text-xs text-[#2B577E] font-semibold hover:underline"
                >
                  All Tasks →
                </Link>
              </div>

              <div className="space-y-3">
                {devTasks.map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl border border-[#EAE6E0] bg-[#FAF8F5] space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[#292735]">{t.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFFDF9] border border-[#EAE6E0]">
                        {t.story_points} SP
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#777482]">
                        Status: <strong className="text-[#292735]">{t.status.replace("_", " ")}</strong>
                      </span>
                      <div className="flex items-center gap-1">
                        {["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"].map((st) => (
                          <button
                            key={st}
                            disabled={updatingTaskId === t.id}
                            onClick={() => handleUpdateTaskStatus(t.id, st)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all ${
                              t.status === st
                                ? "bg-[#292735] text-[#FFFDF9]"
                                : "bg-[#FFFDF9] text-[#777482] border border-[#EAE6E0] hover:bg-[#EAE6E0]"
                            }`}
                          >
                            {st === "IN_PROGRESS" ? "PROG" : st === "IN_REVIEW" ? "REV" : st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Performance Factors & Manager Review */}
            <div className="space-y-6">
              <div className="pastel-card p-6 space-y-3">
                <h3 className="text-sm font-semibold text-[#292735] flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-[#4C4472]" />
                  What Is Driving My Score? (AI Factors)
                </h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#F3F7F0] border border-[#DCE8D5] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-[#385E30]">+12.0 pts • High Commit Cadence</h4>
                      <p className="text-[11px] text-[#777482]">Consistent tested contributions across 3 repositories.</p>
                    </div>
                    <span className="badge-sage pastel-badge text-[10px]">Strength</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F3F7F0] border border-[#DCE8D5] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-[#385E30]">+9.0 pts • Rapid Code Review Turnaround</h4>
                      <p className="text-[11px] text-[#777482]">Providing constructive peer feedback in &lt; 2 hours.</p>
                    </div>
                    <span className="badge-sage pastel-badge text-[10px]">Strength</span>
                  </div>
                </div>
              </div>

              <div className="pastel-card p-6 space-y-3">
                <h3 className="text-sm font-semibold text-[#292735] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#645CBB]" />
                  Manager Review & Feedback
                </h3>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]">
                  <p className="text-xs text-[#4C4472] italic">
                    "Alex has consistently delivered high-quality front-end components and led the Next.js migration with excellence."
                  </p>
                  <p className="text-[10px] text-[#777482] mt-2 font-medium">
                    — Elena Rostova, Engineering Manager • Sprint Q4
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
