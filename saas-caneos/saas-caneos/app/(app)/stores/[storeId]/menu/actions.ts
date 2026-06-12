"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStoreAccess } from "@/lib/auth/store-access";
import { auditLog } from "@/lib/auth/store-access";

export async function saveProduct(storeId: string, data: {
  id?: string; name: string; category_id: string|null; price: number; cost: number; is_active: boolean;
}) {
  await requireStoreAccess(storeId, ["owner","manager"]);
  const sb = await createClient();
  const payload = { store_id: storeId, name: data.name.trim(), category_id: data.category_id, price: data.price, cost: data.cost, is_active: data.is_active };
  const { error } = data.id
    ? await sb.from("products").update(payload).eq("id", data.id)
    : await sb.from("products").insert(payload);
  if (error) return { error: error.message };
  await auditLog(storeId, data.id ? "update_product" : "create_product", "products", data.id);
  revalidatePath(`/stores/${storeId}/menu`);
  return { error: null };
}

export async function deleteProduct(storeId: string, id: string) {
  await requireStoreAccess(storeId, ["owner"]);
  const sb = await createClient();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  await auditLog(storeId, "delete_product", "products", id);
  revalidatePath(`/stores/${storeId}/menu`);
  return { error: null };
}

export async function saveRecipe(productId: string, storeId: string, items: { ingredient_id: string; quantity: number }[]) {
  await requireStoreAccess(storeId, ["owner","manager"]);
  const sb = await createClient();
  await sb.from("recipe_items").delete().eq("product_id", productId);
  if (items.length > 0) {
    await sb.from("recipe_items").insert(items.map(i => ({ product_id: productId, ...i })));
  }
  revalidatePath(`/stores/${storeId}/menu`);
  return { error: null };
}
