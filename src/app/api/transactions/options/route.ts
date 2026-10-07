import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getAuthUserId } from "@/src/lib/auth-user";

export async function GET() {
  try {
    // Ambil ID user yang sedang login dari session server
    const userId = await getAuthUserId();

    const currentPeriod = new Date().toISOString().slice(0, 7); // Format: "YYYY-MM"

    const [wallets, budgets] = await Promise.all([
      // 1. Ambil Poket HANYA milik user ini
      prisma.wallet.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          currentBalance: true,
        },
        orderBy: { createdAt: "asc" },
      }),

      // 2. Ambil Pos Budget HANYA milik user ini di periode berjalan
      prisma.budget.findMany({
        where: {
          userId,
          period: currentPeriod,
        },
        select: {
          id: true,
          name: true,
          allocatedAmount: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return NextResponse.json({
      wallets: wallets.map((w) => ({
        id: w.id.toString(),
        name: w.name,
        balance: Number(w.currentBalance),
      })),
      budgets: budgets.map((b) => ({
        id: b.id.toString(),
        name: b.name,
        allocatedAmount: Number(b.allocatedAmount),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch wallet/budget options:", error);
    return NextResponse.json({ wallets: [], budgets: [] }, { status: 401 });
  }
}