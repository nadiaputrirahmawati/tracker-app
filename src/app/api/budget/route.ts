import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { TransactionType } from "@prisma/client";

export async function GET() {
  try {
    const userId = BigInt(1); // Sesuaikan dengan session user aktif

    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Jalankan query paralel: Pos Budget, Transaksi Expense, dan Kantong Utama
    const [budgets, expenseAgg, mainWallet] = await Promise.all([
      prisma.budget.findMany({
        where: { userId, period },
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.groupBy({
        by: ["budgetId"],
        where: {
          userId,
          type: TransactionType.EXPENSE,
        },
        _sum: {
          amount: true,
        },
      }),
      // Mengambil kantong/pocket utama
      prisma.wallet.findFirst({
        where: { userId },
        orderBy: { id: "asc" },
        select: { id: true, name: true, currentBalance: true },
      }),
    ]);

    const spentMap = new Map<string, number>(
      expenseAgg
        .filter((item) => item.budgetId !== null)
        .map((item) => [item.budgetId!.toString(), Number(item._sum.amount ?? 0)])
    );

    let totalBudget = 0;
    let totalSpent = 0;

    const items = budgets.map((b) => {
      const budgetLimit = Number(b.allocatedAmount);
      const spent = spentMap.get(b.id.toString()) ?? 0;
      const remaining = Math.max(0, budgetLimit - spent);
      const percentage = budgetLimit > 0 ? Math.min(100, Math.round((spent / budgetLimit) * 100)) : 0;

      totalBudget += budgetLimit;
      totalSpent += spent;

      return {
        id: b.id.toString(),
        name: b.name,
        type: b.type,
        icon: b.icon,
        limit: budgetLimit,
        spent,
        remaining,
        percentage,
      };
    });

    const mainWalletBalance = Number(mainWallet?.currentBalance ?? 0);
    const overallPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

    return NextResponse.json({
      summary: {
        totalBudget,                           // Total alokasi seluruh budget
        totalSpent,                            // Total yang sudah dibelanjakan
        mainWalletBalance,                     // Total saldo kantong utama
        walletName: mainWallet?.name || "Utama",
        percentage: overallPercentage,
      },
      items,
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Gagal mengambil data budget" }, { status: 500 });
  }
}