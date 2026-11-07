"use client";

import React, { useEffect, useState } from "react";
import {
  FolderGit2,
  Users,
  Plus,
  ExternalLink,
  Smartphone,
  Globe,
  Clock,
  AlertTriangle,
  TrendingUp,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

export default function TeamsProjectsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<"projects" | "teams">("projects");
  const [loading, setLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    code: "",
    project_type: "Web",
    tech_stack: "Next.js, FastAPI, PostgreSQL",
    client_name: "",
    repo_url: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tRes, pRes] = await Promise.all([api.getTeams(), api.getProjects()]);
      setTeams(tRes);
      setProjects(pRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProject(newProject);
      setShowNewProjectModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create project");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#292735]">Teams & Projects</h1>
          <p className="text-xs text-[#777482] mt-0.5">
            Manage multi-platform engineering projects (Web & Mobile Apps) and team capacity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE6E0]">
            <button
              onClick={() => setActiveSection("projects")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSection === "projects"
                  ? "bg-[#DCD6F7] text-[#292735] shadow-xs"
                  : "text-[#777482] hover:text-[#34323D]"
              }`}
            >
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveSection("teams")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSection === "teams"
                  ? "bg-[#DCD6F7] text-[#292735] shadow-xs"
                  : "text-[#777482] hover:text-[#34323D]"
              }`}
            >
              Teams ({teams.length})
            </button>
          </div>

          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-medium hover:bg-[#34323D] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#DCD6F7]" />
            New Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {activeSection === "projects" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const completionPct =
              proj.task_count > 0
                ? Math.round((proj.completed_task_count / proj.task_count) * 100)
                : 0;

            return (
              <div key={proj.id} className="pastel-card p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`pastel-badge text-[10px] ${
                        proj.project_type === "Mobile" ? "badge-peach" : "badge-blue"
                      }`}
                    >
                      {proj.project_type === "Mobile" ? (
                        <Smartphone className="w-3 h-3" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                      {proj.project_type} App
                    </span>
                    <span
                      className={`pastel-badge text-[10px] ${
                        proj.delivery_risk === "High"
                          ? "badge-pink"
                          : proj.delivery_risk === "Medium"
                          ? "badge-peach"
                          : "badge-sage"
                      }`}
                    >
                      {proj.delivery_risk} Delivery Risk
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#292735]">{proj.name}</h3>
                  <p className="text-[11px] text-[#777482] line-clamp-2 mt-1">{proj.description}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#EAE6E0]/60">
                  <div className="text-[11px] text-[#777482]">
                    <span className="font-semibold text-[#292735]">Stack: </span>
                    {proj.tech_stack}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-[#777482] mb-1">
                      <span>Milestone Progress</span>
                      <span className="text-[#292735] font-bold">{completionPct}%</span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] h-2 rounded-full overflow-hidden border border-[#EAE6E0]">
                      <div
                        className="bg-[#DCD6F7] h-full rounded-full transition-all"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#777482] pt-1">
                    <span>
                      {proj.completed_task_count} / {proj.task_count} tasks completed
                    </span>
                    <span className="flex items-center gap-1 text-[#83394C] font-semibold">
                      {proj.due_date ? `${Math.round(proj.risk_probability * 100)}% slip prob` : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Teams Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((t) => (
            <div key={t.id} className="pastel-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#292735]">{t.name}</h3>
                  <p className="text-xs text-[#777482]">{t.department} • Manager: {t.manager_name}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#292735]">{t.average_score}%</div>
                  <div className="text-[10px] text-[#777482]">Avg Velocity Score</div>
                </div>
              </div>

              <p className="text-xs text-[#777482]">{t.description}</p>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EAE6E0]/60 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]">
                  <span className="text-[10px] text-[#777482]">Engineers</span>
                  <div className="text-base font-bold text-[#292735] mt-0.5">{t.member_count}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]">
                  <span className="text-[10px] text-[#777482]">Target Velocity</span>
                  <div className="text-base font-bold text-[#385E30] mt-0.5">{t.target_velocity} SP/Sprint</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-[#292735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-[22px] border border-[#EAE6E0] w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EAE6E0] pb-3">
              <h3 className="font-bold text-[#292735] text-sm">Create New Project</h3>
              <button onClick={() => setShowNewProjectModal(false)} className="text-[#777482]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#777482] font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Android Customer Mobile App"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#777482] font-medium mb-1">Project Code</label>
                  <input
                    type="text"
                    required
                    placeholder="AND"
                    value={newProject.code}
                    onChange={(e) => setNewProject({ ...newProject, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#777482] font-medium mb-1">Type</label>
                  <select
                    value={newProject.project_type}
                    onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value })}
                    className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                  >
                    <option value="Web">Web Application</option>
                    <option value="Mobile">Mobile (iOS / Android)</option>
                    <option value="Fullstack">Fullstack Platform</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#777482] font-medium mb-1">Tech Stack</label>
                <input
                  type="text"
                  value={newProject.tech_stack}
                  onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })}
                  className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#EAE6E0] text-[#777482]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#292735] text-[#FFFDF9] font-medium"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
