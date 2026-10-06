"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wallet,
  CalendarDays,
  PieChart,
  Plus,
  X,
  ArrowDownLeft,
  FolderPlus,
  PiggyBank,
  Check,
  ChevronDown,
} from "lucide-react";

interface OptionItem {
  id: string;
  name: string;
}

export function BottomNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const [wallets, setWallets] = useState<OptionItem[]>([]);
  const [budgets, setBudgets] = useState<OptionItem[]>([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ambil opsi dropdown dari API saat popup dibuka
  useEffect(() => {
    if (isOpen && wallets.length === 0 && budgets.length === 0) {
      setLoadingOptions(true);
      fetch("/api/transactions/options")
        .then((res) => res.json())
        .then((data) => {
          if (data.wallets?.length) {
            setWallets(data.wallets);
            setSelectedWallet(data.wallets[0].id);
          }
          if (data.budgets?.length) {
            setBudgets(data.budgets);
            setSelectedBudget(data.budgets[0].id);
          }
        })
        .catch(() => setError("Gagal memuat opsi dompet & budget"))
        .finally(() => setLoadingOptions(false));
    }
  }, [isOpen, wallets.length, budgets.length]);

  async function handleFastSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Masukkan nominal yang valid");
      return;
    }
    if (!selectedWallet) {
      setError("Pilih pocket asal uang");
      return;
    }
    if (!selectedBudget) {
      setError("Pilih pos budget");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          walletId: selectedWallet,
          budgetId: selectedBudget,
          description: note,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal mencatat transaksi");

      setAmount("");
      setNote("");
      setIsOpen(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const leftNavs = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Poket", href: "/dashboard/wallets", icon: Wallet },
  ];

  const rightNavs = [
    { label: "Kalender", href: "/dashboard/calendar", icon: CalendarDays },
    { label: "Budget", href: "/dashboard/budgets", icon: PieChart },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-[#062828]/40 backdrop-blur-[2px]"
        />
      )}

      {/* Popup Menu Akses Cepat */}
      <div
        className={`fixed left-0 right-0 z-50 max-w-md mx-auto px-4 transition-all duration-200 ${
          isOpen
            ? "bottom-24 opacity-100 scale-100 pointer-events-auto"
            : "bottom-16 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-[#fcfde8] border-2 border-[#062828] rounded-[28px] p-4 shadow-[4px_4px_0px_#062828]">
          <div className="flex items-center justify-between pb-2 border-b border-[#062828]/15 mb-3">
            <span className="text-xs font-black tracking-wider uppercase text-[#062828]">
              Akses & Catat Cepat
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full bg-white border border-[#062828] text-[#062828] hover:bg-[#FEF08A]"
            >
              <X size={14} className="stroke-[3]" />
            </button>
          </div>

          {/* 3 Tombol Navigasi Halaman */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Link
              href="/dashboard/wallets/income"
              onClick={() => setIsOpen(false)}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white border-2 border-[#062828] shadow-[2px_2px_0px_#062828] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#FEF08A] transition text-center"
            >
              <div className="p-1.5 rounded-xl bg-[#FEF08A] border border-[#062828]">
                <ArrowDownLeft size={15} className="text-[#062828]" />
              </div>
              <span className="text-[10px] font-black text-[#062828]">Isi Saldo</span>
            </Link>

            <Link
              href="/dashboard/wallets/create"
              onClick={() => setIsOpen(false)}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white border-2 border-[#062828] shadow-[2px_2px_0px_#062828] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#FEF08A] transition text-center"
            >
              <div className="p-1.5 rounded-xl bg-[#FEF08A] border border-[#062828]">
                <FolderPlus size={15} className="text-[#062828]" />
              </div>
              <span className="text-[10px] font-black text-[#062828]">Tambah Pocket</span>
            </Link>

            <Link
              href="/dashboard/budgets/create"
              onClick={() => setIsOpen(false)}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white border-2 border-[#062828] shadow-[2px_2px_0px_#062828] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#FEF08A] transition text-center"
            >
              <div className="p-1.5 rounded-xl bg-[#FEF08A] border border-[#062828]">
                <PiggyBank size={15} className="text-[#062828]" />
              </div>
              <span className="text-[10px] font-black text-[#062828]">Tambah Budget</span>
            </Link>
          </div>

          {/* Form Transaksi Langsung */}
          <form
            onSubmit={handleFastSubmit}
            className="space-y-2 bg-white border-2 border-[#062828] p-3 rounded-2xl shadow-[2px_2px_0px_#062828]"
          >
            <span className="text-[11px] font-black uppercase tracking-wider text-[#062828] block">
              Catat Transaksi Langsung
            </span>

            {error && (
              <p className="text-[10px] font-bold text-red-600 bg-red-100 p-1.5 rounded-xl border border-red-300">
                {error}
              </p>
            )}

            {/* Input Nominal */}
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-black text-[#062828]">Rp</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-[#F9F8F6] border-2 border-[#062828] rounded-xl py-1.5 pl-9 pr-3 text-xs font-black text-[#062828] focus:outline-none focus:ring-1 focus:ring-[#FEC000]"
              />
            </div>

            {/* 2 Dropdown Bersebelahan */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full bg-[#F9F8F6] border-2 border-[#062828] rounded-xl py-1.5 px-2 text-[11px] font-bold text-[#062828] appearance-none focus:outline-none truncate pr-6 disabled:opacity-50"
                >
                  {wallets.length === 0 ? (
                    <option value="">Pilih Pocket...</option>
                  ) : (
                    wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={13} className="absolute right-2 top-2.5 text-[#062828] pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full bg-[#F9F8F6] border-2 border-[#062828] rounded-xl py-1.5 px-2 text-[11px] font-bold text-[#062828] appearance-none focus:outline-none truncate pr-6 disabled:opacity-50"
                >
                  {budgets.length === 0 ? (
                    <option value="">Pilih Budget...</option>
                  ) : (
                    budgets.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={13} className="absolute right-2 top-2.5 text-[#062828] pointer-events-none" />
              </div>
            </div>

            {/* Catatan Ringkas */}
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan (cth: Makan Siang)"
              className="w-full bg-[#F9F8F6] border-2 border-[#062828] rounded-xl py-1.5 px-2.5 text-xs font-bold text-[#062828] focus:outline-none"
            />

            {/* Tombol Simpan */}
            <button
              type="submit"
              disabled={loading || loadingOptions}
              className="w-full py-2 bg-[#FEC000] border-2 border-[#062828] rounded-xl font-black text-xs text-[#062828] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#062828] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#FEF08A] transition disabled:opacity-50"
            >
              <Check size={14} className="stroke-[3]" />
              <span>{loading ? "Menyimpan Transaksi..." : "Simpan Transaksi"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-4 pointer-events-none">
        <div className="relative bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 py-2 px-3 flex items-center justify-between pointer-events-auto">
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
                  <div className={`p-1.5 rounded-xl ${isActive ? "bg-[#FEF08A] text-[#062828]" : ""}`}>
                    <Icon size={19} className="stroke-[2.5]" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Tombol Plus Tengah */}
          <div className="relative -top-5 px-2 flex justify-center">
            <div className="p-1.5 bg-[#F8FAF9] rounded-full">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#062828] shadow-[2px_2px_0px_#062828] active:scale-95 transition-all ${
                  isOpen ? "bg-[#FEF08A] text-[#062828] rotate-45" : "bg-[#062828] text-[#FEF08A]"
                }`}
              >
                <Plus size={22} className="stroke-[3] transition-transform duration-200" />
              </button>
            </div>
          </div>

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
                  <div className={`p-1.5 rounded-xl ${isActive ? "bg-[#FEF08A] text-[#062828]" : ""}`}>
                    <Icon size={19} className="stroke-[2.5]" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}