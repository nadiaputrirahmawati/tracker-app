"use server";

import { prisma } from "@/src/lib/prisma";
import { getAuthUserId } from "@/src/lib/auth-user";

export async function getDashboardData() {
  const userId = await getAuthUserId();
  const now = new Date();
  const currentPeriod = now.toISOString().slice(0, 7); // Format: "YYYY-MM"

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  // 1. Hitung total hari & sisa hari dalam bulan ini
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDate + 1);

  // 2. Batas tanggal hari ini (00:00:00 - 23:59:59)
  const startOfToday = new Date(currentYear, currentMonth, currentDate, 0, 0, 0);
  const endOfToday = new Date(currentYear, currentMonth, currentDate, 23, 59, 59, 999);

  // 3. Batas tanggal bulan ini
  const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

  // 4. Query Paralel Efisien (Anti N+1)
  const [
    dailyBudgets,
    spentDailyAgg,
    spentTodayAgg,
    incomeExpenseMonthAgg,
    wallets,
    allBudgets,
    spentPerBudgetAgg,
    recentTransactionsRaw,
  ] = await Promise.all([
    // Ambil budget khusus EXPENSE_DAILY di bulan ini
    prisma.budget.findMany({
      where: {
        userId,
        period: currentPeriod,
        type: "EXPENSE_DAILY",
      },
      select: { id: true, allocatedAmount: true },
    }),

    // Total belanja EXPENSE_DAILY bulan ini
    prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
        budget: { type: "EXPENSE_DAILY" },
      },
      _sum: { amount: true },
    }),

    // Belanja EXPENSE_DAILY khusus hari ini
    prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        transactionDate: { gte: startOfToday, lte: endOfToday },
        budget: { type: "EXPENSE_DAILY" },
      },
      _sum: { amount: true },
    }),

    // Agregasi Pemasukan & Pengeluaran Global bulan ini
    prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),

    // Dompet user
    prisma.wallet.findMany({
      where: { userId },
      select: { id: true, name: true, currentBalance: true },
      orderBy: { createdAt: "asc" },
    }),

    // Semua budget aktif bulan ini untuk carousel
    prisma.budget.findMany({
      where: { userId, period: currentPeriod },
      orderBy: { allocatedAmount: "desc" },
    }),

    // Total belanja per masing-masing budget (untuk percentage, remaining, usedAmount)
    prisma.transaction.groupBy({
      by: ["budgetId"],
      where: {
        userId,
        type: "EXPENSE",
        budgetId: { not: null },
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),

    // 5 Transaksi terakhir
    prisma.transaction.findMany({
      where: { userId },
      take: 5,
      orderBy: { transactionDate: "desc" },
      include: {
        budget: { select: { name: true } },
      },
    }),
  ]);

  // 5. Perhitungan Kuota Jatah Harian (EXPENSE_DAILY)
  const totalDailyAllocated = dailyBudgets.reduce(
    (acc, b) => acc + Number(b.allocatedAmount),
    0
  );
  const totalDailySpentMonth = Number(spentDailyAgg._sum.amount ?? 0);
  const remainingDailyBudget = Math.max(0, totalDailyAllocated - totalDailySpentMonth);

  // dailySafe = sisa kuota harian dibagi sisa hari
  const dailySafe = Math.round(remainingDailyBudget / daysRemaining);
  const spentToday = Number(spentTodayAgg._sum.amount ?? 0);

  // 6. Total Pemasukan vs Pengeluaran Bulan Ini
  let totalIncome = 0;
  let totalExpense = 0;
  for (const item of incomeExpenseMonthAgg) {
    const amt = Number(item._sum.amount ?? 0);
    if (item.type === "INCOME") totalIncome += amt;
    if (item.type === "EXPENSE") totalExpense += amt;
  }

  // 7. Mapping Pengeluaran per Budget (Menjawab kebutuhan props BudgetCarousel)
  const spentMap = new Map<string, number>();
  for (const s of spentPerBudgetAgg) {
    if (s.budgetId) {
      spentMap.set(s.budgetId.toString(), Number(s._sum.amount ?? 0));
    }
  }

  // Format array budgets lengkap dengan usedAmount, remaining, & percentage
  const formattedBudgets = allBudgets.map((b) => {
    const allocated = Number(b.allocatedAmount);
    const used = spentMap.get(b.id.toString()) || 0;
    const rem = Math.max(0, allocated - used);
    const pct = allocated > 0 ? Math.min(100, Math.round((used / allocated) * 100)) : 0;

    return {
      id: b.id.toString(),
      name: b.name,
      allocatedAmount: allocated,
      usedAmount: used,
      remaining: rem,
      percentage: pct,
      type: b.type,
      icon: b.icon,
    };
  });

  return {
    period: currentPeriod,
    daysRemaining,
    dailySafe,
    spentToday,
    totalDailyAllocated,
    totalIncome,
    totalExpense,
    wallets: wallets.map((w) => ({
      id: w.id.toString(),
      name: w.name,
      balance: Number(w.currentBalance),
    })),
    budgets: formattedBudgets, // ✅ Properti ini sekarang sudah ada percentage, remaining, dan usedAmount!
    recentTransactions: recentTransactionsRaw.map((t) => ({
      id: t.id.toString(),
      amount: Number(t.amount),
      type: t.type,
      description: t.notes || (t.type === "INCOME" ? "Pemasukan Dana" : "Pengeluaran"),
      categoryName: t.budget?.name || (t.type === "INCOME" ? "Pemasukan" : "Perpindahan Dana"),
      dateFormatted: new Date(t.transactionDate).toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
      }),
    })),
  };
}