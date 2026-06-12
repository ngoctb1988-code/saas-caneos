"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStoreAccess, auditLog } from "@/lib/auth/store-access";
import type { InvestmentCategory } from "@/lib/types";
export async function saveInvestment(storeId: string, data: { id?: string; name: string; category: InvestmentCategory; amount: number; invest_date: string }) {
  await requireStoreAccess(storeId, ["owner"]);
  const sb = await createClient();
  const payload = { store_id: storeId, name: data.name.trim(), category: data.category, amount: data.amount, invest_date: data.invest_date };
  const { error } = data.id ? await sb.from("investments").update(payload).eq("id", data.id) : await sb.from("investments").insert(payload);
  if (error) return { error: error.message };
  await auditLog(storeId, data.id ? "update_investment" : "create_investment", "investments");
  revalidatePath(`/stores/${storeId}/investments`);
  return { error: null };
}
export async function deleteInvestment(storeId: string, id: string) {
  await requireStoreAccess(storeId, ["owner"]);
  const sb = await createClient();
  await sb.from("investments").delete().eq("id", id);
  revalidatePath(`/stores/${storeId}/investments`);
  return { error: null };
}
