"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";

export async function getCalendarMonthlyTransactions(year: number, month: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = BigInt(session.user.id);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: { gte: startDate, lte: endDate },
    },
    include: { wallet: true, budget: true },
    orderBy: { transactionDate: "desc" },
  });

  // Map transaksi per tanggal: { "2026-09-25": [tx1, tx2] }
  const grouped: Record<string, typeof transactions> = {};

  for (const tx of transactions) {
    const dateKey = tx.transactionDate.toISOString().split("T")[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(tx);
  }

  // Serialisasi data agar aman dikirim ke Client Component
  const serializedGrouped: Record<
    string,
    {
      id: string;
      notes: string;
      amount: number;
      type: "INCOME" | "EXPENSE" | "TRANSFER";
      walletName: string;
      budgetName?: string;
    }[]
  > = {};

  for (const [key, items] of Object.entries(grouped)) {
    serializedGrouped[key] = items.map((t) => ({
      id: t.id.toString(),
      notes: t.notes || (t.type === "INCOME" ? "Pemasukan" : "Pengeluaran"),
      amount: Number(t.amount),
      type: t.type,
      walletName: t.wallet.name,
      budgetName: t.budget?.name,
    }));
  }

  return serializedGrouped;
}