export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { prisma } from "@/src/lib/prisma";
import { getAuthUserId } from "@/src/lib/auth-user";
import { getBudgetsWithPeriodFilter } from "@/src/services/budget.service";
import { getBudgetAnalyticsData } from "@/src/services/budget-analytics.service";
import { BudgetListClient } from "@/src/components/budget/BudgetListClient";
import { BudgetViewTabs } from "@/src/components/budget/BudgetViewTabs";
import { BudgetAnalyticsView } from "@/src/components/budget/BudgetAnalyticsView";
import { BudgetHeroCard } from "@/src/components/budget/BudgetHeroCard";

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string; period?: string }>;
}

export default async function BudgetListPage({ searchParams }: PageProps) {
  // 1. Ambil session ID user login
  const userId = await getAuthUserId();
  const resolvedParams = await searchParams;

  // 2. Ambil data budget dengan filter tahun/bulan
  const budgetData = await getBudgetsWithPeriodFilter(
    resolvedParams.year,
    resolvedParams.month
  );

  // 3. Ambil data dompet & analitik secara paralel terikat ke user aktif
  const [rawWallets, analyticsData] = await Promise.all([
    prisma.wallet.findMany({
      where: { userId }, // ✅ Sekarang sudah terdefinisi dan aman
      select: { id: true, name: true, currentBalance: true },
      orderBy: { createdAt: "asc" },
    }),
    getBudgetAnalyticsData(budgetData.targetPeriod),
  ]);

  // Lanjutkan return JSX komponen seperti biasa...

  const wallets = rawWallets.map((w) => ({
    id: w.id.toString(),
    name: w.name,
    balance: Number(w.currentBalance),
  }));

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

      {/* Hero Card Sinkron dengan Periode Filter Terpilih */}
      <BudgetHeroCard
        totalAllocated={budgetData.totalAllocated}
        totalSpent={budgetData.totalSpent}
        totalRemaining={budgetData.totalRemaining}
      />

      {/* Tab Navigasi */}
      <BudgetViewTabs
        budgetListComponent={
          <BudgetListClient
            userId={userId.toString()}
            items={budgetData.items}
            wallets={wallets}
            activeYear={budgetData.activeYear}
            activeMonth={budgetData.activeMonth}
            availableFilters={budgetData.availableFilters}
          />
        }
        analyticsComponent={<BudgetAnalyticsView data={analyticsData} />}
      />
    </div>
  );
}