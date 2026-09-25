import { getCalendarMonthlyTransactions } from "@/src/actions/calender";
import { CustomCalendar } from "@/src/components/custom-calender";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CalendarPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const data = await getCalendarMonthlyTransactions(year, month);

  return (
    /* Posisi FIXED INSET-0 mengunci halaman secara mutlak sehingga layar utama mustahil bisa di-scroll */
    <div className="fixed inset-0 max-w-md mx-auto z-30 flex flex-col bg-[#062828] select-none overflow-hidden">
      
      {/* Header Bar */}
      <div className="bg-[#062828] px-4 pt-3 pb-2 flex items-center gap-3 shrink-0">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-full hover:bg-white/10 text-white transition active:scale-95"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-base font-black text-white">Kalender Keuangan</h1>
      </div>

      {/* Komponen Kalender */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CustomCalendar
          initialData={data}
          initialYear={year}
          initialMonth={month}
        />
      </div>
    </div>
  );
}