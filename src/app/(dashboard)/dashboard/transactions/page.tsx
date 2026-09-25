import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { formatRupiah } from "@/src/lib/utils";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";


export default async function TransactionsHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const transactions = await prisma.transaction.findMany({
    where: { userId: BigInt(session.user.id) },
    include: { wallet: true, budget: true },
    orderBy: { transactionDate: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-base font-bold text-slate-800">Riwayat Mutasi</h1>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-xs">Belum ada mutasi transaksi.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
            {transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              return (
                <div key={tx.id.toString()} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800">
                        {tx.notes || (isIncome ? "Pemasukan" : "Pengeluaran")}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {tx.wallet.name} {tx.budget ? `• ${tx.budget.name}` : ""} •{" "}
                        {tx.transactionDate.toISOString().split("T")[0]}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isIncome ? "text-emerald-600" : "text-slate-800"
                    }`}
                  >
                    {isIncome ? "+" : "-"} {formatRupiah(Number(tx.amount))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}