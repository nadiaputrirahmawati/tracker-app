"use client";

import { useState, useEffect } from "react";
import { X, Layers } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { updateBudgetAction } from "@/src/actions/budget";
import { BudgetItemView } from "@/src/services/budget.service";

interface EditBudgetModalProps {
  budget: BudgetItemView | null;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EditBudgetModal({
  budget,
  userId,
  isOpen,
  onClose,
}: EditBudgetModalProps) {
  const [name, setName] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (budget) {
      setName(budget.name);
      setAmountStr(new Intl.NumberFormat("id-ID").format(budget.allocatedAmount));
      setErrorMessage("");
    }
  }, [budget]);

  if (!isOpen || !budget) return null;

  const rawAmount = Number(amountStr.replace(/\D/g, ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Nama jatah belanja wajib diisi.");
      return;
    }
    if (rawAmount <= 0) {
      setErrorMessage("Plafon anggaran harus lebih dari 0.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await updateBudgetAction({
        id: budget.id,
        userId,
        name,
        allocatedAmount: rawAmount,
      });

      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        onClose();
      }
    } catch {
      setErrorMessage("Terjadi masalah saat memperbarui data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-[#062828]/60 backdrop-blur-xs" />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm bg-spoket-white border-2 border-spoket-dark rounded-[28px] p-5 shadow-2xl z-10 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-spoket-gray">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-spoket-darker block">
              PENGATURAN
            </span>
            <h3 className="text-sm font-black text-spoket-dark">Ubah Jatah Belanja</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-spoket-gray text-spoket-dark flex items-center justify-center hover:bg-slate-200"
          >
            <X size={14} />
          </button>
        </div>

        {errorMessage && (
          <div className="p-2 bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Input Nama */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-spoket-darker uppercase tracking-wider block">
              NAMA JATAH
            </label>
            <div className="flex items-center gap-2 bg-spoket-gray px-3 py-2.5 rounded-xl border-2 border-spoket-dark/10 focus-within:border-spoket-dark">
              <Layers size={15} className="text-spoket-darker" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-bold text-spoket-dark focus:outline-none bg-transparent"
                placeholder="Nama jatah..."
              />
            </div>
          </div>

          {/* Input Plafon */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-spoket-darker uppercase tracking-wider block">
              TARGET / PLAFON
            </label>
            <div className="flex items-center gap-2 bg-spoket-gray px-3 py-2 rounded-xl border-2 border-spoket-dark/10 focus-within:border-spoket-dark">
              <span className="text-base font-black text-spoket-dark">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setAmountStr(val ? new Intl.NumberFormat("id-ID").format(Number(val)) : "");
                }}
                className="w-full text-base font-black text-spoket-dark focus:outline-none bg-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" isLoading={isLoading} disabled={!name.trim() || rawAmount <= 0}>
              SIMPAN PERUBAHAN
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}