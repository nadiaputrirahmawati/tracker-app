import { prisma } from "@/src/lib/prisma";

export interface BudgetItemView {
  id: string;
  name: string;
  period: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  type: string;
  icon?: string | null;
}

export interface MonthBudgetGroup {
  period: string; // e.g. "2026-10"
  periodLabel: string; // e.g. "Oktober 2026"
  totalAllocated: number;
  totalSpent: number;
  items: BudgetItemView[];
}

export async function getAllBudgetsGroupedByMonth(
  userId: bigint
): Promise<MonthBudgetGroup[]> {
  // Query 1: Ambil semua budget user diurutkan berdasarkan periode terbaru
  // Query 2: Ambil agregat pengeluaran per budgetId sekaligus (Anti N+1)
  const [budgets, spentAggregates] = await Promise.all([
    prisma.budget.findMany({
      where: { userId },
      orderBy: [{ period: "desc" }, { createdAt: "desc" }],
    }),
    prisma.transaction.groupBy({
      by: ["budgetId"],
      where: {
        userId,
        type: "EXPENSE",
        budgetId: { not: null },
      },
      _sum: { amount: true },
    }),
  ]);

  // Map transaksi pengeluaran (O(1) lookup)
  const spentMap = new Map<string, number>();
  for (const item of spentAggregates) {
    if (item.budgetId) {
      spentMap.set(item.budgetId.toString(), Number(item._sum.amount ?? 0));
    }
  }

  // Pengelompokan per Periode Bulan
  const groupMap = new Map<string, MonthBudgetGroup>();

  for (const b of budgets) {
    const period = b.period;
    const allocated = Number(b.allocatedAmount);
    const spent = spentMap.get(b.id.toString()) || 0;
    const remaining = Math.max(0, allocated - spent);
    const percentage =
      allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;

    const item: BudgetItemView = {
      id: b.id.toString(),
      name: b.name,
      period: b.period,
      allocatedAmount: allocated,
      spentAmount: spent,
      remainingAmount: remaining,
      percentageUsed: percentage,
      type: b.type,
      icon: b.icon,
    };

    if (!groupMap.has(period)) {
      // Format label bulan bahasa Indonesia: "Oktober 2026"
      const [year, month] = period.split("-");
      const dateObj = new Date(Number(year), Number(month) - 1, 1);
      const periodLabel = dateObj.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });

      groupMap.set(period, {
        period,
        periodLabel,
        totalAllocated: 0,
        totalSpent: 0,
        items: [],
      });
    }

    const group = groupMap.get(period)!;
    group.totalAllocated += allocated;
    group.totalSpent += spent;
    group.items.push(item);
  }

  return Array.from(groupMap.values());
}