"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  ExternalLink,
  BrainCircuit,
  AlertTriangle,
  Clock,
  CheckCircle2,
  GitCommit,
  GitPullRequest,
  Target,
  Sparkles,
  X,
  FileSpreadsheet,
  Shield,
  Briefcase,
  User as UserIcon,
  MessageSquare,
  Award,
  ChevronRight,
  TrendingUp,
  FolderGit2,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function EmployeesPage() {
  const { role, user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedRisk, setSelectedRisk] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeEmployeeId, setActiveEmployeeId] = useState<number | null>(null);
  const [employeeDetail, setEmployeeDetail] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Developer (Alex Chen) specific state
  const [devTab, setDevTab] = useState<"tasks" | "predictions" | "feedback" | "squad">("tasks");
  const [devTasks, setDevTasks] = useState<any[]>([]);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    employee_code: "",
    name: "",
    email: "",
    role_title: "Frontend Engineer",
    team_id: 1,
    experience_level: "Mid",
    skills: "Next.js, TypeScript, Tailwind",
  });

  useEffect(() => {
    loadEmployees();
    api.getTeams().then(setTeams).catch(console.error);
    // Load Alex Chen's tasks (assignee_id = 2) for Dev View
    api.getTasks({ assignee_id: 2 }).then(setDevTasks).catch(console.error);
  }, [selectedTeam, selectedRisk, searchQuery]);

  const loadEmployees = async () => {
    try {
      const params: any = {};
      if (selectedTeam) params.team_id = Number(selectedTeam);
      if (selectedRisk) params.risk_level = selectedRisk;
      if (searchQuery) params.search = searchQuery;
      const res = await api.getEmployees(params);
      setEmployees(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (id: number) => {
    setActiveEmployeeId(id);
    setActiveTab("overview");
    setDetailLoading(true);
    try {
      const detail = await api.getEmployeeDetail(id);
      setEmployeeDetail(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createEmployee({
        ...newEmp,
        skills: JSON.stringify(newEmp.skills.split(",").map((s) => s.trim())),
        team_id: Number(newEmp.team_id),
      });
      setShowAddModal(false);
      loadEmployees();
    } catch (err: any) {
      alert(err.message || "Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      await api.updateTask(taskId, { status: newStatus });
      const updated = await api.getTasks({ assignee_id: 2 });
      setDevTasks(updated);
    } catch (err) {
      console.error("Failed to update task", err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Find Alex Chen (emp ID 2) for developer view
  const alexChen = employees.find((e) => e.id === 2 || e.email?.includes("alex")) || {
    id: 2,
    name: "Alex Chen",
    email: "alex.chen@epms.dev",
    employee_code: "EMP-102",
    role_title: "Senior Frontend Engineer",
    team_name: "Frontend Experience",
    experience_level: "Senior",
    current_score: 87.4,
    risk_level: "Low",
    productivity_outlook: "High",
    skills: JSON.stringify(["Next.js", "TypeScript", "Tailwind CSS", "Architecture", "Design Systems"]),
  };

  // Teammates for squad view
  const squadTeammates = employees.filter((e) => e.team_name === "Frontend Experience" && e.id !== 2);

  // Direct reports for Manager (Elena Rostova's team)
  const managerDirectReports = employees.filter(
    (e) => e.team_name === "Frontend Experience" || e.manager_name === "Elena Rostova" || e.id <= 6
  );

  return (
    <div className="space-y-6">
      {/* =========================================================================
          ROLE-SPECIFIC HEADER & SUMMARY
      ========================================================================= */}

      {/* 1. ADMIN VIEW HEADER */}
      {role === "ADMIN" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#DCD6F7]/40 via-[#FAF8F5] to-[#FFFDF9] border border-[#EAE6E0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#DCD6F7] text-[#292735] border border-[#C5BDEB] flex items-center gap-1.5 shadow-xs">
                  <Shield className="w-3 h-3 text-[#4C4472]" />
                  Administrator Scope • Full HR Governance
                </span>
                <span className="text-xs text-[#777482]">All Engineering Organizations</span>
              </div>
              <h1 className="text-xl font-bold text-[#292735]">Engineering Directory (Admin Governance)</h1>
              <p className="text-xs text-[#777482] mt-0.5">
                Organization-wide employee management, directory administration, credential provisioning, and CSV export.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href={api.exportEmployeesCSVUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#EAE6E0] text-xs font-medium text-[#292735] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#777482]" />
                Export CSV
              </a>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-medium hover:bg-[#34323D] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-[#DCD6F7]" />
                Add Engineer
              </button>
            </div>
          </div>

          {/* Admin Metric Overview Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="pastel-card p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#777482] font-semibold uppercase">Total Engineers</p>
                <p className="text-lg font-bold text-[#292735]">{employees.length || 16}</p>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[#DCD6F7]/50 flex items-center justify-center text-[#4C4472]">
                <Users className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="pastel-card p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#777482] font-semibold uppercase">Active Teams</p>
                <p className="text-lg font-bold text-[#292735]">{teams.length || 4}</p>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[#DCE8D5]/60 flex items-center justify-center text-[#385E30]">
                <FolderGit2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="pastel-card p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#777482] font-semibold uppercase">Admin Access</p>
                <p className="text-lg font-bold text-[#385E30]">Read / Write</p>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[#DCE8D5] flex items-center justify-center text-[#385E30]">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="pastel-card p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#777482] font-semibold uppercase">Audit Logging</p>
                <p className="text-lg font-bold text-[#292735]">Active</p>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#EAE6E0] flex items-center justify-center text-[#777482]">
                <Sparkles className="w-3.5 h-3.5 text-[#645CBB]" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANAGER VIEW HEADER */}
      {role === "MANAGER" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#DCE8D5]/40 via-[#FAF8F5] to-[#FFFDF9] border border-[#EAE6E0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#DCE8D5] text-[#292735] border border-[#C3D7B8] flex items-center gap-1.5 shadow-xs">
                  <Briefcase className="w-3 h-3 text-[#385E30]" />
                  Engineering Manager • Elena Rostova
                </span>
                <span className="text-xs text-[#777482]">Team: Frontend Experience & Direct Reports</span>
              </div>
              <h1 className="text-xl font-bold text-[#292735]">Team Management Directory</h1>
              <p className="text-xs text-[#777482] mt-0.5">
                Monitor your direct reports' velocity trends, triage delivery risks, review assigned sprint tasks, and schedule 1-on-1s.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href={api.exportEmployeesCSVUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#EAE6E0] text-xs font-medium text-[#292735] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#777482]" />
                Export Team Roster
              </a>
              <a
                href="/feedback"
                className="px-3.5 py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-medium hover:bg-[#34323D] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#DCE8D5]" />
                Give 1-on-1 Feedback
              </a>
            </div>
          </div>

          {/* Manager Metric Overview Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="pastel-card p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#777482] font-semibold uppercase">Direct Reports</p>
                <p className="text-lg font-bold text-[#292735]">6 Engineers</p>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[#DCE8D5]/60 flex items-center justify-center text-[#385E30]">
                <Users className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="pastel-card p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#777482] font-semibold uppercase">Team Velocity</p>
                <p className="text-lg font-bold text-[#385E30]">89.2%</p>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[#DCE8D5] flex items-center justify-center text-[#385E30]">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="pastel-card p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#777482] font-semibold uppercase">Risk Triage</p>
                <p className="text-lg font-bold text-[#83394C]">1 High Risk</p>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[#F4DDE3] flex items-center justify-center text-[#83394C]">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="pastel-card p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#777482] font-semibold uppercase">Reviews Due</p>
                <p className="text-lg font-bold text-[#292735]">2 Engineers</p>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#EAE6E0] flex items-center justify-center text-[#777482]">
                <Clock className="w-3.5 h-3.5 text-[#8C552A]" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. DEVELOPER (DEV) VIEW HEADER & HERO DOSSIER */}
      {role === "EMPLOYEE" && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#D8E9F7]/40 via-[#FAF8F5] to-[#FFFDF9] border border-[#EAE6E0]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#D8E9F7] text-[#292735] border border-[#BBDDF7] flex items-center gap-1.5 shadow-xs">
                    <UserIcon className="w-3 h-3 text-[#2B577E]" />
                    Developer Portal • Personal Engineering Dossier
                  </span>
                  <span className="text-xs text-[#777482]">Active Engineer: Alex Chen (Senior Frontend)</span>
                </div>
                <h1 className="text-xl font-bold text-[#292735]">My Developer Profile & Squad View</h1>
                <p className="text-xs text-[#777482] mt-0.5">
                  Your personalized engineering performance telemetry, sprint tasks in flight, AI productivity factors, and team colleagues.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/tasks-activity"
                  className="px-3.5 py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-medium hover:bg-[#34323D] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D8E9F7]" />
                  Open Sprint Kanban
                </a>
              </div>
            </div>
          </div>

          {/* Developer Hero Spotlight Card */}
          <div className="pastel-card p-6 bg-gradient-to-b from-[#FFFDF9] to-[#FAF8F5]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#EAE6E0]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#D8E9F7] text-[#2B577E] flex items-center justify-center text-xl font-bold border border-[#BBDDF7] shadow-sm shrink-0">
                  AC
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#292735]">{alexChen.name}</h2>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#DCD6F7] text-[#4C4472]">
                      {alexChen.employee_code}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#DCE8D5] text-[#385E30]">
                      {alexChen.experience_level}
                    </span>
                  </div>
                  <p className="text-xs text-[#777482] mt-0.5">
                    {alexChen.role_title} • Team: <span className="font-semibold text-[#292735]">{alexChen.team_name}</span> (Manager: Elena Rostova)
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Next.js", "TypeScript", "Tailwind CSS", "Architecture", "Design Systems"].map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EAE6E0] text-[#4C4472] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Large Score Metric Badge */}
              <div className="flex items-center gap-4 bg-[#FFFDF9] p-4 rounded-xl border border-[#EAE6E0]">
                <div>
                  <span className="text-[10px] text-[#777482] font-semibold uppercase block">My AI Performance Score</span>
                  <div className="text-3xl font-extrabold text-[#292735] flex items-center gap-1.5">
                    {alexChen.current_score}%
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#DCE8D5] text-[#385E30] font-semibold">
                      Low Risk
                    </span>
                  </div>
                  <span className="text-[10px] text-[#385E30] font-medium flex items-center gap-1 mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +3.2% vs previous sprint • High Outlook
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Developer Telemetry Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]/80">
                <span className="text-[10px] text-[#777482] font-semibold uppercase block">Weekly Commits</span>
                <span className="text-base font-bold text-[#292735]">28 Commits</span>
                <span className="text-[10px] text-[#385E30] block">Across 3 repositories</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]/80">
                <span className="text-[10px] text-[#777482] font-semibold uppercase block">PRs Merged</span>
                <span className="text-base font-bold text-[#292735]">6 Pull Requests</span>
                <span className="text-[10px] text-[#385E30] block">0 merge conflicts</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]/80">
                <span className="text-[10px] text-[#777482] font-semibold uppercase block">On-Time Delivery</span>
                <span className="text-base font-bold text-[#385E30]">94.0%</span>
                <span className="text-[10px] text-[#777482] block">Target: &gt; 85%</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]/80">
                <span className="text-[10px] text-[#777482] font-semibold uppercase block">Review Response</span>
                <span className="text-base font-bold text-[#292735]">1.8 Hours</span>
                <span className="text-[10px] text-[#385E30] block">Top 10% on team</span>
              </div>
            </div>
          </div>

          {/* Developer Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#EAE6E0] pb-2">
            <button
              onClick={() => setDevTab("tasks")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                devTab === "tasks" ? "bg-[#292735] text-[#FFFDF9]" : "text-[#777482] hover:bg-[#FAF8F5]"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              My Assigned Sprint Tasks ({devTasks.length || 4})
            </button>
            <button
              onClick={() => setDevTab("predictions")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                devTab === "predictions" ? "bg-[#292735] text-[#FFFDF9]" : "text-[#777482] hover:bg-[#FAF8F5]"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              My AI Factors & Strengths
            </button>
            <button
              onClick={() => setDevTab("feedback")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                devTab === "feedback" ? "bg-[#292735] text-[#FFFDF9]" : "text-[#777482] hover:bg-[#FAF8F5]"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Manager Feedback & Goals
            </button>
            <button
              onClick={() => setDevTab("squad")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                devTab === "squad" ? "bg-[#292735] text-[#FFFDF9]" : "text-[#777482] hover:bg-[#FAF8F5]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              My Squad Colleagues ({squadTeammates.length || 3})
            </button>
          </div>

          {/* Dev Tab 1: My Sprint Tasks */}
          {devTab === "tasks" && (
            <div className="pastel-card p-5 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-bold text-[#292735] uppercase tracking-wider">Active Sprint Tasks</h3>
                  <p className="text-[11px] text-[#777482]">Update status directly as you progress through development</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#DCE8D5] text-[#385E30] font-semibold">
                  Sprint Q4
                </span>
              </div>

              <div className="divide-y divide-[#EAE6E0]">
                {devTasks.map((t) => (
                  <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                            t.priority === "High"
                              ? "bg-[#F4DDE3] text-[#83394C]"
                              : t.priority === "Medium"
                              ? "bg-[#F7E1D0] text-[#8C552A]"
                              : "bg-[#DCE8D5] text-[#385E30]"
                          }`}
                        >
                          {t.priority}
                        </span>
                        <h4 className="text-xs font-semibold text-[#292735]">{t.title}</h4>
                      </div>
                      <div className="text-[11px] text-[#777482] flex items-center gap-3">
                        <span>Points: <strong className="text-[#292735]">{t.story_points} SP</strong></span>
                        <span>Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : "Next Friday"}</span>
                      </div>
                    </div>

                    {/* Status Pill & Transitions */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-[10px] font-semibold text-[#777482] mr-1">Status:</span>
                      {["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"].map((st) => (
                        <button
                          key={st}
                          disabled={updatingTaskId === t.id}
                          onClick={() => handleUpdateTaskStatus(t.id, st)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                            t.status === st
                              ? "bg-[#292735] text-[#FFFDF9] shadow-xs"
                              : "bg-[#FAF8F5] text-[#777482] border border-[#EAE6E0] hover:bg-[#EAE6E0]"
                          }`}
                        >
                          {st.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dev Tab 2: My AI Factors */}
          {devTab === "predictions" && (
            <div className="pastel-card p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-[#292735] uppercase tracking-wider">AI Performance Factor Attribution</h3>
                <p className="text-[11px] text-[#777482]">
                  Explainable factors calculated by the Random Forest model affecting your score
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-[#DCE8D5] bg-[#F3F7F0] flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#385E30] uppercase">Positive Factor (+12.0 pts)</span>
                    <h4 className="text-xs font-semibold text-[#292735] mt-0.5">High Commit Velocity & Clean Merges</h4>
                    <p className="text-[11px] text-[#777482]">
                      Consistently contributing tested commits across design system and Next.js repositories.
                    </p>
                  </div>
                  <span className="badge-sage pastel-badge text-[10px] shrink-0">Positive Driver</span>
                </div>

                <div className="p-3 rounded-xl border border-[#DCE8D5] bg-[#F3F7F0] flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#385E30] uppercase">Positive Factor (+9.0 pts)</span>
                    <h4 className="text-xs font-semibold text-[#292735] mt-0.5">Rapid Code Review Turnaround</h4>
                    <p className="text-[11px] text-[#777482]">
                      Providing thorough and constructive feedback on peer pull requests within 2 hours.
                    </p>
                  </div>
                  <span className="badge-sage pastel-badge text-[10px] shrink-0">Positive Driver</span>
                </div>

                <div className="p-3 rounded-xl border border-[#F7E1D0] bg-[#FAF5EE] flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#8C552A] uppercase">Minor Variance (-3.0 pts)</span>
                    <h4 className="text-xs font-semibold text-[#292735] mt-0.5">Estimation Accuracy on Complex Tasks</h4>
                    <p className="text-[11px] text-[#777482]">
                      Slight story point variance on architectural refactors; breaking down tickets will improve prediction.
                    </p>
                  </div>
                  <span className="badge-peach pastel-badge text-[10px] shrink-0">Improvement</span>
                </div>
              </div>
            </div>
          )}

          {/* Dev Tab 3: Feedback & Goals */}
          {devTab === "feedback" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="pastel-card p-5 space-y-3">
                <h3 className="text-xs font-bold text-[#292735] uppercase tracking-wider">Latest Manager Review</h3>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292735]">Elena Rostova (Engineering Manager)</span>
                    <span className="text-[10px] text-[#777482]">Sprint Q4 Review</span>
                  </div>
                  <p className="text-xs text-[#4C4472] italic">
                    "Alex has consistently delivered high-quality front-end components and led the Next.js migration with excellence. Very dependable sprint velocity and great mentorship to mid-level engineers."
                  </p>
                </div>
              </div>

              <div className="pastel-card p-5 space-y-3">
                <h3 className="text-xs font-bold text-[#292735] uppercase tracking-wider">My Active Growth Goals</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#292735]">Achieve 95% Unit Test Coverage on UI Components</span>
                      <span className="font-bold text-[#385E30]">80%</span>
                    </div>
                    <div className="w-full bg-[#EAE6E0] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#385E30] h-full rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#292735]">Conduct 3 Architecture Knowledge Sharing Sessions</span>
                      <span className="font-bold text-[#645CBB]">66%</span>
                    </div>
                    <div className="w-full bg-[#EAE6E0] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#645CBB] h-full rounded-full" style={{ width: "66%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dev Tab 4: Squad Colleagues */}
          {devTab === "squad" && (
            <div className="pastel-card p-5 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-xs font-bold text-[#292735] uppercase tracking-wider">Frontend Experience Squad</h3>
                  <p className="text-[11px] text-[#777482]">Your fellow engineering teammates and direct collaborators</p>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#DCD6F7] text-[#292735] font-semibold">
                  Team #1
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {squadTeammates.map((mate) => (
                  <div key={mate.id} className="p-3.5 rounded-xl border border-[#EAE6E0] bg-[#FAF8F5] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#DCD6F7] text-[#4C4472] flex items-center justify-center text-xs font-bold">
                        {mate.name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#292735]">{mate.name}</h4>
                        <p className="text-[10px] text-[#777482]">{mate.role_title}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFFDF9] border border-[#EAE6E0] text-[#385E30]">
                      {mate.current_score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          COMMON DIRECTORY TABLE (FOR ADMIN & MANAGER ONLY)
      ========================================================================= */}
      {role !== "EMPLOYEE" && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="pastel-card p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#777482] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, code, or email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#EAE6E0] focus:outline-none focus:border-[#DCD6F7] text-[#34323D]"
              />
            </div>

            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
            >
              <option value="">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
            >
              <option value="">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

          {/* Employees Table */}
          <div className="pastel-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EAE6E0] bg-[#FAF8F5]/60 text-[11px] font-semibold text-[#777482] uppercase tracking-wider">
                    <th className="py-3 px-4">Engineer</th>
                    <th className="py-3 px-4">ID / Title</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Outlook</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE6E0]/60 text-xs">
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => handleOpenDetail(emp.id)}
                      className="hover:bg-[#FAF8F5]/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#D8E9F7] text-[#2B577E] flex items-center justify-center text-xs font-bold shrink-0">
                            {emp.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <div>
                            <div className="font-semibold text-[#292735]">{emp.name}</div>
                            <div className="text-[11px] text-[#777482]">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#292735]">{emp.employee_code}</div>
                        <div className="text-[11px] text-[#777482]">{emp.role_title}</div>
                      </td>
                      <td className="py-3 px-4 text-[#777482]">{emp.team_name}</td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium text-[#4C4472] px-2 py-0.5 rounded-md bg-[#DCD6F7]/40">
                          {emp.experience_level}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#292735] text-sm">{emp.current_score}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`pastel-badge text-[10px] ${
                            emp.risk_level === "Low"
                              ? "badge-sage"
                              : emp.risk_level === "Medium"
                              ? "badge-peach"
                              : "badge-pink"
                          }`}
                        >
                          {emp.risk_level} Risk
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-[#777482] font-medium">
                          {emp.productivity_outlook}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(emp.id);
                          }}
                          className="text-xs font-semibold text-[#645CBB] hover:underline"
                        >
                          {role === "ADMIN" ? "Administer →" : "Review →"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EMPLOYEE DETAIL MODAL (FOR ADMIN & MANAGER)
      ========================================================================= */}
      {activeEmployeeId && employeeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
          <div className="bg-[#FFFDF9] border border-[#EAE6E0] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EAE6E0] flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#D8E9F7] text-[#2B577E] flex items-center justify-center text-lg font-bold">
                  {employeeDetail.employee.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#292735]">{employeeDetail.employee.name}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#DCD6F7] text-[#4C4472]">
                      {employeeDetail.employee.employee_code}
                    </span>
                  </div>
                  <p className="text-xs text-[#777482]">
                    {employeeDetail.employee.role_title} • {employeeDetail.employee.team_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveEmployeeId(null)}
                className="p-2 rounded-xl text-[#777482] hover:bg-[#EAE6E0] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="pastel-card p-3 text-center">
                  <span className="text-[10px] text-[#777482] font-semibold uppercase">Current Score</span>
                  <p className="text-xl font-bold text-[#292735]">{employeeDetail.employee.current_score}%</p>
                </div>
                <div className="pastel-card p-3 text-center">
                  <span className="text-[10px] text-[#777482] font-semibold uppercase">Delivery Risk</span>
                  <p className="text-sm font-bold text-[#83394C]">{employeeDetail.employee.risk_level} Risk</p>
                </div>
                <div className="pastel-card p-3 text-center">
                  <span className="text-[10px] text-[#777482] font-semibold uppercase">Outlook</span>
                  <p className="text-sm font-bold text-[#385E30]">{employeeDetail.employee.productivity_outlook}</p>
                </div>
              </div>

              {/* Tasks List */}
              <div className="pastel-card p-4">
                <h4 className="text-xs font-bold text-[#292735] mb-2 uppercase">Assigned Tasks ({employeeDetail.tasks?.length || 0})</h4>
                <div className="space-y-2">
                  {employeeDetail.tasks?.slice(0, 4).map((t: any) => (
                    <div key={t.id} className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EAE6E0] flex items-center justify-between text-xs">
                      <span>{t.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFFDF9] font-semibold">{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD ENGINEER MODAL (ADMIN ONLY)
      ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
          <div className="bg-[#FFFDF9] border border-[#EAE6E0] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE6E0] pb-3">
              <h3 className="font-bold text-sm text-[#292735]">Provision New Engineer (Admin)</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded text-[#777482] hover:bg-[#FAF8F5]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#777482] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]"
                  placeholder="e.g. Liam Anderson"
                />
              </div>
              <div>
                <label className="block text-[#777482] mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                  className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]"
                  placeholder="liam.anderson@epms.dev"
                />
              </div>
              <div>
                <label className="block text-[#777482] mb-1 font-medium">Employee Code</label>
                <input
                  type="text"
                  required
                  value={newEmp.employee_code}
                  onChange={(e) => setNewEmp({ ...newEmp, employee_code: e.target.value })}
                  className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]"
                  placeholder="EMP-501"
                />
              </div>
              <div>
                <label className="block text-[#777482] mb-1 font-medium">Job Title</label>
                <input
                  type="text"
                  required
                  value={newEmp.role_title}
                  onChange={(e) => setNewEmp({ ...newEmp, role_title: e.target.value })}
                  className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#EAE6E0] text-[#777482]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-xl bg-[#292735] text-[#FFFDF9] font-medium"
                >
                  {isSubmitting ? "Saving..." : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
