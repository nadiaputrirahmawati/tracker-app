"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

interface SplitWalletPayload {
  name: string;
  amount: number;
}

interface BudgetAllocPayload {
  name: string;
  amount: number;
  period: string;
}

interface IncomePayload {
  userId: string;
  mainWalletName: string;
  totalIncome: number;
  notes?: string;
  budgets?: BudgetAllocPayload[];
  walletSplits?: SplitWalletPayload[];
}

// 1. Eksekusi Gajian & Pecah Dompet Otomatis (Cepat & Mutasi Lengkap)
export async function processIncomeWorkflow(payload: IncomePayload) {
  const userIdBig = BigInt(payload.userId);
  const mainName = payload.mainWalletName.trim() || "Kas Tunai";

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Ambil atau Buat Dompet Utama
      let mainWallet = await tx.wallet.findFirst({
        where: { userId: userIdBig, name: { equals: mainName, mode: "insensitive" } },
      });

      if (!mainWallet) {
        mainWallet = await tx.wallet.create({
          data: {
            userId: userIdBig,
            name: mainName,
            initialBalance: 0,
            currentBalance: 0,
          },
        });
      }

      // 2. Tambah Saldo Dompet Utama & Catat Transaksi Masuk
      await tx.wallet.update({
        where: { id: mainWallet.id },
        data: { currentBalance: { increment: payload.totalIncome } },
      });

      await tx.transaction.create({
        data: {
          userId: userIdBig,
          walletId: mainWallet.id,
          type: "INCOME",
          amount: payload.totalIncome,
          transactionDate: new Date(),
          notes: payload.notes || "Gajian / Pemasukan Utama",
        },
      });

      // 3. Pecah Saldo ke Dompet Target (Catat Mutasi di KEDUA Dompet)
      if (payload.walletSplits && payload.walletSplits.length > 0) {
        for (const split of payload.walletSplits) {
          const splitName = split.name.trim();
          if (!splitName || split.amount <= 0) continue;
          if (splitName.toLowerCase() === mainWallet.name.toLowerCase()) continue;

          let targetWallet = await tx.wallet.findFirst({
            where: { userId: userIdBig, name: { equals: splitName, mode: "insensitive" } },
          });

          if (!targetWallet) {
            targetWallet = await tx.wallet.create({
              data: {
                userId: userIdBig,
                name: splitName,
                initialBalance: 0,
                currentBalance: 0,
              },
            });
          }

          // Potong Dompet Utama & Tambah ke Target
          await tx.wallet.update({
            where: { id: mainWallet.id },
            data: { currentBalance: { decrement: split.amount } },
          });

          await tx.wallet.update({
            where: { id: targetWallet.id },
            data: { currentBalance: { increment: split.amount } },
          });

          // Catat Mutasi Pengeluaran Transfer di Dompet Utama
          await tx.transaction.create({
            data: {
              userId: userIdBig,
              walletId: mainWallet.id,
              type: "TRANSFER",
              amount: split.amount,
              transactionDate: new Date(),
              notes: `Alokasi gaji ke ${targetWallet.name}`,
            },
          });

          // Catat Mutasi Penerimaan di Dompet Target
          await tx.transaction.create({
            data: {
              userId: userIdBig,
              walletId: targetWallet.id,
              type: "INCOME",
              amount: split.amount,
              transactionDate: new Date(),
              notes: `Terima alokasi gaji dari ${mainWallet.name}`,
            },
          });
        }
      }

      // 4. Simpan Pos Anggaran
      if (payload.budgets && payload.budgets.length > 0) {
        for (const b of payload.budgets) {
          if (b.amount <= 0) continue;

          const exist = await tx.budget.findFirst({
            where: { userId: userIdBig, period: b.period, name: b.name },
          });

          if (exist) {
            await tx.budget.update({
              where: { id: exist.id },
              data: { allocatedAmount: { increment: b.amount } },
            });
          } else {
            await tx.budget.create({
              data: {
                userId: userIdBig,
                name: b.name,
                period: b.period,
                allocatedAmount: b.amount,
                type: "EXPENSE",
              },
            });
          }
        }
      }
    });

    revalidatePath("/dashboard/wallets");
    return { success: true };
  } catch (err) {
    console.error("Gagal simpan:", err);
    return { error: "Gagal memproses alokasi dana ke dompet." };
  }
}

// 2. Action Update Dompet (Nama & Koreksi Nominal Saldo dari Modal)
export async function updateWalletDetails(
  walletId: string,
  newName: string,
  newBalance?: number
) {
  try {
    const idBig = BigInt(walletId);

    await prisma.wallet.update({
      where: { id: idBig },
      data: {
        name: newName.trim(),
        ...(newBalance !== undefined && { currentBalance: newBalance }),
      },
    });

    revalidatePath("/dashboard/wallets");
    return { success: true };
  } catch (error) {
    return { error: "Gagal memperbarui data dompet." };
  }
}

// 3. Action Pindahkan Uang dari Dompet ke Saldo Utama / Kas Tunai
export async function transferWalletToMainIncome(
  userId: string,
  sourceWalletId: string,
  amount: number,
  mainWalletName: string = "Kas Tunai"
) {
  if (amount <= 0) return { error: "Nominal pemindahan harus lebih dari 0." };

  const userIdBig = BigInt(userId);
  const sourceIdBig = BigInt(sourceWalletId);

  try {
    await prisma.$transaction(async (tx) => {
      // Cek dompet sumber & kecukupan saldo
      const sourceWallet = await tx.wallet.findUnique({
        where: { id: sourceIdBig },
      });

      if (!sourceWallet || Number(sourceWallet.currentBalance) < amount) {
        throw new Error("Saldo dompet tidak mencukupi untuk dipindahkan.");
      }

      // Cari atau buat dompet utama tujuan
      let mainWallet = await tx.wallet.findFirst({
        where: { userId: userIdBig, name: { equals: mainWalletName, mode: "insensitive" } },
      });

      if (!mainWallet) {
        mainWallet = await tx.wallet.create({
          data: {
            userId: userIdBig,
            name: mainWalletName,
            initialBalance: 0,
            currentBalance: 0,
          },
        });
      }

      // Potong saldo dompet sumber
      await tx.wallet.update({
        where: { id: sourceIdBig },
        data: { currentBalance: { decrement: amount } },
      });

      // Tambah saldo dompet utama
      await tx.wallet.update({
        where: { id: mainWallet.id },
        data: { currentBalance: { increment: amount } },
      });

      // Catat mutasi transfer keluar
      await tx.transaction.create({
        data: {
          userId: userIdBig,
          walletId: sourceIdBig,
          type: "TRANSFER",
          amount,
          transactionDate: new Date(),
          notes: `Tarik dana ke ${mainWallet.name}`,
        },
      });

      // Catat mutasi transfer masuk
      await tx.transaction.create({
        data: {
          userId: userIdBig,
          walletId: mainWallet.id,
          type: "INCOME",
          amount,
          transactionDate: new Date(),
          notes: `Terima pemindahan dana dari ${sourceWallet.name}`,
        },
      });
    });

    revalidatePath("/dashboard/wallets");
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || "Gagal memindahkan uang." };
  }
}

// 4. Action Hapus Dompet
export async function deleteWallet(walletId: string) {
  try {
    await prisma.wallet.delete({
      where: { id: BigInt(walletId) },
    });
    revalidatePath("/dashboard/wallets");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus dompet." };
  }
}

export async function deleteWalletWithBalanceTransfer(
  userId: string,
  walletId: string,
  mainWalletName: string = "Kas Tunai"
) {
  const userIdBig = BigInt(userId);
  const walletIdBig = BigInt(walletId);

  try {
    await prisma.$transaction(async (tx) => {
      const walletToDelete = await tx.wallet.findUnique({
        where: { id: walletIdBig },
      });

      if (!walletToDelete) throw new Error("Dompet tidak ditemukan.");

      const balanceRemaining = Number(walletToDelete.currentBalance);

      // Jika masih ada saldo, pindahkan ke dompet utama
      if (balanceRemaining > 0) {
        let mainWallet = await tx.wallet.findFirst({
          where: { userId: userIdBig, name: { equals: mainWalletName, mode: "insensitive" } },
        });

        if (!mainWallet) {
          mainWallet = await tx.wallet.create({
            data: {
              userId: userIdBig,
              name: mainWalletName,
              initialBalance: 0,
              currentBalance: 0,
            },
          });
        }

        // Tambah ke saldo utama
        await tx.wallet.update({
          where: { id: mainWallet.id },
          data: { currentBalance: { increment: balanceRemaining } },
        });

        // Catat transaksi mutasi
        await tx.transaction.create({
          data: {
            userId: userIdBig,
            walletId: mainWallet.id,
            type: "INCOME",
            amount: balanceRemaining,
            transactionDate: new Date(),
            notes: `Pengalihan sisa saldo dari penutupan dompet ${walletToDelete.name}`,
          },
        });
      }

      // Hapus dompet (dan transaksi terkait jika cascade)
      await tx.transaction.deleteMany({
        where: { walletId: walletIdBig },
      });

      await tx.wallet.delete({
        where: { id: walletIdBig },
      });
    });

    revalidatePath("/dashboard/wallets");
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || "Gagal menghapus dompet." };
  }
}