"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { CupSoda, Building2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TYPES = [
  { v:"drink_kiosk", label:"Kiosk đồ uống" },
  { v:"cafe", label:"Cà phê" },
  { v:"bubble_tea", label:"Trà sữa" },
  { v:"juice_bar", label:"Bar nước ép" },
  { v:"other", label:"Khác" },
];

export default function CreateStorePage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [type, setType] = React.useState("drink_kiosk");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Nhập tên cửa hàng"); return; }
    setLoading(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // 1. Create tenant
    const { data: tenant, error: tErr } = await sb.from("tenants")
      .insert({ name: name.trim(), owner_id: user.id }).select("id").single();
    if (tErr) { toast.error(tErr.message); setLoading(false); return; }

    // 2. Create store
    const { data: store, error: sErr } = await sb.from("stores")
      .insert({ tenant_id: tenant.id, name: name.trim(), address: address.trim() || null, phone: phone.trim() || null, type })
      .select("id").single();
    if (sErr) { toast.error(sErr.message); setLoading(false); return; }

    // 3. Add current user as owner
    await sb.from("store_members").insert({ store_id: store.id, user_id: user.id, role: "owner" });

    // 4. Mark onboarded
    await sb.from("profiles").update({ onboarded: true }).eq("id", user.id);

    setLoading(false);
    router.push(`/onboarding/menu?storeId=${store.id}`);
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-gradient-to-b from-primary/[0.05] to-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow mx-auto mb-4"><Building2 className="h-7 w-7"/></span>
          <div className="mb-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">1</span>
            <span className="h-px w-8 bg-border"/>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">2</span>
          </div>
          <h1 className="text-2xl font-semibold">Tạo cửa hàng đầu tiên</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bạn có thể thêm nhiều cửa hàng sau.</p>
        </div>
        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tên cửa hàng *</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Nước Mía WOW Sport" />
            </div>
            <div className="space-y-1.5">
              <Label>Loại hình kinh doanh</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t.v} value={t.v}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Địa chỉ</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Sân WOW Sport, Nguyễn Thiện Thành…" />
            </div>
            <div className="space-y-1.5">
              <Label>Số điện thoại</Label>
              <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="09xx xxx xxx" />
            </div>
            <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>{loading ? "Đang tạo…" : "Tiếp tục →"}</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
