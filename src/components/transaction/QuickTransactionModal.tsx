"use client";

import { useState, useEffect } from "react";
import { X, Check, ChevronDown } from "lucide-react";

interface OptionItem {
  id: string;
  name: string;
  balance?: number;
}

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickTransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickTransactionModalProps) {
  const [wallets, setWallets] = useState<OptionItem[]>([]);
  const [budgets, setBudgets] = useState<OptionItem[]>([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [rawAmount, setRawAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ambil opsi Pocket & Budget saat modal pertama kali dibuka
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
        .catch(() => setError("Gagal mengambil daftar Pocket dan Budget"))
        .finally(() => setLoadingOptions(false));
    }
  }, [isOpen, wallets.length, budgets.length]);

  // Handler format input angka menjadi Rupiah (contoh: 50.000)
  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setDisplayAmount("");
      setRawAmount(0);
      return;
    }
    const num = parseInt(rawVal, 10);
    setRawAmount(num);
    setDisplayAmount(num.toLocaleString("id-ID"));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rawAmount <= 0) {
      setError("Masukkan nominal yang valid");
      return;
    }
    if (!selectedWallet) {
      setError("Silakan pilih Pocket sumber");
      return;
    }
    if (!selectedBudget) {
      setError("Silakan pilih Pos Budget");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: rawAmount,
          walletId: selectedWallet,
          budgetId: selectedBudget,
          description: notes,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Gagal mencatat transaksi");

      // Reset Form
      setDisplayAmount("");
      setRawAmount(0);
      setNotes("");
      onClose();

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#062828]/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-[#fcfde8] border-2 border-[#062828] rounded-[28px] p-5 shadow-[5px_5px_0px_#062828] relative">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#062828]/10 mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-[#062828]">
            Catat Pengeluaran Cepat
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-white border-2 border-[#062828] text-[#062828] hover:bg-[#FEF08A] transition"
          >
            <X size={14} className="stroke-[3]" />
          </button>
        </div>

        {error && (
          <p className="text-[11px] font-bold text-red-600 bg-red-100 border border-red-300 p-2 rounded-xl mb-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Input Nominal Rupiah */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-[#57595B] mb-1 block">
              Nominal Pengeluaran
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-black text-[#062828]">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-white border-2 border-[#062828] rounded-xl py-2 pl-10 pr-3 text-sm font-black text-[#062828] focus:outline-none focus:ring-2 focus:ring-[#FEC000]"
              />
            </div>
          </div>

          {/* 2 Dropdown Bersebelahan */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#57595B] mb-1 block">
                Sumber Pocket
              </label>
              <div className="relative">
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full bg-white border-2 border-[#062828] rounded-xl py-2 px-2.5 text-xs font-bold text-[#062828] appearance-none focus:outline-none truncate pr-6 disabled:opacity-50"
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
                <ChevronDown size={14} className="absolute right-2 top-3 text-[#062828] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#57595B] mb-1 block">
                Pos Budget
              </label>
              <div className="relative">
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full bg-white border-2 border-[#062828] rounded-xl py-2 px-2.5 text-xs font-bold text-[#062828] appearance-none focus:outline-none truncate pr-6 disabled:opacity-50"
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
                <ChevronDown size={14} className="absolute right-2 top-3 text-[#062828] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Input Catatan */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-[#57595B] mb-1 block">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Makan Siang, Bensin"
              className="w-full bg-white border-2 border-[#062828] rounded-xl py-2 px-3 text-xs font-bold text-[#062828] focus:outline-none"
            />
          </div>

          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={loading || loadingOptions}
            className="w-full mt-2 py-3 bg-[#FEC000] border-2 border-[#062828] rounded-2xl font-black text-xs text-[#062828] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#062828] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#FEF08A] transition disabled:opacity-50"
          >
            <Check size={16} className="stroke-[3]" />
            <span>{loading ? "Menyimpan Transaksi..." : "Simpan Transaksi"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}