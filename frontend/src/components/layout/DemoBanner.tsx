"use client";

import React, { useState } from "react";
import { Info, Sparkles, X, ShieldAlert } from "lucide-react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#FAF8F5] border-b border-[#EAE6E0] px-6 py-2 text-xs flex items-center justify-between text-[#777482]">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold text-[#4C4472] bg-[#DCD6F7]/60 px-2 py-0.5 rounded-md text-[11px]">
          <Sparkles className="w-3 h-3 text-[#645CBB]" />
          Demo Mode Active
        </span>
        <span className="hidden md:inline">
          Demonstrating with seeded engineering telemetry (GitHub commits, PR reviews, Jira sprint tasks, and Random Forest ML models). All synthetic records are explicitly labeled.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="/settings"
          className="text-[#34323D] hover:underline font-medium text-[11px]"
        >
          View Model Metadata & Weights →
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#777482] hover:text-[#34323D] p-1"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
