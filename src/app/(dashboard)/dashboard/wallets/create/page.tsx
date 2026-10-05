import { prisma } from "@/src/lib/prisma";
import { CreateWalletForm } from "@/src/components/wallets/CreateWalleteForm";

export default async function CreateWalletPage() {
  const currentUserId = BigInt(1);

  // Ambil saldo Kantong Utama pengguna saat ini
  const mainWallet = await prisma.wallet.findFirst({
    where: {
      userId: currentUserId,
      name: { equals: "Kantong Utama", mode: "insensitive" },
    },
    select: { currentBalance: true },
  });

  const mainWalletBalance = mainWallet ? Number(mainWallet.currentBalance) : 0;

  return (
    <div className="min-h-screen bg-[#FEF9E7] p-4 pb-28">
      <CreateWalletForm
        userId={currentUserId.toString()}
        mainWalletBalance={mainWalletBalance}
      />
    </div>
  );
}