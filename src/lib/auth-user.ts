import { auth } from "@/src/auth"; // sesuaikan path konfigurasi auth
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

export async function getAuthUserId(): Promise<bigint> {
  let session = null;

  try {
    session = await auth();
  } catch {
    // Dipanggil saat Next.js mengevaluasi build/prerender tanpa request header
    return BigInt(0);
  }

  // Jika memang tidak ada sesi saat runtime request, arahkan ke login
  if (!session?.user) {
    redirect("/login");
  }

  // 1. Cek ID dari session jika valid angka
  if (session.user.id && !isNaN(Number(session.user.id))) {
    return BigInt(session.user.id);
  }

  // 2. Ambil ID dari database berdasarkan email session
  if (session.user.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (user) {
      return user.id;
    }
  }

  redirect("/login");
}