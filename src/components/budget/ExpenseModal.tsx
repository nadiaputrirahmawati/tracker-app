"use client";

import { useState } from "react";
import { X, Wallet as WalletIcon, Calendar, FileText } from "lucide-react";
import { formatNumberInput, parseNumberInput, formatRupiah } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/Button";
import { createExpenseAction } from "@/src/actions/expense";
import { BudgetItemView } from "@/src/services/budget.service";

export interface WalletOption {
  id: string;
  name: string;
  balance: number;
}

interface ExpenseModalProps {
  budget: BudgetItemView | null;
  wallets: WalletOption[];
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseModal({
  budget,
  wallets,
  userId,
  isOpen,
  onClose,
}: ExpenseModalProps) {
  const [amountStr, setAmountStr] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState(
    wallets[0]?.id || ""
  );
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !budget) return null;

  const expenseAmount = parseNumberInput(amountStr);
  const chosenWallet = wallets.find((w) => w.id === selectedWalletId);
  const isWalletInsufficient =
    chosenWallet ? chosenWallet.balance < expenseAmount : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (expenseAmount <= 0) {
      setErrorMessage("Nominal belanja harus lebih dari 0.");
      return;
    }

    if (!selectedWalletId) {
      setErrorMessage("Silakan pilih dompet sumber pembayaran.");
      return;
    }

    if (isWalletInsufficient) {
      setErrorMessage(`Saldo ${chosenWallet?.name} tidak mencukupi.`);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await createExpenseAction({
        userId,
        budgetId: budget.id,
        walletId: selectedWalletId,
        amount: expenseAmount,
        notes,
      });

      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setAmountStr("");
        setNotes("");
        onClose();
      }
    } catch {
      setErrorMessage("Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-spoket-white rounded-t-[32px] sm:rounded-[32px] border-2 border-spoket-dark p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-spoket-darker uppercase tracking-wider">
              CATAT PENGELUARAN
            </span>
            <h3 className="text-base font-black text-spoket-dark">
              {budget.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-spoket-gray flex items-center justify-center text-spoket-dark hover:bg-slate-200 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Ringkasan Kuota Jatah */}
        <div className="bg-spoket-cream p-3 rounded-2xl border border-spoket-dark/10 flex items-center justify-between text-xs">
          <span className="font-bold text-spoket-darker">Sisa Kuota Belanja:</span>
          <span className="font-black text-spoket-dark">
            {formatRupiah(budget.remainingAmount)}
          </span>
        </div>

        {errorMessage && (
          <div className="p-2.5 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Input Nominal Pengeluaran */}
          <div className="bg-spoket-gray p-4 rounded-2xl border-2 border-spoket-dark/10 focus-within:border-spoket-dark transition">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              NOMINAL BELANJA
            </span>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-2xl font-black text-spoket-dark">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={amountStr}
                onChange={(e) => setAmountStr(formatNumberInput(e.target.value))}
                placeholder="0"
                className="w-full text-2xl font-black text-spoket-dark focus:outline-none bg-transparent placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Pilih Dompet Pembayaran */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-spoket-darker uppercase tracking-wider block px-1">
              DIBAYAR MENGGUNAKAN DOMPET
            </label>
            <div className="relative">
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="w-full bg-spoket-white text-xs font-bold text-spoket-dark py-3 pl-3 pr-8 rounded-2xl border-2 border-spoket-dark/15 focus:outline-none focus:border-spoket-dark cursor-pointer appearance-none"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} — Saldo: {formatRupiah(w.balance)}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-spoket-darker">
                <WalletIcon size={15} />
              </div>
            </div>
          </div>

          {/* Catatan Belanja (Opsional) */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-spoket-darker uppercase tracking-wider block px-1">
              CATATAN (OPSIONAL)
            </label>
            <div className="flex items-center gap-2 bg-spoket-white px-3 py-2.5 rounded-2xl border-2 border-spoket-dark/15 focus-within:border-spoket-dark">
              <FileText size={15} className="text-spoket-darker shrink-0" />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Makan siang geprek, beli bensin"
                className="w-full text-xs font-bold text-spoket-dark placeholder:text-slate-300 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Tombol Simpan Button */}
          <div className="pt-2">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={expenseAmount <= 0 || isWalletInsufficient}
            >
              SIMPAN PENGELUARAN
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}