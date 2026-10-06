"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out  cursor-pointer ${
        checked ? "bg-spoket-dark" : "bg-slate-200"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}