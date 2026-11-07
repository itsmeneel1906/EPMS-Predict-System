"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Calendar,
  Sparkles,
  RefreshCw,
  Shield,
  Briefcase,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TopNavbarProps {
  pageTitle?: string;
  onSearch?: (query: string) => void;
  onTriggerScan?: () => void;
  openAlertsCount?: number;
}

export function TopNavbar({
  pageTitle = "Overview Dashboard",
  onSearch,
  onTriggerScan,
  openAlertsCount = 4,
}: TopNavbarProps) {
  const { role, switchDemoRole, resetDemoData, user } = useAuth();
  const [searchVal, setSearchVal] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleReset = async () => {
    if (confirm("Reset database to clean default demo dataset?")) {
      setIsResetting(true);
      await resetDemoData();
      setIsResetting(false);
    }
  };

  return (
    <header className="h-16 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#EAE6E0] sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-[#292735]">{pageTitle}</h2>
        {role === "ADMIN" && (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#DCD6F7] text-[#292735] border border-[#C5BDEB] flex items-center gap-1.5 shadow-xs">
            <Shield className="w-3 h-3 text-[#4C4472]" />
            Admin Mode • Full Governance
          </span>
        )}
        {role === "MANAGER" && (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#DCE8D5] text-[#292735] border border-[#C3D7B8] flex items-center gap-1.5 shadow-xs">
            <Briefcase className="w-3 h-3 text-[#385E30]" />
            Manager Mode • Team Velocity
          </span>
        )}
        {role === "EMPLOYEE" && (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#D8E9F7] text-[#292735] border border-[#BBDDF7] flex items-center gap-1.5 shadow-xs">
            <User className="w-3 h-3 text-[#2B577E]" />
            Dev Mode • Alex Chen
          </span>
        )}
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#777482] border border-[#EAE6E0] hidden xl:inline-flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-[#777482]" />
          Sprint Q4 • Last 30 Days
        </span>
      </div>

      {/* Global Search & Context Controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative w-48 sm:w-64 hidden lg:block">
          <Search className="w-4 h-4 text-[#777482] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Search employees, tasks, repos..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#EAE6E0] focus:outline-none focus:border-[#DCD6F7] focus:bg-[#FFFDF9] transition-all text-[#34323D] placeholder-[#777482]"
          />
        </div>

        {/* Demo Role Switcher */}
        <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE6E0]">
          <span className="text-[10px] text-[#777482] font-semibold px-2 uppercase tracking-wider hidden sm:inline-block">
            View as:
          </span>
          <button
            onClick={() => switchDemoRole("admin")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              role === "ADMIN"
                ? "bg-[#DCD6F7] text-[#292735] font-semibold shadow-xs"
                : "text-[#777482] hover:text-[#34323D]"
            }`}
          >
            <Shield className="w-3 h-3" />
            <span className="hidden sm:inline">Admin</span>
          </button>
          <button
            onClick={() => switchDemoRole("manager")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              role === "MANAGER"
                ? "bg-[#DCE8D5] text-[#292735] font-semibold shadow-xs"
                : "text-[#777482] hover:text-[#34323D]"
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span className="hidden sm:inline">Manager</span>
          </button>
          <button
            onClick={() => switchDemoRole("employee")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              role === "EMPLOYEE"
                ? "bg-[#D8E9F7] text-[#292735] font-semibold shadow-xs"
                : "text-[#777482] hover:text-[#34323D]"
            }`}
          >
            <User className="w-3 h-3" />
            <span className="hidden sm:inline">Dev</span>
          </button>
        </div>

        {/* Alerts Badge */}
        <a
          href="/early-warnings"
          title={`${openAlertsCount} active risk warnings`}
          className="relative p-2 rounded-xl text-[#777482] hover:text-[#292735] hover:bg-[#FAF8F5] transition-colors"
        >
          <Bell className="w-4 h-4" />
          {openAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#F4DDE3] text-[#83394C] text-[10px] font-bold rounded-full flex items-center justify-center border border-[#EAE6E0]">
              {openAlertsCount}
            </span>
          )}
        </a>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          title={isDark ? "Switch to Daylight Mode" : "Switch to Midnight Dark Mode"}
          className="p-2 rounded-xl text-[#777482] hover:text-[#292735] hover:bg-[#FAF8F5] transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-[#D8A74A]" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleReset}
          disabled={isResetting}
          title="Reset dataset to clean reproducible state"
          className="px-2.5 py-1.5 rounded-xl border border-[#EAE6E0] text-[11px] font-medium text-[#777482] hover:text-[#292735] hover:bg-[#FAF8F5] flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isResetting ? "animate-spin" : ""}`} />
          <span className="hidden md:inline">Reset Demo</span>
        </button>
      </div>
    </header>
  );
}
