"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, SlidersHorizontal, Plus, Trash2 } from "lucide-react";
import { CurrencyInput } from "@/src/components/ui/input/Currency";
import { OptionToggle } from "@/src/components/ui/toggle/OptionToggle";
import { processIncomeWorkflow } from "@/src/actions/wallet";

interface SplitItem {
  name: string;
  amount: number;
}

export default function IncomeAllocationPage() {
  const router = useRouter();
  const [totalIncome, setTotalIncome] = useState<number>(3000000);
  const [mainWalletName, setMainWalletName] = useState<string>("BCA");
  const [notes, setNotes] = useState<string>("Gajian Bulanan");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 50/30/20
  const [enableBudget, setEnableBudget] = useState(false);
  const [kebutuhan, setKebutuhan] = useState(1500000);
  const [keinginan, setKeinginan] = useState(900000);
  const [tabungan, setTabungan] = useState(600000);

  // Sebar ke Dompet Lain
  const [enableSplit, setEnableSplit] = useState(false);
  const [splits, setSplits] = useState<SplitItem[]>([
    { name: "Kas Tunai", amount: 500000 },
    { name: "GoPay", amount: 500000 },
  ]);

  function handleToggleBudget(active: boolean) {
    setEnableBudget(active);
    if (active && totalIncome > 0) {
      setKebutuhan(Math.round(totalIncome * 0.5));
      setKeinginan(Math.round(totalIncome * 0.3));
      setTabungan(Math.round(totalIncome * 0.2));
    }
  }

  function handleToggleSplit(active: boolean) {
    setEnableSplit(active);
    if (active && totalIncome > 0 && splits.length === 0) {
      setSplits([
        { name: "Kas Tunai", amount: Math.round(totalIncome * 0.2) },
        { name: "GoPay", amount: Math.round(totalIncome * 0.2) },
      ]);
    }
  }

  function updateSplit(idx: number, field: keyof SplitItem, val: any) {
    setSplits((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  }

  function addSplitItem() {
    setSplits((prev) => [...prev, { name: "", amount: 0 }]);
  }

  function removeSplitItem(idx: number) {
    setSplits((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (totalIncome <= 0) return alert("Masukkan nominal gaji!");
    setIsSubmitting(true);

    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const res = await processIncomeWorkflow({
      userId: "1", // Ganti dengan session user riil
      mainWalletName,
      totalIncome,
      notes,
      budgets: enableBudget
        ? [
            { name: "Kebutuhan (50%)", amount: kebutuhan, period },
            { name: "Keinginan (30%)", amount: keinginan, period },
            { name: "Tabungan (20%)", amount: tabungan, period },
          ]
        : [],
      walletSplits: enableSplit ? splits : [],
    });

    setIsSubmitting(false);

    if (res?.error) {
      alert(res.error);
    } else {
      router.push("/dashboard/wallets");
      router.refresh();
    }
  }

  return (
    <main className="max-w-md mx-auto p-4 space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white rounded-full border border-slate-100 text-[#062828] shadow-sm cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-base font-black text-[#062828]">Alokasi Gajian Baru</h1>
          <p className="text-[11px] text-slate-400">Atur arus kas ke pos & dompet</p>
        </div>
      </div>

      {/* Input Nominal Utama & Dompet Masuk */}
      <div className="space-y-3">
        <CurrencyInput
          label="Nominal Gaji / Uang Masuk"
          value={totalIncome}
          onChange={(val) => {
            setTotalIncome(val);
            if (enableBudget) {
              setKebutuhan(Math.round(val * 0.5));
              setKeinginan(Math.round(val * 0.3));
              setTabungan(Math.round(val * 0.2));
            }
          }}
        />

        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            Uang Pertama Kali Masuk Ke (Dompet Utama)
          </span>
          <input
            type="text"
            value={mainWalletName}
            onChange={(e) => setMainWalletName(e.target.value)}
            placeholder="Contoh: BCA / Mandiri / Kas Tunai"
            className="w-full font-black text-sm text-[#062828] focus:outline-none"
          />
        </div>
      </div>

      {/* 50/30/20 Toggle */}
      <OptionToggle
        label="Rekomendasi Pos 50/30/20"
        description="Bagi otomatis kuota Kebutuhan, Keinginan, dan Tabungan"
        checked={enableBudget}
        onChange={handleToggleBudget}
      />

      {enableBudget && (
        <div className="p-4 bg-[#FEF08A]/20 border border-[#FEF08A] rounded-3xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#062828]">
            <Sparkles size={16} /> Kuota Anggaran (Dapat Diedit)
          </div>
          <CurrencyInput label="Kebutuhan (50%)" value={kebutuhan} onChange={setKebutuhan} />
          <CurrencyInput label="Keinginan (30%)" value={keinginan} onChange={setKeinginan} />
          <CurrencyInput label="Tabungan (20%)" value={tabungan} onChange={setTabungan} />
        </div>
      )}

      {/* Sebar ke Dompet Lain Toggle */}
      <OptionToggle
        label="Sebar ke Dompet Lain"
        description="Buat/Transfer ke Kas Tunai, GoPay, atau Bank Lain"
        checked={enableSplit}
        onChange={handleToggleSplit}
      />

      {enableSplit && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#062828] flex items-center gap-1.5">
              <SlidersHorizontal size={16} /> Dompet Tujuan & Nominal
            </span>
            <button
              type="button"
              onClick={addSplitItem}
              className="text-[11px] font-black text-[#062828] flex items-center gap-1 bg-[#FEF08A] px-2.5 py-1 rounded-lg cursor-pointer"
            >
              <Plus size={14} /> Tambah
            </button>
          </div>

          {splits.map((item, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2 relative">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateSplit(idx, "name", e.target.value)}
                  placeholder="Nama Dompet (misal: GoPay / Tunai)"
                  className="text-xs font-black text-[#062828] focus:outline-none border-b border-slate-200 pb-0.5 w-4/5"
                />
                <button
                  type="button"
                  onClick={() => removeSplitItem(idx)}
                  className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <CurrencyInput
                label="Nominal Pindah"
                value={item.amount}
                onChange={(val) => updateSplit(idx, "amount", val)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSubmitting}
        className="w-full py-4 bg-[#062828] hover:bg-[#0b3838] active:scale-98 text-[#FEF08A] font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg transition disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? "Menyimpan & Menyebar Dana..." : "Simpan & Terapkan Pembagian ⚡"}
      </button>
    </main>
  );
}