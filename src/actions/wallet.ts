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
  mainWalletName?: string;
  totalIncome: number;
  notes?: string;
  budgets?: BudgetAllocPayload[];
  walletSplits?: SplitWalletPayload[];
}

interface CreateWalletPayload {
  userId: string;
  name: string;
  initialAllocation: number;
}

export async function processIncomeWorkflow(payload: IncomePayload) {
  const userIdBig = BigInt(payload.userId);
  const mainWalletName = (payload.mainWalletName || "Kantong Utama").trim();
  const totalIncome = Number(payload.totalIncome) || 0;

  if (totalIncome <= 0) {
    return { error: "Nominal gaji harus lebih besar dari Rp 0" };
  }

  // Filter split yang valid (punya nama & nominal > 0)
  const validSplits = (payload.walletSplits || []).filter(
    (s) => s.name && s.name.trim() !== "" && Number(s.amount) > 0
  );

  // Hitung total uang yang di-split
  const totalSplitAmount = validSplits.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // SISA BERSIH YANG HARUS MASUK KE KANTONG UTAMA
  const remainingForMainWallet = totalIncome - totalSplitAmount;

  if (totalSplitAmount > totalIncome) {
    return { error: "Total pembagian dompet melebihi nominal gaji!" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Cari / Buat Dompet Utama
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

      // 2. HANYA MASUKKAN SISA (Rp 90.000) KE KANTONG UTAMA
      if (remainingForMainWallet > 0) {
        await tx.wallet.update({
          where: { id: mainWallet.id },
          data: { currentBalance: { increment: remainingForMainWallet } },
        });

        await tx.transaction.create({
          data: {
            userId: userIdBig,
            walletId: mainWallet.id,
            type: "INCOME",
            amount: remainingForMainWallet, // HARUS SISA INI!
            transactionDate: new Date(),
            notes: payload.notes || "Sisa Alokasi Gaji",
          },
        });
      }

      // 3. Masukkan uang yang di-split ke masing-masing dompet target
      // Sebar ke Dompet Tujuan
      // 4. Sebar ke Dompet Tujuan (Cukup 1 Catatan Transaksi per Split)
      for (const split of validSplits) {
        const splitName = split.name.trim();
        const splitAmount = Number(split.amount);

        // Jangan split ke dompet utama sendiri
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

        // Tambah saldo ke dompet tujuan
        await tx.wallet.update({
          where: { id: targetWallet.id },
          data: { currentBalance: { increment: splitAmount } },
        });

        // CATAT HANYA 1 TRANSAKSI TRANSFER
        await tx.transaction.create({
          data: {
            userId: userIdBig,
            walletId: targetWallet.id, // atau mainWallet.id sesuai kebutuhan laporan Anda
            type: "TRANSFER",
            amount: splitAmount,
            transactionDate: new Date(),
            notes: `Alokasi dari ${mainWallet.name} ke ${targetWallet.name}`,
          },
        });
      }

      // 4. Pos Anggaran Budget (Jika ada)
      if (payload.budgets && payload.budgets.length > 0) {
        for (const b of payload.budgets) {
          const bAmount = Number(b.amount);
          if (bAmount <= 0) continue;

          const exist = await tx.budget.findFirst({
            where: { userId: userIdBig, period: b.period, name: b.name },
          });

          if (exist) {
            await tx.budget.update({
              where: { id: exist.id },
              data: { allocatedAmount: { increment: bAmount } },
            });
          } else {
            await tx.budget.create({
              data: {
                userId: userIdBig,
                name: b.name,
                period: b.period,
                allocatedAmount: bAmount,
                type: b.name.toLowerCase().includes("tabung") ? "SAVING" : "EXPENSE",
              },
            });
          }
        }
      }
    });

    revalidatePath("/dashboard/wallets");
    return { success: true };
  } catch (err: any) {
    console.error("ERROR DB:", err);
    return { error: err?.message || "Gagal memproses ke database." };
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
  mainWalletName: string = "Kantong Utama"
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
  mainWalletName: string = "Kantong Utama"
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
            notes: `Pengalihan sisa saldo dari penutupan poket ${walletToDelete.name}`,
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


export async function createWalletFromMainIncome(payload: CreateWalletPayload) {
  const userIdBig = BigInt(payload.userId);
  const walletName = payload.name.trim();
  const allocation = Math.round(payload.initialAllocation);

  if (!walletName) {
    return { error: "Nama kantong/dompet wajib diisi." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil data Kantong Utama
      const mainWallet = await tx.wallet.findFirst({
        where: {
          userId: userIdBig,
          name: { equals: "Kantong Utama", mode: "insensitive" },
        },
      });

      if (!mainWallet) {
        throw new Error("Kantong Utama belum ditemukan. Silakan tambahkan pemasukan terlebih dahulu.");
      }

      // Validasi kecukupan saldo Kantong Utama jika ada alokasi awal
      if (allocation > 0 && Number(mainWallet.currentBalance) < allocation) {
        throw new Error("Saldo Kantong Utama tidak mencukupi untuk alokasi ini.");
      }

      // Cek apakah nama dompet sudah ada
      const existingWallet = await tx.wallet.findFirst({
        where: {
          userId: userIdBig,
          name: { equals: walletName, mode: "insensitive" },
        },
      });

      if (existingWallet) {
        throw new Error(`Kantong dengan nama "${walletName}" sudah terdaftar.`);
      }

      // 2. Buat dompet baru
      const newWallet = await tx.wallet.create({
        data: {
          userId: userIdBig,
          name: walletName,
          initialBalance: allocation,
          currentBalance: allocation,
        },
      });

      // 3. Jika ada alokasi awal, potong Kantong Utama & catat 1 baris TRANSFER
      if (allocation > 0) {
        await tx.wallet.update({
          where: { id: mainWallet.id },
          data: { currentBalance: { decrement: allocation } },
        });

        await tx.transaction.create({
          data: {
            userId: userIdBig,
            walletId: newWallet.id,
            type: "TRANSFER",
            amount: allocation,
            transactionDate: new Date(),
            notes: `Alokasi saldo awal dari ${mainWallet.name}`,
          },
        });
      }

      return newWallet;
    });

    revalidatePath("/dashboard/wallets");
    return { success: true, walletId: result.id.toString() };
  } catch (err: any) {
    console.error("Gagal membuat kantong:", err);
    return { error: err?.message || "Gagal membuat kantong baru." };
  }
}