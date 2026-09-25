import { getWallets } from "@/src/actions/wallet";
import { formatRupiah } from "@/src/lib/utils";
import { AddWalletModal } from "@/src/components/add-wallet-modal";
import { Wallet as WalletIcon, ArrowLeft } from "lucide-react";
import { WalletItemActions } from "@/src/components/wallet-item-actions";
import Link from "next/link";

export default async function WalletsPage() {
  const wallets = await getWallets();
  const totalBalance = wallets.reduce((sum, w) => sum + w.currentBalance, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-base font-bold text-slate-800">Daftar Dompet Saya</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Ringkasan Total Saldo Seluruh Dompet */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-400 font-medium">
            Akumulasi Seluruh Saldo
          </p>
          <p className="text-2xl font-extrabold mt-1">
            {formatRupiah(totalBalance)}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Terbagi dalam {wallets.length} rekening / dompet aktif
          </p>
        </div>

        {/* List Dompet */}
        <div className="space-y-3">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="bg-white border-2 border-teal-950 p-4 rounded-2xl shadow-[3px_3px_0px_#042f2e] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 border border-teal-950 text-teal-950 rounded-xl">
                  <WalletIcon size={20} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-teal-950">{w.name}</h4>
                  <p className="font-extrabold text-xs text-teal-900/60 mt-0.5">
                    {formatRupiah(w.currentBalance)}
                  </p>
                </div>
              </div>

              <WalletItemActions wallet={w} />
            </div>

          ))}
        </div>

        {/* Tombol Buka Modal Tambah */}
        <AddWalletModal />
      </div>
    </div>
  );
}