import { getBudgetsByPeriod } from "@/src/actions/budget";
import { formatRupiah, getCurrentPeriod } from "@/src/lib/utils";
import { AddBudgetModal } from "@/src/components/add-budget-modal";
import { ArrowLeft, PiggyBank, ShoppingBag } from "lucide-react";
import { BudgetItemActions } from "@/src/components/budget-item-actions";
import Link from "next/link";

export default async function BudgetsPage() {
  const currentPeriod = getCurrentPeriod();
  const budgets = await getBudgetsByPeriod(currentPeriod);

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalUsed = budgets.reduce((sum, b) => sum + b.usedAmount, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-800">Pos Anggaran</h1>
            <p className="text-[11px] text-slate-400">Periode: {currentPeriod}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Ringkasan Total Budget vs Terpakai */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-500">Rencana Terpakai</span>
            <span className="font-bold text-slate-800">
              {formatRupiah(totalUsed)} / {formatRupiah(totalAllocated)}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(
                  Math.round((totalUsed / (totalAllocated || 1)) * 100),
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Action Button */}
        <AddBudgetModal currentPeriod={currentPeriod} />

        {/* List Pos Amplop */}
        <div className="space-y-3 pt-1">
          {budgets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs">Belum ada amplop pos anggaran di bulan ini.</p>
            </div>
          ) : (
            budgets.map((b) => (
              <div
                key={b.id}
                className="bg-white border-2 border-teal-950 p-4 rounded-2xl shadow-[3px_3px_0px_#042f2e] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl border border-teal-950 ${b.type === "SAVING" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-teal-950"
                        }`}
                    >
                      {b.type === "SAVING" ? <PiggyBank size={18} /> : <ShoppingBag size={18} />}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-teal-950">{b.name}</h4>
                      <span className="text-[10px] font-bold text-teal-900/60 uppercase">
                        {b.type === "SAVING" ? "Tabungan" : "Pengeluaran"}
                      </span>
                    </div>
                  </div>

                  {/* Tombol Edit & Hapus Pos */}
                  <BudgetItemActions budget={b} />
                </div>

                {/* Progress Bar & Sisa Nominal */}
                <div className="space-y-1">
                  <div className="w-full bg-[#FAF8F5] border border-teal-950 h-2.5 rounded-full overflow-hidden p-[1px]">
                    <div
                      className={`h-full rounded-full transition-all ${b.percentage >= 100 ? "bg-rose-500" : b.percentage > 80 ? "bg-amber-400" : "bg-teal-950"
                        }`}
                      style={{ width: `${b.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-teal-900">
                    <span>Terpakai: {formatRupiah(b.usedAmount)}</span>
                    <span>Sisa: {formatRupiah(b.remaining)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}