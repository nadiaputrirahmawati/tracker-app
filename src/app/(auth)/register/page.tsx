"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, User, Check, X } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Button } from "@/src/components/ui/Button";
import { PasswordRequirements } from "@/src/components/requiment/password";

import { getPasswordStrength } from "@/src/lib/password-strength";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});



export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 1. Validasi Kekuatan Password
    if (strength.score < 3) {
      setError("Password minimal 8 karakter, mengandung huruf besar, dan angka.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat akun.");
        setLoading(false);
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("Terjadi kesalahan sistem.");
      setLoading(false);
    }
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-white flex justify-center items-center lg:p-6 p-0`}>
      <div className="w-full max-w-md  bg-gradient-to-b from-[#8FA866] via-[#7B9651] to-[#688241] text-white flex flex-col justify-between  overflow-hidden shadow-2xl lg:rounded-[44px] rounded-none
      ">
        {/* Ornamen Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/15 rounded-full blur-3xl" />
          <div className="absolute top-44 -right-16 w-56 h-56 bg-emerald-200/15 rounded-full blur-2xl" />
        </div>

        {/* 1. Header & Logo Atas */}
        <div className="pt-6 px-6 text-center z-10 shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl mx-auto flex items-center justify-center mb-2">
            <Image
              src="/img/logo.svg"
              alt="Finary Logo"
              width={110}
              height={110}
              className="object-contain drop-shadow"
              priority
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Create Account
          </h1>
          <p className="text-sm font-medium text-emerald-950 tracking-wide mt-1">
            Start managing your financial journey today
          </p>
        </div>

        {/* 2. Kartu Melayang Bawah (Bottom Sheet Card) */}
        <div className="relative z-10 flex-1 flex flex-col mt-3">
          {/* Notch Handle Bar */}
          <div className="absolute justify-center lg:ml-[12.5rem] ml-[10.2rem]  mt-3">
            <div className="w-16 h-1.5 bg-gray-500 rounded-full" />
          </div>

          <div className="bg-[#FAFBFB] text-[#062828] rounded-t-[38px] px-7 pt-5 pb-5 shadow-[0_-12px_30px_rgba(0,0,0,0.08)] w-full flex-1 flex flex-col justify-between border-t border-white/70 overflow-y-auto no-scrollbar">
            <div>
              {/* Teks Judul Form */}
              <div className="text-center mb-4">
                <h2 className="text-base font-bold text-slate-800 tracking-tight">
                  Daftarkan Akun Baru
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Lengkapi data diri Anda di bawah ini
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                  <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">
                    {error}
                  </div>
                )}

                {/* Input Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-emerald-950 mb-1 mt-6">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: John Doe"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#7B9651] focus:ring-4 focus:ring-[#7B9651]/15 transition"
                    />
                  </div>
                </div>

                {/* Input Email */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-emerald-950 mb-1 mt-4">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#7B9651] focus:ring-4 focus:ring-[#7B9651]/15 transition"
                    />
                  </div>
                </div>

                {/* Input Password & Checklist Syarat */}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-emerald-950 mb-1 mt-4">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Buat password yang kuat"
                      className="w-full pl-11 pr-11 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#7B9651] focus:ring-4 focus:ring-[#7B9651]/15 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Indikator Bar Kekuatan */}
                  {password && (
                    <div className="mt-3 space-y-1">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-semibold">
                        <span className="text-slate-400">Kekuatan:</span>
                        <span className={strength.textColor}>{strength.label}</span>
                      </div>
                    </div>
                  )}

                  {/* Checklist Syarat Password (Interaktif) */}
                  <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5">

                  <PasswordRequirements password={password} />
                  </div>
                </div>

                {/* Tombol Register */}
                <Button type="submit" isLoading={loading}>
                  Sign Up
                </Button>
              </form>

              {/* Tautan Kembali ke Login */}
              <div className="text-center pt-4 pb-1">
                <p className="text-xs font-semibold text-slate-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#062828] font-bold underline underline-offset-2"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}