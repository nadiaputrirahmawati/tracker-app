"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addIncome } from "@/src/actions/income";
import { ArrowLeft, Wallet, Calendar, FileText } from "lucide-react";
import Link from "next/link";

interface WalletOption {
  id: string;
  name: string;
  balance: number;
}

export function IncomeForm({ wallets }: { wallets: WalletOption[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Tanggal default hari ini (format YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await addIncome(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-base font-bold text-slate-800">
          Tambah Pemasukan / Gaji
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {error && (
          <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        {/* Input Nominal Besar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Nominal Pemasukan
          </label>
          <div className="flex items-center justify-center gap-1">
            <span className="text-xl font-bold text-slate-400">Rp</span>
            <input
              name="amount"
              type="number"
              required
              min="1"
              placeholder="0"
              className="text-3xl font-extrabold text-slate-900 w-full text-center focus:outline-none placeholder:text-slate-300"
              autoFocus
            />
          </div>
        </div>

        {/* Form Fields Container */}
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {/* Pilih Rekening Tujuan */}
          <div className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Wallet size={18} />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-slate-400">
                Masuk ke Dompet
              </label>
              <select
                name="walletId"
                required
                defaultValue={wallets[0]?.id || ""}
                className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none mt-0.5"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tanggal Transaksi */}
          <div className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calendar size={18} />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-slate-400">
                Tanggal Diterima
              </label>
              <input
                name="transactionDate"
                type="date"
                defaultValue={today}
                required
                className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none mt-0.5"
              />
            </div>
          </div>

          {/* Catatan / Keterangan */}
          <div className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <FileText size={18} />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-slate-400">
                Catatan (Opsional)
              </label>
              <input
                name="notes"
                type="text"
                placeholder="Contoh: Gaji Bulanan, Bonus Project"
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <button
          type="submit"
          disabled={loading || wallets.length === 0}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50 text-sm"
        >
          {loading ? "Menyimpan Data..." : "Simpan Pemasukan"}
        </button>
      </form>
    </div>
  );
}