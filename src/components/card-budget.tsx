"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/src/lib/utils";

export interface Budget {
  id: string | number;
  name: string;
  percentage: number;
  remaining: number;
  usedAmount: number;
  allocatedAmount?: number;
  type?: string;
  icon?: string | null;
}

interface BudgetCarouselProps {
  budgets: Budget[];
}
export function BudgetCarousel({ budgets }: BudgetCarouselProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    setIsDragging(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();

    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;

    // Hanya anggap dragging jika mouse benar-benar bergeser lebih dari 5px
    if (Math.abs(x - startX) > 5) {
      setIsDragging(true);
    }

    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="flex flex-col gap-2.5 select-none">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-teal-950">
            List Kebutuhan Bulanan
          </h2>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="p-5 border-2 border-dashed border-teal-950 rounded-2xl bg-white text-center">
          <p className="text-xs font-bold text-teal-950">Belum ada amplop pos belanja.</p>
          <Link
            href="/dashboard/budgets"
            className="inline-block mt-2 text-xs font-black bg-spoket-yellow border-2 border-teal-950 px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#042f2e]"
          >
            Tambah Kebutuhan Bulai Ini
          </Link>
        </div>
      ) : (
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          // Tambahkan utility inline Tailwind untuk hide scrollbar & disable scroll snap saat drag
          className={`flex gap-3  overflow-x-auto pb-2 pt-1  px-4 cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isDown ? "scroll-auto select-none" : "snap-x scroll-smooth"
            }`}
        >
          {budgets.map((b) => {
            const isFull = b.percentage >= 100 || b.remaining <= 0;

            return (
              <Link
                key={b.id.toString()}
                href={`/dashboard/budgets/${b.id}`}
                draggable={false}
                onClick={(e) => {
                  if (isDragging) e.preventDefault();
                }}
                className={`min-w-[200px] max-w-[220px] p-3.5 rounded-2xl snap-start flex flex-col justify-between shrink-0 shadow-lg transition ${isFull ? "bg-[#041c1c] border border-red-500/30" : "bg-teal-950"
                  }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-black text-sm text-white truncate max-w-[125px]">
                      {b.name}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border ${isFull
                          ? "bg-rose-500 text-white border-rose-600"
                          : "bg-amber-200 text-teal-950 border-teal-950"
                        }`}
                    >
                      {isFull ? "Terpenuhi" : `${b.percentage}%`}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-white mt-1">
                    {isFull ? (
                      <span className="text-rose-400 font-extrabold">Target Terpenuhi</span>
                    ) : (
                      `Sisa ${formatRupiah(b.remaining)}`
                    )}
                  </p>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="w-full bg-[#FAF8F5] border border-teal-950 h-2.5 rounded-full overflow-hidden p-[1px]">
                    <div
                      className={`h-full rounded-full transition-all ${isFull ? "bg-rose-500" : b.percentage > 75 ? "bg-amber-500" : "bg-amber-300"
                        }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-white flex justify-between">
                    <span>Terpakai:</span>
                    <span>{formatRupiah(b.usedAmount)}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}