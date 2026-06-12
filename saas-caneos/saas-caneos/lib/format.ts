export const VND = (n: number | null | undefined) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(n ?? 0));
export const compact = (n: number | null | undefined) => {
  const v = Number(n ?? 0);
  if (Math.abs(v) >= 1e9) return (v/1e9).toFixed(2).replace(".",",")+" tỷ";
  if (Math.abs(v) >= 1e6) return (v/1e6).toFixed(1).replace(".",",")+" tr";
  if (Math.abs(v) >= 1e3) return Math.round(v/1e3)+"K";
  return String(Math.round(v));
};
export const NUM = (n: number | null | undefined) =>
  new Intl.NumberFormat("vi-VN").format(Number(n ?? 0));
export const PCT = (n: number | null | undefined, d = 1) =>
  (Number(n ?? 0)*100).toFixed(d).replace(".",",")+"%";
export const toDateKey = (d: Date = new Date()) => {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime()-off*60_000).toISOString().slice(0,10);
};
export const fmtDate = (iso: string) => { const [y,m,d]=iso.split("-"); return `${d}/${m}/${y}`; };
export const fmtShort = (iso: string) => { const [,m,d]=iso.split("-"); return `${d}/${m}`; };
export const addDays = (iso: string, n: number) => {
  const d = new Date(iso+"T00:00:00"); d.setDate(d.getDate()+n); return toDateKey(d);
};
