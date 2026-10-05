"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wallet, Sparkles, Check, AlertCircle } from "lucide-react";
import { formatNumberInput, parseNumberInput, formatRupiah } from "@/src/lib/utils";
import { createWalletFromMainIncome } from "@/src/actions/wallet";

interface CreateWalletFormProps {
  userId: string;
  mainWalletBalance: number;
}

const PRESET_WALLETS = [
  "BCA",
  "Mandiri",
  "GoPay",
  "ShopeePay",
  "Dana Darurat",
  "Nabung Liburan",
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
      {/* Header Top */}
      <div className="flex items-center gap-3 py-2">
        <Link
          href="/dashboard/wallets"
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-800 shadow-sm border border-slate-100 hover:bg-slate-50 transition active:scale-95"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
            Buat Kantong Baru
          </h1>
          <p className="text-xs font-semibold text-slate-400">
            Sumber dana diambil dari Kantong Utama
          </p>
        </div>
      </div>

      {/* Alert Error */}
      {errorMessage && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Kartu Informasi Sumber Dana (Kantong Utama) */}
      <div className="bg-[#062828] text-white rounded-[26px] p-5 shadow-lg border border-teal-950 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-[#FEF08A] uppercase tracking-wider">
            SUMBER DANA TERSEDIA
          </span>
          <span className="text-[10px] font-bold bg-white/10 px-2.5 py-0.5 rounded-full text-white/90">
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
            <span className="text-xs text-white/60 block">Sisa Nanti</span>
            <span
              className={`text-sm font-black ${
                isOverBalance ? "text-red-400" : "text-[#FEF08A]"
              }`}
            >
              {formatRupiah(Math.max(0, remainingMain))}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Kartu Nama Kantong & Preset */}
      <div className="bg-white rounded-[26px] p-5 shadow-sm border border-slate-100/80 space-y-3">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
          NAMA KANTONG / REKENING
        </label>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#062828] flex items-center justify-center text-white shrink-0">
            <Wallet size={18} />
          </div>
          <input
            type="text"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            placeholder="Misal: Tabungan Nikah / GoPay"
            className="w-full text-sm font-black text-slate-800 placeholder:text-slate-300 focus:outline-none"
          />
        </div>

        {/* Preset Cepat Pilihan Nama */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 mb-2">
            <Sparkles size={11} className="text-amber-500" />
            <span>PILIHAN CEPAT</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_WALLETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setWalletName(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  walletName.toLowerCase() === preset.toLowerCase()
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
      <div className="bg-white rounded-[26px] p-5 shadow-sm border border-slate-100/80 space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            ALOKASI SALDO AWAL (OPSIONAL)
          </label>
          {mainWalletBalance > 0 && (
            <button
              type="button"
              onClick={() => setAllocationStr(formatNumberInput(mainWalletBalance))}
              className="text-[11px] font-bold text-teal-800 hover:underline cursor-pointer"
            >
              Ambil Semua
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-xl font-black text-slate-400">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={allocationStr}
            onChange={(e) => setAllocationStr(formatNumberInput(e.target.value))}
            placeholder="0"
            className="w-full text-2xl font-black text-slate-900 focus:outline-none placeholder:text-slate-300"
          />
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          Jika diisi, nominal ini akan langsung dipotong dari Kantong Utama dan dimasukkan ke dompet baru ini.
        </p>
      </div>

      {/* Tombol Simpan */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || !walletName.trim() || isOverBalance}
          className="w-full py-4 bg-[#062828] disabled:bg-slate-300 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-[2px_2px_0px_#042f2e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
        >
          <Check size={16} className="stroke-[3]" />
          <span>{isLoading ? "Membuat Kantong..." : "Buat Kantong Sekarang"}</span>
        </button>
      </div>
    </form>
  );
}