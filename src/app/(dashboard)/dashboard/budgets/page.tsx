import Link from "next/link";
import { Plus, ArrowLeft, Layers } from "lucide-react";
import { prisma } from "@/src/lib/prisma";
import { formatRupiah } from "@/src/lib/utils";
import { getAllBudgetsGroupedByMonth } from "@/src/services/budget.service";
import { BudgetListClient } from "@/src/components/budget/BudgetListClient";

export default async function BudgetListPage() {
  const currentUserId = BigInt(1);

  // 1. Ambil data budget & daftar dompet secara paralel (Cepat & Anti N+1)
  const [monthGroups, rawWallets] = await Promise.all([
    getAllBudgetsGroupedByMonth(currentUserId),
    prisma.wallet.findMany({
      where: { userId: currentUserId },
      select: {
        id: true,
        name: true,
        currentBalance: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // 2. Format data dompet agar aman dikirim ke Client Component
  const wallets = rawWallets.map((w) => ({
    id: w.id.toString(),
    name: w.name,
    balance: Number(w.currentBalance),
  }));

  // 3. Hitung ringkasan saldo untuk Kartu Hijau Utama
  const overallAllocated = monthGroups.reduce((acc, g) => acc + g.totalAllocated, 0);
  const overallSpent = monthGroups.reduce((acc, g) => acc + g.totalSpent, 0);
  const overallRemaining = Math.max(0, overallAllocated - overallSpent);

  return (
    <div className="min-h-screen bg-spoket-cream p-4 pb-28 space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/wallets"
            className="w-10 h-10 rounded-full bg-spoket-white border-2 border-spoket-dark/10 flex items-center justify-center text-spoket-dark hover:bg-spoket-gray transition active:scale-95 shadow-xs"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-black text-spoket-dark tracking-tight leading-tight">
              Jatah Belanja
            </h1>
            <p className="text-[11px] font-bold text-spoket-darker">
              Kendalikan batas pengeluaran Anda
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/budgets/create"
          className="border-2 border-spoket-dark bg-spoket-yellow text-spoket-dark px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 hover:brightness-105 active:scale-95 transition shadow-xs"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Tambah</span>
        </Link>
      </div>

      {/* KARTU HIJAU HERO: Sisa Kuota Uang */}
      <div className="bg-spoket-dark text-white rounded-[28px] p-5 border-2 border-spoket-dark shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-spoket-yellow uppercase tracking-wider">
            TOTAL SISA JATAH BELANJA
          </span>
          <div className="flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-spoket-yellowlight">
            <Layers size={11} />
            <span>
              {monthGroups.reduce((acc, g) => acc + g.items.length, 0)} Jatah Aktif
            </span>
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xs text-white/60 block font-bold">Tersisa</span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {formatRupiah(overallRemaining)}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/60 block font-bold">Terpakai</span>
            <span className="text-sm font-black text-spoket-yellowlight">
              {formatRupiah(overallSpent)}
            </span>
          </div>
        </div>
      </div>

      {/* Konten Daftar Jatah & Interaksi Modal Klik Card */}
      {monthGroups.length === 0 ? (
        <div className="bg-spoket-white rounded-2xl border-2 border-dashed border-spoket-dark/20 p-8 text-center space-y-2 mt-4">
          <p className="text-xs font-bold text-spoket-darker">
            Belum ada jatah belanja yang dibuat.
          </p>
          <Link
            href="/dashboard/budgets/create"
            className="inline-block text-xs font-black text-spoket-dark underline"
          >
            Buat jatah belanja pertama
          </Link>
        </div>
      ) : (
        <BudgetListClient
          userId={currentUserId.toString()}
          monthGroups={monthGroups}
          wallets={wallets}
        />
      )}
    </div>
  );
}