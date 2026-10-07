"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Calendar } from "lucide-react";
import { BudgetItemView, AvailablePeriodFilter } from "@/src/services/budget.service";
import { CompactBudgetRow } from "@/src/components/budget/BudgetCardItem";
import { ExpenseModal, WalletOption } from "@/src/components/budget/ExpenseModal";
import { EditBudgetModal } from "@/src/components/budget/EditBudgetModal";
import { formatRupiah } from "@/src/lib/utils";

interface BudgetListClientProps {
  userId: string;
  items: BudgetItemView[];
  wallets: WalletOption[];
  activeYear: string;
  activeMonth: string;
  availableFilters: AvailablePeriodFilter[];
}

export function BudgetListClient({
  userId,
  items,
  wallets,
  activeYear,
  activeMonth,
  availableFilters,
}: BudgetListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedBudgetForExpense, setSelectedBudgetForExpense] =
    useState<BudgetItemView | null>(null);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  const [selectedBudgetForEdit, setSelectedBudgetForEdit] =
    useState<BudgetItemView | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Ambil daftar bulan sesuai tahun aktif
  const currentYearObj = availableFilters.find((f) => f.year === activeYear);
  const availableMonths = currentYearObj?.months || [];

  const handleFilterChange = (newYear: string, newMonth: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", newYear);
    params.set("month", newMonth);
    router.push(`/dashboard/budgets?${params.toString()}`);
  };

  return (
    <>
      <div className="space-y-3 pt-1">
        {/* Bar Filter Tahun & Bulan */}
        <div className="flex items-center justify-between bg-spoket-white border-2 border-spoket-gray rounded-2xl p-2 px-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-spoket-dark">
            <Calendar size={15} className="text-spoket-darker" />
            <span className="text-[11px] font-black uppercase tracking-wider">
              Periode
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Dropdown Tahun */}
            <div className="relative">
              <select
                value={activeYear}
                onChange={(e) => {
                  const targetYear = e.target.value;
                  const targetMonths =
                    availableFilters.find((f) => f.year === targetYear)?.months || [];
                  const defaultMonth = targetMonths[0]?.value || activeMonth;
                  handleFilterChange(targetYear, defaultMonth);
                }}
                className="bg-spoket-gray text-spoket-dark text-xs font-black py-1 pl-2.5 pr-6 rounded-xl border border-slate-200 appearance-none cursor-pointer focus:outline-none"
              >
                {availableFilters.map((f) => (
                  <option key={f.year} value={f.year}>
                    {f.year}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-spoket-dark pointer-events-none"
              />
            </div>

            {/* Dropdown Bulan */}
            <div className="relative">
              <select
                value={activeMonth}
                onChange={(e) => handleFilterChange(activeYear, e.target.value)}
                className="bg-spoket-gray text-spoket-dark text-xs font-black py-1 pl-2.5 pr-6 rounded-xl border border-slate-200 appearance-none cursor-pointer focus:outline-none"
              >
                {availableMonths.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-spoket-dark pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* List Card Budget */}
        {items.length === 0 ? (
          <div className="bg-spoket-white rounded-2xl border-2 border-dashed border-spoket-gray p-8 text-center text-xs font-bold text-spoket-darker">
            Tidak ada jatah belanja pada periode terpilih.
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((b) => (
              <CompactBudgetRow
                key={b.id}
                budget={b}
                onOpenExpense={(budget) => {
                  setSelectedBudgetForExpense(budget);
                  setIsExpenseOpen(true);
                }}
                onOpenEdit={(e, budget) => {
                  e.stopPropagation();
                  setSelectedBudgetForEdit(budget);
                  setIsEditOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Transaksi & Edit */}
      <ExpenseModal
        budget={selectedBudgetForExpense}
        wallets={wallets}
        userId={userId}
        isOpen={isExpenseOpen}
        onClose={() => {
          setIsExpenseOpen(false);
          setSelectedBudgetForExpense(null);
        }}
      />

      <EditBudgetModal
        budget={selectedBudgetForEdit}
        userId={userId}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedBudgetForEdit(null);
        }}
      />
    </>
  );
}