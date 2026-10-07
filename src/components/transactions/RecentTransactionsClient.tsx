"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/src/lib/utils";
import { TransactionGroup } from "@/src/services/transaction.service";
import { getBudgetIconData } from "@/src/lib/budgetIcon";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface Props {
  initialGroups: TransactionGroup[];
}

export function RecentTransactionsClient({ initialGroups }: Props) {
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  // Filter client-side instan
  const filteredGroups = initialGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => {
        if (filter === "ALL") return true;
        return item.type === filter;
      }),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-black text-spoket-dark tracking-tight">
          Recent Transactions
        </h2>
        <Link
          href="/dashboard/transactions"
          className="text-xs font-black text-spoket-dark hover:underline"
        >
          See all
        </Link>
      </div>

      {/* Pill Filters */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
            filter === "ALL"
              ? "bg-spoket-white border-2 border-spoket-dark text-spoket-dark shadow-xs"
              : "bg-spoket-white/60 border-2 border-transparent text-spoket-darker hover:bg-spoket-white"
          }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => setFilter("INCOME")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
            filter === "INCOME"
              ? "bg-spoket-white border-2 border-emerald-600 text-emerald-700 shadow-xs"
              : "bg-spoket-white/60 border-2 border-transparent text-emerald-700/70 hover:bg-spoket-white"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Income</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("EXPENSE")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
            filter === "EXPENSE"
              ? "bg-spoket-white border-2 border-rose-600 text-rose-700 shadow-xs"
              : "bg-spoket-white/60 border-2 border-transparent text-rose-700/70 hover:bg-spoket-white"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Expense</span>
        </button>
      </div>

      {/* Daftar Transaksi Dikelompokkan per Waktu */}
      {filteredGroups.length === 0 ? (
        <div className="bg-spoket-white rounded-2xl border-2 border-dashed border-spoket-gray p-8 text-center text-xs font-bold text-spoket-darker">
          Belum ada transaksi pada kategori ini.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <div key={group.dateKey} className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1 block">
                {group.label}
              </span>

              {/* Box Kumpulan Item */}
              <div className="bg-spoket-white rounded-2xl border-2 border-spoket-gray p-1.5 space-y-1.5 shadow-xs">
                {group.items.map((item) => {
                  const isExpense = item.type === "EXPENSE";
                  const iconStyle = isExpense
                    ? getBudgetIconData(item.categoryName)
                    : { icon: <ArrowDownLeft size={18} className="text-emerald-700" />, bg: "bg-emerald-50" };

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-spoket-gray/60 transition"
                    >
                      {/* Sisi Kiri: Ikon & Detail */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl ${iconStyle.bg} flex items-center justify-center shrink-0 border border-slate-100`}
                        >
                          {iconStyle.icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-spoket-dark truncate">
                            {item.categoryName}
                          </h4>
                          <p className="text-[10px] font-semibold text-spoket-darker truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Sisi Kanan: Jumlah Uang & Tanggal */}
                      <div className="text-right shrink-0 ml-2">
                        <span
                          className={`text-xs font-black block ${
                            isExpense ? "text-spoket-dark" : "text-emerald-600"
                          }`}
                        >
                          {isExpense ? "- " : "+ "}
                          {formatRupiah(item.amount)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">
                          {item.dateFormatted}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}