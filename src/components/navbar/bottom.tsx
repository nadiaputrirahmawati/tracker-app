"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wallet,
  CalendarDays,
  PieChart,
  Plus,
} from "lucide-react";
import { QuickTransactionModal } from "@/src/components/transaction/QuickTransactionModal";

export function BottomNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const leftNavs = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Poket", href: "/dashboard/wallets", icon: Wallet },
  ];

  const rightNavs = [
    { label: "Transaction", href: "/dashboard/transactions", icon: CalendarDays },
    { label: "Budget", href: "/dashboard/budgets", icon: PieChart },
  ];

  return (
    <>
      <QuickTransactionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-4 pointer-events-none">
        <div className="relative bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 py-2 px-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center justify-around flex-1">
            {leftNavs.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 text-[11px] font-black transition-all ${
                    isActive ? "text-[#062828]" : "text-slate-400 hover:text-[#062828]"
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${isActive ? "bg-[#FEF08A] text-[#062828]" : ""}`}>
                    <Icon size={19} className="stroke-[2.5]" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Tombol Plus Tengah */}
          <div className="relative -top-5 px-2 flex justify-center">
            <div className="p-1.5 bg-[#F8FAF9] rounded-full">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#062828] bg-[#062828] text-[#FEF08A] shadow-[2px_2px_0px_#062828] active:scale-95 hover:brightness-110 transition-all cursor-pointer"
              >
                <Plus size={22} className="stroke-[3]" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-around flex-1">
            {rightNavs.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 text-[11px] font-black transition-all ${
                    isActive ? "text-[#062828]" : "text-slate-400 hover:text-[#062828]"
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${isActive ? "bg-[#FEF08A] text-[#062828]" : ""}`}>
                    <Icon size={19} className="stroke-[2.5]" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}