import { BottomNav } from "@/src/components/bottom-nav";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";

const roboto = Nunito({
  weight: ["400", "500", "700"], // Pilih ketebalan yang dibutuhkan
  subsets: ["latin"],
  variable: "--font-roboto", // Opsional: jika ingin diintegrasikan dengan Tailwind CSS
  display: "swap",
});

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Aplikasi Pelacak Pengeluaran",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-slate-50 flex justify-center ${roboto.className}`}>
      <main  className="w-full max-w-md bg-stone-100 min-h-screen shadow-sm pb-24 relative flex flex-col">
        {children}
        <BottomNav />
      </main>
    </div>
  );
}