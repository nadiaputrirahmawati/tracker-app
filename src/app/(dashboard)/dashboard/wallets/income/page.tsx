import { prisma } from "@/src/lib/prisma";
import { IncomeForm } from "@/src/components/wallets/AddIncomeForm";

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
    <div className="min-h-screen bg-[#FEF9E7] p-4 pb-28">
      <IncomeForm
        userId={currentUserId.toString()}
        existingWallets={formattedWallets}
      />
    </div>
  );
}