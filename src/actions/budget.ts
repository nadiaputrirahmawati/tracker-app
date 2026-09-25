"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const budgetSchema = z.object({
  name: z.string().min(2, "Nama pos minimal 2 karakter"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Format periode harus YYYY-MM"),
  type: z.enum(["EXPENSE", "SAVING"]),
  allocatedAmount: z.coerce.number().positive("Alokasi harus lebih dari 0"),
});

// Ambil pos anggaran pada periode tertentu beserta kalkulasi realisasinya
export async function getBudgetsByPeriod(period: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = BigInt(session.user.id);

  const budgets = await prisma.budget.findMany({
    where: { userId, period },
    include: {
      transactions: {
        where: { type: "EXPENSE" },
        select: { amount: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return budgets.map((b) => {
    const usedAmount = b.transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
    const allocated = Number(b.allocatedAmount);
    const remaining = allocated - usedAmount;
    const percentage = Math.min(Math.round((usedAmount / allocated) * 100), 100);

    return {
      id: b.id.toString(),
      name: b.name,
      type: b.type,
      allocatedAmount: allocated,
      usedAmount,
      remaining,
      percentage,
    };
  });
}

// Tambah pos anggaran baru
export async function createBudget(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi telah berakhir" };

  const parsed = budgetSchema.safeParse({
    name: formData.get("name"),
    period: formData.get("period"),
    type: formData.get("type"),
    allocatedAmount: formData.get("allocatedAmount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, period, type, allocatedAmount } = parsed.data;

  try {
    await prisma.budget.create({
      data: {
        userId: BigInt(session.user.id),
        name,
        period,
        type,
        allocatedAmount,
      },
    });

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Gagal membuat pos anggaran" };
  }
}

// Salin pos anggaran dari bulan sebelumnya ke periode saat ini
export async function copyPreviousMonthBudgets(currentPeriod: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi telah berakhir" };

  const userId = BigInt(session.user.id);

  // Hitung periode 1 bulan ke belakang
  const [year, month] = currentPeriod.split("-").map(Number);
  const prevDate = new Date(year, month - 2, 1);
  const prevPeriod = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  const prevBudgets = await prisma.budget.findMany({
    where: { userId, period: prevPeriod },
  });

  if (prevBudgets.length === 0) {
    return { error: `Tidak ada pos anggaran ditemukan di bulan ${prevPeriod}` };
  }

  // Masukkan ke periode baru
  await prisma.budget.createMany({
    data: prevBudgets.map((b) => ({
      userId,
      period: currentPeriod,
      name: b.name,
      type: b.type,
      allocatedAmount: b.allocatedAmount,
    })),
  });

  revalidatePath("/dashboard/budgets");
  revalidatePath("/dashboard");
  return { success: true, count: prevBudgets.length };
}

// UPDATE POS ANGGARAN
export async function updateBudget(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi telah berakhir" };

  const id = formData.get("id");
  const name = formData.get("name") as string;
  const allocatedAmount = formData.get("allocatedAmount");
  const type = formData.get("type") as "EXPENSE" | "SAVING";

  if (!id || !name || !allocatedAmount) return { error: "Data tidak valid" };

  try {
    await prisma.budget.update({
      where: {
        id: BigInt(id.toString()),
        userId: BigInt(session.user.id),
      },
      data: {
        name,
        allocatedAmount: Number(allocatedAmount),
        type,
      },
    });

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Gagal memperbarui pos" };
  }
}

// HAPUS POS ANGGARAN
export async function deleteBudget(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi telah berakhir" };

  try {
    // Sesuai skema: transaksi yang terhubung otomatis diubah budget_id = null (onDelete: set null)
    await prisma.budget.delete({
      where: {
        id: BigInt(id),
        userId: BigInt(session.user.id),
      },
    });

    revalidatePath("/dashboard/budgets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Gagal menghapus pos anggaran" };
  }
}