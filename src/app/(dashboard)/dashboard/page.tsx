import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Flame,
  ChevronRight,
} from "lucide-react";
import { getDashboardData } from "@/src/actions/dashboard";
import { formatRupiah } from "@/src/lib/utils";
import { BudgetCarousel } from "@/src/components/card-budget";
import { getBudgetIconData } from "@/src/lib/budgetIcon";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const today = new Date();

  const formattedDate = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Strip 7 Hari (3 hari lalu sampai 3 hari ke depan)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return {
      dayName: d.toLocaleDateString("id-ID", { weekday: "short" }),
      dateNum: d.getDate(),
      isoDate: d.toISOString().split("T")[0],
      isToday: d.toDateString() === today.toDateString(),
    };
  });

  const selisih = data.totalIncome - data.totalExpense;
  const isOverSpentToday = data.spentToday > data.dailySafe && data.dailySafe > 0;

  return (
    <div className="flex flex-col gap-4 p-4 bg-spoket-cream min-h-screen text-spoket-dark font-sans pb-28">
      {/* 1. Header Kalender Mingguan */}
      <section className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-xs font-black tracking-tight text-spoket-dark">
            {formattedDate}
          </h4>
          <span className="text-[10px] font-bold text-spoket-darker">
            Hari ini
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {weekDays.map((item) => (
            <Link
              key={item.isoDate}
              href={`/dashboard/calendar?date=${item.isoDate}`}
              className={`py-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center ${
                item.isToday
                  ? "bg-spoket-dark text-white border-spoket-dark shadow-xs"
                  : "bg-spoket-white text-spoket-dark border-spoket-gray hover:border-spoket-yellowlight"
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-75">
                {item.dayName}
              </span>
              <span className="text-xs font-black mt-0.5">{item.dateNum}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Kartu Jatah Kebutuhan Harian (Expense Daily) */}
      <section className="bg-spoket-yellowlight rounded-[28px] p-5 space-y-3 border-2 border-spoket-yellow/40 shadow-xs">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-black uppercase tracking-wider text-spoket-dark flex items-center gap-1.5">
            <Zap size={15} className="fill-spoket-dark text-spoket-dark" />
            Jatah Harian (Daily Safe)
          </span>
          <span className="text-[10px] font-black bg-spoket-white text-spoket-dark px-2.5 py-0.5 rounded-full border border-spoket-dark/15">
            Sisa {data.daysRemaining} Hari
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <div>
            <h2 className="text-3xl font-black text-spoket-dark tracking-tight">
              {formatRupiah(data.dailySafe)}
            </h2>
            <span className="text-[10px] font-bold text-spoket-darker block mt-0.5">
              Tersisa untuk hari ini dari pos harian
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-spoket-darker block">Terpakai Hari Ini</span>
            <span className="text-xs font-black text-spoket-dark">
              {formatRupiah(data.spentToday)}
            </span>
          </div>
        </div>

        {/* Status Alert Tips */}
        <div className="bg-spoket-white/90 p-2.5 rounded-2xl text-[11px] font-bold text-spoket-dark flex items-center gap-2 border border-spoket-dark/10">
          <Flame
            size={16}
            className={`shrink-0 ${
              isOverSpentToday
                ? "text-rose-500 fill-rose-500"
                : "text-amber-500 fill-amber-500"
            }`}
          />
          <span className="leading-snug">
            {isOverSpentToday
              ? "Belanja hari ini melewati jatah aman! Jatah besok otomatis disesuaikan."
              : "Pengeluaran harian terkendali. Sisa kuota hari ini akan terakumulasi ke hari berikutnya!"}
          </span>
        </div>
      </section>

      {/* 3. Pos Anggaran Carousel */}
      <section className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-spoket-darker">
            Pos Belanja Aktif
          </h3>
          <Link
            href="/dashboard/budgets"
            className="text-[11px] font-black text-spoket-dark hover:underline flex items-center gap-0.5"
          >
            <span>Semua Jatah</span>
            <ChevronRight size={13} />
          </Link>
        </div>
        <BudgetCarousel budgets={data.budgets} />
      </section>

      {/* 4. Ringkasan Arus Kas Bulan Ini */}
      <section className="space-y-2">
        <span className="text-xs font-black tracking-wider uppercase text-spoket-darker block px-1">
          Catatan Keuangan Bulan Ini
        </span>

        <div className="grid grid-cols-2 gap-2">
          {/* Pemasukan */}
          <Link
            href="/dashboard/transactions"
            className="bg-spoket-white border-2 border-spoket-gray hover:border-emerald-200 p-3.5 rounded-2xl transition flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center gap-1.5 text-emerald-700">
              <div className="p-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <ArrowDownLeft size={15} />
              </div>
              <span className="text-[11px] font-bold">Pemasukan</span>
            </div>
            <p className="text-sm font-black text-spoket-dark mt-2 truncate">
              {formatRupiah(data.totalIncome)}
            </p>
          </Link>

          {/* Pengeluaran */}
          <Link
            href="/dashboard/transactions"
            className="bg-spoket-white border-2 border-spoket-gray hover:border-rose-200 p-3.5 rounded-2xl transition flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center gap-1.5 text-rose-600">
              <div className="p-1.5 bg-rose-50 rounded-xl border border-rose-100">
                <ArrowUpRight size={15} />
              </div>
              <span className="text-[11px] font-bold">Pengeluaran</span>
            </div>
            <p className="text-sm font-black text-spoket-dark mt-2 truncate">
              {formatRupiah(data.totalExpense)}
            </p>
          </Link>
        </div>

        {/* Baris Selisih Arus Kas */}
        <div className="bg-spoket-white border-2 border-spoket-gray py-2.5 px-4 rounded-2xl shadow-xs flex justify-between items-center text-xs">
          <span className="font-bold text-spoket-darker">Sisa Uang Bersih:</span>
          <span
            className={`font-black ${
              selisih >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {selisih >= 0 ? "+ " : ""}{formatRupiah(selisih)}
          </span>
        </div>
      </section>

      {/* 5. Recent Transactions Widget */}
      <section className="space-y-2 pt-1">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-spoket-darker">
            Transaksi Terakhir
          </h3>
          <Link
            href="/dashboard/transactions"
            className="text-[11px] font-black text-spoket-dark hover:underline flex items-center gap-0.5"
          >
            <span>Lihat Semua</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        {data.recentTransactions.length === 0 ? (
          <div className="bg-spoket-white rounded-2xl border-2 border-dashed border-spoket-gray p-6 text-center text-xs font-bold text-spoket-darker">
            Belum ada transaksi yang tercatat.
          </div>
        ) : (
          <div className="bg-spoket-white rounded-2xl border-2 border-spoket-gray p-2 space-y-1.5 shadow-xs">
            {data.recentTransactions.map((tx) => {
              const isExpense = tx.type === "EXPENSE";
              const iconStyle = isExpense
                ? getBudgetIconData(tx.categoryName)
                : {
                    icon: <ArrowDownLeft size={16} className="text-emerald-700" />,
                    bg: "bg-emerald-50",
                  };

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-spoket-gray/60 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl ${iconStyle.bg} flex items-center justify-center shrink-0 border border-slate-100`}
                    >
                      {iconStyle.icon}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-black text-spoket-dark truncate">
                        {tx.categoryName}
                      </h5>
                      <p className="text-[10px] font-semibold text-spoket-darker truncate">
                        {tx.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span
                      className={`text-xs font-black block ${
                        isExpense ? "text-spoket-dark" : "text-emerald-600"
                      }`}
                    >
                      {isExpense ? "- " : "+ "}{formatRupiah(tx.amount)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {tx.dateFormatted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}