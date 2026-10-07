"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Utensils, Coffee, Car, Home, Heart, PiggyBank, Wallet } from "lucide-react";
import { formatRupiah } from "@/src/lib/utils";
import { BudgetAnalyticsData } from "@/src/services/budget-analytics.service";
import { BudgetDonutChart } from "@/src/components/budget/BudgetDonutChart";

export function BudgetAnalyticsView({ data }: { data: BudgetAnalyticsData }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", e.target.value);
    router.push(`/dashboard/budgets?${params.toString()}`);
  };

  const getCategoryIcon = (iconName?: string | null, name?: string) => {
    const n = (iconName || name || "").toLowerCase();
    if (n.includes("makan") || n.includes("utensil")) return <Utensils size={15} />;
    if (n.includes("kopi") || n.includes("coffee")) return <Coffee size={15} />;
    if (n.includes("transport") || n.includes("car")) return <Car size={15} />;
    if (n.includes("sewa") || n.includes("home")) return <Home size={15} />;
    if (n.includes("tabung") || n.includes("piggy")) return <PiggyBank size={15} />;
    return <Wallet size={15} />;
  };

  return (
    <div className="space-y-4">
      {/* Filter Pemilih Bulan */}
      <div className="flex justify-center">
        <div className="relative inline-block">
          <select
            value={data.period}
            onChange={handleMonthChange}
            className="bg-spoket-white border-2 border-spoket-gray text-spoket-dark text-xs font-black py-1.5 pl-3.5 pr-8 rounded-full shadow-xs appearance-none cursor-pointer focus:outline-none"
          >
            {data.availableMonths.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-spoket-dark pointer-events-none"
          />
        </div>
      </div>

      {/* Kartu Ringkasan Atas: Total & Rata-rata Harian */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-spoket-white border-2 border-spoket-gray rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-14 h-14 rounded-full border-4 border-spoket-yellow flex items-center justify-center mb-1">
            <span className="text-[11px] font-black text-spoket-dark">
              {data.percentageOfBudget}%
            </span>
          </div>
          <span className="text-[10px] font-bold text-spoket-darker">Total Belanja</span>
          <span className="text-xs font-black text-spoket-dark">
            {formatRupiah(data.totalSpent)}
          </span>
        </div>

        <div className="bg-spoket-white border-2 border-spoket-gray rounded-2xl p-3.5 flex flex-col justify-center text-center shadow-xs">
          <span className="text-[10px] font-bold text-spoket-darker uppercase tracking-wider">
            Rata-rata Harian
          </span>
          <h3 className="text-base font-black text-spoket-dark mt-1">
            {formatRupiah(data.dailyAverage)}
          </h3>
          <span className="text-[9px] font-bold text-slate-400 mt-0.5">per hari</span>
        </div>
      </div>

      <p className="text-center text-[11px] font-bold text-spoket-darker">
        Terpakai <span className="text-spoket-dark font-black">{data.percentageOfBudget}%</span> dari target {formatRupiah(data.totalAllocated)}[cite: 5]
      </p>

      {/* Donut Chart & Legenda */}
      <div className="bg-spoket-white border-2 border-spoket-gray rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <BudgetDonutChart data={data.breakdown} />

          {/* Legenda Persentase */}
          <div className="grid grid-cols-1 gap-1.5 w-full sm:w-auto">
            {data.breakdown.map((item) => (
              <div key={item.budgetId} className="flex items-center justify-between sm:justify-start gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-spoket-dark text-[11px]">{item.name}</span>
                </div>
                <span className="font-black text-spoket-darker text-[11px]">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* List Detail Transaksi Kategori */}
      <div className="space-y-2">
        <span className="text-[11px] font-black text-spoket-darker uppercase tracking-wider block px-1">
          Rincian Pos Belanja
        </span>

        <div className="bg-spoket-white border-2 border-spoket-gray rounded-2xl p-2 space-y-2 shadow-xs">
          {data.breakdown.map((item) => (
            <div
              key={item.budgetId}
              className="flex items-center justify-between p-2.5 rounded-xl bg-spoket-gray/60"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: item.color === "#FEF08A" ? "#FEC000" : item.color }}
                >
                  {getCategoryIcon(item.icon, item.name)}
                </div>
                <div>
                  <h4 className="text-xs font-black text-spoket-dark">{item.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {item.transactionCount} transaksi
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-spoket-dark block">
                  {formatRupiah(item.totalSpent)}
                </span>
                <span className="text-[10px] font-extrabold text-spoket-darker">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}