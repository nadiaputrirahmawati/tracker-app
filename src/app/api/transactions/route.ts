// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { TransactionType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // Sesuaikan dengan userId session/auth aktif (BigInt)
    const userId = BigInt(1);

    const body = await req.json();
    const { amount, walletId, budgetId, description } = body;

    const nominal = Number(amount);
    if (!nominal || nominal <= 0) {
      return NextResponse.json({ message: "Nominal harus lebih dari 0" }, { status: 400 });
    }
    if (!walletId || !budgetId) {
      return NextResponse.json({ message: "Pocket dan Budget wajib dipilih" }, { status: 400 });
    }

    const targetWalletId = BigInt(walletId);
    const targetBudgetId = BigInt(budgetId);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Cek wallet & saldo terkini
      const wallet = await tx.wallet.findFirst({
        where: { id: targetWalletId, userId },
        select: { id: true, currentBalance: true },
      });

      if (!wallet) {
        throw new Error("Pocket tidak ditemukan");
      }

      if (Number(wallet.currentBalance) < nominal) {
        throw new Error("Saldo pocket tidak mencukupi");
      }

      // 2. Simpan transaksi sesuai skema
      const createdTx = await tx.transaction.create({
        data: {
          userId,
          walletId: targetWalletId,
          budgetId: targetBudgetId,
          type: TransactionType.EXPENSE, // Wajib diisi enum TransactionType
          amount: nominal,              // Prisma otomatis mengonversi ke Decimal(15, 2)
          transactionDate: new Date(),  // Wajib diisi DateTime
          notes: description?.trim() || null,
        },
      });

      // 3. Potong currentBalance wallet
      await tx.wallet.update({
        where: { id: targetWalletId },
        data: {
          currentBalance: { decrement: nominal },
        },
      });

      return createdTx;
    });

    return NextResponse.json(
      {
        message: "Transaksi berhasil disimpan",
        data: {
          ...result,
          id: result.id.toString(),
          userId: result.userId.toString(),
          walletId: result.walletId.toString(),
          budgetId: result.budgetId ? result.budgetId.toString() : null,
          amount: Number(result.amount),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Gagal memproses transaksi" },
      { status: 400 }
    );
  }
}