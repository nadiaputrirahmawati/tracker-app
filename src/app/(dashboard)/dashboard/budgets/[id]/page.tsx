import Link from "next/link";
import { ArrowLeft, Calendar, ArrowDownRight } from "lucide-react";
import { prisma } from "@/src/lib/prisma";
import { formatRupiah } from "@/src/lib/utils";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BudgetDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const budgetId = BigInt(resolvedParams.id);
  const currentUserId = BigInt(1);

  // Ambil detail budget beserta daftar transaksi riilnya
  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId: currentUserId },
    include: {
      transactions: {
        where: { type: "EXPENSE" },
        include: { wallet: true },
        orderBy: { transactionDate: "desc" },
      },
    },
  });

  if (!budget) return notFound();

  const totalSpent = budget.transactions.reduce((acc, t) => acc + Number(t.amount), 0);
  const remaining = Math.max(0, Number(budget.allocatedAmount) - totalSpent);

  return (
    <div className="min-h-screen bg-spoket-cream p-4 pb-28 space-y-4">
      {/* Header Bar */}
      <div className="flex items-center gap-3 py-1">
        <Link
          href="/dashboard/budgets"
          className="w-10 h-10 rounded-full bg-spoket-white border-2 border-spoket-gray flex items-center justify-center text-spoket-dark shadow-xs"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-lg font-black text-spoket-dark leading-tight">
            {budget.name}
          </h1>
          <p className="text-[11px] font-bold text-spoket-darker">
            Periode {budget.period}
          </p>
        </div>
      </div>

      {/* Ringkasan Saldo Budget */}
      <div className="bg-spoket-dark text-white rounded-[28px] p-5 space-y-3 shadow-md">
        <span className="text-[10px] font-black text-spoket-yellow uppercase tracking-wider">
          SISA KUOTA
        </span>
        <h2 className="text-2xl font-black text-white">
          {formatRupiah(remaining)}
        </h2>
        <div className="flex justify-between text-xs pt-1 border-t border-white/10 text-white/70">
          <span>Terpakai: <b className="text-white">{formatRupiah(totalSpent)}</b></span>
          <span>Plafon: <b className="text-white">{formatRupiah(Number(budget.allocatedAmount))}</b></span>
        </div>
      </div>

      {/* Daftar Transaksi Belanja Riil */}
      <div className="space-y-2">
        <span className="text-[11px] font-black text-spoket-darker uppercase tracking-wider block px-1">
          Riwayat Belanja ({budget.transactions.length})
        </span>

        {budget.transactions.length === 0 ? (
          <div className="bg-spoket-white rounded-2xl border-2 border-dashed border-spoket-gray p-8 text-center text-xs font-bold text-spoket-darker">
            Belum ada transaksi pengeluaran pada pos ini.
          </div>
        ) : (
          <div className="space-y-2">
            {budget.transactions.map((t) => (
              <div
                key={t.id.toString()}
                className="bg-spoket-white border-2 border-spoket-gray rounded-2xl p-3.5 flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <ArrowDownRight size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-spoket-dark">
                      {t.notes || budget.name}
                    </h5>
                    <span className="text-[10px] font-semibold text-spoket-darker flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(t.transactionDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {t.wallet ? ` • ${t.wallet.name}` : ""}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black text-red-600">
                  - {formatRupiah(Number(t.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}