"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createWalletSchema = z.object({
  name: z.string().min(2, "Nama dompet minimal 2 karakter"),
  initialBalance: z.coerce.number().min(0, "Saldo awal tidak boleh minus"),
});

// Ambil semua dompet user aktif
export async function getWallets() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const wallets = await prisma.wallet.findMany({
    where: { userId: BigInt(session.user.id) },
    orderBy: { createdAt: "asc" },
  });

  return wallets.map((w) => ({
    id: w.id.toString(),
    name: w.name,
    initialBalance: Number(w.initialBalance),
    currentBalance: Number(w.currentBalance),
  }));
}

// Tambah dompet baru
export async function createWallet(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi telah berakhir" };

  const parsed = createWalletSchema.safeParse({
    name: formData.get("name"),
    initialBalance: formData.get("initialBalance"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, initialBalance } = parsed.data;

  try {
    await prisma.wallet.create({
      data: {
        userId: BigInt(session.user.id),
        name,
        initialBalance,
        currentBalance: initialBalance, // Di awal, saldo aktif = saldo awal
      },
    });

    revalidatePath("/dashboard/wallets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Gagal menambahkan dompet baru" };
  }
}

// UPDATE DOMPET
export async function updateWallet(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi telah berakhir" };

  const walletId = formData.get("id");
  const name = formData.get("name") as string;
  const currentBalance = formData.get("currentBalance");

  if (!walletId || !name) return { error: "Data tidak lengkap" };

  try {
    await prisma.wallet.update({
      where: {
        id: BigInt(walletId.toString()),
        userId: BigInt(session.user.id),
      },
      data: {
        name,
        currentBalance: currentBalance ? Number(currentBalance) : undefined,
      },
    });

    revalidatePath("/dashboard/wallets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Gagal memperbarui dompet" };
  }
}

// HAPUS DOMPET
export async function deleteWallet(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesi telah berakhir" };

  try {
    await prisma.wallet.delete({
      where: {
        id: BigInt(id),
        userId: BigInt(session.user.id),
      },
    });

    revalidatePath("/dashboard/wallets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Gagal menghapus dompet" };
  }
}