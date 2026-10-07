import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const userId = BigInt(1);
  const currentPeriod = new Date().toISOString().slice(0, 7);

  // Ambil wallet dan budget secara paralel
  const [wallets, budgets, spentAgg] = await Promise.all([
    prisma.wallet.findMany({
      where: { userId },
      select: { id: true, name: true, currentBalance: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.budget.findMany({
      where: { userId, period: currentPeriod },
      select: { id: true, name: true, allocatedAmount: true },
      orderBy: { createdAt: "asc" },
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
  for (const s of spentAgg) {
    if (s.budgetId) {
      spentMap.set(s.budgetId.toString(), Number(s._sum.amount ?? 0));
    }
  }

  // Filter budget yang sisa kuotanya > 0 saja
  const availableBudgets = budgets
    .map((b) => {
      const allocated = Number(b.allocatedAmount);
      const spent = spentMap.get(b.id.toString()) || 0;
      const remaining = Math.max(0, allocated - spent);
      return {
        id: b.id.toString(),
        name: b.name,
        remaining,
        isFull: remaining <= 0,
      };
    })
    .filter((b) => !b.isFull); // Saring keluar pos yang sudah habis 100%

  return NextResponse.json({
    wallets: wallets.map((w) => ({
      id: w.id.toString(),
      name: w.name,
      balance: Number(w.currentBalance),
    })),
    budgets: availableBudgets,
  });
}