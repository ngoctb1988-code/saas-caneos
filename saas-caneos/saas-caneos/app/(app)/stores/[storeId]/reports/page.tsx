import { TrendingUp, TrendingDown, Coins, ShoppingBag, Percent } from "lucide-react";
import { getReportData, resolveRange } from "@/lib/queries/reports";
import { requireStoreAccess } from "@/lib/auth/store-access";
import { VND, PCT, NUM, fmtDate, fmtShort } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { RevenueTrend } from "@/components/charts/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
export const dynamic = "force-dynamic";
const RANGES = [
  { v:"today",label:"Hôm nay" },{ v:"7d",label:"7 ngày" },{ v:"week",label:"Tuần này" },
  { v:"month",label:"Tháng này" },{ v:"quarter",label:"Quý" },{ v:"year",label:"Năm" },
];
export default async function ReportsPage({
  params, searchParams,
}: { params: Promise<{storeId:string}>; searchParams: Promise<{range?:string}> }) {
  const { storeId } = await params;
  const { range = "month" } = await searchParams;
  await requireStoreAccess(storeId, ["owner","manager"]);
  const { from, to } = resolveRange(range);
  const d = await getReportData(storeId, from, to);
  const margin  = d.revenue > 0 ? d.gross / d.revenue : 0;
  const netMargin = d.revenue > 0 ? d.net / d.revenue : 0;
  const totalUnits = d.daily.reduce((s,r)=>s+r.units, 0);

  return (
    <>
      <PageHeader title="Báo cáo" subtitle={`${fmtDate(from)} — ${fmtDate(to)}`} />

      {/* Range picker */}
      <div className="mb-4 flex flex-wrap gap-2">
        {RANGES.map(r => (
          <a key={r.v} href={`?range=${r.v}`}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${range===r.v?"border-primary bg-primary/8 text-primary":"hover:bg-accent text-muted-foreground"}`}>
            {r.label}
          </a>
        ))}
      </div>

      {/* KPI row */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Doanh thu" value={VND(d.revenue)} icon={<TrendingUp className="h-5 w-5"/>} />
        <StatCard label="Lãi gộp" value={VND(d.gross)} hint={`Biên ${PCT(margin)}`} accent icon={<Coins className="h-5 w-5"/>} />
        <StatCard label="Chi phí" value={VND(d.totalExp)} icon={<TrendingDown className="h-5 w-5"/>} />
        <StatCard label="Lợi nhuận ròng" value={VND(d.net)} hint={`Biên ròng ${PCT(netMargin)}`} icon={<Percent className="h-5 w-5"/>} />
      </div>

      {/* Revenue trend */}
      <Card className="mb-4">
        <CardHeader><CardTitle>Biểu đồ doanh thu</CardTitle></CardHeader>
        <CardContent><RevenueTrend data={d.daily.map(r=>({date:r.date,revenue:r.revenue,profit:r.grossProfit}))} /></CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Daily breakdown */}
        <Card>
          <CardHeader><CardTitle>Chi tiết theo ngày</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Ngày</TableHead><TableHead className="text-right">Doanh thu</TableHead>
                <TableHead className="text-right">Giá vốn</TableHead><TableHead className="text-right">Lợi nhuận</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {d.daily.filter(r=>r.revenue>0).map(r=>(
                  <TableRow key={r.date}>
                    <TableCell className="text-sm">{fmtDate(r.date)}</TableCell>
                    <TableCell className="tnum text-right text-sm">{VND(r.revenue)}</TableCell>
                    <TableCell className="tnum text-right text-sm text-muted-foreground">{VND(r.cogs)}</TableCell>
                    <TableCell className={`tnum text-right text-sm font-medium ${r.grossProfit>=0?"text-emerald-600":"text-destructive"}`}>{VND(r.grossProfit)}</TableCell>
                  </TableRow>
                ))}
                {!d.daily.some(r=>r.revenue>0) && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Không có dữ liệu.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Product performance */}
        <Card>
          <CardHeader><CardTitle>Hiệu suất sản phẩm</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Sản phẩm</TableHead><TableHead className="text-right">Số ly</TableHead>
                <TableHead className="text-right">Doanh thu</TableHead><TableHead className="text-right">Lợi nhuận</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {d.perf.slice(0,10).map(p=>(
                  <TableRow key={p.productId}>
                    <TableCell className="font-medium text-sm">{p.name}</TableCell>
                    <TableCell className="tnum text-right text-sm">{NUM(p.units)}</TableCell>
                    <TableCell className="tnum text-right text-sm">{VND(p.revenue)}</TableCell>
                    <TableCell className={`tnum text-right text-sm font-medium ${p.profit>=0?"text-emerald-600":"text-destructive"}`}>{VND(p.profit)}</TableCell>
                  </TableRow>
                ))}
                {!d.perf.length && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Chưa có dữ liệu.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
