import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, CupSoda, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserStores } from "@/lib/auth/store-access";
import { getAllStoresSummary } from "@/lib/queries/dashboard";
import { VND } from "@/lib/format";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/types";
export const dynamic = "force-dynamic";
export default async function StoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const stores = await getUserStores();
  if (!stores.length) redirect("/onboarding/store");
  const summaryMap = await getAllStoresSummary(stores.map(s => s.id));
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><CupSoda className="h-4 w-4"/></span>
          <span className="font-semibold tracking-tight">CanêOS</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm"><Link href="/onboarding/store"><Plus className="h-4 w-4"/>Thêm cửa hàng</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Cửa hàng của bạn</h1>
          <p className="mt-1 text-sm text-muted-foreground">Chọn một cửa hàng để quản lý.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {stores.map(store => {
            const sum = summaryMap.get(store.id);
            return (
              <Link key={store.id} href={`/stores/${store.id}`}>
                <Card className="p-5 transition-shadow hover:shadow-md cursor-pointer">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl">🥤</div>
                    <Badge variant={store.role === "owner" ? "default" : store.role === "manager" ? "secondary" : "muted"}>
                      {ROLE_LABELS[store.role]}
                    </Badge>
                  </div>
                  <p className="font-semibold">{store.name}</p>
                  {store.address && <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3"/>{store.address}</p>}
                  {sum && <div className="mt-3 flex gap-4 border-t pt-3">
                    <div><p className="text-xs text-muted-foreground">Doanh thu tháng</p><p className="tnum text-sm font-semibold">{VND(sum.rev)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Lợi nhuận</p><p className={`tnum text-sm font-semibold ${sum.profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>{VND(sum.profit)}</p></div>
                  </div>}
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
