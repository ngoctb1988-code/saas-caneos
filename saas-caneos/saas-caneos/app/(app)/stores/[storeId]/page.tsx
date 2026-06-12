import { Wallet, TrendingUp, Coins, ShoppingBag, AlertTriangle } from "lucide-react";
import { getStoreDashboard } from "@/lib/queries/dashboard";
import { requireStoreAccess } from "@/lib/auth/store-access";
import { can } from "@/lib/auth/permissions";
import { VND, NUM } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { RevenueTrend } from "@/components/charts/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export const dynamic = "force-dynamic";
export default async function StoreDashboard({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const { role } = await requireStoreAccess(storeId);
  const d = await getStoreDashboard(storeId);
  const showFinancials = can(role, "view_financials");
  const maxRev = Math.max(1, ...d.topProducts.map(p => p.revenue));
  return (
    <>
      <PageHeader title="Tổng quan" subtitle="Bức tranh kinh doanh hôm nay và tháng này." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard accent label="Doanh thu hôm nay" value={VND(d.todayRev)} icon={<Wallet className="h-5 w-5"/>} />
        <StatCard label="Doanh thu tháng" value={VND(d.monthRev)} icon={<TrendingUp className="h-5 w-5"/>} />
        {showFinancials && <>
          <StatCard label="Lợi nhuận ròng" value={VND(d.monthNet)} hint={`Lãi gộp ${VND(d.monthGross)}`} icon={<Coins className="h-5 w-5"/>} />
          <StatCard label="Tổng đơn / AOV" value={NUM(d.monthOrders)} hint={`TB đơn ${VND(d.aov)}`} icon={<ShoppingBag className="h-5 w-5"/>} />
        </>}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Doanh thu 30 ngày</CardTitle></CardHeader>
          <CardContent><RevenueTrend data={d.daily} /></CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Bán chạy tháng này</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {d.topProducts.length === 0 && <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>}
              {d.topProducts.map((p, i) => (
                <div key={p.productId} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-muted-foreground tnum">{i+1}</span>
                      <span className="truncate font-medium">{p.name}</span>
                    </span>
                    <span className="tnum shrink-0 text-muted-foreground">{NUM(p.units)} ly</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{width:`${(p.revenue/maxRev)*100}%`}}/>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          {d.lowStock.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/[0.04]">
              <CardHeader><CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400"><AlertTriangle className="h-4 w-4"/>Tồn kho sắp hết</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {d.lowStock.slice(0,5).map(i => (
                  <div key={i.id} className="flex items-center justify-between text-sm">
                    <span>{i.name}</span>
                    <Badge variant="warning">{NUM(i.current_stock)} {i.unit}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
