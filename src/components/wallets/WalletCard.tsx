"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Eye, EyeOff, Wallet, BarChart3 } from "lucide-react";
import { toRupiah } from "@/src/lib/money";

interface WalletCardProps {
  totalBalance: number;
  activeTab: "poket" | "analitik";
  onTabChange: (tab: "poket" | "analitik") => void;
}

export function WalletCard({
  totalBalance,
  activeTab,
  onTabChange,
}: WalletCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="relative px-6 pb-14 text-white">
      {/* Header Atas: Tombol Tambah Pemasukan di pojok kanan atas */}
      <div className="flex justify-end mb-4">

      </div>

      {/* Teks & Angka Saldo TETAP DI TENGAH */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl font-bold text-spoket-gray/80">
            Saldo Kantong Utama
          </span>
          <button
            type="button"
            onClick={() => setShowBalance(!showBalance)}
            className="text-white/60 hover:text-white transition p-0.5"
            aria-label="Toggle Saldo"
          >
            {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <h2 className="text-4xl font-black tracking-tight text-white select-none">
          {showBalance ? `Rp ${toRupiah(totalBalance)}` : "••••••••"}
        </h2>
        <div className="flex justify-center pt-1">
          <Link
            href="/dashboard/wallets/income"
            prefetch={true}
            className="border-2 border-teal-950 text-black bg-spoket-yellow px-4 py-1.5 rounded-xl font-black text-xs shadow-[2px_2px_0px_#042f2e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center  transition"
          >
            <span className="pr-1 tracking-wider">Isi Saldo</span>
            <Plus size={14} className="stroke-[3] pt" />
          </Link>
        </div>
      </div>

      {/* Floating Card Melayang di Bawah Saldo persis seperti semula */}
      <div className="absolute left-10 right-10 -bottom-7 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-20">
        <div className="flex items-center gap-1 bg-spoket-gray p-1 rounded-xl">
          {/* Tab 1: Poket */}
          <button
            type="button"
            onClick={() => onTabChange("poket")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "poket"
                ? "bg-spoket-dark text-spoket-white shadow-[2px_2px_0px_#042f2e]"
                : "text-spoket-darker hover:text-slate-800"
              }`}
          >
            <Wallet size={14} />
            <span>Poket</span>
          </button>

          {/* Tab 2: Analitik */}
          <button
            type="button"
            onClick={() => onTabChange("analitik")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "analitik"
                ? "bg-spoket-dark text-spoket-white shadow-[2px_2px_0px_#042f2e]"
                : "text-spoket-darker hover:text-slate-800"
              }`}
          >
            <BarChart3 size={14} />
            <span>Analitik</span>
          </button>
        </div>
      </div>
    </div>
  );
}