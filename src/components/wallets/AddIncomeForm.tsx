"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal, Plus, Trash2, Check } from "lucide-react";
import { Toggle } from "@/src/components/ui/toggle/OptionToggle";
import {
  formatNumberInput,
  parseNumberInput,
  getCurrentPeriod,
  formatRupiah,
} from "@/src/lib/utils";
import { processIncomeWorkflow } from "@/src/actions/wallet";

interface ExistingWallet {
  id: string;
  name: string;
}

interface SplitItem {
  id: string;
  name: string;
  amountStr: string;
}

export function IncomeForm({
  userId,
  existingWallets,
}: {
  userId: string;
  existingWallets: ExistingWallet[];
}) {
  const router = useRouter();

  // Input gaji awal (kosong agar user mengisi sendiri)
  const [totalIncomeStr, setTotalIncomeStr] = useState<string>("");
  const [enableBudget, setEnableBudget] = useState<boolean>(false);
  const [enableSplit, setEnableSplit] = useState<boolean>(true);

  // Default baris split mengambil dompet yang ada selain Kantong Utama
  const initialSplits: SplitItem[] = existingWallets
    .filter((w) => w.name.toLowerCase() !== "kantong utama")
    .slice(0, 2)
    .map((w) => ({
      id: w.id,
      name: w.name,
      amountStr: "",
    }));

  const [splits, setSplits] = useState<SplitItem[]>(
    initialSplits.length > 0
      ? initialSplits
      : [{ id: "1", name: "BCA", amountStr: "" }]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalIncomeNum = parseNumberInput(totalIncomeStr);

  // Hitung Kuota 50/30/20 dari total gaji yang diinput
  const budget50 = Math.round(totalIncomeNum * 0.5);
  const budget30 = Math.round(totalIncomeNum * 0.3);
  const budget20 = Math.round(totalIncomeNum * 0.2);

  // Total uang yang disebar ke dompet
  const totalSplitsNum = enableSplit
    ? splits.reduce((acc, curr) => acc + parseNumberInput(curr.amountStr), 0)
    : 0;

  // Sisa bersih yang akan mengendap di Kantong Utama
  const remainingForMain = Math.max(0, totalIncomeNum - totalSplitsNum);
  const isOverAllocated = totalSplitsNum > totalIncomeNum;

  // Fitur Bagi Rata Sesuai Jumlah Dompet
  const handleSplitEqually = () => {
    if (totalIncomeNum <= 0 || splits.length === 0) return;
    const share = Math.floor(totalIncomeNum / splits.length);
    setSplits((prev) =>
      prev.map((s) => ({
        ...s,
        amountStr: formatNumberInput(share),
      }))
    );
  };

  const handleAddSplit = () => {
    setSplits((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        amountStr: "",
      },
    ]);
  };

  const handleRemoveSplit = (id: string) => {
    setSplits((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSplitName = (id: string, name: string) => {
    setSplits((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
  };

  const handleUpdateSplitAmount = (id: string, val: string) => {
    setSplits((prev) =>
      prev.map((s) => (s.id === id ? { ...s, amountStr: formatNumberInput(val) } : s))
    );
  };

  const handleSubmit = async () => {
    const totalIncomeNum = parseNumberInput(totalIncomeStr);

    if (totalIncomeNum <= 0) {
      setErrorMessage("Silakan masukkan nominal gaji.");
      return;
    }

    // DEBUG FRONTEND SEBELUM KIRIM
    console.log("Splits State saat ini:", splits);

    const walletSplitsPayload = enableSplit
      ? splits
        .filter((s) => s.name.trim() !== "" && parseNumberInput(s.amountStr) > 0)
        .map((s) => ({
          name: s.name.trim(),
          amount: parseNumberInput(s.amountStr),
        }))
      : [];

    console.log("Payload splits yang dikirim ke BE:", walletSplitsPayload);

    setIsLoading(true);
    setErrorMessage("");

    try {
      const period = getCurrentPeriod();

      const budgetsPayload = enableBudget
        ? [
          { name: "Kebutuhan Pokok (50%)", amount: budget50, period },
          { name: "Keinginan (30%)", amount: budget30, period },
          { name: "Tabungan (20%)", amount: budget20, period },
        ]
        : [];

      const res = await processIncomeWorkflow({
        userId,
        mainWalletName: "Kantong Utama",
        totalIncome: totalIncomeNum,
        notes: "Gaji Bulanan",
        budgets: budgetsPayload,
        walletSplits: walletSplitsPayload, // <-- PASTIKAN INI TERKIRIM
      });

      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        router.push("/dashboard/wallets");
        router.refresh();
      }
    } catch (err) {
      setErrorMessage("Gagal mengirim data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 py-2">
        <Link
          href="/dashboard/wallets"
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-800 shadow-sm border border-slate-100 hover:bg-slate-50 transition active:scale-95"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
            Tambah Pemasukan
          </h1>
          <p className="text-xs font-semibold text-slate-400">
            Atur arus kas ke pos & dompet
          </p>
        </div>
      </div>

      {/* Pesan Kesalahan */}
      {errorMessage && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
          {errorMessage}
        </div>
      )}

      {/* 1. Input Nominal Gaji */}
      <div className="bg-white rounded-[26px] p-5 shadow-sm border border-slate-100/80">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2">
          NOMINAL GAJI / UANG MASUK
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-slate-400">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={totalIncomeStr}
            onChange={(e) => setTotalIncomeStr(formatNumberInput(e.target.value))}
            placeholder="0"
            className="w-full text-2xl font-black text-slate-900 focus:outline-none placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* 2. Toggle POS 50/30/20 */}
      <div className="bg-white rounded-[26px] p-5 shadow-sm border border-slate-100/80 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
              REKOMENDASI POS 50/30/20
            </h3>
            <p className="text-[11px] font-medium text-slate-400 leading-snug mt-0.5">
              Bagi otomatis kuota Kebutuhan, Keinginan, dan Tabungan
            </p>
          </div>
          <Toggle checked={enableBudget} onChange={setEnableBudget} />
        </div>

        {enableBudget && (
          <div className="pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Kebutuhan Pokok (50%)</span>
              <span className="text-[#062828] font-black">{formatRupiah(budget50)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Keinginan (30%)</span>
              <span className="text-[#062828] font-black">{formatRupiah(budget30)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Tabungan (20%)</span>
              <span className="text-emerald-700 font-black">{formatRupiah(budget20)}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Toggle Sebar ke Dompet Lain */}
      <div className="bg-white rounded-[26px] p-5 shadow-sm border border-slate-100/80">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
              SEBAR KE DOMPET LAIN
            </h3>
            <p className="text-[11px] font-medium text-slate-400 leading-snug mt-0.5">
              Buat/Transfer ke Kas Tunai, GoPay, atau Bank Lain
            </p>
          </div>
          <Toggle checked={enableSplit} onChange={setEnableSplit} />
        </div>
      </div>

      {/* 4. Kontainer Split Dompet */}
      {enableSplit && (
        <div className="bg-[#F8FAFC]/90 rounded-[28px] p-4 border border-slate-200/60 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800">
              <SlidersHorizontal size={14} className="stroke-[2.5]" />
              <span>Dompet Tujuan & Nominal</span>
            </div>

            <div className="flex items-center gap-2">
              {totalIncomeNum > 0 && splits.length > 0 && (
                <button
                  type="button"
                  onClick={handleSplitEqually}
                  className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-xl text-[11px] font-bold hover:bg-slate-50"
                >
                  Bagi Rata
                </button>
              )}
              <button
                type="button"
                onClick={handleAddSplit}
                className="flex items-center gap-1 bg-[#FEF08A] border border-amber-300 text-black px-3 py-1.5 rounded-xl text-xs font-black hover:bg-amber-300 transition active:scale-95 shadow-xs"
              >
                <Plus size={13} className="stroke-[3]" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {splits.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[22px] p-4 shadow-xs border border-slate-100 space-y-3"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateSplitName(item.id, e.target.value)}
                    placeholder="Nama Dompet (mis: BCA, GoPay)"
                    className="font-black text-xs text-slate-800 focus:outline-none w-full"
                  />
                  {splits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSplit(item.id)}
                      className="text-slate-400 hover:text-red-500 transition p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                    NOMINAL PINDAH
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-400">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={item.amountStr}
                      onChange={(e) => handleUpdateSplitAmount(item.id, e.target.value)}
                      placeholder="0"
                      className="w-full text-base font-black text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indikator Balance Realtime Sisa Kantong Utama */}
          <div
            className={`p-3.5 rounded-2xl flex justify-between items-center text-xs border ${isOverAllocated
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-100 text-emerald-900"
              }`}
          >
            <span className="font-bold">
              {isOverAllocated ? "Kelebihan Alokasi:" : "Sisa Masuk ke Kantong Utama:"}
            </span>
            <span className="font-black">
              {isOverAllocated
                ? `-${formatRupiah(totalSplitsNum - totalIncomeNum)}`
                : formatRupiah(remainingForMain)}
            </span>
          </div>
        </div>
      )}

      {/* Tombol Simpan */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isLoading || totalIncomeNum <= 0 || isOverAllocated}
          onClick={handleSubmit}
          className="w-full py-3.5 bg-[#062828] disabled:bg-slate-300 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-[2px_2px_0px_#042f2e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
        >
          <Check size={16} className="stroke-[3]" />
          <span>{isLoading ? "Menyimpan Arus Kas..." : "Simpan Pemasukan"}</span>
        </button>
      </div>
    </div>
  );
}