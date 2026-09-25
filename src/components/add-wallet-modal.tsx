"use client";

import { useState } from "react";
import { createWallet } from "@/src/actions/wallet";
import { Plus, X, Landmark } from "lucide-react";

export function AddWalletModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const res = await createWallet(formData);

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
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 border-2 border-dashed border-blue-300 rounded-2xl flex items-center justify-center gap-2 text-blue-600 font-semibold text-sm hover:bg-blue-50/50 active:scale-[0.99] transition"
      >
        <Plus size={18} />
        Tambah Dompet / Rekening
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-800">
                <Landmark size={20} className="text-blue-600" />
                <h3 className="font-bold text-base">Rekening / Dompet Baru</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <p className="p-2 mb-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Nama Dompet / Bank
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="BCA Gaji, Kantong Seabank, Dompet Kas"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Saldo Awal (Saat Ini)
                </label>
                <input
                  name="initialBalance"
                  type="number"
                  min="0"
                  defaultValue="0"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Isi saldo riil yang sekarang sedang ada di rekening ini.
                </span>
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
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}