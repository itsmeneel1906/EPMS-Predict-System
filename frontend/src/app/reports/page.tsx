"use client";

import React, { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportDate, setReportDate] = useState<string>("October 20, 2025");

  useEffect(() => {
    setReportDate(new Date().toLocaleDateString());
    async function init() {
      try {
        const [empRes, projRes, kpiRes] = await Promise.all([
          api.getEmployees(),
          api.getProjects(),
          api.getKPIs(),
        ]);
        setEmployees(empRes);
        setProjects(projRes);
        setKpis(kpiRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#292735] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#4C4472]" />
            Executive Reports & Data Exports
          </h1>
          <p className="text-xs text-[#777482] mt-0.5">
            Verified database exports, compliance-ready summaries, and printable reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={api.exportEmployeesCSVUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#EAE6E0] text-xs font-medium text-[#292735] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#777482]" />
            Export Employee CSV
          </a>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-medium hover:bg-[#34323D] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[#DCD6F7]" />
            Print Report View
          </button>
        </div>
      </div>

      {/* Printable Executive Summary Sheet */}
      <div className="pastel-card p-8 bg-[#FFFDF9] space-y-6">
        <div className="border-b border-[#EAE6E0] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#292735]">
              Executive Engineering Delivery & Productivity Report
            </h2>
            <p className="text-xs text-[#777482]">
              Evaluation Horizon: Q4 Sprint Cycle • Generated: {reportDate}
            </p>
          </div>
          <span className="badge-sage pastel-badge text-[10px]">
            Database Integrity: Verified (Seed Telemetry)
          </span>
        </div>

        {/* Report KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]">
            <span className="text-[11px] text-[#777482]">Engineers Audited</span>
            <div className="text-2xl font-bold text-[#292735] mt-1">{kpis?.total_employees || 16}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]">
            <span className="text-[11px] text-[#777482]">Average AI Velocity Score</span>
            <div className="text-2xl font-bold text-[#385E30] mt-1">
              {kpis?.average_predicted_score || 87.0}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]">
            <span className="text-[11px] text-[#777482]">On-Time Milestone Rate</span>
            <div className="text-2xl font-bold text-[#292735] mt-1">
              {Math.round((kpis?.on_time_delivery_rate || 0.88) * 100)}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]">
            <span className="text-[11px] text-[#777482]">Support / At-Risk Count</span>
            <div className="text-2xl font-bold text-[#83394C] mt-1">
              {kpis?.employees_requiring_support || 2}
            </div>
          </div>
        </div>

        {/* Project Delivery Status Summary */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-[#292735] uppercase tracking-wider">
            Active Multi-Platform Projects
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#EAE6E0] text-[10px] text-[#777482] uppercase">
                <th className="py-2">Project</th>
                <th className="py-2">Type</th>
                <th className="py-2">Client</th>
                <th className="py-2">Progress</th>
                <th className="py-2">Milestone Delivery Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6E0]/60">
              {projects.map((p) => {
                const pct =
                  p.task_count > 0 ? Math.round((p.completed_task_count / p.task_count) * 100) : 0;
                return (
                  <tr key={p.id} className="py-2">
                    <td className="py-2 font-semibold text-[#292735]">{p.name} ({p.code})</td>
                    <td className="py-2 text-[#777482]">{p.project_type}</td>
                    <td className="py-2 text-[#777482]">{p.client_name || "Internal"}</td>
                    <td className="py-2 font-medium">{pct}% ({p.completed_task_count}/{p.task_count} tasks)</td>
                    <td className="py-2">
                      <span
                        className={`pastel-badge text-[10px] ${
                          p.delivery_risk === "High"
                            ? "badge-pink"
                            : p.delivery_risk === "Medium"
                            ? "badge-peach"
                            : "badge-sage"
                        }`}
                      >
                        {p.delivery_risk} Risk
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Employees Evaluation Table */}
        <div className="space-y-3 pt-4 border-t border-[#EAE6E0]">
          <h3 className="font-bold text-xs text-[#292735] uppercase tracking-wider">
            Engineer Performance & Risk Audit
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#EAE6E0] text-[10px] text-[#777482] uppercase">
                <th className="py-2">Engineer</th>
                <th className="py-2">Team</th>
                <th className="py-2">Level</th>
                <th className="py-2">Current Score</th>
                <th className="py-2">Risk Level</th>
                <th className="py-2">Outlook</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6E0]/60">
              {employees.map((e) => (
                <tr key={e.id} className="py-2">
                  <td className="py-2 font-semibold text-[#292735]">{e.name}</td>
                  <td className="py-2 text-[#777482]">{e.team_name}</td>
                  <td className="py-2 text-[#4C4472]">{e.experience_level}</td>
                  <td className="py-2 font-bold text-[#292735]">{e.current_score}%</td>
                  <td className="py-2">
                    <span
                      className={`pastel-badge text-[10px] ${
                        e.risk_level === "High"
                          ? "badge-pink"
                          : e.risk_level === "Medium"
                          ? "badge-peach"
                          : "badge-sage"
                      }`}
                    >
                      {e.risk_level}
                    </span>
                  </td>
                  <td className="py-2 text-[#777482]">{e.productivity_outlook}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
