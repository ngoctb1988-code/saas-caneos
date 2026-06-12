"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CupSoda, Check } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SEED_CATS = [
  { name: "Nước mía", sort_order: 1, items: [
    { name: "Nước mía truyền thống", price: 18000, cost: 5000 },
    { name: "Nước mía tắc",          price: 20000, cost: 6000 },
    { name: "Nước mía sầu riêng",    price: 25000, cost: 9000 },
  ]},
  { name: "Đồ uống khác", sort_order: 2, items: [
    { name: "Dừa tắc",          price: 22000, cost: 8000 },
    { name: "Rau má đậu xanh",  price: 20000, cost: 7000 },
  ]},
  { name: "Topping", sort_order: 3, items: [
    { name: "Trân châu",   price: 5000, cost: 1500 },
  ]},
];

export default function SeedMenuPage() {
  const router = useRouter();
  const params = useSearchParams();
  const storeId = params.get("storeId");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function seed() {
    if (!storeId) return;
    setLoading(true);
    const sb = createClient();
    for (const cat of SEED_CATS) {
      const { data: c } = await sb.from("categories")
        .insert({ store_id: storeId, name: cat.name, sort_order: cat.sort_order })
        .select("id").single();
      if (!c) continue;
      for (const item of cat.items) {
        await sb.from("products").insert({ store_id: storeId, category_id: c.id, ...item, is_active: true });
      }
    }
    setLoading(false); setDone(true);
    toast.success("Đã tạo menu mẫu!");
    setTimeout(() => router.push(`/stores/${storeId}`), 1200);
  }

  async function skip() { router.push(`/stores/${storeId}`); }

  return (
    <main className="grid min-h-dvh place-items-center bg-gradient-to-b from-primary/[0.05] to-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow mx-auto mb-4"><CupSoda className="h-7 w-7"/></span>
          <div className="mb-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold"><Check className="h-3 w-3"/></span>
            <span className="h-px w-8 bg-primary"/>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">2</span>
          </div>
          <h1 className="text-2xl font-semibold">Khởi tạo menu mẫu</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bạn có thể chỉnh sửa sau.</p>
        </div>
        <Card className="p-5 mb-4 space-y-3">
          {SEED_CATS.map(cat => (
            <div key={cat.name}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat.name}</p>
              <div className="flex flex-wrap gap-2">
                {cat.items.map(it => <Badge key={it.name} variant="secondary">{it.name}</Badge>)}
              </div>
            </div>
          ))}
        </Card>
        {done
          ? <Button size="lg" className="w-full" disabled><Check className="h-4 w-4"/>Đang vào trang quản lý…</Button>
          : <div className="flex flex-col gap-2">
              <Button size="lg" className="w-full" onClick={seed} disabled={loading}>{loading ? "Đang tạo menu…" : "Tạo menu mẫu"}</Button>
              <Button size="lg" variant="outline" className="w-full" onClick={skip}>Bỏ qua, tự thêm sau</Button>
            </div>
        }
      </div>
    </main>
  );
}
