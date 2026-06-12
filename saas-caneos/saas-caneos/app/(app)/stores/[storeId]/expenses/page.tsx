import { createClient } from "@/lib/supabase/server";
import { requireStoreAccess } from "@/lib/auth/store-access";
import { can } from "@/lib/auth/permissions";
import { VND, fmtDate } from "@/lib/format";
import { EXPENSE_LABELS } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddExpenseButton, DeleteExpenseButton } from "./expense-manager";
export const dynamic = "force-dynamic";
export default async function ExpensesPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const { role } = await requireStoreAccess(storeId);
  const sb = await createClient();
  const { data: expenses } = await sb.from("expenses")
    .select("*,creator:profiles(full_name)")
    .eq("store_id", storeId).order("expense_date", { ascending: false }).limit(100);
  const total = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0);
  const canDelete = can(role, "delete_expenses");
  return (
    <>
      <PageHeader title="Chi phí" subtitle={`Tổng: ${VND(total)} (${(expenses??[]).length} khoản)`}
        action={<AddExpenseButton storeId={storeId} />} />
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Ngày</TableHead><TableHead>Loại</TableHead>
            <TableHead className="text-right">Số tiền</TableHead>
            <TableHead>Ghi chú</TableHead><TableHead>Người ghi</TableHead>
            {canDelete && <TableHead className="w-12"></TableHead>}
          </TableRow></TableHeader>
          <TableBody>
            {(expenses ?? []).map(e => (
              <TableRow key={e.id}>
                <TableCell className="text-muted-foreground text-sm">{fmtDate(e.expense_date)}</TableCell>
                <TableCell><Badge variant="muted">{EXPENSE_LABELS[e.type as keyof typeof EXPENSE_LABELS]}</Badge></TableCell>
                <TableCell className="tnum text-right font-medium">{VND(e.amount)}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{e.note ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{(e.creator as any)?.full_name ?? "—"}</TableCell>
                {canDelete && <TableCell><DeleteExpenseButton storeId={storeId} expenseId={e.id} /></TableCell>}
              </TableRow>
            ))}
            {!(expenses?.length) && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Chưa có chi phí nào.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
