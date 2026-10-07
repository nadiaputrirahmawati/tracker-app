import { prisma } from "@/src/lib/prisma";
import { getAuthUserId } from "@/src/lib/auth-user";

export interface CategoryBreakdownItem {
  budgetId: string;
  name: string;
  icon?: string | null;
  totalSpent: number;
  percentage: number;
  transactionCount: number;
  color: string;
}

export interface BudgetAnalyticsData {
  period: string; // YYYY-MM
  totalSpent: number;
  dailyAverage: number;
  totalAllocated: number;
  percentageOfBudget: number;
  breakdown: CategoryBreakdownItem[];
  availableMonths: { value: string; label: string }[];
}

const PALETTE_COLORS = [
  "#FEC000", // spoket-yellow
  "#062828", // spoket-dark
  "#FEF08A", // spoket-yellowlight
  "#0ea5e9", // blue
  "#f97316", // orange
  "#10b981", // emerald
  "#ec4899", // pink
  "#8b5cf6", // purple
];



export async function getBudgetAnalyticsData(
  period?: string | null
): Promise<BudgetAnalyticsData> {
  const userId = await getAuthUserId();

  // Validasi dan fallback jika period undefined, null, atau format salah
  const validPeriodPattern = /^\d{4}-\d{2}$/;
  const fallbackPeriod = new Date().toISOString().slice(0, 7);
  const activePeriod =
    typeof period === "string" && validPeriodPattern.test(period)
      ? period
      : fallbackPeriod;

  const [yearStr, monthStr] = activePeriod.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const daysInMonth = new Date(year, month, 0).getDate();

  // 1. Eksekusi paralel: Ambil jatah bulanan & transaksi teragregasi (Anti N+1)
  const [budgets, spentAggregates, allPeriods] = await Promise.all([
    prisma.budget.findMany({
      where: { userId, period: activePeriod },
      select: { id: true, name: true, icon: true, allocatedAmount: true },
    }),
    prisma.transaction.groupBy({
      by: ["budgetId"],
      where: {
        userId,
        type: "EXPENSE",
        budgetId: { not: null },
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.budget.findMany({
      where: { userId },
      select: { period: true },
      distinct: ["period"],
      orderBy: { period: "desc" },
    }),
  ]);

  const budgetMap = new Map(budgets.map((b) => [b.id.toString(), b]));
  const totalAllocated = budgets.reduce((acc, b) => acc + Number(b.allocatedAmount), 0);

  let totalSpent = 0;
  const rawItems: {
    budgetId: string;
    name: string;
    icon?: string | null;
    spent: number;
    count: number;
  }[] = [];

  for (const item of spentAggregates) {
    if (!item.budgetId) continue;
    const bId = item.budgetId.toString();
    const bMeta = budgetMap.get(bId);
    const spent = Number(item._sum.amount ?? 0);
    totalSpent += spent;

    rawItems.push({
      budgetId: bId,
      name: bMeta?.name || "Lainnya",
      icon: bMeta?.icon,
      spent,
      count: item._count.id,
    });
  }

  // Urutkan dari pengeluaran terbesar
  rawItems.sort((a, b) => b.spent - a.spent);

  const breakdown: CategoryBreakdownItem[] = rawItems.map((item, idx) => ({
    budgetId: item.budgetId,
    name: item.name,
    icon: item.icon,
    totalSpent: item.spent,
    percentage: totalSpent > 0 ? Number(((item.spent / totalSpent) * 100).toFixed(1)) : 0,
    transactionCount: item.count,
    color: PALETTE_COLORS[idx % PALETTE_COLORS.length],
  }));

  const availableMonths = allPeriods
    .filter((p) => typeof p.period === "string" && p.period.includes("-"))
    .map((p) => {
      const [y, m] = p.period.split("-");
      const d = new Date(Number(y), Number(m) - 1, 1);
      return {
        value: p.period,
        label: d.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
      };
    });

  return {
    period: activePeriod,
    totalSpent,
    dailyAverage: Math.round(totalSpent / daysInMonth),
    totalAllocated,
    percentageOfBudget:
      totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0,
    breakdown,
    availableMonths:
      availableMonths.length > 0
        ? availableMonths
        : [{ value: activePeriod, label: "Bulan Ini" }],
  };
}