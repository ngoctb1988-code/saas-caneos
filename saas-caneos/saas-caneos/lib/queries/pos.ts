import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/lib/types";

export async function getPosProducts(storeId: string) {
  const sb = await createClient();
  const [prodRes, catRes] = await Promise.all([
    sb.from("products").select("*,category:categories(id,name,sort_order)")
      .eq("store_id", storeId).eq("is_active", true).order("sort_order"),
    sb.from("categories").select("*").eq("store_id", storeId).order("sort_order"),
  ]);
  return {
    products: (prodRes.data as Product[]) ?? [],
    categories: (catRes.data as Category[]) ?? [],
  };
}
