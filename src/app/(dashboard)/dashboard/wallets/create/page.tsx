import { prisma } from "@/src/lib/prisma";
import { CreateWalletForm } from "@/src/components/wallets/CreateWalleteForm";
import Link from "next/link";
import { ArrowLeft, Wallet, Sparkles, Check, AlertCircle } from "lucide-react";

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
    <div className="flex-1 flex flex-col bg-spoket-dark">
      <div className="flex items-center gap-3 py-2">
        <div className="w-3/12">
          <Link
            href="/dashboard/wallets"
            className="w-10 h-10 flex items-center justify-center text-white   transition active:scale-95"
          >
            <ArrowLeft size={18} />
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-lg font-medium text-center text-white tracking-tight leading-tight">
            Tambahkan Poket
          </h1>
        </div>
      </div>
      <div className="flex-1 bg-spoket-cream rounded-t-[36px] pt-12 px-4 pb-32 space-y-5 shadow-2xl relative z-10 mt-2">
        <CreateWalletForm
          userId={currentUserId.toString()}
          mainWalletBalance={mainWalletBalance}
        />
      </div>
    </div>
  );
}