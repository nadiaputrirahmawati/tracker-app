"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addExpense } from "@/src/actions/expense";
import { formatRupiah } from "@/src/lib/utils";
import { ArrowLeft, Wallet, PieChart, Calendar, FileEdit } from "lucide-react";
import Link from "next/link";

interface ExpenseFormProps {
  wallets: { id: string; name: string; balance: number }[];
  budgets: { id: string; name: string }[];
}

export function ExpenseForm({ wallets, budgets }: ExpenseFormProps) {
  // Hook useSearchParams sekarang berada DI DALAM function component
  const searchParams = useSearchParams();
  const defaultBudgetId = searchParams.get("budgetId") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const res = await addExpense(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-teal-950">
      <div className="bg-white border-b-2 border-teal-950 px-4 py-3 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-xl border-2 border-teal-950 bg-white hover:bg-amber-100 text-teal-950 shadow-[2px_2px_0px_#042f2e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-base font-black text-teal-950">Catat Pengeluaran</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <div className="p-3 text-xs font-bold text-rose-600 bg-rose-50 border-2 border-rose-600 rounded-xl">
            {error}
          </div>
        )}

        {/* Input Nominal Pengeluaran */}
        <div className="bg-white p-4 rounded-2xl border-2 border-teal-950 text-center shadow-[4px_4px_0px_#042f2e]">
          <label className="block text-xs font-black text-teal-900/60 uppercase tracking-wider mb-2">
            Nominal Belanja
          </label>
          <div className="flex items-center justify-center gap-1">
            <span className="text-xl font-black text-teal-900/40">Rp</span>
            <input
              name="amount"
              type="number"
              required
              min="1"
              placeholder="0"
              className="text-3xl font-black text-teal-950 w-full text-center focus:outline-none placeholder:text-slate-300"
              autoFocus
            />
          </div>
        </div>

        {/* Container Opsi Form */}
        <div className="bg-white rounded-2xl border-2 border-teal-950 divide-y-2 divide-teal-950 shadow-[4px_4px_0px_#042f2e] overflow-hidden">
          {/* Dompet Pemotongan */}
          <div className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-amber-100 border border-teal-950 text-teal-950 rounded-xl">
              <Wallet size={18} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase text-teal-900/60">
                Bayar Pakai Dompet
              </label>
              <select
                name="walletId"
                required
                defaultValue={wallets[0]?.id || ""}
                className="w-full bg-transparent text-sm font-bold text-teal-950 focus:outline-none mt-0.5"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Sisa: {formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pos Anggaran (Amplop) */}
          <div className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 border border-teal-950 text-teal-950 rounded-xl">
              <PieChart size={18} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase text-teal-900/60">
                Alokasi Pos Anggaran
              </label>
              <select
                name="budgetId"
                defaultValue={defaultBudgetId}
                className="w-full bg-transparent text-sm font-bold text-teal-950 focus:outline-none mt-0.5"
              >
                <option value="">-- Tanpa Pos Anggaran --</option>
                {budgets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tanggal Transaksi */}
          <div className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-blue-100 border border-teal-950 text-teal-950 rounded-xl">
              <Calendar size={18} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase text-teal-900/60">
                Tanggal Transaksi
              </label>
              <input
                name="transactionDate"
                type="date"
                defaultValue={today}
                required
                className="w-full bg-transparent text-sm font-bold text-teal-950 focus:outline-none mt-0.5"
              />
            </div>
          </div>

          {/* Catatan Belanja */}
          <div className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-rose-100 border border-teal-950 text-teal-950 rounded-xl">
              <FileEdit size={18} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase text-teal-900/60">
                Keterangan Belanja
              </label>
              <input
                name="notes"
                type="text"
                required
                placeholder="Contoh: Makan siang warteg, bayar pulsa"
                className="w-full bg-transparent text-sm font-bold text-teal-950 placeholder:text-slate-300 focus:outline-none mt-0.5"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || wallets.length === 0}
          className="w-full py-3.5 px-4 bg-teal-950 hover:bg-teal-900 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-amber-300 font-black rounded-xl border-2 border-teal-950 shadow-[4px_4px_0px_#042f2e] transition disabled:opacity-50 text-xs uppercase tracking-wider"
        >
          {loading ? "Menyimpan Pengeluaran..." : "Simpan Pengeluaran"}
        </button>
      </form>
    </div>
  );
}