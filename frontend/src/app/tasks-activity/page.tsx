"use client";

import React, { useEffect, useState } from "react";
import {
  CheckSquare,
  GitCommit,
  GitPullRequest,
  Clock,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

export default function TasksActivityPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    task_key: "",
    title: "",
    project_id: 1,
    assignee_id: 1,
    priority: "Medium",
    story_points: 3,
    estimated_hours: 8,
  });

  useEffect(() => {
    loadTasks();
    api.getProjects().then(setProjects).catch(console.error);
    api.getEmployees().then(setEmployees).catch(console.error);
  }, [selectedProject, selectedStatus]);

  const loadTasks = async () => {
    try {
      const params: any = {};
      if (selectedProject) params.project_id = Number(selectedProject);
      if (selectedStatus) params.status = selectedStatus;
      const res = await api.getTasks(params);
      setTasks(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const proj = projects.find((p) => p.id === Number(newTask.project_id));
      const key = newTask.task_key || `${proj?.code || "TASK"}-${Date.now().toString().slice(-4)}`;
      await api.createTask({
        ...newTask,
        task_key: key,
        project_id: Number(newTask.project_id),
        assignee_id: Number(newTask.assignee_id),
        story_points: Number(newTask.story_points),
        estimated_hours: Number(newTask.estimated_hours),
      });
      setShowNewTaskModal(false);
      loadTasks();
    } catch (err: any) {
      alert(err.message || "Failed to create task");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#292735] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#4C4472]" />
            Tasks & Engineering Activity
          </h1>
          <p className="text-xs text-[#777482] mt-0.5">
            Sprint ticket tracking, story point estimations, and developer activity feed.
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-3.5 py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-medium hover:bg-[#34323D] transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-[#DCD6F7]" />
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="pastel-card p-4 flex flex-wrap items-center gap-3">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.code})
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="COMPLETED">Completed</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      {/* Tasks Table */}
      <div className="pastel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAE6E0] bg-[#FAF8F5]/60 text-[11px] font-semibold text-[#777482] uppercase tracking-wider">
                <th className="py-3 px-4">Task Key</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Hours (Est / Act)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6E0]/60 text-xs">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#4C4472]">{t.task_key}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#292735]">{t.title}</div>
                    <div className="text-[10px] text-[#777482]">Priority: {t.priority}</div>
                  </td>
                  <td className="py-3 px-4 text-[#777482]">{t.project_name}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-[#292735]">{t.assignee_name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EAE6E0] font-bold text-[#292735]">
                      {t.story_points} SP
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#777482]">
                    {t.estimated_hours}h / {t.actual_hours}h
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`pastel-badge text-[10px] ${
                        t.status === "COMPLETED"
                          ? "badge-sage"
                          : t.status === "IN_PROGRESS"
                          ? "badge-blue"
                          : t.status === "BLOCKED"
                          ? "badge-pink"
                          : "badge-lavender"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {t.status !== "COMPLETED" ? (
                      <button
                        onClick={() => handleUpdateStatus(t.id, "COMPLETED")}
                        className="text-xs font-semibold text-[#385E30] hover:underline"
                      >
                        Complete ✓
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#777482]">Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-[#292735]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-[22px] border border-[#EAE6E0] w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EAE6E0] pb-3">
              <h3 className="font-bold text-[#292735] text-sm">Create New Development Task</h3>
              <button onClick={() => setShowNewTaskModal(false)} className="text-[#777482]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#777482] font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement optimistic UI update for goal tracking"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#777482] font-medium mb-1">Project</label>
                  <select
                    value={newTask.project_id}
                    onChange={(e) => setNewTask({ ...newTask, project_id: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#777482] font-medium mb-1">Assignee</label>
                  <select
                    value={newTask.assignee_id}
                    onChange={(e) => setNewTask({ ...newTask, assignee_id: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#777482] font-medium mb-1">Story Points</label>
                  <input
                    type="number"
                    min={1}
                    max={21}
                    value={newTask.story_points}
                    onChange={(e) => setNewTask({ ...newTask, story_points: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#777482] font-medium mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    step={0.5}
                    value={newTask.estimated_hours}
                    onChange={(e) => setNewTask({ ...newTask, estimated_hours: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#777482] font-medium mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-[#34323D] focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#EAE6E0] text-[#777482]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#292735] text-[#FFFDF9] font-medium"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
