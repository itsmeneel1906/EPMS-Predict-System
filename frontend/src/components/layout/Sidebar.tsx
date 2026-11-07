"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  LineChart,
  BrainCircuit,
  AlertTriangle,
  HeartHandshake,
  CheckSquare,
  Cable,
  FileSpreadsheet,
  Settings,
  Sparkles,
  LogOut,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const ADMIN_NAV = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Engineering Directory", href: "/employees", icon: Users },
  { name: "Teams & Projects", href: "/teams-projects", icon: FolderGit2 },
  { name: "Performance Analytics", href: "/analytics", icon: LineChart },
  { name: "Model Governance", href: "/predictions", icon: BrainCircuit, badge: "AI/ML" },
  { name: "Early Warnings", href: "/early-warnings", icon: AlertTriangle, badge: "Alerts" },
  { name: "Platform Integrations", href: "/integrations", icon: Cable, badge: "Admin" },
  { name: "Executive Reports", href: "/reports", icon: FileSpreadsheet },
  { name: "Settings & Weights", href: "/settings", icon: Settings, badge: "Config" },
];

export const MANAGER_NAV = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Team Directory", href: "/employees", icon: Users },
  { name: "Teams & Projects", href: "/teams-projects", icon: FolderGit2 },
  { name: "Team Analytics", href: "/analytics", icon: LineChart },
  { name: "Delivery Predictions", href: "/predictions", icon: BrainCircuit, badge: "AI/ML" },
  { name: "Early Warnings", href: "/early-warnings", icon: AlertTriangle, badge: "Alerts" },
  { name: "1-on-1 Feedback", href: "/feedback", icon: HeartHandshake },
  { name: "Tasks & Sprints", href: "/tasks-activity", icon: CheckSquare },
  { name: "Delivery Reports", href: "/reports", icon: FileSpreadsheet },
];

export const DEVELOPER_NAV = [
  { name: "My Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Profile & Squad", href: "/employees", icon: Users },
  { name: "My Tasks & Activity", href: "/tasks-activity", icon: CheckSquare },
  { name: "My AI Performance", href: "/predictions", icon: BrainCircuit, badge: "AI Score" },
  { name: "My Feedback & Goals", href: "/feedback", icon: HeartHandshake },
  { name: "My Team Projects", href: "/teams-projects", icon: FolderGit2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  const currentNav =
    role === "ADMIN"
      ? ADMIN_NAV
      : role === "EMPLOYEE"
      ? DEVELOPER_NAV
      : MANAGER_NAV;

  const roleLabel =
    role === "ADMIN"
      ? "Admin (Governance)"
      : role === "EMPLOYEE"
      ? "Dev (Engineer)"
      : "Manager (Delivery)";

  return (
    <aside className="w-64 bg-[#FFFDF9] border-r border-[#EAE6E0] h-screen sticky top-0 flex flex-col justify-between shrink-0 select-none z-30">
      <div>
        {/* App Logo & Header */}
        <div className="p-5 border-b border-[#EAE6E0]/70 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DCD6F7] flex items-center justify-center text-[#34323D] shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight text-[#292735] flex items-center gap-1.5">
              EPMS Predict
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#DCE8D5] text-[#292735]">
                AI-HR
              </span>
            </h1>
            <p className="text-[11px] text-[#777482]">Dev Performance System</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#DCD6F7]/50 text-[#292735] font-semibold shadow-xs"
                    : "text-[#777482] hover:bg-[#FAF8F5] hover:text-[#34323D]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#34323D]" : "text-[#777482]"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badge === "Alerts"
                        ? "bg-[#F4DDE3] text-[#83394C]"
                        : "bg-[#DCD6F7] text-[#4C4472]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Role Info */}
      <div className="p-3.5 m-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E0] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#D8E9F7] text-[#2B577E] flex items-center justify-center text-xs font-semibold shrink-0">
            {user?.full_name?.substring(0, 2).toUpperCase() || (role === "ADMIN" ? "SA" : role === "EMPLOYEE" ? "AC" : "ER")}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-[#292735] truncate">{user?.full_name || (role === "ADMIN" ? "Sarah Sterling (Admin)" : role === "EMPLOYEE" ? "Alex Chen (Developer)" : "Elena Rostova (Manager)")}</p>
            <div className="flex items-center gap-1">
              {role === "ADMIN" ? (
                <ShieldCheck className="w-3 h-3 text-[#645CBB]" />
              ) : (
                <UserCheck className="w-3 h-3 text-[#385E30]" />
              )}
              <span className="text-[10px] text-[#777482] font-semibold tracking-wide uppercase">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="text-[#777482] hover:text-[#34323D] p-1.5 rounded-lg hover:bg-[#FFFDF9] transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
