import { BottomNav } from "@/src/components/navbar/bottom";
import { TopNav } from "@/src/components/navbar/top";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";


export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Aplikasi Pelacak Pengeluaran",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-slate-100 flex justify-center ${geistSans.variable} ${geistMono.variable} `}>
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