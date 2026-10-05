export function parseRawNumber(val: string): number {
  return Number(val.replace(/\D/g, "")) || 0;
}

export function toRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}