"use client";

import { formatRupiah } from "@/src/lib/utils";
import { Zap, Flame } from "lucide-react";

export function DailyAllowanceCard({
  dailySafe,
  daysRemaining,
  spentToday,
}: {
  dailySafe: number;
  daysRemaining: number;
  spentToday: number;
}) {
  const isOver = spentToday > dailySafe;

  return (
    <div className="border-2 border-teal-950 bg-[#FEF08A] rounded-2xl p-4 shadow-[4px_4px_0px_#042f2e] space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-black uppercase tracking-wider text-teal-950 flex items-center gap-1.5">
          <Zap size={14} className="fill-amber-500 text-teal-950" />
          Jatah Belanja Aman Hari Ini
        </span>
        <span className="text-[10px] font-black bg-white border border-teal-950 px-2 py-0.5 rounded-md">
          {daysRemaining} Hari Tersisa
        </span>
      </div>

      <div className="flex justify-between items-baseline">
        <h2 className="text-3xl font-black text-teal-950">
          {formatRupiah(dailySafe)}
        </h2>
        <div className="text-right">
          <span className="text-[10px] font-bold text-teal-900/60 block">Terpakai Hari Ini</span>
          <span className={`text-xs font-black ${isOver ? "text-rose-600" : "text-teal-950"}`}>
            {formatRupiah(spentToday)}
          </span>
        </div>
      </div>

      <div className="bg-white/80 border border-teal-950 p-2 rounded-xl text-[11px] font-bold text-teal-900 flex items-center gap-2">
        <Flame size={14} className={isOver ? "text-rose-500" : "text-amber-500"} />
        <span>
          {isOver
            ? "⚠️ Hari ini melebihi jatah harian. Jatah besok akan sedikit berkurang."
            : " Hemat hari ini, sisa kuota otomatis ditambahkan ke jatah besok!"}
        </span>
      </div>
    </div>
  );
}