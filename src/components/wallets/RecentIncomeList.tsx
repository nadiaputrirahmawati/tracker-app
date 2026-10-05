"use client";

import { useState } from "react";
import { MoreVertical, Edit2, Trash2, Check, X, ArrowDownLeft } from "lucide-react";
import { toRupiah, parseRawNumber } from "@/src/lib/money";
import { deleteIncomeTransaction, updateIncomeTransaction } from "@/src/actions/wallet";

interface IncomeItem {
  id: string;
  amount: number;
  notes: string;
  walletName: string;
  date: string;
}

export function RecentIncomeList({ items }: { items: IncomeItem[] }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  function startEdit(item: IncomeItem) {
    setEditingId(item.id);
    setEditNotes(item.notes);
    setEditAmount(item.amount);
    setActiveMenu(null);
  }

  async function handleSaveEdit(id: string) {
    if (editAmount <= 0) return alert("Nominal tidak boleh 0!");
    setLoading(true);
    await updateIncomeTransaction(id, editAmount, editNotes);
    setLoading(false);
    setEditingId(null);
  }

  async function handleDelete(id: string, notes: string) {
    if (confirm(`Hapus catatan "${notes}"? Saldo dompet terkait akan otomatis berkurang.`)) {
      setLoading(true);
      await deleteIncomeTransaction(id);
      setLoading(false);
      setActiveMenu(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center text-xs font-bold text-slate-400">
        Belum ada riwayat pemasukan gajian.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Riwayat Pemasukan Terakhir ({items.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative"
          >
            {editingId === item.id ? (
              // Mode Edit
              <div className="w-full space-y-2">
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Keterangan"
                  className="w-full text-xs font-black text-[#062828] border-b border-slate-200 pb-1 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-400">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editAmount === 0 ? "" : toRupiah(editAmount)}
                    onChange={(e) => setEditAmount(parseRawNumber(e.target.value))}
                    className="w-full text-sm font-black text-[#062828] border-b border-slate-200 focus:outline-none"
                  />
                  <button
                    disabled={loading}
                    onClick={() => handleSaveEdit(item.id)}
                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg cursor-pointer"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 bg-slate-50 text-slate-400 rounded-lg cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              // Tampilan Biasa
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <ArrowDownLeft size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#062828] leading-none">{item.notes}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                      {item.walletName} • {item.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-600">
                    +Rp {toRupiah(item.amount)}
                  </span>

                  {/* Dropdown Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                      className="p-1 text-slate-400 hover:text-[#062828] rounded-lg cursor-pointer"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenu === item.id && (
                      <div className="absolute right-0 top-8 bg-white border border-slate-100 rounded-xl shadow-xl p-1 z-20 w-28">
                        <button
                          onClick={() => startEdit(item)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-black text-[#062828] hover:bg-slate-50 rounded-lg text-left cursor-pointer"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.notes)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-black text-rose-600 hover:bg-rose-50 rounded-lg text-left cursor-pointer"
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}