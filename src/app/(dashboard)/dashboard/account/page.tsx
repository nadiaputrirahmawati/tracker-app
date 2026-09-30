import { auth } from "@/src/auth";
import { LogoutButton } from "@/src/components/button/logout";
import { User, Mail } from "lucide-react";

export default async function AccountPage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-5 p-4 bg-[#F8FAF9] min-h-screen text-[#062828] pb-28">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black">Akun Saya</h1>
        <p className="text-xs text-slate-400 font-bold">Kelola profil dan keamanan</p>
      </div>

      {/* Kartu Informasi Pengguna */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 bg-[#FEF08A] rounded-2xl flex items-center justify-center text-[#062828] font-black text-lg border border-teal-950/10">
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-sm truncate">{session?.user?.name || "Pengguna Finary"}</h2>
            <p className="text-xs font-bold text-slate-400 truncate">{session?.user?.email || "-"}</p>
          </div>
        </div>

        <div className="space-y-2 pt-1 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2.5">
            <User size={15} className="text-slate-400" />
            <span>Status Akun: <strong className="text-emerald-600">Aktif & Terverifikasi</strong></span>
          </div>
        </div>
      </div>

      {/* Tombol Keluar / Logout */}
      <div className="pt-2">
        <LogoutButton />
      </div>
    </div>
  );
}