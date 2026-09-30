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
      {/* Baris Tombol Aksi */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 py-3 px-4 bg-[#062828] hover:bg-[#0b3838] active:scale-[0.99] text-[#FEF08A] rounded-2xl flex items-center justify-center gap-2 font-black text-xs transition shadow-sm"
        >
          <Plus size={16} className="stroke-[3]" />
          <span>Buat Pos Baru</span>
        </button>

        <button
          onClick={handleCopy}
          disabled={loading}
          className="py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200/80 text-[#062828] rounded-2xl flex items-center gap-1.5 font-bold text-xs transition disabled:opacity-50 shadow-xs"
          title="Salin dari bulan lalu"
        >
          <Copy size={15} className="text-slate-400" />
          <span>Salin Bulan Lalu</span>
        </button>
      </div>

      {/* Modal Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#062828]/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#F8FAF9] w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#FEF08A] text-[#062828] rounded-xl">
                  <FolderPlus size={18} className="stroke-[2.5]" />
                </div>
                <h3 className="font-black text-sm text-[#062828] uppercase tracking-wider">
                  Pos Anggaran Baru
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-white text-slate-400 hover:text-[#062828] shadow-xs transition"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <p className="p-2.5 mb-3 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl">
                {error}
              </p>
            )}

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Nama Pos / Kategori
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Contoh: Makan Bulanan, Listrik & Air"
                  className="w-full font-bold text-xs text-[#062828] placeholder:text-slate-300 focus:outline-none"
                />
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Jenis Pos
                </label>
                <select
                  name="type"
                  defaultValue="EXPENSE"
                  className="w-full bg-transparent font-bold text-xs text-[#062828] focus:outline-none"
                >
                  <option value="EXPENSE">Pengeluaran Habis (Expense)</option>
                  <option value="SAVING">Target Tabungan (Saving)</option>
                </select>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Target Alokasi Dana (Rp)
                </label>
                <input
                  name="allocatedAmount"
                  type="number"
                  min="1"
                  required
                  placeholder="Contoh: 1500000"
                  className="w-full font-bold text-xs text-[#062828] placeholder:text-slate-300 focus:outline-none"
                />
              </div>

              {/* Tombol Aksi Bawah */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-500 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-2xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 text-xs font-black text-[#FEF08A] bg-[#062828] hover:bg-[#0b3838] active:scale-[0.99] rounded-2xl shadow-sm transition disabled:opacity-50"
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