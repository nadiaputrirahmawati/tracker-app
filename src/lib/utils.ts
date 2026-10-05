
export function formatRupiah(amount: number | bigint | string): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function getCurrentPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`; // Hasil: "2026-09"
}

// Mengubah angka murni menjadi string bertitik ribuan (contoh: 1500000 -> "1.500.000")
export function formatNumberInput(value: number | string): string {
  if (!value && value !== 0) return "";
  const cleanNumber = value.toString().replace(/\D/g, "");
  if (!cleanNumber) return "";
  return new Intl.NumberFormat("id-ID").format(Number(cleanNumber));
}

// Mengubah string berformat titik kembali menjadi number murni (contoh: "1.500.000" -> 1500000)
export function parseNumberInput(value: string): number {
  const cleanNumber = value.replace(/\D/g, "");
  return cleanNumber ? parseInt(cleanNumber, 10) : 0;
}