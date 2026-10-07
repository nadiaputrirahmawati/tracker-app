"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Settings, User, LogOut } from "lucide-react";
import { Fredoka } from "next/font/google";

// Font chubby rounded mirip gambar logo Spoket
const fredoka = Fredoka({
  weight: ["600", "700"],
  subsets: ["latin"],
});

export function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    // signOut akan menghapus sesi dan otomatis mengarahkan ke halaman /login
    await signOut({ callbackUrl: "/login" });
  }

  // Tutup dropdown jika klik di luar area modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#062828] border-b border-teal-950/40 px-4 py-3">
      <div className="flex items-center justify-between relative">
        {/* Kiri: Logo + Nama Brand Spoket */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 relative rounded-full overflow-hidden flex items-center justify-center">
            {/* Ganti path dengan lokasi gambar logo dompet Anda */}
            <Image
              src="/img/logo.svg"
              alt="Logo Spoket"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span
            className={`${fredoka.className} text-xl font-bold tracking-wide text-[#FEF08A] drop-shadow-[0_1.5px_0_#fffff]`}
          >
            Spoket
          </span>
        </Link>

        {/* Kanan: Tombol Setting & Dropdown Modal */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition flex items-center justify-center text-white border border-white/10"
            aria-label="Settings"
          >
            <Settings size={18} className="text-slate-100" />
          </button>

          {/* Modal Kecil / Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <Link
                href="/dashboard/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <User size={15} className="text-slate-500" />
                <span>Profile</span>
              </Link>

              <div className="h-[1px] bg-slate-100 my-1 mx-2" />

              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition text-left"
              >
                <LogOut size={15} className="text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}