"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getAuthUserId } from "@/src/lib/auth-user";

export type BudgetTypeEnum = "EXPENSE_DAILY" | "EXPENSE_MONTHLY" | "EXPENSE" | "SAVING";

export async function createBudgetAction(payload: any) {
  try {
    const userId = await getAuthUserId();

    console.log("--> DEBUG CREATE BUDGET:");
    console.log("User ID dari auth:", userId.toString());
    console.log("Payload diterima:", payload);

    // 1. Cek apakah user benar-benar ada di tabel users DB
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!userExists) {
      console.error(`User ID ${userId} tidak ditemukan di tabel database users!`);
      return { 
        error: `Akun dengan ID ${userId} belum terdaftar di database. Silakan logout lalu login kembali.` 
      };
    }

    const name = payload?.name?.trim();
    const rawAmount =
      typeof payload?.allocatedAmount === "string"
        ? payload.allocatedAmount.replace(/\D/g, "")
        : payload?.allocatedAmount;
    const amount = Math.round(Number(rawAmount) || 0);

    // Pastikan period selalu YYYY-MM
    let period = payload?.period || new Date().toISOString().slice(0, 7);
    if (period.length > 7) {
      period = period.slice(0, 7);
    }

    if (!name) {
      return { error: "Nama pos budget harus diisi." };
    }

    if (amount <= 0) {
      return { error: "Nominal plafon harus lebih dari Rp 0." };
    }

    // Pemetaan enum yang valid sesuai PostgreSQL
    let budgetType = payload?.type;
    if (budgetType === "EXPENSE" || !budgetType) {
      budgetType = "EXPENSE_DAILY";
    }

    // 2. Cek duplikasi nama di periode yang sama untuk user ini
    const existing = await prisma.budget.findFirst({
      where: {
        userId,
        period,
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existing) {
      return { error: `Pos "${name}" sudah terdaftar pada periode ${period}.` };
    }

    // 3. Eksekusi Create
    await prisma.budget.create({
      data: {
        userId,
        name,
        period,
        type: budgetType as any,
        allocatedAmount: new Prisma.Decimal(amount),
        icon: payload?.icon || "wallet",
      },
    });

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Gagal create budget - Detail Error:", err);
    return { error: err?.message || "Gagal membuat pos budget baru." };
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
    const userId = await getAuthUserId();
    
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