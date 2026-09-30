import { Check, X } from "lucide-react";

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = [
    {
      id: "length",
      label: "Min. 8 karakter",
      isValid: password.length >= 8,
    },
    {
      id: "uppercase",
      label: "Huruf besar (A-Z)",
      isValid: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "Huruf kecil (a-z)",
      isValid: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "Mengandung angka (0-9)",
      isValid: /[0-9]/.test(password),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-1 text-[11px] font-medium">
      {requirements.map((req) => (
        <div
          key={req.id}
          className={`flex items-center gap-1.5 transition-colors ${
            req.isValid ? "text-emerald-700 font-bold" : "text-slate-400"
          }`}
        >
          {req.isValid ? (
            <Check size={13} className="stroke-[3]" />
          ) : (
            <X size={13} />
          )}
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
}