"use client";

import { useState } from "react";
import { createBudget, copyPreviousMonthBudgets } from "@/src/actions/budget";
import { Plus, X, FolderPlus, Copy } from "lucide-react";

export function AddBudgetModal({ currentPeriod }: { currentPeriod: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("period", currentPeriod);

    const res = await createBudget(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
    }
  }

  async function handleCopy() {
    setLoading(true);
    setError(null);
    const res = await copyPreviousMonthBudgets(currentPeriod);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 font-semibold text-xs active:scale-[0.99] transition shadow-sm"
        >
          <Plus size={16} />
          Buat Pos Baru
        </button>
        <button
          onClick={handleCopy}
          disabled={loading}
          className="py-3 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl flex items-center gap-1.5 font-semibold text-xs transition disabled:opacity-50"
          title="Salin dari bulan lalu"
        >
          <Copy size={16} className="text-slate-500" />
          <span>Salin Bulan Lalu</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-800">
                <FolderPlus size={20} className="text-blue-600" />
                <h3 className="font-bold text-base">Pos Anggaran Baru</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <p className="p-2.5 mb-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Nama Pos / Kategori
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Makan Bulanan, Listrik & Air, Kos"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Jenis Pos
                </label>
                <select
                  name="type"
                  defaultValue="EXPENSE"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EXPENSE">Pengeluaran Habis (Expense)</option>
                  <option value="SAVING">Target Tabungan (Saving)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Target Alokasi Dana (Rp)
                </label>
                <input
                  name="allocatedAmount"
                  type="number"
                  min="1"
                  required
                  placeholder="Contoh: 1500000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Buat Pos"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}