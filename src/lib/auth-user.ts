import { redirect } from "next/navigation";
// Sesuaikan import session auth di proyekmu:
// Contoh jika pakai NextAuth / Auth.js:
import { auth } from "@/src/auth"; // atau import { getServerSession } from "next-auth";

export async function getAuthUserId(): Promise<bigint> {
  const session = await auth();

  // Jika belum login, tendang ke /login
  if (!session?.user?.id) {
    redirect("/login");
  }

  return BigInt(session.user.id);
}