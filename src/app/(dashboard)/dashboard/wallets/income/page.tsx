import { prisma } from "@/src/lib/prisma";
import { IncomeForm } from "@/src/components/wallets/AddIncomeForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function IncomePage() {
  const currentUserId = BigInt(1);

  // Ambil list dompet yang sudah terdaftar
  const wallets = await prisma.wallet.findMany({
    where: { userId: currentUserId },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  const formattedWallets = wallets.map((w) => ({
    id: w.id.toString(),
    name: w.name,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-spoket-dark">
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="w-3/12">
          <Link
            href="/dashboard/wallets"
            className="w-10 h-10 rounded-full  flex items-center justify-center text-spoket-gray shadow-sm   transition active:scale-95"
          >
            <ArrowLeft size={18} />
          </Link>
        </div>
        <div className="flex text-center justify-center items-center">
          <h1 className="text-lg font-madium text-spoket-white tracking-wide leading-tight">
            Tambah Pemasukan
          </h1>
        </div>
      </div>
      <div className="bg-spoket-cream rounded-t-[36px] p-5 h-full pb-28">
        <IncomeForm
          userId={currentUserId.toString()}
          existingWallets={formattedWallets}
        />
      </div>

    </div>
  );
}