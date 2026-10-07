"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  ArrowDownLeft,
  FolderPlus,
  PiggyBank,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { formatRupiah } from "@/src/lib/utils";

// 1. Perbarui tipe data
export interface OptionWallet {
  id: string;
  name: string;
  balance: number;
}

export interface OptionBudget {
  id: string;
  name: string;
  remaining: number;
}

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickTransactionModal({
  isOpen,
  onClose,
}: QuickTransactionModalProps) {
const [wallets, setWallets] = useState<OptionWallet[]>([]);
const [budgets, setBudgets] = useState<OptionBudget[]>([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        .catch(() => setError("Gagal memuat data dompet & budget"))
        .finally(() => setLoadingOptions(false));
    }
  }, [isOpen, wallets.length, budgets.length]);

  if (!isOpen) return null;

  const rawNumber = Number(amountStr.replace(/\D/g, ""));

  async function handleFastSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rawNumber || rawNumber <= 0) {
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
          amount: rawNumber,
          walletId: selectedWallet,
          budgetId: selectedBudget,
          description: note,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal mencatat transaksi");

      setAmountStr("");
      setNote("");
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#062828]/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog di Tengah */}
      <div className="relative w-full max-w-md bg-[#fcfde8] border-2 border-[#062828] rounded-[32px] p-5 shadow-[4px_4px_0px_#062828] z-10 max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-[#062828]/15 mb-4">
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase text-[#57595B] block">
              AKSES CEPAT
            </span>
            <h2 className="text-sm font-black text-[#062828]">
              Catat Transaksi Langsung
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#062828] text-[#062828] flex items-center justify-center hover:bg-[#FEF08A] transition active:scale-95"
          >
            <X size={15} className="stroke-[3]" />
          </button>
        </div>

        {/* 3 Tombol Navigasi Pintas */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Link
            href="/dashboard/wallets/income"
            onClick={onClose}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white border-2 border-[#062828] shadow-[2px_2px_0px_#062828] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#FEF08A] transition text-center"
          >
            <div className="p-2 rounded-xl bg-[#FEF08A] border border-[#062828]">
              <ArrowDownLeft size={16} className="text-[#062828]" />
            </div>
            <span className="text-[10px] font-black text-[#062828]">Isi Saldo</span>
          </Link>

          <Link
            href="/dashboard/wallets/create"
            onClick={onClose}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white border-2 border-[#062828] shadow-[2px_2px_0px_#062828] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#FEF08A] transition text-center"
          >
            <div className="p-2 rounded-xl bg-[#FEF08A] border border-[#062828]">
              <FolderPlus size={16} className="text-[#062828]" />
            </div>
            <span className="text-[10px] font-black text-[#062828]">Tambah Poket</span>
          </Link>

          <Link
            href="/dashboard/budgets/create"
            onClick={onClose}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white border-2 border-[#062828] shadow-[2px_2px_0px_#062828] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#FEF08A] transition text-center"
          >
            <div className="p-2 rounded-xl bg-[#FEF08A] border border-[#062828]">
              <PiggyBank size={16} className="text-[#062828]" />
            </div>
            <span className="text-[10px] font-black text-[#062828]">Tambah Budget</span>
          </Link>
        </div>

        {/* Form Input Besar */}
        <form onSubmit={handleFastSubmit} className="space-y-3.5 bg-white border-2 border-[#062828] p-4 rounded-2xl shadow-[2px_2px_0px_#062828]">
          {error && (
            <p className="text-[11px] font-bold text-red-600 bg-red-100 p-2 rounded-xl border border-red-300">
              {error}
            </p>
          )}

          {/* Input Nominal Ukuran Besar */}
          <div className="bg-[#F9F8F6] p-3.5 rounded-2xl border-2 border-[#062828]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#57595B] block">
              NOMINAL BELANJA
            </span>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-2xl font-black text-[#062828]">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={amountStr}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setAmountStr(val ? new Intl.NumberFormat("id-ID").format(Number(val)) : "");
                }}
                placeholder="0"
                className="w-full text-2xl font-black text-[#062828] placeholder:text-slate-300 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Pilihan Dompet & Jatah Belanja (Ukuran Luas & Nyaman Ditekan) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#57595B] block px-1">
                DARI POKET
              </label>
              <div className="relative">
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full bg-[#F9F8F6] border-2 border-[#062828] rounded-xl py-2.5 px-3 text-xs font-bold text-[#062828] appearance-none focus:outline-none truncate pr-7 disabled:opacity-50 cursor-pointer"
                >
                  {wallets.length === 0 ? (
                    <option value="">Pilih Poket...</option>
                  ) : (
                    wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} - {formatRupiah(w.balance)}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#062828] pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#57595B] block px-1">
                POS BUDGET
              </label>
              <div className="relative">
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full bg-[#F9F8F6] border-2 border-[#062828] rounded-xl py-2.5 px-3 text-xs font-bold text-[#062828] appearance-none focus:outline-none truncate pr-7 disabled:opacity-50 cursor-pointer"
                >
                  {budgets.length === 0 ? (
                    <option value="">Pilih Pos...</option>
                  ) : (
                    budgets.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#062828] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Catatan Transaksi */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#57595B] block px-1">
              CATATAN
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Makan siang, beli token listrik"
              className="w-full bg-[#F9F8F6] border-2 border-[#062828] rounded-xl py-2.5 px-3 text-xs font-bold text-[#062828] placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Tombol Simpan Button Spoket */}
          <div className="pt-1">
            <Button
              type="submit"
              isLoading={loading}
              disabled={loading || loadingOptions || rawNumber <= 0}
            >
              SIMPAN TRANSAKSI
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}