import { PiggyBank } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireStoreAccess } from "@/lib/auth/store-access";
import { VND, NUM, fmtDate } from "@/lib/format";
import { INVESTMENT_LABELS } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
export const dynamic = "force-dynamic";
export default async function InvestmentsPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  await requireStoreAccess(storeId, ["owner","manager"]);
  const sb = await createClient();
  const [invRes, salesRes] = await Promise.all([
    sb.from("investments").select("*").eq("store_id", storeId).order("invest_date", { ascending: false }),
    sb.from("sales").select("total_amount,total_cost").eq("store_id", storeId),
  ]);
  const investments = invRes.data ?? [];
  const totalInv = investments.reduce((s,i) => s + Number(i.amount), 0);
  const totalRev = (salesRes.data ?? []).reduce((s,r) => s + Number(r.total_amount), 0);
  const totalCogs = (salesRes.data ?? []).reduce((s,r) => s + Number(r.total_cost), 0);
  const totalProfit = totalRev - totalCogs;
  const roi = totalInv > 0 ? totalProfit / totalInv : 0;
  const paybackMonths = totalProfit > 0 ? totalInv / (totalProfit / Math.max((salesRes.data?.length ?? 1) / 30, 1) * 30) : null;
  return (
    <>
      <PageHeader title="Đầu tư & ROI" subtitle="Theo dõi vốn đầu tư và hiệu quả sinh lời." />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Tổng vốn đầu tư" value={VND(totalInv)} icon={<PiggyBank className="h-5 w-5"/>} />
        <StatCard label="Tổng lợi nhuận" value={VND(totalProfit)} icon={<PiggyBank className="h-5 w-5"/>} />
        <StatCard accent label="ROI" value={`${(roi*100).toFixed(1)}%`} hint="Trên toàn bộ lịch sử" />
        <StatCard label="Hoàn vốn (dự kiến)" value={paybackMonths ? `${paybackMonths.toFixed(1)} tháng` : "—"} />
      </div>
      <Card>
        <CardHeader><CardTitle>Danh sách đầu tư</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Hạng mục</TableHead><TableHead>Danh mục</TableHead><TableHead className="text-right">Số tiền</TableHead><TableHead>Ngày</TableHead></TableRow></TableHeader>
            <TableBody>
              {investments.map(i=>(
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell><Badge variant="muted">{INVESTMENT_LABELS[i.category as keyof typeof INVESTMENT_LABELS]}</Badge></TableCell>
                  <TableCell className="tnum text-right">{VND(i.amount)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmtDate(i.invest_date)}</TableCell>
                </TableRow>
              ))}
              {!investments.length && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Chưa có khoản đầu tư nào.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
