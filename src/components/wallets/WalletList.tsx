"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  Wallet as WalletIcon,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { formatRupiah } from "@/src/lib/utils";
import { WalletActionModal, WalletItem } from "@/src/components/wallets/WalletActionModal";
import { deleteWalletWithBalanceTransfer } from "@/src/actions/wallet";

interface WalletListProps {
  initialWallets: WalletItem[];
  userId?: string;
}

export function WalletList({ initialWallets, userId = "1" }: WalletListProps) {
  const [wallets, setWallets] = useState<WalletItem[]>(initialWallets);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // State untuk modal edit
  const [selectedWalletForEdit, setSelectedWalletForEdit] = useState<WalletItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // State untuk modal konfirmasi hapus
  const [walletToDelete, setWalletToDelete] = useState<WalletItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tutup popup aksi saat klik di area manapun di luar menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuId]);

  // Handler Menu
  const handleOpenEdit = (wallet: WalletItem) => {
    setActiveMenuId(null);
    setSelectedWalletForEdit(wallet);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (wallet: WalletItem) => {
    setActiveMenuId(null);
    setWalletToDelete(wallet);
  };

  const handleConfirmDelete = async () => {
    if (!walletToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteWalletWithBalanceTransfer(userId, walletToDelete.id);
      if (!res?.error) {
        setWallets((prev) => prev.filter((w) => w.id !== walletToDelete.id));
        setWalletToDelete(null);
      } else {
        alert(res.error);
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus dompet.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          Daftar Kantong Saldo ({wallets.length})
        </span>
      </div>

      {/* Render List Dompet */}
      <div className="space-y-2.5">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="relative flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-2xl shadow-xs transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#062828]">
                <WalletIcon size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#062828]">{wallet.name}</h4>
                <span className="text-[10px] font-semibold text-emerald-600">Dompet Aktif</span>
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <span className="text-xs font-black text-[#062828]">
                {formatRupiah(wallet.balance)}
              </span>

              {/* Tombol Titik Tiga */}
              <button
                type="button"
                onClick={() =>
                  setActiveMenuId(activeMenuId === wallet.id ? null : wallet.id)
                }
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
              >
                <MoreVertical size={16} />
              </button>

              {/* Popup Aksi Dropdown Melayang */}
              {activeMenuId === wallet.id && (
                <div
                  ref={menuRef}
                  className="absolute right-0 bottom-full mb-1 w-32 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                >
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(wallet)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Pencil size={13} className="text-slate-500" />
                    <span>Edit</span>
                  </button>

                  <div className="h-[1px] bg-slate-100 my-1 mx-2" />

                  <button
                    type="button"
                    onClick={() => handleOpenDelete(wallet)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={13} className="text-red-500" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edit Bawaan */}
      <WalletActionModal
        wallet={selectedWalletForEdit}
        userId={userId}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedWalletForEdit(null);
        }}
        onSuccess={(updated) => {
          setWallets((prev) =>
            prev.map((w) => (w.id === updated.id ? { ...w, ...updated } : w))
          );
        }}
      />

      {/* MODAL KONFIRMASI HAPUS (PORTAL KE BODY) */}
      {mounted &&
        walletToDelete &&
        createPortal(
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl relative z-[1000] animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between pb-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <AlertTriangle size={20} />
                </div>
                <button
                  type="button"
                  onClick={() => setWalletToDelete(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3 space-y-2">
                <h3 className="text-base font-black text-[#062828]">
                  Hapus Dompet {walletToDelete.name}?
                </h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Tindakan ini tidak dapat dibatalkan. Sisa saldo sebesar{" "}
                  <strong className="text-[#062828] font-black">
                    {formatRupiah(walletToDelete.balance)}
                  </strong>{" "}
                  akan <span className="text-emerald-700 font-bold">otomatis dialihkan ke Kantong/Saldo Utama</span>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setWalletToDelete(null)}
                  className="py-3 bg-[#F1F5F9] text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-200 transition"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#991b1b] active:scale-98"
                >
                  <Trash2 size={14} />
                  <span>{isDeleting ? "Menghapus..." : "Ya, Hapus"}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}