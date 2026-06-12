import "server-only";
import { createClient } from "@/lib/supabase/server";
import { addDays, toDateKey } from "@/lib/format";

export async function getCashflow(storeId: string, from: string, to: string) {
  const sb = await createClient();
  const [salesRes, expRes, invRes] = await Promise.all([
    sb.from("sales").select("sale_date,total_amount").eq("store_id", storeId).gte("sale_date", from).lte("sale_date", to),
    sb.from("expenses").select("expense_date,amount").eq("store_id", storeId).gte("expense_date", from).lte("expense_date", to),
    sb.from("investments").select("invest_date,amount").eq("store_id", storeId).gte("invest_date", from).lte("invest_date", to),
  ]);
  // Daily map
  type Day = { date: string; inflow: number; outflow: number; net: number; balance: number };
  const days = new Map<string, Day>();
  for (let d = from; d <= to; d = addDays(d, 1)) {
    days.set(d, { date: d, inflow: 0, outflow: 0, net: 0, balance: 0 });
  }
  for (const s of salesRes.data ?? []) {
    const r = days.get(s.sale_date); if (r) r.inflow += Number(s.total_amount);
  }
  for (const e of expRes.data ?? []) {
    const r = days.get(e.expense_date); if (r) r.outflow += Number(e.amount);
  }
  for (const i of invRes.data ?? []) {
    const r = days.get(i.invest_date); if (r) r.outflow += Number(i.amount);
  }
  // Running balance
  let running = 0;
  const series: Day[] = [];
  for (const d of days.values()) {
    d.net = d.inflow - d.outflow;
    running += d.net; d.balance = running;
    series.push(d);
  }
  const totalIn  = series.reduce((s,d)=>s+d.inflow, 0);
  const totalOut = series.reduce((s,d)=>s+d.outflow, 0);
  return { series, totalIn, totalOut, net: totalIn - totalOut };
}
