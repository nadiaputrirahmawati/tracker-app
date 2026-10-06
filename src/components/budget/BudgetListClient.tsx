"use client";

import { useState } from "react";
import { MonthBudgetGroup, BudgetItemView } from "@/src/services/budget.service";
import { CompactBudgetRow } from "@/src/components/budget/BudgetCardItem";
import { ExpenseModal, WalletOption } from "@/src/components/budget/ExpenseModal";
import { formatRupiah } from "@/src/lib/utils";

interface BudgetListClientProps {
  userId: string;
  monthGroups: MonthBudgetGroup[];
  wallets: WalletOption[];
}

export function BudgetListClient({
  userId,
  monthGroups,
  wallets,
}: BudgetListClientProps) {
  const [selectedBudget, setSelectedBudget] = useState<BudgetItemView | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenExpenseModal = (b: BudgetItemView) => {
    setSelectedBudget(b);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4 pt-1">
        {monthGroups.map((group) => (
          <div key={group.period} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black text-spoket-darker uppercase tracking-wider">
                {group.periodLabel}
              </span>
              <span className="text-[10px] font-bold text-spoket-darker">
                Plafon: {formatRupiah(group.totalAllocated)}
              </span>
            </div>

            <div className="bg-spoket-white rounded-2xl border-2 border-spoket-gray p-2 space-y-2 shadow-xs">
              {group.items.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleOpenExpenseModal(b)}
                  className="cursor-pointer active:scale-[0.99] transition"
                >
                  <CompactBudgetRow budget={b} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Cepat Catat Pengeluaran */}
      <ExpenseModal
        budget={selectedBudget}
        wallets={wallets}
        userId={userId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBudget(null);
        }}
      />
    </>
  );
}