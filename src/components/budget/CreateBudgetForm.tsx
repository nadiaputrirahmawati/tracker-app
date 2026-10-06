"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layers, ChevronDown } from "lucide-react";
import { formatNumberInput, parseNumberInput, getCurrentPeriod } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/Button";
import { createBudgetAction, BudgetTypeEnum } from "@/src/actions/budget";

interface PresetItem {
  name: string;
  type: BudgetTypeEnum;
  icon: string;
}

const PRESET_BUDGETS: PresetItem[] = [
  { name: "Makan Harian", type: "EXPENSE_DAILY", icon: "utensils" },
  { name: "Kopi & Jajan", type: "EXPENSE_DAILY", icon: "coffee" },
  { name: "Transport & Bensin", type: "EXPENSE", icon: "car" },
  { name: "Sewa & Tagihan", type: "EXPENSE", icon: "home" },
  { name: "Nongkrong & Hiburan", type: "EXPENSE", icon: "heart" },
  { name: "Tabungan Masa Depan", type: "SAVING", icon: "piggy-bank" },
];

const BUDGET_TYPES: { label: string; value: BudgetTypeEnum; desc: string }[] = [
  {
    label: "Pengeluaran Harian (EXPENSE_DAILY)",
    value: "EXPENSE_DAILY",
    desc: "Untuk belanja rutin sehari-hari seperti makan, bensin, dan jajan",
  },
  {
    label: "Pengeluaran Bulanan / Tetap (EXPENSE)",
    value: "EXPENSE",
    desc: "Untuk tagihan berkala, sewa, langganan, dan belanja bulanan",
  },
  {
    label: "Pos Tabungan / Investasi (SAVING)",
    value: "SAVING",
    desc: "Untuk simpanan masa depan, dana darurat, atau target tabungan",
  },
];

export function CreateBudgetForm({ userId }: { userId: string }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [allocatedStr, setAllocatedStr] = useState("");
  const [type, setType] = useState<BudgetTypeEnum>("EXPENSE_DAILY");
  const [selectedIcon, setSelectedIcon] = useState("wallet");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const allocatedNum = parseNumberInput(allocatedStr);

  const handleSelectPreset = (preset: PresetItem) => {
    setName(preset.name);
    setType(preset.type);
    setSelectedIcon(preset.icon);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Silakan beri nama jatah belanja.");
      return;
    }

    if (allocatedNum <= 0) {
      setErrorMessage("Nominal batas belanja harus diisi.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await createBudgetAction({
        userId,
        name,
        allocatedAmount: allocatedNum,
        type,
        icon: selectedIcon,
        period: getCurrentPeriod(),
      });

      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        router.push("/dashboard/budgets");
        router.refresh();
      }
    } catch {
      setErrorMessage("Terjadi gangguan, silakan coba beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Header Bar */}
      <div className="flex items-center gap-3 py-1">
        <Link
          href="/dashboard/budgets"
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-spoket-dark shadow-xs border border-slate-100 hover:bg-slate-50 transition active:scale-95"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-lg font-black text-spoket-dark tracking-tight leading-tight">
            Tambah Jatah Belanja
          </h1>
          <p className="text-xs font-semibold text-slate-400">
            Kendalikan batas pengeluaran bulanan
          </p>
        </div>
      </div>

      {/* Pesan Kesalahan */}
      {errorMessage && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
          {errorMessage}
        </div>
      )}

      {/* 1. Kartu Pilihan Tipe Budget (Menggunakan SELECT Dropdown) */}
      <div className="bg-spoket-dark text-white rounded-[32px] p-5 shadow-lg border border-teal-950 space-y-2.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="budgetType"
            className="text-[10px] font-black text-spoket-yellow uppercase tracking-wider block"
          >
            TIPE JATAH ANGGARAN
          </label>
          <span className="text-[10px] font-bold bg-white/10 px-2.5 py-0.5 rounded-full text-white/90">
            Periode {getCurrentPeriod()}
          </span>
        </div>

        {/* Dropdown Select */}
        <div className="relative">
          <select
            id="budgetType"
            value={type}
            onChange={(e) => setType(e.target.value as BudgetTypeEnum)}
            className="w-full bg-[#031d1d] text-white text-xs font-bold py-3.5 pl-4 pr-10 rounded-2xl border border-white/10 appearance-none focus:outline-none focus:border-spoket-yellow cursor-pointer"
          >
            {BUDGET_TYPES.map((bt) => (
              <option key={bt.value} value={bt.value} className="bg-[#062828] text-white">
                {bt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/60">
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Keterangan Tipe Terpilih */}
        <p className="text-[11px] text-white/60 font-medium px-1">
          {BUDGET_TYPES.find((bt) => bt.value === type)?.desc}
        </p>
      </div>

      {/* 2. Kartu Nama & Preset */}
      <div className="rounded-[32px] overflow-hidden border border-slate-200/80 shadow-sm bg-white">
        {/* Bagian Atas Kuning Cerah */}
        <div className="bg-spoket-yellow p-5 space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-spoket-dark flex items-center justify-center text-white shrink-0 shadow-xs">
              <Layers size={20} className="stroke-[2.2]" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Makan Harian"
              className="w-full text-base font-black text-spoket-dark placeholder:text-spoket-dark/40 bg-transparent focus:outline-none"
            />
          </div>

          {/* Preset Kapsul Putih */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_BUDGETS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelectPreset(item)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition active:scale-95 shadow-xs ${
                  name.toLowerCase() === item.name.toLowerCase()
                    ? "bg-spoket-dark text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bagian Bawah Input Nominal Plafon */}
        <div className="bg-white p-5 space-y-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
            PLAFON / TARGET ANGGARAN
          </span>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-2xl font-black text-spoket-dark">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={allocatedStr}
              onChange={(e) => setAllocatedStr(formatNumberInput(e.target.value))}
              placeholder="0"
              className="w-full text-2xl font-black text-slate-800 focus:outline-none placeholder:text-slate-300 bg-transparent"
            />
          </div>

          <p className="text-[11px] text-slate-400 font-medium leading-relaxed pt-1">
            Batas kuota pengeluaran ini akan menjadi pembanding saat mencatat transaksi belanja.
          </p>
        </div>
      </div>

      {/* 3. Tombol Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!name.trim() || allocatedNum <= 0}
        >
          SIMPAN JATAH BELANJA
        </Button>
      </div>
    </form>
  );
}