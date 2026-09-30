import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    // 1. Cek apakah user dengan email ini terdaftar
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 404 });
    }

    // 2. Generate kode OTP 4 digit angka acak
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Kedaluwarsa dalam 10 menit

    // 3. Simpan / Perbarui OTP di Database
    await prisma.verificationToken.upsert({
      where: {
        identifier: email,
      },
      update: {
        token: otpCode,
        expires: expiresAt,
      },
      create: {
        identifier: email,
        token: otpCode,
        expires: expiresAt,
      },
    });

    // 4. Konfigurasi Transporter Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Email pengirim di .env
        pass: process.env.EMAIL_PASS, // App password email di .env
      },
    });

    // 5. Kirim Email ke User
    await transporter.sendMail({
      from: `"Finary App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Kode Verifikasi Reset Password - Finary",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 420px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
          <h2 style="color: #062828; margin-top: 0;">Reset Password Finary</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">Kami menerima permintaan untuk mereset password akun Finary Anda. Masukkan kode OTP berikut pada aplikasi:</p>
          
          <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; text-align: center; padding: 18px; background-color: #F8FAF9; color: #062828; border-radius: 16px; margin: 20px 0; border: 1px solid #cbd5e1;">
            ${otpCode}
          </div>
          
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.4;">Kode ini hanya berlaku selama 10 menit. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gagal kirim OTP:", error);
    return NextResponse.json(
      { error: "Gagal memproses pengiriman email OTP" },
      { status: 500 }
    );
  }
}