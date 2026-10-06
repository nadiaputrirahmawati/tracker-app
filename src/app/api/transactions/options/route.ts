// app/api/transactions/options/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const userId = BigInt(1);

    const [wallets, budgets] = await Promise.all([
      prisma.wallet.findMany({
        where: { userId },
        select: { id: true, name: true, currentBalance: true },
        orderBy: { name: "asc" },
      }),
      prisma.budget.findMany({
        where: { userId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
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
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Gagal memuat opsi dompet dan budget" },
      { status: 500 }
    );
  }
}