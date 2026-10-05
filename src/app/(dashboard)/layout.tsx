import { BottomNav } from "@/src/components/navbar/bottom";
import { TopNav } from "@/src/components/navbar/top";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";

const roboto = Nunito({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
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
    <div className={`min-h-screen bg-slate-100 flex justify-center ${roboto.className}`}>
      <main className="w-full max-w-md min-h-screen relative flex flex-col bg-[#062828] shadow-sm">
        {/* Top Navbar Fixed / Sticky */}
        <TopNav />

        {/* Konten Halaman */}
        <div className="flex-1 flex flex-col w-full">
          {children}
        </div>

        {/* Bottom Nav Floating */}
        <BottomNav />
      </main>
    </div>
  );
}