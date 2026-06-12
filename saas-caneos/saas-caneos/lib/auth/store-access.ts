import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { StoreRole } from "@/lib/types";

export interface StoreAccess {
  storeId: string;
  role: StoreRole;
  userId: string;
}

/**
 * Validate that the current user has access to a store (and optionally a minimum role).
 * Redirects to /stores if no access. Call from Server Components / layouts.
 */
export async function requireStoreAccess(
  storeId: string,
  minRoles: StoreRole[] = ["staff", "manager", "owner"]
): Promise<StoreAccess> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("store_members")
    .select("role")
    .eq("store_id", storeId)
    .eq("user_id", user.id)
    .single();

  if (!member || !minRoles.includes(member.role as StoreRole)) {
    redirect("/stores");
  }

  return { storeId, role: member.role as StoreRole, userId: user.id };
}

/** Get all stores the current user belongs to. */
export async function getUserStores() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("store_members")
    .select("role, store:stores(id,name,address,type,logo_url,is_active,tenant_id)")
    .eq("user_id", user.id)
    .eq("store.is_active", true)
    .order("created_at");

  return (data ?? []).map((m) => ({
    ...(m.store as any),
    role: m.role as StoreRole,
  }));
}

/** Log an audit event. */
export async function auditLog(
  storeId: string | null,
  action: string,
  tableName?: string,
  recordId?: string,
  oldData?: unknown,
  newData?: unknown
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    store_id: storeId,
    user_id: user?.id ?? null,
    action,
    table_name: tableName ?? null,
    record_id: recordId ?? null,
    old_data: oldData ? (oldData as Record<string, unknown>) : null,
    new_data: newData ? (newData as Record<string, unknown>) : null,
  });
}
