"use client";

import { toRupiah, parseRawNumber } from "@/src/lib/money";

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
}

export function CurrencyInput({ label, value, onChange, placeholder = "0" }: CurrencyInputProps) {
  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm focus-within:border-[#062828] transition">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-black text-slate-400">Rp</span>
        <input
          type="text"
          inputMode="numeric"
          value={value === 0 ? "" : toRupiah(value)}
          placeholder={placeholder}
          onChange={(e) => onChange(parseRawNumber(e.target.value))}
          className="w-full text-lg font-black text-[#062828] focus:outline-none placeholder:text-slate-200"
        />
      </div>
    </div>
  );
}