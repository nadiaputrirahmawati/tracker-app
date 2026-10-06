"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wallet, Sparkles, Check, AlertCircle } from "lucide-react";
import { formatNumberInput, parseNumberInput, formatRupiah } from "@/src/lib/utils";
import { createWalletFromMainIncome } from "@/src/actions/wallet";
import { Button } from "@/src/components/ui/Button";

interface CreateWalletFormProps {
  userId: string;
  mainWalletBalance: number;
}

const PRESET_WALLETS = [
  "BCA",
  "GoPay",
  "ShopeePay",
  "Dana Darurat",
  "Tabungan Liburan",
];

export function CreateWalletForm({
  userId,
  mainWalletBalance,
}: CreateWalletFormProps) {
  const router = useRouter();

  const [walletName, setWalletName] = useState("");
  const [allocationStr, setAllocationStr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const allocationNum = parseNumberInput(allocationStr);
  const remainingMain = mainWalletBalance - allocationNum;
  const isOverBalance = allocationNum > mainWalletBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletName.trim()) {
      setErrorMessage("Silakan beri nama kantong Anda.");
      return;
    }

    if (isOverBalance) {
      setErrorMessage("Alokasi saldo melebihi saldo Kantong Utama.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await createWalletFromMainIncome({
        userId,
        name: walletName,
        initialAllocation: allocationNum,
      });

      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        router.push("/dashboard/wallets");
        router.refresh();
      }
    } catch {
      setErrorMessage("Terjadi kesalahan sistem, silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Kartu Informasi Sumber Dana (Kantong Utama) */}
      <div className="bg-[#062828] text-white rounded-[26px] p-5 shadow-lg border border-teal-950 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-spoket-yellowlight uppercase tracking-wider">
            SUMBER DANA
          </span>
          <span className="text-[10px] font-bold bg-spoket-gray/20 px-2.5 py-0.5 rounded-full text-white/90">
            Kantong Utama
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xs text-white/60 block">Saldo Saat Ini</span>
            <span className="text-2xl font-black text-white">
              {formatRupiah(mainWalletBalance)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-white/60 block">Sisa</span>
            <span
              className={`text-sm font-black ${isOverBalance ? "text-red-400" : "text-[#FEF08A]"
                }`}
            >
              {formatRupiah(Math.max(0, remainingMain))}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Kartu Nama Kantong & Preset */}
      <div className="bg-spoket-yellow rounded-t-2xl p-5 shadow-sm mb-0 border-2 border-spoket-dark space-y-3">

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#062828] flex items-center justify-center text-white shrink-0">
            <Wallet size={18} />
          </div>
          <input
            type="text"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            placeholder="Contoh: Tabungan Darurat"
            className="w-full text-md font-medium text-slate-700 placeholder:text-spoket-darker/60 focus:outline-none"
          />
        </div>

        {/* Preset Cepat Pilihan Nama */}
        <div className="pt-2  border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {PRESET_WALLETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setWalletName(preset)}
                className={`px-2 rounded-xl text-[10px] font-bold transition ${walletName.toLowerCase() === preset.toLowerCase()
                  ? "bg-[#062828] text-[#FEF08A]"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Kartu Nominal Alokasi Awal */}
      <div className="bg-spoket-cream rounded-b-2xl p-5 shadow-sm border-b-2 border-l-2 border-r-2 border-spoket-dark/80 mt-0 space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-spoket-dark  tracking-wider">
            ALOKASI SALDO AWAL
          </label>
          {mainWalletBalance > 0 && (
            <button
              type="button"
              onClick={() => setAllocationStr(formatNumberInput(mainWalletBalance))}
              className="text-xs bg-spoket-yellow/50 px-2 py-0.5 rounded-2xl font-medium text-spoket-dark  cursor-pointer"
            >
              Ambil Semua
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-xl font-black text-spoket-dark">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={allocationStr}
            onChange={(e) => setAllocationStr(formatNumberInput(e.target.value))}
            placeholder="0"
            className="w-full text-2xl font-black text-slate-900 focus:outline-none placeholder:text-spoket-darker/50"
          />
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          Jika diisi, nominal ini akan langsung dipotong dari Kantong Utama dan dimasukkan ke dompet baru ini.
        </p>
      </div>

      {/* Tombol Simpan */}
      <div className="pt-2">
        <Button
          type="button"
          disabled={isLoading || !walletName.trim() || isOverBalance}
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:text-spoket-gray">
          <Check size={16} className="stroke-[3]" />
          <span>{isLoading ? "Membuat Kantong..." : "Buat Kantong Sekarang"}</span>
        </Button>
      </div>
    </form>
  );
}