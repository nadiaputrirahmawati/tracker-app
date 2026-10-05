"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowRightLeft, Check, X } from "lucide-react";
import { formatRupiah, formatNumberInput, parseNumberInput } from "@/src/lib/utils";
import { updateWalletDetails, transferWalletToMainIncome } from "@/src/actions/wallet";

export interface WalletItem {
    id: string;
    name: string;
    balance: number;
}

interface WalletActionModalProps {
    wallet: WalletItem | null;
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedWallet: { id: string; name: string; balance: number }) => void;
}

export function WalletActionModal({
    wallet,
    userId,
    isOpen,
    onClose,
    onSuccess,
}: WalletActionModalProps) {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"edit" | "transfer">("transfer");
    const [editName, setEditName] = useState("");
    const [editBalanceStr, setEditBalanceStr] = useState("");
    const [transferAmountStr, setTransferAmountStr] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Pastikan render portal hanya di sisi client
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (wallet) {
            setEditName(wallet.name);
            setEditBalanceStr(formatNumberInput(wallet.balance));
            setTransferAmountStr("");
            setActiveTab("transfer");
            setErrorMessage("");
        }
    }, [wallet]);

    if (!isOpen || !wallet || !mounted) return null;

    const numericEditBalance = parseNumberInput(editBalanceStr);
    const numericTransfer = parseNumberInput(transferAmountStr);
    const realtimeBalanceAfterTransfer = Math.max(0, wallet.balance - numericTransfer);

    const handleSave = async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            if (activeTab === "transfer") {
                if (numericTransfer <= 0) {
                    setErrorMessage("Nominal pemindahan harus lebih dari Rp 0");
                    setIsLoading(false);
                    return;
                }

                const res = await transferWalletToMainIncome(userId, wallet.id, numericTransfer);
                if (res?.error) {
                    setErrorMessage(res.error);
                } else {
                    onSuccess({
                        id: wallet.id,
                        name: wallet.name,
                        balance: realtimeBalanceAfterTransfer,
                    });
                    onClose();
                }
            } else {
                const res = await updateWalletDetails(wallet.id, editName, numericEditBalance);
                if (res?.error) {
                    setErrorMessage(res.error);
                } else {
                    onSuccess({
                        id: wallet.id,
                        name: editName,
                        balance: numericEditBalance,
                    });
                    onClose();
                }
            }
        } catch {
            setErrorMessage("Terjadi kesalahan, silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    // Gunakan createPortal ke document.body agar menutupi TopNav dan Card Tombol
    return createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            {/* Box Putih Modal */}
            <div className="w-full max-w-sm sm:max-w-md bg-white rounded-[32px] p-6 shadow-2xl relative z-[1000] animate-in zoom-in-95 duration-200">

                {/* Header Title + Tombol Close */}
                <div className="flex items-center justify-between pb-3">
                    <h3 className="text-base font-black text-[#062828] tracking-tight">
                        Pengaturan Dompet
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Card Saldo Gelap Hijau Tua */}
                {/* Card Saldo Gelap Hijau Tua */}
                <div className="my-4 p-5 rounded-2xl bg-[#032525] text-white space-y-1 shadow-inner">
                    <span className="text-[10px] font-black text-[#FEF08A] uppercase tracking-wider block">
                        {activeTab === "transfer" ? "ESTIMASI SISA SALDO DOMPET" : "SALDO TERSEDIA SAAT INI"}
                    </span>
                    <h2 className="text-3xl font-black tracking-tight text-white">
                        {formatRupiah(activeTab === "transfer" ? realtimeBalanceAfterTransfer : wallet.balance)}
                    </h2>

                    {/* Rincian nominal yang dipindahkan kembali dimunculkan */}
                    {activeTab === "transfer" && numericTransfer > 0 && (
                        <div className="pt-1.5 flex items-center gap-1.5 text-amber-200">
                            <span className="text-[11px] font-bold">
                                *Dipindahkan: {formatRupiah(numericTransfer)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Tab Pilihan Menu */}
                <div className="flex items-center gap-2 p-1.5 bg-[#F1F5F9]/80 rounded-2xl mb-4 text-xs font-black">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab("edit");
                            setErrorMessage("");
                        }}
                        className={`flex-1 py-2.5 rounded-xl transition text-center ${activeTab === "edit"
                                ? "bg-white text-[#062828] border-2 border-[#062828] shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        Ubah Data
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab("transfer");
                            setErrorMessage("");
                        }}
                        className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${activeTab === "transfer"
                                ? "bg-white text-[#062828] border-2 border-[#062828] shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        <ArrowRightLeft size={14} className="stroke-[2.5]" />
                        <span>Pindahkan Uang</span>
                    </button>
                </div>

                {/* Alert Error */}
                {errorMessage && (
                    <div className="mb-3 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                        {errorMessage}
                    </div>
                )}

                {/* Konten Form */}
                {activeTab === "transfer" ? (
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-bold text-slate-700">
                                Nominal Dipindahkan
                            </label>
                            <button
                                type="button"
                                onClick={() => setTransferAmountStr(formatNumberInput(wallet.balance))}
                                className="text-xs font-extrabold text-teal-800 hover:underline cursor-pointer"
                            >
                                Pindahkan Semua
                            </button>
                        </div>

                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-sm font-black text-slate-400">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={transferAmountStr}
                                onChange={(e) => {
                                    const parsed = parseNumberInput(e.target.value);
                                    if (parsed > wallet.balance) {
                                        setTransferAmountStr(formatNumberInput(wallet.balance));
                                    } else {
                                        setTransferAmountStr(formatNumberInput(e.target.value));
                                    }
                                }}
                                placeholder="0"
                                className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-sm font-black text-[#062828] focus:outline-none focus:border-[#062828]"
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium px-1">
                            Nominal ini akan dipindahkan dan dicatat masuk ke saldo utama/kas tunai.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 mb-6">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Nama Dompet
                            </label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-black text-[#062828] focus:outline-none focus:border-[#062828]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                                Koreksi Saldo
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-4 text-xs font-black text-slate-400">
                                    Rp
                                </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={editBalanceStr}
                                    onChange={(e) => setEditBalanceStr(formatNumberInput(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-black text-[#062828] focus:outline-none focus:border-[#062828]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tombol Aksi Bawah */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-3 bg-[#F1F5F9] text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-200 transition"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        disabled={isLoading || (activeTab === "transfer" && numericTransfer <= 0)}
                        onClick={handleSave}
                        className="py-3 bg-[#CBD5E1] disabled:opacity-60 text-[#062828] rounded-2xl text-xs font-black border-2 border-[#062828] flex items-center justify-center gap-1.5 transition active:scale-98"
                    >
                        <Check size={16} className="stroke-[3]" />
                        <span>{isLoading ? "Menyimpan..." : "Konfirmasi"}</span>
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}