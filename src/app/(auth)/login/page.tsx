"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Button } from "@/src/components/ui/Button";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
      router.refresh();
    }
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Email atau password salah.");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan sistem.");
      setLoading(false);
    }
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-white flex justify-center items-center p-6`}>
      <div className="w-full max-w-md  bg-gradient-to-b from-[#8FA866] via-[#7B9651] to-[#688241] text-white flex flex-col justify-between  overflow-hidden shadow-2xl rounded-[44px]">

        {/* Ornamen Garis Gelombang Geometris Abstrak (Bukan Bunga/Daun) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Efek Ambient Glow */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/15 rounded-full blur-3xl" />
          <div className="absolute top-44 -right-16 w-56 h-56 bg-emerald-200/15 rounded-full blur-2xl" />


        </div>

        {/* 1. Header & Logo Atas */}
        <div className="pt-6 px-6 text-center z-10 shrink-0">
          <div className="w-36 h-36 rounded-3xl mx-auto flex items-center justify-center mb-4">
            <Image
              src="/img/logo.svg"
              alt="Finary Logo"
              width={150}
              height={150}
              className="object-contain drop-shadow"
              priority
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Let&apos;s get you Login!
          </h1>
          <p className="text-md font-medium text-emerald-950 tracking-wide mt-1.5">
            Hi! Welcome back, you&apos;ve been missed
          </p>
        </div>

        {/* 2. Kartu Melayang Bawah (Bottom Sheet Card) */}
        <div className="relative z-10 flex-1 flex flex-col mt-8">
          {/* Notch Handle Bar */}
          <div className="absolute justify-center ml-[12.5rem] mt-3">
            <div className="w-16 h-1.5 bg-gray-500 rounded-full" />
          </div>

          <div className="bg-[#FAFBFB] text-[#062828] rounded-t-[38px] px-7 pt-7 pb-6 shadow-[0_-12px_30px_rgba(0,0,0,0.08)] w-full flex-1 flex flex-col justify-between border-t border-white/70">
            <div>
              {/* Teks Judul Form Baru */}
              <div className="text-center mb-6 mt-5">
                <h2 className="text-base font-bold text-slate-800 tracking-tight">
                  Masuk ke Akun Anda
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Gunakan email dan kata sandi terdaftar
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 ">
                {error && (
                  <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">
                    {error}
                  </div>
                )}

                {/* Input Email */}
                <div>
                  <label className="block text-sm font-bold  tracking-wider text-emerald-950 mb-1.5 ">
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
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#7B9651] focus:ring-4 focus:ring-[#7B9651]/15 transition"
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 mt-6">
                    <label className="text-sm font-bold  tracking-wider text-slate-400">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-[#688241] hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
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
                      placeholder="••••••••••••"
                      className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#7B9651] focus:ring-4 focus:ring-[#7B9651]/15 transition"
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
                </div>

                <Button type="submit" isLoading={loading}>
                  Sign In
                </Button>
              </form>

              <div className="text-center pt-7 pb-1">
                <p className="text-sm font-semibold text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-[#062828] font-bold underline underline-offset-2"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>

            {/* Navigasi Bawah */}

          </div>
        </div>

      </div>
    </div>
  );
}