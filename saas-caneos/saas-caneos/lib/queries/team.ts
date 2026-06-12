import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { StoreMember, PendingInvitation } from "@/lib/types";

export async function getTeam(storeId: string) {
  const sb = await createClient();
  const [memRes, invRes] = await Promise.all([
    sb.from("store_members").select("*,profile:profiles(id,email,full_name,avatar_url)")
      .eq("store_id", storeId).order("created_at"),
    sb.from("pending_invitations").select("*")
      .eq("store_id", storeId).eq("status","pending").order("created_at"),
  ]);
  return {
    members: (memRes.data as StoreMember[]) ?? [],
    invitations: (invRes.data as PendingInvitation[]) ?? [],
  };
}
