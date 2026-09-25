"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, CalendarDays, PieChart, Plus, X, Zap } from "lucide-react";
import { addExpense } from "@/src/actions/expense";

interface BottomNavProps {
  defaultWalletId?: string;
  budgets?: { id: string; name: string }[];
}

export function BottomNav({ defaultWalletId = "1", budgets = [] }: BottomNavProps) {
  const pathname = usePathname();
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

  const leftNavs = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Dompet", href: "/dashboard/wallets", icon: Wallet },
  ];

  const rightNavs = [
    { label: "Kalender", href: "/dashboard/calendar", icon: CalendarDays },
    { label: "Pos", href: "/dashboard/budgets", icon: PieChart },
  ];

  return (
    <>
      {/* 1. Bar Navigasi Bawah */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-4 pointer-events-none">
        <div className="relative bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 py-2 px-3 flex items-center justify-between pointer-events-auto">
          
          {/* Menu Kiri */}
          <div className="flex items-center justify-around flex-1">
            {leftNavs.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 text-[11px] font-black transition-all ${
                    isActive ? "text-[#062828]" : "text-slate-400 hover:text-[#062828]"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-xl transition-all ${
                      isActive ? "bg-[#FEF08A] text-[#062828]" : ""
                    }`}
                  >
                    <Icon size={19} className="stroke-[2.5]" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Tombol Tengah Melayang (Floating Button) */}
          <div className="relative -top-5 px-2 flex justify-center">
            <div className="p-1.5 bg-[#F8FAF9] rounded-full">
              <button
                onClick={() => setIsOpen(true)}
                className="w-13 h-13 bg-[#062828] hover:bg-[#0b3838] active:scale-95 text-[#FEF08A] rounded-full flex items-center justify-center shadow-lg shadow-[#062828]/25 transition-all p-3"
                title="Catat Cepat"
              >
                <Plus size={24} className="stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Menu Kanan */}
          <div className="flex items-center justify-around flex-1">
            {rightNavs.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 text-[11px] font-black transition-all ${
                    isActive ? "text-[#062828]" : "text-slate-400 hover:text-[#062828]"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-xl transition-all ${
                      isActive ? "bg-[#FEF08A] text-[#062828]" : ""
                    }`}
                  >
                    <Icon size={19} className="stroke-[2.5]" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

        </div>
      </nav>

      {/* 2. Modal Quick Input (Sesuai Gaya Visual Dashboard) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#062828]/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#F8FAF9] w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#FEF08A] rounded-xl text-[#062828]">
                  <Zap size={16} className="fill-[#062828]" />
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#062828]">
                  Catat Cepat (5 Detik)
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-white rounded-full text-slate-400 hover:text-[#062828] shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <p className="p-2.5 mb-3 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl">
                {error}
              </p>
            )}

            <form onSubmit={handleFastSubmit} className="space-y-3.5">
              {/* Box Input Nominal */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Nominal Pengeluaran
                </span>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-black text-slate-400">Rp</span>
                  <input
                    name="amount"
                    type="number"
                    placeholder="0"
                    autoFocus
                    required
                    min="1"
                    className="w-full text-3xl font-black text-[#062828] text-center focus:outline-none placeholder:text-slate-200"
                  />
                </div>
              </div>

              {/* Pos Anggaran */}
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Pilih Pos Amplop
                </label>
                <select
                  name="budgetId"
                  className="w-full bg-transparent font-black text-xs text-[#062828] focus:outline-none"
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
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Keterangan Belanja
                </label>
                <input
                  name="notes"
                  type="text"
                  required
                  placeholder="Contoh: Kopi, Nasi Rames"
                  className="w-full font-bold text-xs text-[#062828] placeholder:text-slate-300 focus:outline-none"
                />
              </div>

              {/* Tombol Simpan */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#062828] hover:bg-[#0b3838] active:scale-[0.99] text-[#FEF08A] font-black rounded-2xl text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50 mt-2"
              >
                {loading ? "Menyimpan..." : "Simpan Pengeluaran ⚡"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}