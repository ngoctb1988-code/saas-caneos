"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStoreAccess, auditLog } from "@/lib/auth/store-access";

export async function saveIngredient(storeId: string, data: {
  id?: string; name: string; unit: string; reorder_point: number;
}) {
  await requireStoreAccess(storeId, ["owner","manager"]);
  const sb = await createClient();
  const payload = { store_id: storeId, name: data.name.trim(), unit: data.unit, reorder_point: data.reorder_point };
  const { error } = data.id
    ? await sb.from("ingredients").update(payload).eq("id", data.id)
    : await sb.from("ingredients").insert(payload);
  if (error) return { error: error.message };
  revalidatePath(`/stores/${storeId}/inventory`);
  return { error: null };
}

export async function recordStockIn(storeId: string, data: {
  ingredient_id: string; quantity: number; unit_cost: number; note?: string; txn_date: string;
}) {
  const { userId } = await requireStoreAccess(storeId, ["owner","manager","staff"]);
  if (data.quantity <= 0) return { error: "Số lượng phải > 0" };
  const sb = await createClient();
  const { error } = await sb.from("inventory_transactions").insert({
    store_id: storeId, ingredient_id: data.ingredient_id, txn_type: "in",
    quantity: data.quantity, unit_cost: data.unit_cost,
    txn_date: data.txn_date, note: data.note?.trim() || null,
  });
  if (error) return { error: error.message };
  await auditLog(storeId, "stock_in", "inventory_transactions", undefined, null, { quantity: data.quantity });
  revalidatePath(`/stores/${storeId}/inventory`);
  return { error: null };
}

export async function recordStockOut(storeId: string, data: {
  ingredient_id: string; quantity: number; note?: string; txn_date: string;
}) {
  await requireStoreAccess(storeId, ["owner","manager"]);
  const sb = await createClient();
  const { error } = await sb.from("inventory_transactions").insert({
    store_id: storeId, ingredient_id: data.ingredient_id, txn_type: "out",
    quantity: data.quantity, unit_cost: 0, txn_date: data.txn_date, note: data.note?.trim() || null,
  });
  if (error) return { error: error.message };
  revalidatePath(`/stores/${storeId}/inventory`);
  return { error: null };
}
