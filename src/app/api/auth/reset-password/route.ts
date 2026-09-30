import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "Data permintaan tidak lengkap." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Verifikasi kembali token OTP di database
    const verification = await prisma.verificationToken.findUnique({
      where: { identifier: normalizedEmail },
    });

    if (!verification || verification.token !== code) {
      return NextResponse.json(
        { error: "Sesi verifikasi tidak valid atau kode salah." },
        { status: 400 }
      );
    }

    if (new Date() > verification.expires) {
      return NextResponse.json(
        { error: "Kode verifikasi telah kedaluwarsa." },
        { status: 400 }
      );
    }

    // 2. Hash password baru
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Perbarui password user di database
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    // 4. Hapus token OTP agar tidak bisa dipakai ulang
    await prisma.verificationToken.delete({
      where: { identifier: normalizedEmail },
    });

    return NextResponse.json({
      success: true,
      message: "Kata sandi berhasil diperbarui.",
    });
  } catch (error: any) {
    console.error("Gagal reset password:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}