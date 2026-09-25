"use client";

import { useState } from "react";
import { addExpense } from "@/src/actions/expense";
import { Zap, X } from "lucide-react";

interface QuickExpenseModalProps {
  defaultWalletId: string;
  budgets: { id: string; name: string }[];
}

export function QuickExpenseModal({ defaultWalletId, budgets }: QuickExpenseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFastSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    form.set("walletId", defaultWalletId);
    form.set("transactionDate", new Date().toISOString().split("T")[0]);

    const res = await addExpense(form);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <>
      {/* Floating Action Button Neo-Brutalism */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-5 z-40 bg-amber-300 text-teal-950 border-2 border-teal-950 px-4 py-3 rounded-2xl shadow-[4px_4px_0px_#042f2e] font-black text-xs flex items-center gap-1.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
      >
        <Zap size={18} className="fill-teal-950" />
        <span>+ Jajan Cepat</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF8F5] border-2 border-teal-950 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-[6px_6px_0px_#042f2e] animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-teal-950">
                Catat Cepat (5 Detik)
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-200 border-2 border-teal-950 rounded-lg text-teal-950"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <p className="p-2 mb-3 text-xs font-bold text-rose-600 bg-rose-50 border-2 border-rose-600 rounded-xl">
                {error}
              </p>
            )}

            <form onSubmit={handleFastSubmit} className="space-y-3">
              {/* Input Nominal Otomatis Terfokus */}
              <div className="bg-white border-2 border-teal-950 p-3 rounded-xl shadow-[2px_2px_0px_#042f2e]">
                <span className="text-[10px] font-black text-teal-900/60 uppercase">
                  Nominal Pengeluaran (Rp)
                </span>
                <input
                  name="amount"
                  type="number"
                  placeholder="25000"
                  autoFocus
                  required
                  min="1"
                  className="w-full text-2xl font-black text-teal-950 focus:outline-none placeholder:text-slate-300"
                />
              </div>

              {/* Pos Anggaran */}
              <div className="bg-white border-2 border-teal-950 p-2.5 rounded-xl shadow-[2px_2px_0px_#042f2e]">
                <span className="text-[10px] font-black text-teal-900/60 uppercase block">
                  Pilih Pos Anggaran
                </span>
                <select
                  name="budgetId"
                  className="w-full bg-transparent font-bold text-xs text-teal-950 focus:outline-none mt-1"
                >
                  <option value="">-- Tanpa Pos Anggaran --</option>
                  {budgets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Keterangan */}
              <div className="bg-white border-2 border-teal-950 p-2.5 rounded-xl shadow-[2px_2px_0px_#042f2e]">
                <span className="text-[10px] font-black text-teal-900/60 uppercase block">
                  Keterangan Singkat
                </span>
                <input
                  name="notes"
                  type="text"
                  required
                  placeholder="Contoh: Kopi susu, Warteg siang"
                  className="w-full text-xs font-bold text-teal-950 focus:outline-none mt-0.5"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-950 text-amber-300 font-black rounded-xl text-xs border-2 border-teal-950 shadow-[3px_3px_0px_#042f2e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
              >
                {loading ? "Menyimpan..." : "Simpan Seketika ⚡"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}