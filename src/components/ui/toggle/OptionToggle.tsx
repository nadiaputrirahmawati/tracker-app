"use client";

interface OptionToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function OptionToggle({ label, description, checked, onChange }: OptionToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="pr-4">
        <h4 className="text-xs font-black text-[#062828] uppercase tracking-wide">{label}</h4>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
          checked ? "bg-[#062828]" : "bg-slate-200"
        }`}
      >
        <div
          className={`bg-[#FEF08A] w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}