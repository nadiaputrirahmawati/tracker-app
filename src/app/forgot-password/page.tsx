"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Button } from "@/src/components/ui/Button";
import Image from "next/image";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Timer hitung mundur 2 menit (120 detik)
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);

  // Ref untuk input kotak OTP agar fokus berpindah otomatis
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Efek hitung mundur 2 menit
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "OTP" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Format detik ke format mm:ss (contoh: 02:00, 01:45)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  // Kirim OTP ke email
  async function handleSendEmail(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengirim kode OTP.");
      } else {
        setStep("OTP");
        setTimer(120); // Reset timer kembali ke 2 menit
        setCanResend(false);
        setOtp(["", "", "", ""]);
        setMessage(`Kode OTP telah dikirimkan ke ${email}`);
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      }
    } catch {
      setError("Terjadi gangguan koneksi internet.");
    } finally {
      setLoading(false);
    }
  }

  // Handle input kotak OTP
  const handleOtpChange = (idx: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, "");

    // Jika pengguna menempelkan (paste) kode langsung
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 4).split("");
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(pasted.length, 3);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[idx] = cleanVal;
    setOtp(newOtp);

    // Otomatis berpindah ke kotak kanan
    if (cleanVal && idx < 3) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Otomatis berpindah ke kotak kiri saat menekan tombol backspace
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // Verifikasi OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const code = otp.join("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kode OTP salah atau telah kedaluwarsa.");
      } else {
        router.push(
          `/reset-password?email=${encodeURIComponent(email)}&code=${code}`
        );
      }
    } catch {
      setError("Verifikasi kode gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-white flex justify-center items-center p-6`}>
      <div className="w-full max-w-md  bg-gradient-to-b from-[#8FA866] via-[#7B9651] to-[#688241] text-white flex flex-col justify-between  overflow-hidden shadow-2xl rounded-[44px]">

        {/* 1. Bar Navigasi Atas & Tombol Kembali */}
        <div className="pt-8 px-6 flex items-center justify-between z-10 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (step === "OTP") {
                setStep("EMAIL");
                setError(null);
                setMessage(null);
              } else {
                router.push("/login");
              }
            }}
            className="w-10 h-10 rounded-full bg-[#e0f5bf] backdrop-blur-md border border-white/30 flex items-center justify-center text-[#8FA866] hover:bg-white/30 transition active:scale-95"
            aria-label="Kembali"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-emerald-900 tracking-wide">
            {step === "EMAIL" ? "Lupa Kata Sandi" : "Verifikasi Email"}
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
              {/* Badge Ilustrasi Surat / Gembok Melingkar */}
              <div className="flex justify-center mb-4">
                <div className="relative p-10 rounded-full bg-[#e0f5bf]/30 flex items-center justify-center">
                  {step === "EMAIL" ? (
                    <Image
                      src="/img/forgot-password.svg"
                      alt="Ilustrasi Lupa Kata Sandi"
                      width={140}
                      height={140}
                      priority
                    />
                  ) : (
                    <Image
                      src="/img/verify-email.svg"
                      alt="Ilustrasi Verifikasi OTP"
                      width={140}
                      height={140}
                      priority
                    />
                  )}
                </div>
              </div>

              {/* Teks Penjelasan */}
              <div className="text-center mb-6 mt-8 px-3">
                <p className="text-md text-emerald-900 font-bold leading-relaxed">
                  {step === "EMAIL"
                    ? "Masukkan alamat email Anda yang terdaftar untuk menerima 4 digit kode verifikasi."
                    : `Silakan masukkan 4 digit kode verifikasi yang telah dikirim ke ${email}`}
                </p>
              </div>

              {/* FORM LANGKAH 1: INPUT EMAIL */}
              {step === "EMAIL" ? (
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold tracking-wider text-emerald-950 mb-1.5 mt-12">
                      Alamat Email
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
                        placeholder="nama@email.com"
                        className="w-full pl-11 pr-4 py-3 bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 border-b-2 border-slate-300 focus:outline-none focus:border-[#7B9651] transition"
                      />
                    </div>
                  </div>

                  <Button type="submit" isLoading={loading} className="mt-3">
                    Kirim Kode Verifikasi
                  </Button>
                </form>
              ) : (
                /* FORM LANGKAH 2: INPUT 4 DIGIT OTP DENGAN RESEND TIMER */
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* Kotak Input 4 Digit */}
                  <div className="flex justify-center gap-3 pt-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-13 h-14 bg-white border-2 border-slate-200 rounded-2xl text-center text-xl font-extrabold text-[#062828] focus:outline-none focus:border-[#7B9651] focus:ring-4 focus:ring-[#7B9651]/15 transition shadow-xs"
                      />
                    ))}
                  </div>

                  {/* Tautan Kirim Ulang Kode Dengan Timer 2 Menit */}
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-500">
                      Tidak menerima kode?{" "}
                      {canResend ? (
                        <button
                          type="button"
                          onClick={() => handleSendEmail()}
                          disabled={loading}
                          className="font-bold text-[#688241] hover:underline disabled:opacity-50"
                        >
                          Kirim Ulang Kode
                        </button>
                      ) : (
                        <span className="text-slate-400 font-medium">
                          Kirim ulang dalam{" "}
                          <strong className="text-[#688241] font-bold">
                            {formatTimer(timer)}
                          </strong>
                        </span>
                      )}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={otp.join("").length < 4}
                  >
                    Verifikasi Kode
                  </Button>
                </form>
              )}
            </div> 
          </div>
        </div>
      </div>
    </div>
  );
}