import "server-only";
import { createClient } from "@/lib/supabase/server";
import { toDateKey, addDays } from "@/lib/format";
import type { DailyRow, ProductPerf } from "@/lib/types";

export async function getReportData(storeId: string, from: string, to: string) {
  const sb = await createClient();
  const [salesRes, expRes] = await Promise.all([
    sb.from("sales").select("id,sale_date,total_amount,total_cost,payment_method,sale_items(quantity,unit_price,unit_cost,product:products(id,name))")
      .eq("store_id", storeId).gte("sale_date", from).lte("sale_date", to),
    sb.from("expenses").select("*").eq("store_id", storeId).gte("expense_date", from).lte("expense_date", to),
  ]);
  const sales = salesRes.data ?? [];
  const exps  = expRes.data ?? [];

  // Daily rows
  const dayMap = new Map<string, DailyRow>();
  for (let d=from; d<=to; d=addDays(d,1)) {
    dayMap.set(d,{date:d,revenue:0,cogs:0,expenses:0,grossProfit:0,netProfit:0,units:0,orders:0});
  }
  for (const s of sales) {
    const row = dayMap.get(s.sale_date); if (!row) continue;
    const items = (s.sale_items as any[]) ?? [];
    row.revenue += Number(s.total_amount); row.cogs += Number(s.total_cost);
    row.units += items.reduce((a:number,i:any)=>a+Number(i.quantity),0); row.orders += 1;
  }
  for (const e of exps) {
    const row = dayMap.get(e.expense_date); if (row) row.expenses += Number(e.amount);
  }
  const daily = [...dayMap.values()].map(r=>({...r,grossProfit:r.revenue-r.cogs,netProfit:r.revenue-r.cogs-r.expenses}));

  // Product performance
  const perfMap = new Map<string, ProductPerf>();
  for (const s of sales) {
    for (const it of (s.sale_items as any[]) ?? []) {
      const pid = it.product?.id ?? "?"; const name = it.product?.name ?? "Đã xoá";
      const cur = perfMap.get(pid) ?? {productId:pid,name,units:0,revenue:0,cost:0,profit:0};
      cur.units += Number(it.quantity); cur.revenue += Number(it.quantity)*Number(it.unit_price);
      cur.cost  += Number(it.quantity)*Number(it.unit_cost); cur.profit = cur.revenue-cur.cost;
      perfMap.set(pid, cur);
    }
  }
  const perf = [...perfMap.values()].sort((a,b)=>b.revenue-a.revenue);

  const revenue = daily.reduce((s,d)=>s+d.revenue,0);
  const cogs    = daily.reduce((s,d)=>s+d.cogs,0);
  const totalExp = daily.reduce((s,d)=>s+d.expenses,0);

  return { daily, perf, revenue, cogs, totalExp, gross:revenue-cogs, net:revenue-cogs-totalExp, exps };
}

export function resolveRange(range: string):{from:string;to:string} {
  const today = toDateKey();
  if (range==="today") return {from:today,to:today};
  if (range==="7d")  return {from:addDays(today,-6),to:today};
  if (range==="week") {
    const d=new Date(); const day=(d.getDay()+6)%7;
    const mon=new Date(d.getTime()-day*86_400_000);
    return {from:toDateKey(mon),to:today};
  }
  if (range==="month") return {from:today.slice(0,7)+"-01",to:today};
  if (range==="quarter") return {from:addDays(today,-89),to:today};
  if (range==="year") return {from:today.slice(0,4)+"-01-01",to:today};
  return {from:addDays(today,-29),to:today}; // 30d default
}
