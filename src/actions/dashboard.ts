"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { getCurrentPeriod } from "@/src/lib/utils";

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = BigInt(session.user.id);
  const currentPeriod = getCurrentPeriod();

  const [yearStr, monthStr] = currentPeriod.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Rentang waktu khusus hari ini
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [wallets, incomes, expenses, budgets, todayExpenses] = await Promise.all([
    // 1. Dompet aktif
    prisma.wallet.findMany({
      where: { userId },
      orderBy: { id: "asc" },
    }),

    // 2. Pemasukan bulan ini
    prisma.transaction.aggregate({
      where: {
        userId,
        type: "INCOME",
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    }),

    // 3. Pengeluaran bulan ini
    prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    }),

    // 4. Pos anggaran bulan ini + total belanja
    prisma.budget.findMany({
      where: { userId, period: currentPeriod },
      include: {
        transactions: {
          where: { type: "EXPENSE" },
          select: { amount: true },
        },
      },
    }),

    // 5. Total pengeluaran hari ini saja
    prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        transactionDate: { gte: startOfToday, lte: endOfToday },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalBalance = wallets.reduce((acc, w) => acc + Number(w.currentBalance), 0);

  // Kalkulasi Amplop & Sisa Pos Belanja Fleksibel (misal pos bertipe EXPENSE)
  let flexibleBudgetRemaining = 0;
  const formattedBudgets = budgets.map((b) => {
    const used = b.transactions.reduce((acc, t) => acc + Number(t.amount), 0);
    const allocated = Number(b.allocatedAmount);
    const remaining = Math.max(allocated - used, 0);

    if (b.type === "EXPENSE") {
      flexibleBudgetRemaining += remaining;
    }

    return {
      id: b.id.toString(),
      name: b.name,
      allocatedAmount: allocated,
      usedAmount: used,
      remaining,
      percentage: Math.min(Math.round((used / (allocated || 1)) * 100), 100),
    };
  });

  // Hitung Hari Tersisa di Bulan Ini
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const todayDate = new Date().getDate();
  const daysRemaining = Math.max(totalDaysInMonth - todayDate + 1, 1);

  // Rumus Jatah Harian Dinamis
  const dailySafe = Math.floor(flexibleBudgetRemaining / daysRemaining);

  return {
    totalBalance,
    totalIncome: Number(incomes._sum.amount || 0),
    totalExpense: Number(expenses._sum.amount || 0),
    spentToday: Number(todayExpenses._sum.amount || 0),
    dailySafe,
    daysRemaining,
    wallets: wallets.map((w) => ({
      id: w.id.toString(),
      name: w.name,
      currentBalance: Number(w.currentBalance),
    })),
    budgets: formattedBudgets,
  };
}