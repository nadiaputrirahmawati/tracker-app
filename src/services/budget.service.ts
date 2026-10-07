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

export interface AvailablePeriodFilter {
  year: string;
  months: { value: string; label: string }[];
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

export async function getBudgetsWithPeriodFilter(
  userId: bigint,
  selectedYear?: string,
  selectedMonth?: string
) {
  // 1. Ambil semua distinct period yang tersimpan di database user
  const distinctPeriods = await prisma.budget.findMany({
    where: { userId },
    select: { period: true },
    distinct: ["period"],
    orderBy: { period: "desc" },
  });

  // Susun struktur filter Tahun -> Bulan yang hanya ada datanya
  const periodMap = new Map<string, Set<string>>();
  for (const item of distinctPeriods) {
    const [y, m] = item.period.split("-");
    if (!periodMap.has(y)) {
      periodMap.set(y, new Set());
    }
    periodMap.get(y)!.add(m);
  }

  const availableFilters: AvailablePeriodFilter[] = Array.from(periodMap.entries()).map(
    ([year, monthsSet]) => {
      const months = Array.from(monthsSet)
        .sort((a, b) => Number(b) - Number(a))
        .map((m) => {
          const d = new Date(Number(year), Number(m) - 1, 1);
          return {
            value: m,
            label: d.toLocaleDateString("id-ID", { month: "long" }),
          };
        });
      return { year, months };
    }
  );

  // Tentukan tahun & bulan aktif default dari data yang ada
  const activeYear =
    selectedYear && periodMap.has(selectedYear)
      ? selectedYear
      : availableFilters[0]?.year || new Date().getFullYear().toString();

  const activeMonthsList =
    availableFilters.find((f) => f.year === activeYear)?.months || [];

  const activeMonth =
    selectedMonth && activeMonthsList.some((m) => m.value === selectedMonth)
      ? selectedMonth
      : activeMonthsList[0]?.value ||
      String(new Date().getMonth() + 1).padStart(2, "0");

  const targetPeriod = `${activeYear}-${activeMonth}`;

  // 2. Query budget & aggregate transaksi (Anti N+1)
  const [budgets, spentAggregates] = await Promise.all([
    prisma.budget.findMany({
      where: { userId, period: targetPeriod },
      orderBy: { createdAt: "desc" },
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

  const spentMap = new Map<string, number>();
  for (const s of spentAggregates) {
    if (s.budgetId) {
      spentMap.set(s.budgetId.toString(), Number(s._sum.amount ?? 0));
    }
  }

  let totalAllocated = 0;
  let totalSpent = 0;

  const items: BudgetItemView[] = budgets.map((b) => {
    const allocated = Number(b.allocatedAmount);
    const spent = spentMap.get(b.id.toString()) || 0;
    const remaining = Math.max(0, allocated - spent);
    const percentage =
      allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;

    totalAllocated += allocated;
    totalSpent += spent;

    return {
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
  });

  return {
    items,
    totalAllocated,
    totalSpent,
    totalRemaining: Math.max(0, totalAllocated - totalSpent),
    activeYear,
    activeMonth,
    targetPeriod,
    availableFilters,
  };
}