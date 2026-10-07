"use server";

import { prisma } from "@/src/lib/prisma";

export type CalendarDayTransaction = {
  id: string;
  notes: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  walletName: string;
  budgetName?: string;
};

export async function getCalendarMonthlyTransactions(
  year: number,
  month: number,
  userIdStr = "1"
): Promise<Record<string, CalendarDayTransaction[]>> {
  const userId = BigInt(userIdStr);

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      wallet: { select: { name: true } },
      budget: { select: { name: true } },
    },
    orderBy: { transactionDate: "desc" },
  });

  const resultMap: Record<string, CalendarDayTransaction[]> = {};

  for (const t of transactions) {
    const dateKey = new Date(t.transactionDate).toISOString().slice(0, 10);
    if (!resultMap[dateKey]) {
      resultMap[dateKey] = [];
    }
    resultMap[dateKey].push({
      id: t.id.toString(),
      notes: t.notes || (t.type === "INCOME" ? "Pemasukan" : "Pengeluaran"),
      amount: Number(t.amount),
      type: t.type as "INCOME" | "EXPENSE" | "TRANSFER",
      walletName: t.wallet?.name || "Dompet",
      budgetName: t.budget?.name,
    });
  }

  return resultMap;
}