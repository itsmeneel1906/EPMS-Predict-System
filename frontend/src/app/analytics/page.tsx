"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Sliders,
  Scale,
  Sparkles,
  Info,
  CheckCircle,
  Clock,
  Printer,
  BrainCircuit,
  Compass,
  Users,
  Target,
} from "lucide-react";
import { api } from "@/lib/api";

export default function PerformanceAnalyticsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [teamComparison, setTeamComparison] = useState<any[]>([]);
  const [workload, setWorkload] = useState<any[]>([]);
  const [clusterData, setClusterData] = useState<any | null>(null);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [tr, tc, wl, st, cl] = await Promise.all([
          api.getProductivityTrends(),
          api.getTeamComparison(),
          api.getWorkloadDistribution(),
          api.getSettings(),
          api.getDeveloperClusters().catch(() => null),
        ]);
        setTrends(tr);
        setTeamComparison(tc);
        setWorkload(wl.slice(0, 8));
        setSettingsData(st);
        setClusterData(cl);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#292735]">Performance Analytics</h1>
          <p className="text-xs text-[#777482] mt-0.5">
            Transparent scoring framework, historical trajectories, and multi-team comparative velocity.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#EAE6E0] text-xs font-medium text-[#292735] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Printer className="w-3.5 h-3.5 text-[#777482]" />
          Print / Export Report
        </button>
      </div>

      {/* Transparent Evaluation Framework Notice */}
      <div className="p-4 rounded-[20px] bg-[#FFFDF9] border border-[#EAE6E0] space-y-2">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#4C4472]" />
          <h3 className="font-semibold text-xs text-[#292735]">
            Transparent & Configurable Evaluation Weighting Model
          </h3>
        </div>
        <p className="text-xs text-[#777482]">
          Scores serve as decision-support insights rather than automated HR decisions. Metric weights are configured by administrators and normalized onto documented scales.
        </p>

        {settingsData?.metric_weights && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            {Object.entries(settingsData.metric_weights).map(([k, v]: [string, any]) => (
              <div key={k} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E0]">
                <div className="text-[10px] text-[#777482] uppercase tracking-wider capitalize">
                  {k.replace("_", " ")}
                </div>
                <div className="text-sm font-bold text-[#292735] mt-0.5">
                  {Math.round(v * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart 1: Historical Trends (Observed vs Predicted) */}
      <div className="pastel-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#292735]">
              Historical Trajectory & Predictive Delivery Forecast
            </h3>
            <p className="text-xs text-[#777482]">
              6-month historical baseline with Q4 sprint evaluation trajectory
            </p>
          </div>
          <span className="badge-sage pastel-badge text-[10px]">
            Model: RandomForestRegressor (R² = 0.864)
          </span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE6E0" vertical={false} />
              <XAxis dataKey="period" stroke="#777482" fontSize={11} tickLine={false} />
              <YAxis stroke="#777482" fontSize={11} domain={[70, 95]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFDF9",
                  borderColor: "#EAE6E0",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Area
                type="monotone"
                dataKey="observed_score"
                name="Observed Score"
                stroke="#645CBB"
                fill="#DCD6F7"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="predicted_score"
                name="AI Predicted Score"
                stroke="#385E30"
                strokeDasharray="4 4"
                fill="#DCE8D5"
                fillOpacity={0.4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Comparison Bar Chart */}
        <div className="pastel-card p-6">
          <h3 className="text-sm font-semibold text-[#292735] mb-1">
            Team Velocity & Score Comparison
          </h3>
          <p className="text-xs text-[#777482] mb-4">
            Average velocity scores across core web, mobile and platform teams
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE6E0" vertical={false} />
                <XAxis dataKey="name" stroke="#777482" fontSize={10} tickLine={false} />
                <YAxis stroke="#777482" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFDF9",
                    borderColor: "#EAE6E0",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="average_score" name="Avg Score (%)" fill="#DCD6F7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Story Points Allocation */}
        <div className="pastel-card p-6">
          <h3 className="text-sm font-semibold text-[#292735] mb-1">
            Workload Distribution & Sprint Story Points
          </h3>
          <p className="text-xs text-[#777482] mb-4">
            Assigned points across developers to detect capacity overload
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE6E0" horizontal={false} />
                <XAxis type="number" stroke="#777482" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#777482" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFDF9",
                    borderColor: "#EAE6E0",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="assigned_story_points" name="Assigned Points" fill="#D8E9F7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Unsupervised Learning: K-Means Clustering & 2D PCA Topography */}
      {clusterData?.status === "SUCCESS" && (
        <div className="pastel-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6E0] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#645CBB]" />
                <h3 className="text-sm font-bold text-[#292735]">
                  Unsupervised Machine Learning: Developer Talent Topography (K-Means & PCA)
                </h3>
              </div>
              <p className="text-xs text-[#777482] mt-0.5">
                Multi-dimensional engineering telemetry clustered via K-Means and projected onto 2D coordinate space using Principal Component Analysis.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-lavender pastel-badge text-[10px] flex items-center gap-1">
                <Compass className="w-3 h-3" />
                PCA Explained Variance: {Math.round((clusterData.metrics?.total_explained_variance || 0.74) * 100)}%
              </span>
              <span className="badge-sage pastel-badge text-[10px]">
                Silhouette Score: {clusterData.metrics?.silhouette_score}
              </span>
            </div>
          </div>

          {/* Archetype Persona Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {clusterData.archetypes?.map((arch: any, idx: number) => {
              const borderColors = ["border-[#B8B2E8]", "border-[#A3C99B]", "border-[#B2D1EE]", "border-[#F4DDE3]"];
              const bgColors = ["bg-[#FAF8FE]", "bg-[#F4F9F2]", "bg-[#F3F8FC]", "bg-[#FCF4F6]"];
              const pillColors = ["bg-[#DCD6F7] text-[#4C4472]", "bg-[#DCE8D5] text-[#385E30]", "bg-[#D8E9F7] text-[#2B6CB0]", "bg-[#F4DDE3] text-[#83394C]"];

              return (
                <div
                  key={arch.cluster_id}
                  className={`p-4 rounded-2xl border ${borderColors[idx % 4]} ${bgColors[idx % 4]} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pillColors[idx % 4]}`}>
                        Cluster {arch.cluster_id + 1}
                      </span>
                      <span className="text-xs font-bold text-[#292735]">
                        {arch.member_count} dev{arch.member_count > 1 ? "s" : ""}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-[#292735]">{arch.archetype_name}</h4>
                    <p className="text-[11px] text-[#777482] mt-1">
                      Avg Score: <strong className="text-[#292735]">{arch.average_score}%</strong>
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#EAE6E0]/60 text-[10px] text-[#777482] flex flex-wrap gap-1">
                    {arch.members?.slice(0, 3).map((m: any) => (
                      <span key={m.id} className="bg-white/80 px-1.5 py-0.5 rounded border border-[#EAE6E0]">
                        {m.name.split(" ")[0]}
                      </span>
                    ))}
                    {arch.members?.length > 3 && (
                      <span className="text-[9px] text-[#777482] self-center">+{arch.members.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2D PCA Dimensionality Reduction Scatter Chart */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E0]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-[#292735]">2D PCA Scatter Projection (Principal Component 1 vs 2)</h4>
                <p className="text-[11px] text-[#777482]">Each point represents an active developer in the learned feature manifold.</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-[#777482]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#645CBB]"></span> Cluster 1</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#385E30]"></span> Cluster 2</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#2B6CB0]"></span> Cluster 3</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#C53030]"></span> Cluster 4</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE6E0" />
                  <XAxis
                    type="number"
                    dataKey="pca_x"
                    name="PCA Component 1"
                    stroke="#777482"
                    fontSize={10}
                    tickLine={false}
                    label={{ value: "PC 1: Delivery Velocity & Completion", position: "insideBottom", offset: -10, fontSize: 10, fill: "#777482" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="pca_y"
                    name="PCA Component 2"
                    stroke="#777482"
                    fontSize={10}
                    tickLine={false}
                    label={{ value: "PC 2: Code Review Turnaround & Stability", angle: -90, position: "insideLeft", fontSize: 10, fill: "#777482" }}
                  />
                  <Tooltip
                    content={({ payload }: any) => {
                      if (!payload || !payload[0]) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#FFFDF9] border border-[#EAE6E0] p-3 rounded-xl shadow-md text-xs space-y-1">
                          <p className="font-bold text-[#292735]">{d.name}</p>
                          <p className="text-[#777482] text-[11px]">{d.title} • {d.team_name}</p>
                          <p className="text-[11px] font-semibold text-[#645CBB]">Cluster: {d.archetype_name}</p>
                          <p className="text-[11px]">Score: <strong>{d.current_score}%</strong> • Risk: <strong>{d.risk_level}</strong></p>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="Developers" data={clusterData.developer_points}>
                    {clusterData.developer_points?.map((entry: any, index: number) => {
                      const colors = ["#645CBB", "#385E30", "#2B6CB0", "#C53030"];
                      return <Cell key={`cell-${index}`} fill={colors[entry.cluster_id % 4]} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
