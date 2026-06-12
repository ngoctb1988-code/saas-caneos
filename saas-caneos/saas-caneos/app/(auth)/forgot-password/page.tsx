"use client";
import * as React from "react";
import Link from "next/link";
import { CupSoda } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
export default function ForgotPage() {
  const[email,setEmail]=React.useState("");const[loading,setLoading]=React.useState(false);const[sent,setSent]=React.useState(false);
  async function onSubmit(e:React.FormEvent){
    e.preventDefault();setLoading(true);
    await createClient().auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}/auth/callback?type=recovery`});
    setLoading(false);setSent(true);toast.success("Đã gửi link đặt lại mật khẩu!");
  }
  return <main className="grid min-h-dvh place-items-center bg-gradient-to-b from-primary/[0.05] to-background px-4">
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow"><CupSoda className="h-6 w-6"/></span>
        <div><h1 className="text-xl font-semibold">Quên mật khẩu</h1><p className="text-sm text-muted-foreground">Nhập email để nhận link đặt lại</p></div>
      </div>
      <Card className="p-6">
        {sent?<p className="text-center text-sm">Kiểm tra <strong>{email}</strong> để nhận link đặt lại mật khẩu.</p>:
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="ban@quan.com"/></div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading?"Đang gửi…":"Gửi link đặt lại"}</Button>
        </form>}
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground"><Link href="/login" className="text-primary hover:underline">← Quay lại đăng nhập</Link></p>
    </div>
  </main>;
}
