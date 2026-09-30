import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const record = await prisma.verificationToken.findUnique({
      where: { identifier: email },
    });

    if (!record || record.token !== code) {
      return NextResponse.json({ error: "Kode OTP salah" }, { status: 400 });
    }

    if (new Date() > record.expires) {
      return NextResponse.json({ error: "Kode OTP telah kedaluwarsa" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gagal verifikasi OTP:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}