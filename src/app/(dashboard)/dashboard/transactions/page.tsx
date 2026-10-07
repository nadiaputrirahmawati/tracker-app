import { getRecentTransactions } from "@/src/services/transaction.service";
import { RecentTransactionsClient } from "@/src/components/transactions/RecentTransactionsClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TransactionsPage() {
  // Panggil langsung tanpa oper ID, dijamin hanya menarik data user yang sedang login!
  const groups = await getRecentTransactions(30);

  return (
    <div className="min-h-screen bg-spoket-cream p-4 pb-28 space-y-4">
      <div className="flex items-center gap-3 py-1">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-spoket-white border-2 border-spoket-dark/10 flex items-center justify-center text-spoket-dark hover:bg-spoket-gray transition active:scale-95 shadow-xs"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-lg font-black text-spoket-dark tracking-tight leading-tight">
            Semua Transaksi
          </h1>
          <p className="text-[11px] font-bold text-spoket-darker">
            Riwayat arus kas masuk dan keluar
          </p>
        </div>
      </div>

      <RecentTransactionsClient initialGroups={groups} />
    </div>
  );
}