"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
export function SignOutButton() {
  const router = useRouter();
  async function signOut() { await createClient().auth.signOut(); router.push("/login"); router.refresh(); }
  return <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive"><LogOut className="h-4 w-4"/>Đăng xuất</DropdownMenuItem>;
}
