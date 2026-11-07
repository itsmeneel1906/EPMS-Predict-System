"use client";

import React, { useEffect, useState } from "react";
import {
  Cable,
  FolderGit2,
  CheckCircle2,
  RotateCcw,
  Upload,
  AlertCircle,
  FileSpreadsheet,
  Link as LinkIcon,
  X,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);

  // CSV Ingestion State
  const [csvContent, setCsvContent] = useState<string>(
    `task_key,title,story_points,estimated_hours,priority,status,assignee\nWEB-401,Refactor pastel theme components,5,10.0,High,TODO,alex.chen@epms.dev\nIOS-302,Add biometrics authentication test,3,6.0,Medium,IN_PROGRESS,elena.rostova@epms.dev\nAND-205,Improve Room database indexing,5,12.0,Critical,TODO,diego.ramirez@epms.dev`
  );
  const [csvPreview, setCsvPreview] = useState<any | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadIntegrations();
    api.getProjects().then(setProjects).catch(console.error);
    handlePreviewCSV();
  }, []);

  const loadIntegrations = async () => {
    try {
      const [intRes, histRes] = await Promise.all([
        api.getIntegrations(),
        api.getSyncHistory(),
      ]);
      setIntegrations(intRes);
      setSyncHistory(histRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSync = async (provider: string) => {
    setSyncingProvider(provider);
    try {
      await api.syncIntegration(provider);
      await loadIntegrations();
    } catch (err: any) {
      alert(err.message || "Sync failed");
    } finally {
      setSyncingProvider(null);
    }
  };

  const handlePreviewCSV = async () => {
    try {
      const res = await api.previewCSV(csvContent);
      setCsvPreview(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteImport = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const mapping = {
        task_key: "task_key",
        title: "title",
        story_points: "story_points",
        estimated_hours: "estimated_hours",
        priority: "priority",
        status: "status",
        assignee: "assignee",
      };
      const res = await api.importTasksCSV(csvContent, selectedProjectId, mapping);
      setImportResult(res);
    } catch (err: any) {
      alert(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#292735] flex items-center gap-2">
            <Cable className="w-5 h-5 text-[#4C4472]" />
            Integrations & Engineering Telemetry Ingestion
          </h1>
          <p className="text-xs text-[#777482] mt-0.5">
            Connect GitHub, Jira, or import CSV activity files to feed transparent performance models.
          </p>
        </div>
      </div>

      {/* Integration Cards (GitHub & Jira) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GitHub Card */}
        <div className="pastel-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#292735] text-[#FFFDF9] flex items-center justify-center font-bold text-xs">
                  GH
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#292735]">GitHub REST API</h3>
                  <p className="text-[11px] text-[#777482]">Commits, Pull Requests & Code Reviews</p>
                </div>
              </div>
              <span className="badge-sage pastel-badge text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-[#385E30]" /> Connected (Demo)
              </span>
            </div>

            <p className="text-xs text-[#777482] leading-relaxed">
              Synchronizes commit timestamps, additions, deletions, pull request turnaround time, and peer review participation. Raw lines of code are never equated to employee quality.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]">
                <span className="text-[10px] text-[#777482]">Connected Repos</span>
                <div className="text-base font-bold text-[#292735] mt-0.5">5 Repositories</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]">
                <span className="text-[10px] text-[#777482]">Sync Cadence</span>
                <div className="text-base font-bold text-[#385E30] mt-0.5">Every 6 Hours</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EAE6E0]/60 flex items-center justify-between">
            <span className="text-[11px] text-[#777482]">Last Sync: 42 mins ago</span>
            <button
              onClick={() => handleTriggerSync("github")}
              disabled={syncingProvider === "github"}
              className="px-3 py-1.5 rounded-xl bg-[#DCD6F7] text-[#292735] text-xs font-semibold hover:bg-[#D1CAF2] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${syncingProvider === "github" ? "animate-spin" : ""}`} />
              {syncingProvider === "github" ? "Syncing..." : "Sync GitHub"}
            </button>
          </div>
        </div>

        {/* Jira Card */}
        <div className="pastel-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0052CC] text-[#FFFDF9] flex items-center justify-center font-bold text-xs">
                  JR
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#292735]">Atlassian Jira Software</h3>
                  <p className="text-[11px] text-[#777482]">Sprint Tasks, Due Dates & Story Points</p>
                </div>
              </div>
              <span className="badge-sage pastel-badge text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-[#385E30]" /> Connected (Demo)
              </span>
            </div>

            <p className="text-xs text-[#777482] leading-relaxed">
              Tracks task completion rate, on-time delivery ratio, estimation accuracy, and reopened bugs across sprints to evaluate team delivery predictability.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]">
                <span className="text-[10px] text-[#777482]">Monitored Issues</span>
                <div className="text-base font-bold text-[#292735] mt-0.5">78 Active Tickets</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]">
                <span className="text-[10px] text-[#777482]">Sync Cadence</span>
                <div className="text-base font-bold text-[#385E30] mt-0.5">Every 6 Hours</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EAE6E0]/60 flex items-center justify-between">
            <span className="text-[11px] text-[#777482]">Last Sync: 2 hours ago</span>
            <button
              onClick={() => handleTriggerSync("jira")}
              disabled={syncingProvider === "jira"}
              className="px-3 py-1.5 rounded-xl bg-[#DCD6F7] text-[#292735] text-xs font-semibold hover:bg-[#D1CAF2] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${syncingProvider === "jira" ? "animate-spin" : ""}`} />
              {syncingProvider === "jira" ? "Syncing..." : "Sync Jira"}
            </button>
          </div>
        </div>
      </div>

      {/* CSV Ingestion Pipeline Module */}
      <div className="pastel-card p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-[#292735] flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#4C4472]" />
            Offline Data Ingestion: CSV Task & Activity Importer
          </h3>
          <p className="text-xs text-[#777482] mt-0.5">
            Support manual entry and CSV upload with column validation, preview, and duplicate detection even when external APIs are disconnected.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[#777482]">
                CSV Data Input (Raw text or drag & drop)
              </label>
              <button
                onClick={handlePreviewCSV}
                className="text-[11px] font-semibold text-[#645CBB] hover:underline"
              >
                Refresh Preview
              </button>
            </div>
            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] font-mono text-[11px] text-[#34323D] focus:outline-none focus:border-[#DCD6F7]"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[#777482] mb-1 block">
                Target Project for Imported Tasks
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-xs text-[#34323D] focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0] text-xs space-y-1">
              <div className="font-semibold text-[#292735]">Detected Headers:</div>
              <div className="flex flex-wrap gap-1.5">
                {csvPreview?.headers?.map((h: string) => (
                  <span key={h} className="px-2 py-0.5 rounded-md bg-[#FFFDF9] border border-[#EAE6E0] text-[10px] font-mono text-[#4C4472]">
                    {h}
                  </span>
                ))}
              </div>
              <div className="text-[11px] text-[#777482] pt-1">
                Total Rows to Ingest: {csvPreview?.total_rows || 0}
              </div>
            </div>

            <button
              onClick={handleExecuteImport}
              disabled={importing}
              className="w-full py-2 rounded-xl bg-[#292735] text-[#FFFDF9] text-xs font-semibold hover:bg-[#34323D] transition-colors flex items-center justify-center gap-2"
            >
              <Upload className={`w-3.5 h-3.5 ${importing ? "animate-spin" : ""}`} />
              {importing ? "Validating & Ingesting..." : "Execute Validated CSV Import"}
            </button>
          </div>
        </div>

        {importResult && (
          <div className="p-3.5 rounded-xl bg-[#F3F7F0] border border-[#DCE8D5] text-xs text-[#385E30] flex items-center justify-between">
            <div>
              <strong>Import Successful: </strong>
              Ingested {importResult.imported_count} new tasks (skipped {importResult.skipped_count} existing duplicates).
            </div>
            <button onClick={() => setImportResult(null)} className="font-bold ml-2">×</button>
          </div>
        )}
      </div>

      {/* Sync History Audit Trail */}
      <div className="pastel-card p-6 space-y-3">
        <h3 className="font-semibold text-sm text-[#292735]">
          Integration Synchronization History & Audit Trail
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#EAE6E0] text-[10px] text-[#777482] uppercase">
              <th className="py-2">Provider</th>
              <th className="py-2">Records Processed</th>
              <th className="py-2">Started At</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE6E0]/60">
            {syncHistory.map((s) => (
              <tr key={s.id} className="py-2">
                <td className="py-2 font-semibold text-[#292735] uppercase">{s.provider}</td>
                <td className="py-2 text-[#777482]">{s.records_processed} items</td>
                <td className="py-2 text-[#777482]">{new Date(s.started_at).toLocaleString()}</td>
                <td className="py-2">
                  <span className="pastel-badge text-[10px] badge-sage">{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
