"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    // signOut akan menghapus sesi dan otomatis mengarahkan ke halaman /login
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full py-3.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition active:scale-[0.99] disabled:opacity-50 shadow-xs"
    >
      <LogOut size={16} className="stroke-[2.5]" />
      <span>{loading ? "Logging out..." : "Keluar Akun (Logout)"}</span>
    </button>
  );
}