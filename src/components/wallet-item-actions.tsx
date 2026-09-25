"use client";

import { useState } from "react";
import { updateWallet, deleteWallet } from "@/src/actions/wallet";
import { Pencil, Trash2, X } from "lucide-react";

interface WalletItemActionsProps {
  wallet: {
    id: string;
    name: string;
    currentBalance: number;
  };
}

export function WalletItemActions({ wallet }: WalletItemActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    form.set("id", wallet.id);
    await updateWallet(form);
    setLoading(false);
    setIsOpen(false);
  }

  async function handleDelete() {
    if (confirm(`Yakin ingin menghapus dompet "${wallet.name}"? Semua mutasi di dompet ini akan ikut terhapus!`)) {
      setLoading(true);
      await deleteWallet(wallet.id);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex gap-1.5 items-center">
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 border border-teal-950 bg-amber-100 hover:bg-amber-200 rounded-lg text-teal-950 transition active:scale-95"
          title="Edit Dompet"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="p-1.5 border border-teal-950 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition active:scale-95 disabled:opacity-50"
          title="Hapus Dompet"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF8F5] border-2 border-teal-950 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-[6px_6px_0px_#042f2e] animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-black uppercase text-teal-950">Edit Dompet</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 border border-teal-950 rounded-lg">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3">
              <div className="bg-white border-2 border-teal-950 p-2.5 rounded-xl shadow-[2px_2px_0px_#042f2e]">
                <label className="text-[10px] font-black uppercase text-teal-900/60 block">Nama Dompet</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={wallet.name}
                  required
                  className="w-full text-sm font-bold text-teal-950 focus:outline-none mt-0.5"
                />
              </div>

              <div className="bg-white border-2 border-teal-950 p-2.5 rounded-xl shadow-[2px_2px_0px_#042f2e]">
                <label className="text-[10px] font-black uppercase text-teal-900/60 block">Sesuaikan Saldo Saat Ini (Rp)</label>
                <input
                  name="currentBalance"
                  type="number"
                  defaultValue={wallet.currentBalance}
                  required
                  className="w-full text-sm font-bold text-teal-950 focus:outline-none mt-0.5"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-teal-950 text-amber-300 font-black rounded-xl text-xs border-2 border-teal-950 shadow-[3px_3px_0px_#042f2e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
              >
                {loading ? "Menyimpan..." : "Perbarui Dompet"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}