import "server-only";
import { createClient } from "@/lib/supabase/server";
import { toDateKey, addDays } from "@/lib/format";

export async function getStoreDashboard(storeId: string) {
  const sb = await createClient();
  const today = toDateKey();
  const monthStart = today.slice(0,7)+"-01";
  const from30 = addDays(today, -29);

  const [salesRes, expRes] = await Promise.all([
    sb.from("sales").select("id,sale_date,total_amount,total_cost,sale_items(quantity)")
      .eq("store_id", storeId).gte("sale_date", from30).lte("sale_date", today),
    sb.from("expenses").select("expense_date,amount")
      .eq("store_id", storeId).gte("expense_date", monthStart).lte("expense_date", today),
  ]);

  const sales = salesRes.data ?? [];
  const exps  = expRes.data ?? [];

  let todayRev=0, monthRev=0, monthCogs=0, monthOrders=0, monthUnits=0;
  const dailyMap = new Map<string,{rev:number;profit:number}>();

  for (const s of sales) {
    const rev = Number(s.total_amount), cost = Number(s.total_cost);
    const units = (s.sale_items as any[]).reduce((a:number,i:any)=>a+Number(i.quantity),0);
    if (s.sale_date === today) todayRev += rev;
    if (s.sale_date >= monthStart) { monthRev+=rev; monthCogs+=cost; monthOrders+=1; monthUnits+=units; }
    const cur = dailyMap.get(s.sale_date) ?? {rev:0,profit:0};
    cur.rev += rev; cur.profit += rev-cost; dailyMap.set(s.sale_date, cur);
  }
  const monthExp = exps.reduce((s,e)=>s+Number(e.amount),0);
  const monthGross = monthRev - monthCogs;
  const monthNet   = monthGross - monthExp;
  const aov        = monthOrders ? monthRev/monthOrders : 0;

  // 30-day series
  const daily = [];
  for (let d=from30; d<=today; d=addDays(d,1)) {
    const v = dailyMap.get(d) ?? {rev:0,profit:0};
    daily.push({date:d, revenue:v.rev, profit:v.profit});
  }

  // Top products this month
  const perfRes = await sb.from("sale_items")
    .select("quantity,unit_price,unit_cost,product:products(id,name),sale:sales!inner(sale_date,store_id)")
    .eq("sale.store_id", storeId).gte("sale.sale_date", monthStart);
  const perfMap = new Map<string,{name:string;units:number;revenue:number;profit:number}>();
  for (const it of perfRes.data ?? []) {
    const pid = (it.product as any)?.id ?? "?";
    const name = (it.product as any)?.name ?? "Đã xoá";
    const cur = perfMap.get(pid) ?? {name,units:0,revenue:0,profit:0};
    cur.units += Number(it.quantity);
    cur.revenue += Number(it.quantity)*Number(it.unit_price);
    cur.profit  += Number(it.quantity)*(Number(it.unit_price)-Number(it.unit_cost));
    perfMap.set(pid, cur);
  }
  const topProducts = [...perfMap.entries()]
    .map(([id,v])=>({productId:id,...v}))
    .sort((a,b)=>b.revenue-a.revenue).slice(0,5);

  // Low stock
  const lowRes = await sb.from("ingredients")
    .select("id,name,unit,current_stock,reorder_point")
    .eq("store_id", storeId)
    .filter("current_stock", "lte", "reorder_point");
  const lowStock = lowRes.data ?? [];

  return { todayRev, monthRev, monthGross, monthNet, monthExp, monthOrders, aov, monthUnits, daily, topProducts, lowStock };
}

export async function getAllStoresSummary(storeIds: string[]) {
  if (!storeIds.length) return [];
  const sb = await createClient();
  const today = toDateKey();
  const monthStart = today.slice(0,7)+"-01";
  const { data } = await sb.from("sales")
    .select("store_id,total_amount,total_cost,sale_date")
    .in("store_id", storeIds).gte("sale_date", monthStart);
  const map = new Map<string,{rev:number;profit:number}>();
  for (const s of data ?? []) {
    const cur = map.get(s.store_id) ?? {rev:0,profit:0};
    cur.rev    += Number(s.total_amount);
    cur.profit += Number(s.total_amount)-Number(s.total_cost);
    map.set(s.store_id, cur);
  }
  return map;
}
