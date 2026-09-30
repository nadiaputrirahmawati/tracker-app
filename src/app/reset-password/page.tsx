"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Button } from "@/src/components/ui/Button";
import Image from "next/image";
import { getPasswordStrength } from "@/src/lib/password-strength";
import { PasswordRequirements } from "@/src/components/requiment/password";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil parameter email dan kode OTP dari query string URL
  const emailParam = searchParams.get("email") || "";
  const codeParam = searchParams.get("code") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailParam,
          code: codeParam,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal memperbarui kata sandi.");
        setLoading(false);
      } else {
        router.push("/login?reset=success");
      }
    } catch {
      setError("Terjadi gangguan koneksi sistem.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md h-[100dvh] sm:h-[844px] bg-white text-emerald-950 flex flex-col justify-between relative overflow-hidden shadow-2xl sm:rounded-[44px]">
      
      {/* 1. Bar Navigasi Atas & Tombol Kembali */}
      <div className="pt-8 px-6 flex items-center justify-between z-10 shrink-0">
        <h1 className="text-lg font-bold text-emerald-900 tracking-wide">
          Kata Sandi Baru
        </h1>
        <div className="w-10" />
      </div>

      {/* 2. Kartu Melayang Bawah (Bottom Sheet Card) */}
      <div className="relative z-10 flex-1 flex flex-col mt-6">
        {/* Notch Handle Bar Terpusat */}
        <div className="flex justify-center pb-2.5">
          <div className="w-14 h-1.5 rounded-full" />
        </div>

        <div className="bg-[#FAFBFB] text-[#062828] px-7 pt-6 pb-6 w-full flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar">
          <div>
            {/* Badge Ilustrasi Melingkar (Arahkan gambar Anda di sini) */}
            <div className="flex justify-center mb-3">
              <div className="relative p-8 rounded-full bg-[#e0f5bf]/30 flex items-center justify-center">
                <Image
                  src="/img/new-password.svg" // Ganti dengan path file gambar Anda
                  alt="Ilustrasi Buat Kata Sandi Baru"
                  width={130}
                  height={130}
                  priority
                />
              </div>
            </div>

            {/* Teks Penjelasan */}
            <div className="text-center mb-5 px-3">
              <p className="text-sm text-emerald-900 font-bold leading-relaxed">
                Kata sandi baru Anda harus berbeda dari kata sandi yang pernah digunakan sebelumnya.
              </p>
            </div>

            {/* Notifikasi Error */}
            {error && (
              <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-2xl border border-rose-200 mb-3 animate-in fade-in">
                {error}
              </div>
            )}

            {/* Form Input Dengan Gaya Garis Bawah (Underline) */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-10">
              {/* Input Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-emerald-950 mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full pl-9 pr-10 py-3 bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 border-b-2 border-slate-300 focus:outline-none focus:border-[#7B9651] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Indikator Kekuatan Kata Sandi */}
                {password && (
                  <div className="mt-2 space-y-1">
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
              </div>

              {/* Input Konfirmasi Kata Sandi */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-emerald-950 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full pl-9 pr-10 py-3 bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 border-b-2 border-slate-300 focus:outline-none focus:border-[#7B9651] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Kriteria Checklist Ringkas */}
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5">
               <PasswordRequirements password={password} />
              </div>

              {/* Tombol Simpan */}
              <Button type="submit" isLoading={loading} className="mt-3">
                Simpan Kata Sandi
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      className={`${jakarta.className} min-h-screen bg-amber-100 flex justify-center items-center p-0 sm:p-4`}
    >
      <Suspense fallback={<div className="text-xs text-emerald-950 font-bold">Memuat...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}