"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export type BudgetTypeEnum = "EXPENSE_DAILY" | "EXPENSE" | "SAVING";

interface CreateBudgetPayload {
  userId: string;
  name: string;
  allocatedAmount: number;
  type: BudgetTypeEnum;
  icon?: string;
  period?: string;
}

export async function createBudgetAction(payload: CreateBudgetPayload) {
  const userIdBig = BigInt(payload.userId);
  const name = payload.name.trim();
  const amount = Math.round(payload.allocatedAmount);
  const period = payload.period || new Date().toISOString().slice(0, 7);

  if (!name) {
    return { error: "Nama jatah/pos belanja harus diisi." };
  }

  if (amount <= 0) {
    return { error: "Nominal plafon harus lebih dari Rp 0." };
  }

  try {
    const existing = await prisma.budget.findFirst({
      where: {
        userId: userIdBig,
        period,
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existing) {
      return { error: `Jatah "${name}" sudah terdaftar pada periode ${period}.` };
    }

    await prisma.budget.create({
      data: {
        userId: userIdBig,
        name,
        period,
        type: payload.type,
        allocatedAmount: new Prisma.Decimal(amount), // Menggunakan Prisma.Decimal
        icon: payload.icon || "wallet",
      },
    });

    revalidatePath("/dashboard/budgets");
    return { success: true };
  } catch (err: any) {
    console.error("Gagal simpan budget:", err);
    return { error: err?.message || "Gagal membuat jatah belanja baru." };
  }
}

export async function updateBudgetAction(payload: {
  id: string;
  userId: string;
  name: string;
  allocatedAmount: number;
}) {
  try {
    const budgetId = BigInt(payload.id);
    const userId = BigInt(payload.userId);

    await prisma.budget.update({
      where: {
        id: budgetId,
        userId: userId,
      },
      data: {
        name: payload.name.trim(),
        allocatedAmount: payload.allocatedAmount,
      },
    });

    revalidatePath("/dashboard/budgets");
    return { success: true };
  } catch (err: any) {
    console.error("Gagal update budget:", err);
    return { error: err.message || "Gagal memperbarui jatah belanja." };
  }
}