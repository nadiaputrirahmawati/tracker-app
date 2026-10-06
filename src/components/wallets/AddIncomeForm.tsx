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
import { Button } from "@/src/components/ui/Button";

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
  const [enableSplit, setEnableSplit] = useState<boolean>(false);

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

    <div className="w-full space-y-4 flex-1 ">
      {/* Header */}


      {/* Pesan Kesalahan */}
      {errorMessage && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
          {errorMessage}
        </div>
      )}

      {/* <div className="flex justify-center py-2">
        <h4 className="text-spoket-darker">Yuk isi saldo </h4>
      </div> */}

      {/* 1. Input Nominal Gaji */}
      <div className="mt-11 mb-1">
        <span className="text-md font-semibold text-spoket-darker  tracking-wider block mb-0">
          Masukan Nominal
        </span>
      </div>

      <div className="bg-spoket-yellow rounded-[20px] px-5 py-3 shadow-sm border-2 border-spoket-dark ">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-black">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={totalIncomeStr}
            onChange={(e) => setTotalIncomeStr(formatNumberInput(e.target.value))}
            placeholder="0"
            className="w-full text-2xl font-black text-slate-900 focus:outline-none placeholder:text-black"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center text-center">
        <span className="text-lg font-extrabold text-spoket-dark uppercase tracking-wider block mb-1">
          Mau diatur ke mana uangnya?
        </span>
        <span className="text-sm font-medium text-spoket-dark block">
          Pilih opsi yang ingin kamu terapkan
        </span>
      </div>

      <div className="bg-spoket-yellow border-2 border-spoket-dark p-3 mb-0 rounded-t-2xl">
        <div className=" space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                Budgeting Otomatis
              </h3>
              <p className="text-[11px] font-medium text-spoket-darker leading-snug mt-0.5">
                Bagi otomatis kuota Kebutuhan, Keinginan, dan Tabungan
              </p>
            </div>
            <Toggle checked={enableBudget} onChange={setEnableBudget} />
          </div>

          {enableBudget && (
            <div className="pt-3  bg-spoket-cream shadow  p-2 animate-in fade-in duration-200">
              <p className="text-xs text-spoket-darker font-light tracking-normal leading-snug">Alokasikan uangmu pakai rumus <strong className="font-bold">50:30:20</strong> biar kebutuhan, jajan, dan tabungan tetap aman.</p>
              <hr className="mt-2 mb-1 text-black" />
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-spoket-darker">Kebutuhan Pokok (50%)</span>
                <span className="text-spoket-darker font-semibold">{formatRupiah(budget50)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-spoket-darker">Keinginan (30%)</span>
                <span className="text-[#062828] font-semibold">{formatRupiah(budget30)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-spoket-darker">Tabungan (20%)</span>
                <span className="text-emerald-700 font-semibold">{formatRupiah(budget20)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Toggle Sebar ke Dompet Lain */}
      <div className="bg-spoket-cream rounded-b-2xl p-3 shadow-sm border-l-2 border-r-2 border-b-2 border-spoket-dark">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
              Atur Pocket Tujuan
            </h3>
            <p className="text-[11px] font-medium text-spoket-darker leading-snug mt-0.5">
              Pisahkan dana ke rekening harian, tunai, atau dompet digital.
            </p>
          </div>
          <Toggle checked={enableSplit} onChange={setEnableSplit} />
        </div>
      </div>

      {/* 4. Kontainer Split Dompet */}
      {enableSplit && (
        <div className="bg-spoket-yellow rounded-[28px] p-4 border border-slate-200/60 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800">
              <SlidersHorizontal size={14} className="stroke-[2.5]" />
              <span>Poket Tujuan & Nominal</span>
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
                className="flex items-center gap-1 bg-spoket-yellowlight border border-amber-300 text-black px-3 py-1.5 rounded-xl text-xs font-black hover:bg-yellow-300 transition active:scale-95 shadow-xs"
              >
                <Plus size={13} className="stroke-[3]" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div
              className={`p-3.5 rounded-xl flex justify-between items-center text-xs  ${isOverAllocated
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-spoket-dark  text-spoket-white"
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
            {splits.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 space-y-3"
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
                      className="text-spoket-dark hover:text-red-500 transition p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="bg-spoket-gray rounded-xl p-3.5 ">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-spoket-darker">Rp</span>
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


        </div>
      )}

      {/* Tombol Simpan */}
      <div className="pt-2">
        <Button
          type="button"
          disabled={isLoading || totalIncomeNum <= 0 || isOverAllocated}
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:text-spoket-gray"
        >
          <Check size={16} className="stroke-[3]" />
          <span>{isLoading ? "Menyimpan Arus Kas..." : "Simpan Pemasukan"}</span>
        </Button>
      </div>
    </div>
  );
}