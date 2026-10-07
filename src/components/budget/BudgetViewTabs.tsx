"use client";

import { useState } from "react";
import { Wallet, PieChart } from "lucide-react";

interface BudgetViewTabsProps {
  budgetListComponent: React.ReactNode;
  analyticsComponent: React.ReactNode;
}

export function BudgetViewTabs({
  budgetListComponent,
  analyticsComponent,
}: BudgetViewTabsProps) {
  const [activeTab, setActiveTab] = useState<"list" | "analytics">("list");

  return (
    <div className="space-y-4">
      {/* Segmented Pill Tab Bar */}
      <div className="bg-[#E9F0EE] p-1 rounded-2xl flex items-center gap-1 max-w-xs mx-auto shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "list"
              ? "bg-[#062828] text-[#FEF08A] shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Wallet size={14} />
          <span>Jatah Belanja</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "bg-[#062828] text-[#FEF08A] shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <PieChart size={14} />
          <span>Analitik</span>
        </button>
      </div>

      {/* Konten Tab */}
      <div>
        {activeTab === "list" ? (
          <div className="animate-in fade-in duration-150">{budgetListComponent}</div>
        ) : (
          <div className="animate-in fade-in duration-150">{analyticsComponent}</div>
        )}
      </div>
    </div>
  );
}