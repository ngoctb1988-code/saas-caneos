"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CupSoda } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
export default function RegisterPage() {
  const router=useRouter();
  const[name,setName]=React.useState("");const[email,setEmail]=React.useState("");const[pass,setPass]=React.useState("");const[loading,setLoading]=React.useState(false);
  async function onSubmit(e:React.FormEvent){
    e.preventDefault();if(pass.length<8){toast.error("Mật khẩu tối thiểu 8 ký tự");return;}
    setLoading(true);
    const{error}=await createClient().auth.signUp({email,password:pass,options:{data:{full_name:name.trim()}}});
    setLoading(false);
    if(error){toast.error("Đăng ký thất bại",{description:error.message});return;}
    toast.success("Đăng ký thành công! Hãy kiểm tra email để xác nhận.");
    router.push("/login");
  }
  return <main className="grid min-h-dvh place-items-center bg-gradient-to-b from-primary/[0.05] to-background px-4">
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow"><CupSoda className="h-6 w-6"/></span>
        <div><h1 className="text-xl font-semibold">Tạo tài khoản</h1><p className="text-sm text-muted-foreground">Bắt đầu quản lý quán của bạn</p></div>
      </div>
      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5"><Label>Họ tên</Label><Input required value={name} onChange={e=>setName(e.target.value)} placeholder="Nguyễn Văn A"/></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="ban@quan.com"/></div>
          <div className="space-y-1.5"><Label>Mật khẩu</Label><Input type="password" autoComplete="new-password" required minLength={8} value={pass} onChange={e=>setPass(e.target.value)} placeholder="Tối thiểu 8 ký tự"/></div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading?"Đang tạo tài khoản…":"Đăng ký"}</Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">Đã có tài khoản? <Link href="/login" className="text-primary hover:underline font-medium">Đăng nhập</Link></p>
    </div>
  </main>;
}
