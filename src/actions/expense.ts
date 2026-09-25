"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentPeriod } from "@/src/lib/utils";

const expenseSchema = z.object({
  walletId: z.coerce.number().positive("Pilih dompet yang digunakan"),
  budgetId: z.coerce.number().positive("Pilih pos anggaran belanja").optional().nullable(),
  amount: z.coerce.number().positive("Nominal belanja harus lebih dari 0"),
  transactionDate: z.string().min(1, "Tanggal transaksi wajib diisi"),
  notes: z.string().min(1, "Catatan belanja wajib diisi"),
});

export async function addExpense(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sesi telah berakhir, silakan login ulang." };
  }

  const userId = BigInt(session.user.id);
  const rawBudgetId = formData.get("budgetId");

  const parsed = expenseSchema.safeParse({
    walletId: formData.get("walletId"),
    budgetId: rawBudgetId ? Number(rawBudgetId) : null,
    amount: formData.get("amount"),
    transactionDate: formData.get("transactionDate"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { walletId, budgetId, amount, transactionDate, notes } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Cek saldo dompet apakah mencukupi
      const wallet = await tx.wallet.findUnique({
        where: { id: BigInt(walletId), userId },
      });

      if (!wallet) throw new Error("Dompet tidak ditemukan");
      if (Number(wallet.currentBalance) < amount) {
        throw new Error("Saldo dompet tidak mencukupi untuk transaksi ini");
      }

      // 2. Simpan transaksi pengeluaran (EXPENSE)
      await tx.transaction.create({
        data: {
          userId,
          walletId: BigInt(walletId),
          budgetId: budgetId ? BigInt(budgetId) : null,
          type: "EXPENSE",
          amount,
          transactionDate: new Date(transactionDate),
          notes,
        },
      });

      // 3. Potong saldo dompet
      await tx.wallet.update({
        where: { id: BigInt(walletId) },
        data: {
          currentBalance: {
            decrement: amount,
          },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard/wallets");
    revalidatePath("/dashboard/transactions");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mencatat transaksi";
    return { error: message };
  }
}

// Mengambil opsi dompet dan pos anggaran aktif bulan ini
export async function getExpenseFormData() {
  const session = await auth();
  if (!session?.user?.id) return { wallets: [], budgets: [] };

  const userId = BigInt(session.user.id);
  const currentPeriod = getCurrentPeriod();

  const [wallets, budgets] = await Promise.all([
    prisma.wallet.findMany({
      where: { userId },
      select: { id: true, name: true, currentBalance: true },
    }),
    prisma.budget.findMany({
      where: { userId, period: currentPeriod, type: "EXPENSE" },
      select: { id: true, name: true },
    }),
  ]);

  return {
    wallets: wallets.map((w) => ({
      id: w.id.toString(),
      name: w.name,
      balance: Number(w.currentBalance),
    })),
    budgets: budgets.map((b) => ({
      id: b.id.toString(),
      name: b.name,
    })),
  };
}