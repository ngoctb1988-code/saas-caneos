import { TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { getCashflow } from "@/lib/queries/cashflow";
import { requireStoreAccess } from "@/lib/auth/store-access";
import { resolveRange } from "@/lib/queries/reports";
import { VND, fmtDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { CashflowBars } from "@/components/charts/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export const dynamic = "force-dynamic";
const RANGES = [{v:"month",label:"Tháng"},{v:"quarter",label:"Quý"},{v:"7d",label:"7 ngày"},{v:"year",label:"Năm"}];
export default async function CashflowPage({ params, searchParams }: { params: Promise<{storeId:string}>; searchParams: Promise<{range?:string}> }) {
  const { storeId } = await params;
  const { range = "month" } = await searchParams;
  await requireStoreAccess(storeId, ["owner","manager"]);
  const { from, to } = resolveRange(range);
  const { series, totalIn, totalOut, net } = await getCashflow(storeId, from, to);
  return (
    <>
      <PageHeader title="Dòng tiền" subtitle={`${fmtDate(from)} — ${fmtDate(to)}`} />
      <div className="mb-4 flex gap-2 flex-wrap">
        {RANGES.map(r=><a key={r.v} href={`?range=${r.v}`} className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${range===r.v?"border-primary bg-primary/8 text-primary":"hover:bg-accent text-muted-foreground"}`}>{r.label}</a>)}
      </div>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatCard label="Tiền vào" value={VND(totalIn)} icon={<TrendingUp className="h-5 w-5"/>} />
        <StatCard label="Tiền ra" value={VND(totalOut)} icon={<TrendingDown className="h-5 w-5"/>} />
        <StatCard accent label="Dòng tiền ròng" value={VND(net)} icon={<ArrowRightLeft className="h-5 w-5"/>} />
      </div>
      <Card><CardHeader><CardTitle>Biểu đồ dòng tiền</CardTitle></CardHeader>
        <CardContent><CashflowBars data={series.filter(d=>d.inflow>0||d.outflow>0)}/></CardContent>
      </Card>
    </>
  );
}
