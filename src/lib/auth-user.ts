import { redirect } from "next/navigation";
import { auth } from "@/src/auth"; // sesuaikan path auth kamu

export async function getAuthUserId(): Promise<bigint> {
  let session = null;

  try {
    session = await auth();
  } catch (error) {
    // Menangkap error jika headers() dipanggil saat build/static evaluation
    return BigInt(0);
  }

  if (!session?.user?.id) {
    redirect("/login");
  }

  return BigInt(session.user.id);
}