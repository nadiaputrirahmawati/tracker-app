"use client";

import { useState } from "react";
import { WalletCard } from "./WalletCard";

interface WalletsDashboardClientProps {
  totalBalance: number;
  walletListComponent: React.ReactNode;
  analyticsComponent: React.ReactNode;
}

export function WalletsDashboardClient({
  totalBalance,
  walletListComponent,
  analyticsComponent,
}: WalletsDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"poket" | "analitik">("poket");

  return (
    <div className="flex-1 flex flex-col bg-spoket-dark">
      {/* Saldo di Tengah & Floating Tab Melayang */}
      <WalletCard
        totalBalance={totalBalance}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Container Bawah Putih Bersih */}
      <div className="flex-1 bg-spoket-cream rounded-t-[36px] pt-12 px-4 pb-32 space-y-5 shadow-2xl relative z-10 mt-2">
        {activeTab === "poket" ? (
          <div className="animate-in fade-in duration-150">
            {walletListComponent}
          </div>
        ) : (
          <div className="animate-in fade-in duration-150">
            {analyticsComponent}
          </div>
        )}
      </div>
    </div>
  );
}