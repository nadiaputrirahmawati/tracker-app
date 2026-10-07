import { formatRupiah } from "@/src/lib/utils";

interface BudgetHeroCardProps {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
}

export function BudgetHeroCard({
  totalAllocated,
  totalSpent,
  totalRemaining,
}: BudgetHeroCardProps) {
  const percentage =
    totalAllocated > 0
      ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100))
      : 0;

  return (
    <div className="bg-[#062828] text-white rounded-[26px] p-5 shadow-sm space-y-3.5 border border-teal-950">
      {/* Atas: Label & Angka Total Plafon Bulanan */}
      <div>
        <span className="text-xs font-semibold text-white/70 block">
          Monthly Budget
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
          {formatRupiah(totalAllocated)}
        </h2>
      </div>

      {/* Tengah: Progress Bar Halus Dua Warna */}
      <div className="w-full bg-white/15 h-2.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#A7F3D0] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Bawah: Spent di Kiri, Remaining di Kanan */}
      <div className="flex items-center justify-between text-xs font-bold pt-0.5">
        <span className="text-white/80">
          {formatRupiah(totalSpent)} spent
        </span>
        <span className="text-white/80">
          {formatRupiah(totalRemaining)} remaining
        </span>
      </div>
    </div>
  );
}