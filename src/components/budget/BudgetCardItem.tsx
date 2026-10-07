"use client";

import Link from "next/link";
import { ChevronRight, Plus, Pencil } from "lucide-react";
import { formatRupiah } from "@/src/lib/utils";
import { BudgetItemView } from "@/src/services/budget.service";
import { getBudgetIconData } from "@/src/lib/budgetIcon";

interface CompactBudgetRowProps {
  budget: BudgetItemView;
  onOpenExpense: (budget: BudgetItemView) => void;
  onOpenEdit: (e: React.MouseEvent, budget: BudgetItemView) => void;
}



export function CompactBudgetRow({
  budget,
  onOpenExpense,
  onOpenEdit,
}: CompactBudgetRowProps) {
  // Ambil ikon dan warna pastel secara otomatis dari helper
  const { icon, bg } = getBudgetIconData(budget.name, budget.type);
  const isExhausted = budget.percentageUsed >= 100 || budget.remainingAmount <= 0;

  return (
    <div className="bg-spoket-white border-2 border-spoket-gray hover:border-spoket-yellowlight rounded-2xl p-4 transition-all shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        {/* Klik Konten -> Buka Halaman Detail Riwayat Transaksi */}
        <Link
          href={`/dashboard/budgets/${budget.id}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div
            className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center shrink-0 border border-slate-100`}
          >
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black text-spoket-dark truncate">
              {budget.name}
            </h4>
            <p className="text-[11px] font-bold text-spoket-darker mt-0.5">
              <span className="text-spoket-dark font-extrabold">
                {formatRupiah(budget.spentAmount)}
              </span>
              {" / "}
              <span>{formatRupiah(budget.allocatedAmount)}</span>
            </p>
          </div>
        </Link>

        {/* Grup Tombol: Edit, Catat Transaksi, dan Detail */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {/* Tombol Edit Budget (Membuka EditBudgetModal) */}
          <button
            type="button"
            onClick={(e) => onOpenEdit(e, budget)}
            title="Edit Jatah"
            className="w-8 h-8 rounded-xl bg-spoket-gray text-spoket-darker hover:text-spoket-dark hover:bg-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <Pencil size={13} />
          </button>

          {/* Tombol Catat Pengeluaran (Membuka ExpenseModal) */}


          {/* Tombol Catat Pengeluaran */}
          {isExhausted ? (
            <span className="px-2.5 py-1 bg-slate-100 text-slate-400 rounded-xl font-black text-[10px] border border-slate-200 cursor-not-allowed select-none">
              Terpenuhi
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onOpenExpense(budget)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-spoket-yellowlight hover:bg-spoket-yellow text-spoket-dark rounded-xl font-black text-[11px] border border-spoket-dark/20 transition active:scale-95 cursor-pointer"
            >
              <Plus size={13} className="stroke-[3]" />
              <span>Catat</span>
            </button>
          )}

          {/* Tombol Panah Detail */}
          <Link
            href={`/dashboard/budgets/${budget.id}`}
            className="text-slate-400 hover:text-spoket-dark transition p-1"
          >
            <ChevronRight size={17} />
          </Link>
        </div>
      </div>

      {/* Progress Bar & Persentase */}
      <div className="flex items-center gap-3 pt-0.5">
        <div className="flex-1 bg-spoket-gray h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${budget.percentageUsed >= 90
                ? "bg-red-500"
                : "bg-linear-to-r from-emerald-500 to-sky-500"
              }`}
            style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
          />
        </div>
        <span className="text-[11px] font-black text-spoket-darker min-w-8 text-right">
          {budget.percentageUsed}%
        </span>
      </div>
    </div>
  );
}