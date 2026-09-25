import { getDashboardData } from "@/src/actions/dashboard";
import { formatRupiah } from "@/src/lib/utils";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Wallet as WalletIcon,
  Sparkles,
  Zap,
  Flame
} from "lucide-react";
import { QuickExpenseModal } from "@/src/components/quick-expense-modal";
import { BudgetCarousel } from "@/src/components/card-budget";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const today = new Date();

  const formattedDate = today.toLocaleDateString("id-ID", {
    weekday: "long", // Menampilkan nama hari (Jumat)
    day: "numeric",  // Tanggal (25)
    month: "long",   // Nama bulan (September)
    year: "numeric", // Tahun (2026)
  });

  // Strip 7 Hari (3 hari lalu sampai 3 hari ke depan)[cite: 3]
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return {
      dateObj: d,
      dayName: d.toLocaleDateString("id-ID", { weekday: "short" }),
      dateNum: d.getDate(),
      isoDate: d.toISOString().split("T")[0],
      isToday: d.toDateString() === today.toDateString(),
    };
  });

  const selisih = data.totalIncome - data.totalExpense;
  const isOverSpentToday = data.spentToday > data.dailySafe && data.dailySafe > 0;
  const defaultWalletId = data.wallets[0]?.id || "1";

  return (
    <div className="flex flex-col gap-5 p-4 bg-[#FAF8F5] min-h-screen text-teal-950 font-sans pb-28">

      {/* 1. Header Saldo Bersih */}
      <section className="flex justify-between items-center pt-2">
        <div>
          <span className="text-lg font-black text-teal-900/60 uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={15} className="text-amber-500 fill-amber-400" />
            Finary App
          </span>
          <h1 className="text-2xl font-black tracking-tight text-teal-950">
            {formatRupiah(data.totalBalance)}
          </h1>
          <p className="text-[10px] font-bold text-teal-900/50 mt-0.5">
            Total Keseluruhan Uang
          </p>
        </div>

        <Link
          href="/dashboard/wallets"
          className="border-2 border-teal-950 bg-amber-200 px-3 py-1.5 rounded-xl font-black text-xs shadow-[2px_2px_0px_#042f2e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1"
        >
          <WalletIcon size={14} />
          Dompet
        </Link>
      </section>

      {/* 3. Mini Strip Kalender (Klik tanggal langsung ke kalender) */}
      <section className="">
        <div className="flex justify-between items-center mb-2 px-1">
          <h4 className="text-black font-bold">{formattedDate}</h4>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {weekDays.map((item) => (
            <Link
              key={item.isoDate}
              href={`/dashboard/calendar?date=${item.isoDate}`}
              className={` ${item.isToday
                ? ""
                : ""
                }`}
            >
              <span className="text-[10px] font-bold uppercase">{item.dayName}</span>
            </Link>
          ))}
          {weekDays.map((item) => (
            <Link
              key={item.isoDate}
              href={`/dashboard/calendar?date=${item.isoDate}`}
              className={`px-1 py-3 rounded-full shadow transition-all flex flex-col items-center justify-center ${item.isToday
                ? "bg-teal-950 text-white  "
                : "bg-white text-teal-950  "
                }`}
            >
              {/* <span className="text-[10px] font-bold uppercase">{item.dayName}</span> */}
              <span className="text-xs font-black mt-0.5">{item.dateNum}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Jatah Harian Dinamis (Daily Allowance) */}
      <section className="bg-[#FEF08A] shadow-md rounded-3xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-black uppercase tracking-wider text-teal-950 flex items-center gap-1.5">
            <Zap size={14} className="fill-teal-950 text-teal-950" />
            Budget Kebutuhan Harian
          </span>
          <span className="text-[10px] font-black bg-white border border-teal-950 px-2 py-0.5 rounded-md">
            Sisa {data.daysRemaining} Hari
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <h2 className="text-3xl font-black text-teal-950">
            {formatRupiah(data.dailySafe)}
          </h2>
        </div>

        <div className="bg-white/80 border border-teal-950 p-2 rounded-xl text-[11px] font-bold text-teal-900 flex items-center gap-2">
          <Flame size={14} className={isOverSpentToday ? "text-rose-500 fill-rose-500" : "text-amber-500 fill-amber-500"} />
          <span>
            {isOverSpentToday
              ? "Hari ini melebihi jatah harian! Jatah besok otomatis berkurang."
              : "Hemat hari ini, sisa kuota otomatis ditambahkan ke jatah besok!"}
          </span>
        </div>
      </section>

      {/* 5. Pos Anggaran Carousel (Bisa digeser & diklik untuk detail) */}
      <BudgetCarousel
        budgets={data.budgets} />


      {/* 4. Catatan Keuangan (Pemasukan, Pengeluaran, Selisih) */}
      <section className="flex flex-col ">
        <div className="flex justify-between items-center border-b-2 border-teal-950 pb-2">
          <h2 className="text-xs font-black tracking-wider uppercase text-teal-950">
            Catatan Keuangan Bulan Ini
          </h2>
          <Link
            href="/dashboard/transactions"
            className="text-[11px] font-extrabold text-teal-950 underline"
          >
            Lihat Detail
          </Link>
        </div>

        <div className="grid grid-cols-2 mt-4">
          {/* Box Pemasukan */}
          <Link
            href="/dashboard/transactions/income"
            className="bg-white border border-teal-950 p-3 rounded-tl-xl shadow-[2px_2px_0px_#042f2e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition flex flex-col justify-between"
          >
            <div className="flex items-center gap-1.5 text-emerald-700">
              <div className="p-1 bg-emerald-100 rounded-md border border-emerald-800">
                <ArrowDownLeft size={14} />
              </div>
              <span className="text-[11px] font-bold">Pemasukan</span>
            </div>
            <p className="text-sm font-black text-teal-950 mt-2 truncate">
              {formatRupiah(data.totalIncome)}
            </p>
          </Link>

          {/* Box Pengeluaran */}
          <Link
            href="/dashboard/transactions/expense"
            className="bg-white border border-teal-950 p-3 rounded-tr-xl shadow-[2px_2px_0px_#042f2e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition flex flex-col justify-between"
          >
            <div className="flex items-center gap-1.5 text-rose-700">
              <div className="p-1 bg-rose-100 rounded-md border border-rose-800">
                <ArrowUpRight size={14} />
              </div>
              <span className="text-[11px] font-bold">Pengeluaran</span>
            </div>
            <p className="text-sm font-black text-teal-950 mt-2 truncate">
              {formatRupiah(data.totalExpense)}
            </p>
          </Link>
        </div>

        {/* Baris Selisih */}
        <div className="bg-white/90 border py-2 px-3 rounded-b-xl shadow-[2px_2px_0px_#042f2e] flex justify-between items-center text-xs">
          <span className="font-bold text-teal-950">Sisa Uang:</span>
          <span className={`font-black ${selisih >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {selisih >= 0 ? "+" : ""}{formatRupiah(selisih)}
          </span>
        </div>
      </section>



      {/* Floating Action Modal: Input Cepat 5 Detik */}
      <QuickExpenseModal
        defaultWalletId={defaultWalletId}
        budgets={data.budgets.map((b) => ({ id: b.id, name: b.name }))}
      />
    </div>
  );
}