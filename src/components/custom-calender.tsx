"use client";

import { useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { formatRupiah } from "@/src/lib/utils";
import {
  getCalendarMonthlyTransactions,
  CalendarDayTransaction,
} from "@/src/actions/calender";

interface CustomCalendarProps {
  initialData: Record<string, CalendarDayTransaction[]>;
  initialYear: number;
  initialMonth: number;
}

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function CustomCalendar({
  initialData,
  initialYear,
  initialMonth,
}: CustomCalendarProps) {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [data, setData] = useState<Record<string, CalendarDayTransaction[]>>(initialData);
  const [isPending, startTransition] = useTransition();

  const todayKey = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  // Perhitungan tanggal awal bulan & total hari
  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
  const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
  const totalDays = new Date(currentYear, currentMonth, 0).getDate();

  // Sinkronisasi data saat ganti bulan
  const fetchMonthData = (year: number, month: number) => {
    startTransition(async () => {
      const res = await getCalendarMonthlyTransactions(year, month);
      setData(res);
    });
  };

  const handlePrevMonth = () => {
    let nextY = currentYear;
    let nextM = currentMonth - 1;
    if (nextM < 1) {
      nextM = 12;
      nextY -= 1;
    }
    setCurrentMonth(nextM);
    setCurrentYear(nextY);
    fetchMonthData(nextY, nextM);
  };

  const handleNextMonth = () => {
    let nextY = currentYear;
    let nextM = currentMonth + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    setCurrentMonth(nextM);
    setCurrentYear(nextY);
    fetchMonthData(nextY, nextM);
  };

  const selectedList = data[selectedDate] || [];

  const dayIncome = selectedList
    .filter((t) => t.type === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);

  const dayExpense = selectedList
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);

  const selectedDateLabel = (() => {
    try {
      const [y, m, d] = selectedDate.split("-");
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      return dateObj.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  })();

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden">
      {/* 1. KALENDER COMPACT & RINGKAS (Ukuran Pas & Ramping) */}
      <div className="px-5 pt-1 pb-3 shrink-0 select-none">
        {/* Header Bulan & Navigasi */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white tracking-tight">
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </h2>
            {isPending && <Loader2 size={14} className="text-[#FEF08A] animate-spin" />}
          </div>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isPending}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#FEF08A] transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isPending}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#FEF08A] transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Singkatan Hari */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAYS.map((day, idx) => (
            <span key={idx} className="text-[10px] font-black text-[#FEF08A]/70 uppercase">
              {day}
            </span>
          ))}
        </div>

        {/* Grid Angka Kalender Ramping (w-8 h-8) */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-8" />
          ))}

          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(
              dayNum
            ).padStart(2, "0")}`;
            const isSelected = selectedDate === dateStr;
            const dayTxs = data[dateStr] || [];

            const hasIncome = dayTxs.some((t) => t.type === "INCOME");
            const hasExpense = dayTxs.some((t) => t.type === "EXPENSE");

            return (
              <div key={dateStr} className="flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`w-8 h-8 rounded-xl flex flex-col items-center justify-center text-xs font-black transition-all relative cursor-pointer ${
                    isSelected
                      ? "bg-[#FEF08A] text-[#062828] shadow-sm scale-105"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <span className="leading-none">{dayNum}</span>

                  {/* Dot Indikator Mutasi */}
                  {(hasIncome || hasExpense) && (
                    <div className="flex gap-0.5 absolute bottom-0.5">
                      {hasIncome && (
                        <span
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? "bg-[#062828]" : "bg-emerald-400"
                          }`}
                        />
                      )}
                      {hasExpense && (
                        <span
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? "bg-rose-600" : "bg-rose-400"
                          }`}
                        />
                      )}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CARD BAWAH PERMANEN (MUTLAK FIXED, TIDAK BISA DIBUKA-TUTUP) */}
      <div className="bg-[#F8FAF9] text-[#062828] rounded-t-[32px] shadow-2xl flex-1 flex flex-col min-h-0 overflow-hidden border-t-2 border-white/20">
        {/* Header Ringkasan Harian */}
        <div className="p-3.5 px-5 shrink-0 border-b border-slate-200/80 bg-white rounded-t-[32px] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CalendarIcon size={14} className="text-[#062828]" />
              <h3 className="text-xs font-black text-[#062828] uppercase tracking-wide">
                {selectedDateLabel}
              </h3>
            </div>
            <span className="text-[10px] font-black bg-[#062828] text-[#FEF08A] px-2 py-0.5 rounded-full">
              {selectedList.length} Transaksi
            </span>
          </div>

          {/* Baris Total Arus Kas Hari Terpilih */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-1 text-emerald-800">
                <ArrowDownLeft size={12} className="stroke-[3]" />
                <span className="text-[10px] font-bold">Masuk</span>
              </div>
              <span className="text-xs font-black text-emerald-700">
                {formatRupiah(dayIncome)}
              </span>
            </div>

            <div className="bg-rose-50 border border-rose-100 p-2 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-1 text-rose-800">
                <ArrowUpRight size={12} className="stroke-[3]" />
                <span className="text-[10px] font-bold">Keluar</span>
              </div>
              <span className="text-xs font-black text-rose-700">
                {formatRupiah(dayExpense)}
              </span>
            </div>
          </div>
        </div>

        {/* List Transaksi Scrollable di Dalam Card */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-20">
          {selectedList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-8 text-center text-slate-400">
              <p className="text-xs font-bold">
                Tidak ada mutasi transaksi pada tanggal ini.
              </p>
            </div>
          ) : (
            selectedList.map((tx) => {
              const isIncome = tx.type === "INCOME";

              return (
                <div
                  key={tx.id}
                  className="bg-white border-2 border-slate-100 rounded-2xl p-3 flex items-center justify-between shadow-2xs hover:border-slate-200 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft size={15} className="stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight size={15} className="stroke-[2.5]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-xs text-[#062828] truncate">
                        {tx.notes}
                      </h4>
                      <p className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
                        {tx.walletName} {tx.budgetName ? `• ${tx.budgetName}` : ""}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-black shrink-0 ml-2 ${
                      isIncome ? "text-emerald-600" : "text-slate-900"
                    }`}
                  >
                    {isIncome ? "+ " : "- "}
                    {formatRupiah(tx.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}