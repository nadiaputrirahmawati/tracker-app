import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs"; // atau bcrypt biasa sesuai yang terinstall

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // 1. Validasi input kelengkapan data
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Semua kolom (Nama, Email, Password) wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Normalisasi email (kecilkan huruf dan hilangkan spasi)
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login atau gunakan email lain." },
        { status: 400 }
      );
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Buat User baru beserta Dompet Default (Kas Tunai)
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        wallets: {
          create: {
            name: "Kas Tunai",
            currentBalance: 0,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Konversi ID ke string agar aman dari error serialisasi BigInt
    return NextResponse.json(
      {
        message: "Akun berhasil dibuat.",
        user: {
          ...newUser,
          id: newUser.id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error register:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan pada server saat registrasi." },
      { status: 500 }
    );
  }
}