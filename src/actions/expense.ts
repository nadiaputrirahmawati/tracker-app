"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateExpensePayload {
  userId: string;
  budgetId: string;
  walletId: string;
  amount: number;
  notes?: string;
  transactionDate?: string;
}

export async function createExpenseAction(payload: CreateExpensePayload) {
  const userIdBig = BigInt(payload.userId);
  const budgetIdBig = BigInt(payload.budgetId);
  const walletIdBig = BigInt(payload.walletId);
  const amount = Math.round(payload.amount);

  if (amount <= 0) {
    return { error: "Nominal pengeluaran harus lebih dari Rp 0." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Cek ketersediaan dompet sumber dana
      const wallet = await tx.wallet.findUnique({
        where: { id: walletIdBig },
      });

      if (!wallet || wallet.userId !== userIdBig) {
        throw new Error("Dompet pembayaran tidak valid.");
      }

      if (Number(wallet.currentBalance) < amount) {
        throw new Error(`Saldo dompet ${wallet.name} tidak mencukupi.`);
      }

      // 2. Cek budget tujuan
      const budget = await tx.budget.findUnique({
        where: { id: budgetIdBig },
      });

      if (!budget || budget.userId !== userIdBig) {
        throw new Error("Jatah belanja tidak ditemukan.");
      }

      // 3. Potong saldo dompet yang digunakan
      await tx.wallet.update({
        where: { id: walletIdBig },
        data: { currentBalance: { decrement: amount } },
      });

      // 4. Catat transaksi EXPENSE dengan relasi budget & wallet
      await tx.transaction.create({
        data: {
          userId: userIdBig,
          walletId: walletIdBig,
          budgetId: budgetIdBig,
          type: "EXPENSE",
          amount: amount,
          notes: payload.notes?.trim() || `Pengeluaran: ${budget.name}`,
          transactionDate: payload.transactionDate
            ? new Date(payload.transactionDate)
            : new Date(),
        },
      });
    });

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard/wallets");
    return { success: true };
  } catch (err: any) {
    console.error("Gagal catat pengeluaran:", err);
    return { error: err?.message || "Gagal mencatat transaksi pengeluaran." };
  }
}