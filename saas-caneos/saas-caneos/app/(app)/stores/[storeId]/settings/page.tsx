"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/auth/context";
export const dynamic = "force-dynamic";
export default function SettingsPage() {
  const { storeId, storeName } = useStore();
  const router = useRouter();
  const [name, setName] = React.useState(storeName);
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    createClient().from("stores").select("name,address,phone").eq("id", storeId).single()
      .then(({ data }) => { if (data) { setName(data.name); setAddress(data.address??""); setPhone(data.phone??""); } });
  }, [storeId]);
  async function save() {
    setLoading(true);
    const { error } = await createClient().from("stores").update({ name: name.trim(), address: address.trim()||null, phone: phone.trim()||null }).eq("id", storeId);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Đã lưu cài đặt");
    router.refresh();
  }
  return (
    <>
      <PageHeader title="Cài đặt cửa hàng" subtitle="Thông tin cơ bản của cửa hàng." />
      <Card className="max-w-xl">
        <CardHeader><CardTitle>Thông tin cơ bản</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Tên cửa hàng</Label><Input value={name} onChange={e=>setName(e.target.value)}/></div>
          <div className="space-y-1.5"><Label>Địa chỉ</Label><Input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Số xxx, đường…"/></div>
          <div className="space-y-1.5"><Label>Số điện thoại</Label><Input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="09xx…"/></div>
          <Button onClick={save} disabled={loading}>{loading?"Đang lưu…":"Lưu thay đổi"}</Button>
        </CardContent>
      </Card>
    </>
  );
}
