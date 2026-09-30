export interface PasswordStrength {
  label: string;
  color: string;
  textColor: string;
  width: string;
  score: number;
}

export function getPasswordStrength(pass: string): PasswordStrength {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;

  if (!pass) {
    return {
      label: "",
      color: "bg-slate-200",
      textColor: "text-slate-400",
      width: "w-0",
      score: 0,
    };
  }

  if (score <= 2) {
    return {
      label: "Lemah",
      color: "bg-rose-500",
      textColor: "text-rose-500",
      width: "w-1/3",
      score,
    };
  }

  if (score === 3) {
    return {
      label: "Sedang",
      color: "bg-amber-500",
      textColor: "text-amber-500",
      width: "w-2/3",
      score,
    };
  }

  return {
    label: "Kuat",
    color: "bg-emerald-600",
    textColor: "text-emerald-600",
    width: "w-full",
    score,
  };
}