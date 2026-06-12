"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStoreAccess, auditLog } from "@/lib/auth/store-access";
import type { ExpenseType } from "@/lib/types";

export async function createExpense(storeId: string, data: {
  type: ExpenseType; amount: number; note?: string; expense_date: string;
}) {
  const { userId } = await requireStoreAccess(storeId, ["owner","manager","staff"]);
  if (data.amount <= 0) return { error: "Số tiền phải lớn hơn 0." };
  const sb = await createClient();
  const { error } = await sb.from("expenses").insert({
    store_id: storeId, created_by: userId,
    expense_date: data.expense_date, type: data.type,
    amount: data.amount, note: data.note?.trim() || null,
  });
  if (error) return { error: error.message };
  await auditLog(storeId, "create_expense", "expenses", undefined, null, { amount: data.amount, type: data.type });
  revalidatePath(`/stores/${storeId}/expenses`);
  return { error: null };
}

export async function deleteExpense(storeId: string, id: string) {
  await requireStoreAccess(storeId, ["owner","manager"]);
  const sb = await createClient();
  const { error } = await sb.from("expenses").delete().eq("id", id).eq("store_id", storeId);
  if (error) return { error: error.message };
  await auditLog(storeId, "delete_expense", "expenses", id);
  revalidatePath(`/stores/${storeId}/expenses`);
  return { error: null };
}
