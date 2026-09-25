"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { formatRupiah } from "@/src/lib/utils";

type DayTransactions = {
  id: string;
  notes: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  walletName: string;
  budgetName?: string;
};

interface CustomCalendarProps {
  initialData: Record<string, DayTransactions[]>;
  initialYear: number;
  initialMonth: number;
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function CustomCalendar({ initialData, initialYear, initialMonth }: CustomCalendarProps) {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [data] = useState(initialData);

  const [isSheetOpen, setIsSheetOpen] = useState(true);

  const todayKey = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
  const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
  const totalDays = new Date(currentYear, currentMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const selectedList = data[selectedDate] || [];

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden">

      {/* 1. AREA KALENDER (LEBIH BESAR, TURUN KE BAWAH, & LEGA) */}
      <div className="px-6 pt-4 pb-4 shrink-0 select-none">

        {/* Bulan & Navigasi */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-200 transition active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-200 transition active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Singkatan Hari */}
        <div className="grid grid-cols-7 gap-1 text-center mb-3">
          {DAYS.map((day, idx) => (
            <span key={idx} className="text-xs font-black text-amber-200/60 uppercase">
              {day}
            </span>
          ))}
        </div>

        {/* Grid Angka Kalender (Ukuran w-10 h-10 Lebih Mantap & Pas di Jari) */}
        <div className="grid grid-cols-7 gap-y-2 text-center">
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-10" />
          ))}

          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const isSelected = selectedDate === dateStr;
            const dayTxs = data[dateStr] || [];

            const hasIncome = dayTxs.some((t) => t.type === "INCOME");
            const hasExpense = dayTxs.some((t) => t.type === "EXPENSE");

            return (
              <div key={dateStr} className="flex flex-col items-center justify-center">
                <button
                  onClick={() => {
                    setSelectedDate(dateStr);
                    if (!isSheetOpen) setIsSheetOpen(true);
                  }}
                  className={`w-10 h-10 rounded-full flex flex-col items-center justify-center text-sm font-bold transition-all relative ${isSelected
                      ? "bg-[#FEF08A] text-[#062828] font-black shadow-md scale-105"
                      : "text-white/90 hover:bg-white/10"
                    }`}
                >
                  <span>{dayNum}</span>

                  {/* Titik Indikator Mutasi */}
                  {(hasIncome || hasExpense) && (
                    <div className="flex gap-0.5 absolute bottom-1">
                      {hasIncome && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-[#062828]" : "bg-emerald-400"}`} />
                      )}
                      {hasExpense && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-rose-600" : "bg-rose-400"}`} />
                      )}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. BOTTOM SHEET AKTIVITAS */}
      <div
        className={`bg-[#F8FAF9] text-[#062828] rounded-t-[36px] shadow-2xl transition-all duration-300 ease-in-out flex flex-col min-h-0 ${isSheetOpen ? "h-[48%]" : "h-14"
          }`}
      >
        {/* Handle Bar & Judul Sheet */}
        <div
          onClick={() => setIsSheetOpen(!isSheetOpen)}
          className="pt-3 pb-2.5 px-6 cursor-pointer select-none shrink-0 flex flex-col items-center border-b border-slate-100"
        >
          <div className="w-10 h-1 bg-slate-300 rounded-full mb-2" />
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#062828]">
                Transaksi 
              </h3>
              <span className="text-[10px] font-black bg-[#FEF08A] text-[#062828] px-2 py-0.5 rounded-full">
                {selectedList.length}
              </span>
            </div>
            <button className="text-slate-400 hover:text-[#062828] transition">
              {isSheetOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>

        {/* 3. DAFTAR TRANSAKSI (SCROLLABLE DENGAN SCROLLBAR TERSEMBUNYI) */}
        {/* 3. DAFTAR TRANSAKSI GAYA TIMELINE / ALUR PROSES */}
        {isSheetOpen && (
          <div
            className="p-5 flex-1 overflow-y-auto pb-28 no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style jsx>{`
      div::-webkit-scrollbar {
        display: none;
      }
    `}</style>

            {selectedList.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-xs font-bold">Tidak ada catatan transaksi pada tanggal ini.</p>
              </div>
            ) : (
              <div className="relative pl-1">
                {selectedList.map((tx, index) => {
                  const isIncome = tx.type === "INCOME";
                  const isLast = index === selectedList.length - 1;

                  return (
                    <div key={tx.id} className="relative flex items-start gap-4 pb-6 group">

                      {/* Garis Alur Vertikal (Putus-putus) ke Item Bawahnya */}
                      {!isLast && (
                        <span
                          className={`absolute left-[13px] top-7 bottom-0 w-[2px] border-l-2 border-dashed ${isIncome ? "border-emerald-300" : "border-orange-300"
                            }`}
                        />
                      )}

                      {/* Node Lingkaran Berisi Icon Sesuai Tipe */}
                      <div
                        className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white ${isIncome
                            ? "bg-emerald-500 ring-4 ring-emerald-100"
                            : "bg-orange-500 ring-4 ring-orange-100"
                          }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft size={14} className="stroke-[3]" />
                        ) : (
                          <ArrowUpRight size={14} className="stroke-[3]" />
                        )}
                      </div>

                      {/* Konten Keterangan & Nominal Transaksi */}
                      <div className="flex-1  rounded-2xl shadow-xs flex items-center justify-between min-w-0 -mt-1">
                        <div className="min-w-0 pr-2">
                          <h4 className="font-black text-xs text-[#062828] truncate">
                            {tx.notes}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">
                            {tx.walletName} {tx.budgetName ? `• ${tx.budgetName}` : ""}
                          </p>
                        </div>

                        {/* Badge Nominal */}
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-xl shrink-0 ${isIncome
                              ? "bg-emerald-100/70 text-emerald-800"
                              : "bg-[#FEF08A] text-[#062828]"
                            }`}
                        >
                          {isIncome ? "+" : "-"} {formatRupiah(tx.amount)}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}