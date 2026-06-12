"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStoreAccess, auditLog } from "@/lib/auth/store-access";
import type { StoreRole } from "@/lib/types";

export async function inviteMember(storeId: string, email: string, role: StoreRole) {
  await requireStoreAccess(storeId, ["owner"]);
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  // Check if user already exists and is already a member
  const { data: existing } = await sb.from("store_members")
    .select("id").eq("store_id", storeId)
    .eq("user_id", (await sb.from("profiles").select("id").eq("email", email).single()).data?.id ?? "00000000-0000-0000-0000-000000000000").single();
  if (existing) return { error: "Người dùng này đã là thành viên của cửa hàng." };

  const { error } = await sb.from("pending_invitations").upsert(
    { store_id: storeId, email: email.toLowerCase().trim(), role, invited_by: user!.id },
    { onConflict: "store_id,email", ignoreDuplicates: false }
  );
  if (error) return { error: error.message };
  await auditLog(storeId, "invite_member", "pending_invitations", undefined, null, { email, role });
  revalidatePath(`/stores/${storeId}/team`);
  return { error: null };
}

export async function updateMemberRole(storeId: string, memberId: string, role: StoreRole) {
  await requireStoreAccess(storeId, ["owner"]);
  const sb = await createClient();
  const { error } = await sb.from("store_members").update({ role }).eq("id", memberId).eq("store_id", storeId);
  if (error) return { error: error.message };
  await auditLog(storeId, "update_member_role", "store_members", memberId, null, { role });
  revalidatePath(`/stores/${storeId}/team`);
  return { error: null };
}

export async function removeMember(storeId: string, memberId: string) {
  const { userId } = await requireStoreAccess(storeId, ["owner"]);
  const sb = await createClient();
  // Cannot remove yourself
  const { data: member } = await sb.from("store_members").select("user_id").eq("id", memberId).single();
  if (member?.user_id === userId) return { error: "Không thể xoá chính bạn." };
  const { error } = await sb.from("store_members").delete().eq("id", memberId).eq("store_id", storeId);
  if (error) return { error: error.message };
  revalidatePath(`/stores/${storeId}/team`);
  return { error: null };
}

export async function cancelInvitation(storeId: string, invitationId: string) {
  await requireStoreAccess(storeId, ["owner"]);
  const sb = await createClient();
  await sb.from("pending_invitations").update({ status: "expired" }).eq("id", invitationId);
  revalidatePath(`/stores/${storeId}/team`);
  return { error: null };
}
