"use client";

import { useState } from "react";
import { CurrencyInput } from "@/src/components/ui/input/Currency";
import { OptionToggle } from "@/src/components/ui/toggle/OptionToggle";
import { processIncomeWorkflow } from "@/src/actions/wallet";
import { Sparkles, ArrowRight } from "lucide-react";

interface WalletOption {
  id: string;
  name: string;
}

export function AddIncomeForm({ wallets, userId }: { wallets: WalletOption[]; userId: string }) {
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [mainWalletId, setMainWalletId] = useState<string>(wallets[0]?.id || "");
  const [notes, setNotes] = useState<string>("Gaji Bulanan");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle & State Budget 50/30/20
  const [enableBudget, setEnableBudget] = useState(false);
  const [kebutuhan, setKebutuhan] = useState(0);
  const [keinginan, setKeinginan] = useState(0);
  const [tabungan, setTabungan] = useState(0);

  // Toggle & State Distribusi Dompet
  const [enableWalletSplit, setEnableWalletSplit] = useState(false);
  const [splits, setSplits] = useState<{ [walletId: string]: number }>({});

  // Trigger Rekomendasi 50/30/20 Otomatis
  function handleToggleBudget(active: boolean) {
    setEnableBudget(active);
    if (active && totalIncome > 0) {
      setKebutuhan(Math.round(totalIncome * 0.5));
      setKeinginan(Math.round(totalIncome * 0.3));
      setTabungan(Math.round(totalIncome * 0.2));
    }
  }

  // Trigger Pembagian Dompet Otomatis
  function handleToggleSplit(active: boolean) {
    setEnableWalletSplit(active);
    if (active && totalIncome > 0) {
      const otherWallets = wallets.filter((w) => w.id !== mainWalletId);
      const initialSplits: { [key: string]: number } = {};
      otherWallets.forEach((w) => {
        initialSplits[w.id] = 0; // Default 0, pengguna dapat mengisinya
      });
      setSplits(initialSplits);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (totalIncome <= 0) return alert("Masukkan nominal pemasukan!");

    setIsSubmitting(true);
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

    const budgetPayload = enableBudget
      ? [
          { name: "Kebutuhan (50%)", amount: kebutuhan, period: currentPeriod },
          { name: "Keinginan (30%)", amount: keinginan, period: currentPeriod },
          { name: "Tabungan (20%)", amount: tabungan, period: currentPeriod },
        ]
      : [];

    const walletSplitPayload = enableWalletSplit
      ? Object.entries(splits).map(([walletId, amount]) => ({ walletId, amount }))
      : [];

    const res = await processIncomeWorkflow({
      userId,
      mainWalletId,
      totalIncome,
      notes,
      budgets: budgetPayload,
      walletSplits: walletSplitPayload,
    });

    setIsSubmitting(false);
    if (res?.error) {
      alert(res.error);
    } else {
      alert("Pemasukan dan alokasi berhasil disimpan! 🚀");
      setTotalIncome(0);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto pb-24">
      {/* 1. Input Utama */}
      <div className="space-y-3">
        <CurrencyInput
          label="Total Pemasukan / Gaji"
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

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
            Masuk ke Dompet Utama
          </label>
          <select
            value={mainWalletId}
            onChange={(e) => setMainWalletId(e.target.value)}
            className="w-full bg-transparent font-black text-xs text-[#062828] focus:outline-none"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
            Keterangan
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full font-bold text-xs text-[#062828] focus:outline-none"
          />
        </div>
      </div>

      {/* 2. Opsi 50/30/20 */}
      <OptionToggle
        label="Rekomendasi 50/30/20"
        description="Bagi otomatis ke pos Kebutuhan, Keinginan, dan Tabungan"
        checked={enableBudget}
        onChange={handleToggleBudget}
      />

      {enableBudget && (
        <div className="p-4 bg-[#FEF08A]/20 border border-[#FEF08A] rounded-2xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#062828]">
            <Sparkles size={16} /> Pos Anggaran (Dapat disesuaikan)
          </div>
          <CurrencyInput label="Kebutuhan (50%)" value={kebutuhan} onChange={setKebutuhan} />
          <CurrencyInput label="Keinginan (30%)" value={keinginan} onChange={setKeinginan} />
          <CurrencyInput label="Tabungan (20%)" value={tabungan} onChange={setTabungan} />
        </div>
      )}

      {/* 3. Opsi Bagi ke Dompet Lain */}
      <OptionToggle
        label="Sebar ke Dompet Lain"
        description="Transfer sebagian dana ke Cash, E-Wallet, atau Bank lain"
        checked={enableWalletSplit}
        onChange={handleToggleSplit}
      />

      {enableWalletSplit && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#062828]">
            <ArrowRight size={16} /> Alokasikan ke Dompet Lain
          </div>
          {wallets
            .filter((w) => w.id !== mainWalletId)
            .map((w) => (
              <CurrencyInput
                key={w.id}
                label={`Transfer ke ${w.name}`}
                value={splits[w.id] || 0}
                onChange={(val) => setSplits((prev) => ({ ...prev, [w.id]: val }))}
              />
            ))}
        </div>
      )}

      {/* Tombol Simpan */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-[#062828] text-[#FEF08A] font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:bg-[#0b3838] transition disabled:opacity-50"
      >
        {isSubmitting ? "Memproses Alokasi..." : "Konfirmasi & Simpan Transaksi ⚡"}
      </button>
    </form>
  );
}