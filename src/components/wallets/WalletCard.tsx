import Image from "next/image";
import Link from "next/link";
import { Plus, Wallet as WalletIcon } from "lucide-react";
import { toRupiah } from "@/src/lib/money";

interface WalletCardProps {
  totalBalance: number;
}

export function WalletCard({ totalBalance }: WalletCardProps) {
  return (
    <div className="relative pt-6 px-6 pb-14 text-white">
      {/* Teks & Angka Saldo di Tengah */}
      <div className="text-center space-y-1 ">
        <span className="text-xl font-bold text-white/70 block">
          Saldo Kantong Utama
        </span>
        <h2 className="text-3xl font-black tracking-tight text-white">
          Rp {toRupiah(totalBalance)}
        </h2>
      </div>

      {/* Floating Card Melayang di Bawah Saldo */}
      <div className="absolute left-6 right-6 -bottom-7 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-20">
        <div className="grid grid-cols-2 gap-3">
          {/* Tombol Tambah Pemasukan */}
          <Link
            href="/dashboard/wallets/income"
            prefetch={true}
            className="border-2 border-teal-950 text-black bg-amber-200 px-3 py-2.5 rounded-xl font-black text-xs shadow-[2px_2px_0px_#042f2e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-1.5 transition"
          >
            <Plus size={15} />
            <span>Tambah Pemasukan</span>
          </Link>

          {/* Tombol Tambah Dompet */}
          <Link
            href="/dashboard/wallets/create"
            prefetch={true}
            className="border-2 border-teal-950 text-white bg-[#062828] px-3 py-2.5 rounded-xl font-black text-xs shadow-[2px_2px_0px_#042f2e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-1.5 transition"
          >
            <WalletIcon size={15} />

            <span>Tambah Dompet</span>
          </Link>
        </div>
      </div>
    </div>
  );
}