import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { formatRupiah } from "@/src/lib/utils";
import Link from "next/link";
import { ArrowLeft, Plus, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";

interface BudgetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BudgetDetailPage({ params }: BudgetDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const budget = await prisma.budget.findUnique({
    where: { 
      id: BigInt(id), 
      userId: BigInt(session.user.id) 
    },
    include: {
      transactions: {
        where: { type: "EXPENSE" },
        include: { wallet: true },
        orderBy: { transactionDate: "desc" },
      },
    },
  });

  if (!budget) notFound();

  const totalUsed = budget.transactions.reduce((acc, t) => acc + Number(t.amount), 0);
  const allocated = Number(budget.allocatedAmount);
  const remaining = allocated - totalUsed;
  const percentage = Math.min(Math.round((totalUsed / (allocated || 1)) * 100), 100);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-teal-950 p-4 gap-5">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="border-2 border-teal-950 bg-white p-2 rounded-xl shadow-[2px_2px_0px_#042f2e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-lg font-black text-teal-950">{budget.name}</h1>
          <p className="text-[11px] font-bold text-teal-900/50">Periode: {budget.period}</p>
        </div>
      </div>

      {/* Kartu Ringkasan Neo-Brutalism */}
      <div className="border-2 border-teal-950 bg-[#FEF08A] rounded-2xl p-5 shadow-[4px_4px_0px_#042f2e] space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-950">
              Sisa Kuota Amplop
            </span>
            <h2 className="text-2xl font-black mt-0.5 text-teal-950">
              {formatRupiah(remaining)}
            </h2>
          </div>
          <span className="text-xs font-black bg-white border-2 border-teal-950 px-2.5 py-1 rounded-xl shadow-[2px_2px_0px_#042f2e]">
            {percentage}% Terpakai
          </span>
        </div>

        <div className="space-y-1">
          <div className="w-full bg-white border-2 border-teal-950 h-3.5 rounded-full overflow-hidden p-[1px]">
            <div
              className={`h-full rounded-full ${percentage >= 100 ? "bg-rose-500" : "bg-teal-950"}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-bold text-teal-900">
            <span>Terpakai: {formatRupiah(totalUsed)}</span>
            <span>Target: {formatRupiah(allocated)}</span>
          </div>
        </div>
      </div>

      {/* Tombol Tambah Pengeluaran di Pos Ini */}
      <Link
        href={`/dashboard/transactions/expense?budgetId=${budget.id.toString()}`}
        className="w-full py-3.5 border-2 border-teal-950 bg-teal-950 text-amber-300 rounded-2xl font-black text-xs shadow-[3px_3px_0px_#042f2e] flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
      >
        <Plus size={16} className="stroke-[3]" />
        Tambah Belanja Pada Pos Ini
      </Link>

      {/* Riwayat Mutasi Khusus Pos Ini */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-teal-950">
          Riwayat Belanja ({budget.transactions.length})
        </h3>

        {budget.transactions.length === 0 ? (
          <div className="p-6 border-2 border-dashed border-teal-950/40 rounded-2xl text-center bg-white">
            <p className="text-xs font-bold text-teal-900/60">Belum ada pengeluaran di pos ini.</p>
          </div>
        ) : (
          <div className="border-2 border-teal-950 bg-white rounded-2xl divide-y-2 divide-teal-950 shadow-[3px_3px_0px_#042f2e] overflow-hidden">
            {budget.transactions.map((tx) => (
              <div key={tx.id.toString()} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-rose-100 border border-teal-950 rounded-lg text-rose-700">
                    <ArrowUpRight size={16} />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-teal-950">{tx.notes}</h4>
                    <p className="text-[10px] font-bold text-teal-900/50">
                      {tx.wallet.name} • {tx.transactionDate.toISOString().split("T")[0]}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-rose-700">
                  - {formatRupiah(Number(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}