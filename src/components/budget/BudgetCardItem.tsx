import { formatRupiah } from "@/src/lib/utils";
import { BudgetItemView } from "@/src/services/budget.service";
import {
  Utensils,
  Coffee,
  Car,
  Home,
  Heart,
  PiggyBank,
  Wallet,
} from "lucide-react";

interface CompactBudgetRowProps {
  budget: BudgetItemView;
}

export function CompactBudgetRow({ budget }: CompactBudgetRowProps) {
  const getIcon = () => {
    const iconName = budget.icon?.toLowerCase() || "";
    const name = budget.name.toLowerCase();

    if (iconName === "utensils" || name.includes("makan"))
      return <Utensils size={18} className="text-spoket-dark" />;
    if (iconName === "coffee" || name.includes("jajan") || name.includes("kopi"))
      return <Coffee size={18} className="text-spoket-dark" />;
    if (iconName === "car" || name.includes("transport") || name.includes("bensin"))
      return <Car size={18} className="text-spoket-dark" />;
    if (iconName === "home" || name.includes("tagihan") || name.includes("sewa"))
      return <Home size={18} className="text-spoket-dark" />;
    if (iconName === "piggy-bank" || budget.type === "SAVING")
      return <PiggyBank size={18} className="text-spoket-dark" />;
    if (name.includes("hiburan") || name.includes("nongkrong"))
      return <Heart size={18} className="text-spoket-dark" />;

    return <Wallet size={18} className="text-spoket-dark" />;
  };

  const getSubLabel = () => {
    if (budget.type === "EXPENSE_DAILY") return "Harian";
    if (budget.type === "SAVING") return "Tabungan";
    return "Bulanan";
  };

  return (
    <div className="flex items-center justify-between p-3.5 bg-spoket-white border-2 border-spoket-gray hover:border-spoket-yellowlight rounded-2xl transition">
      {/* Kiri: Icon dalam container spoket-gray & Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-spoket-gray flex items-center justify-center shrink-0 border border-spoket-dark/10">
          {getIcon()}
        </div>
        <div>
          <h4 className="text-xs font-black text-spoket-dark leading-tight">
            {budget.name}
          </h4>
          <span className="text-[10px] font-bold text-spoket-darker">
            {getSubLabel()} • Plafon {formatRupiah(budget.allocatedAmount)}
          </span>
        </div>
      </div>

      {/* Kanan: Sisa uang jatah & Persentase */}
      <div className="text-right">
        <div className="text-xs font-black text-spoket-dark">
          {formatRupiah(budget.remainingAmount)}
        </div>
        <span
          className={`text-[10px] font-extrabold ${
            budget.percentageUsed >= 90
              ? "text-red-500"
              : "text-spoket-darker"
          }`}
        >
          {budget.percentageUsed}% terpakai
        </span>
      </div>
    </div>
  );
}