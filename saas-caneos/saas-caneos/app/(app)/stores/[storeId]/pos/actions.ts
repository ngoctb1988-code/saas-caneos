"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { auditLog } from "@/lib/auth/store-access";
import type { PaymentMethod } from "@/lib/types";

export type PosItem = { product_id: string; quantity: number };

export async function checkoutOrder(
  storeId: string,
  items: PosItem[],
  paymentMethod: PaymentMethod,
  note?: string
) {
  const clean = items.filter(i => i.quantity > 0);
  if (!clean.length) return { error: "Chưa có món nào trong đơn." };
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Chưa đăng nhập." };

  // Verify store access
  const { data: member } = await sb.from("store_members")
    .select("role").eq("store_id", storeId).eq("user_id", user.id).single();
  if (!member) return { error: "Không có quyền truy cập cửa hàng." };

  // Get prices from DB (never trust client)
  const ids = clean.map(i => i.product_id);
  const { data: products } = await sb.from("products").select("id,price,cost").in("id", ids);
  if (!products?.length) return { error: "Không tìm thấy sản phẩm." };
  const pMap = new Map(products.map(p => [p.id, p]));

  let totalAmount = 0, totalCost = 0;
  for (const it of clean) {
    const p = pMap.get(it.product_id);
    if (!p) continue;
    totalAmount += it.quantity * Number(p.price);
    totalCost   += it.quantity * Number(p.cost);
  }

  // Create sale
  const { data: sale, error: sErr } = await sb.from("sales").insert({
    store_id: storeId, created_by: user.id,
    sale_date: new Date().toISOString().slice(0,10),
    payment_method: paymentMethod, note: note?.trim() || null,
    total_amount: totalAmount, total_cost: totalCost,
  }).select("id").single();
  if (sErr) return { error: sErr.message };

  // Create sale items (trigger auto-deducts inventory via recipes)
  const saleItems = clean.map(it => {
    const p = pMap.get(it.product_id)!;
    return { sale_id: sale.id, product_id: it.product_id, quantity: it.quantity, unit_price: Number(p.price), unit_cost: Number(p.cost) };
  });
  const { error: iErr } = await sb.from("sale_items").insert(saleItems);
  if (iErr) {
    await sb.from("sales").delete().eq("id", sale.id);
    return { error: iErr.message };
  }

  await auditLog(storeId, "create_sale", "sales", sale.id, null, { total_amount: totalAmount, items: clean.length });
  revalidatePath(`/stores/${storeId}`);
  revalidatePath(`/stores/${storeId}/pos`);
  return { error: null, saleId: sale.id, totalAmount };
}
