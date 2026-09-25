"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const incomeSchema = z.object({
  walletId: z.coerce.number().positive("Pilih dompet tujuan"),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  transactionDate: z.string().min(1, "Tanggal wajib diisi"),
  notes: z.string().optional(),
});

export async function addIncome(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sesi tidak valid, silakan login kembali." };
  }

  const userId = BigInt(session.user.id);

  const raw = {
    walletId: formData.get("walletId"),
    amount: formData.get("amount"),
    transactionDate: formData.get("transactionDate"),
    notes: formData.get("notes"),
  };

  const parsed = incomeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { walletId, amount, transactionDate, notes } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Simpan mutasi transaksi INCOME
      await tx.transaction.create({
        data: {
          userId,
          walletId: BigInt(walletId),
          budgetId: null, // Pemasukan tidak terikat pos amplop belanja
          type: "INCOME",
          amount,
          transactionDate: new Date(transactionDate),
          notes: notes || "Pemasukan / Gaji",
        },
      });

      // 2. Tambah saldo pada dompet yang dipilih
      await tx.wallet.update({
        where: { id: BigInt(walletId), userId },
        data: {
          currentBalance: {
            increment: amount,
          },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    return { success: true };
  } catch {
    return { error: "Gagal menyimpan pemasukan. Pastikan dompet valid." };
  }
}

export async function getUserWallets() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const wallets = await prisma.wallet.findMany({
    where: { userId: BigInt(session.user.id) },
    select: { id: true, name: true, currentBalance: true },
  });

  return wallets.map((w) => ({
    id: w.id.toString(),
    name: w.name,
    balance: Number(w.currentBalance),
  }));
}