"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MonthlyFinanceItem } from "@/src/services/wallet.service";

interface ChartProps {
  data: MonthlyFinanceItem[];
  selectedYear: number;
  availableYears?: number[];
}

function formatRupiahShort(amount: number): string {
  if (amount === 0) return "0";
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000)}jt`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
  return `${amount}`;
}

export function AnnualFinanceChart({
  data,
  selectedYear,
  availableYears = [selectedYear],
}: ChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dimensi SVG rasio mobile-first (lebar 360 pas di layar HP kecil sekalipun)
  const width = 360;
  const height = 210;
  const paddingLeft = 38; // Pas untuk label angka 16jt / 0
  const paddingRight = 14;
  const paddingTop = 20;
  const paddingBottom = 28;

  // Ukuran batang diperkecil agar 24 batang (12 bulan x 2) muat tanpa desak-desakan
  const barWidth = 6.5;
  const barGap = 2;

  const maxRaw = Math.max(...data.flatMap((d) => [d.income, d.expense]), 0);
  const yMax = maxRaw === 0 ? 1_000_000 : Math.ceil(maxRaw / 100_000) * 100_000;
  const stepCount = 4;
  const steps = Array.from({ length: stepCount + 1 }, (_, i) =>
    Math.round((yMax / stepCount) * i)
  );

  const chartHeight = height - paddingTop - paddingBottom;
  const getY = (val: number) => height - paddingBottom - (val / yMax) * chartHeight;
  const getBarHeight = (val: number) => Math.max(0, (val / yMax) * chartHeight);

  // Pembagian posisi 12 bulan secara proporsional dari Januari sampai Desember
  const getMonthCenter = (idx: number) =>
    paddingLeft + (idx / 11) * (width - paddingLeft - paddingRight);

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Header & Filter Tahun */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-extrabold text-[#062828] tracking-tight">
            Overview
          </h3>
          <p className="text-[11px] font-semibold text-slate-400">
            Januari - Desember {selectedYear}
          </p>
        </div>

        {/* Dropdown Filter Tahun */}
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
          className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-[#062828] focus:outline-none cursor-pointer"
        >
          {availableYears.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>
      </div>

      {/* Area SVG Chart: w-full murni tanpa overflow dan tanpa min-width */}
      <div className="w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none block overflow-visible"
        >
          {/* Garis Grid Horizontal Putus-putus */}
          {steps.map((val, idx) => (
            <g key={`grid-${idx}`}>
              <line
                x1={paddingLeft}
                y1={getY(val)}
                x2={width - paddingRight}
                y2={getY(val)}
                stroke="#F1F5F9"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 6}
                y={getY(val) + 3}
                textAnchor="end"
                className="text-[11px] font-bold fill-slate-400"
              >
                {formatRupiahShort(val)}
              </text>
            </g>
          ))}

          {/* Batang Diagram Tiap Bulan */}
          {data.map((d, i) => {
            const center = getMonthCenter(i);
            const xIncome = center - barWidth - barGap / 2;
            const xExpense = center + barGap / 2;

            const hIncome = getBarHeight(d.income);
            const hExpense = getBarHeight(d.expense);

            const yIncome = getY(d.income);
            const yExpense = getY(d.expense);

            return (
              <g key={`group-${i}`}>
                {/* Batang Pemasukan (Hijau Tua) */}
                {hIncome > 0 && (
                  <rect
                    x={xIncome}
                    y={yIncome}
                    width={barWidth}
                    height={hIncome}
                    rx={barWidth / 2}
                    className="fill-[#062828]"
                  />
                )}

                {/* Batang Pengeluaran (Kuning) */}
                {hExpense > 0 && (
                  <rect
                    x={xExpense}
                    y={yExpense}
                    width={barWidth}
                    height={hExpense}
                    rx={barWidth / 2}
                    className="fill-[#FACC15]"
                  />
                )}

                {/* Label Bulan (Jan - Des) */}
                <text
                  x={center}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] font-black fill-slate-400  tracking-tighter"
                >
                  {d.monthName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Batang */}
      <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#062828]" />
          <span className="text-xs font-bold text-slate-700">Pemasukan</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FACC15]" />
          <span className="text-xs font-bold text-slate-700">Pengeluaran</span>
        </div>
      </div>
    </div>
  );
}