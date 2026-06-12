import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireStoreAccess } from "@/lib/auth/store-access";
import { NUM, VND, fmtDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddIngredientButton, StockInButton } from "./inventory-manager";
export const dynamic = "force-dynamic";
export default async function InventoryPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const { role } = await requireStoreAccess(storeId);
  const sb = await createClient();
  const [ingRes, txnRes] = await Promise.all([
    sb.from("ingredients").select("*").eq("store_id", storeId).order("name"),
    sb.from("inventory_transactions").select("*,ingredient:ingredients(name,unit)")
      .eq("store_id", storeId).order("created_at", { ascending: false }).limit(30),
  ]);
  const ingredients = ingRes.data ?? [];
  const lowStock = ingredients.filter(i => Number(i.current_stock) <= Number(i.reorder_point));
  const isManager = role === "owner" || role === "manager";
  return (
    <>
      <PageHeader title="Tồn kho" subtitle="Nguyên liệu, công thức và giao dịch nhập/xuất."
        action={<div className="flex gap-2">{isManager && <AddIngredientButton storeId={storeId}/>}<StockInButton storeId={storeId} ingredients={ingredients}/></div>} />
      {lowStock.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0"/>
          <span><strong>{lowStock.length} nguyên liệu</strong> sắp hết: {lowStock.map(i=>i.name).join(", ")}</span>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader><CardTitle>Nguyên liệu</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Tên</TableHead><TableHead className="text-right">Tồn kho</TableHead><TableHead className="text-right">Giá TB</TableHead><TableHead>Trạng thái</TableHead></TableRow></TableHeader>
              <TableBody>
                {ingredients.map(i => {
                  const low = Number(i.current_stock) <= Number(i.reorder_point);
                  return (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell className="tnum text-right">{NUM(i.current_stock)} {i.unit}</TableCell>
                      <TableCell className="tnum text-right text-muted-foreground">{VND(i.unit_cost)}/{i.unit}</TableCell>
                      <TableCell><Badge variant={low ? "warning" : "success"}>{low ? "Sắp hết" : "OK"}</Badge></TableCell>
                    </TableRow>
                  );
                })}
                {!ingredients.length && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Chưa có nguyên liệu nào. Thêm nguyên liệu để theo dõi tồn kho.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Giao dịch gần đây</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Nguyên liệu</TableHead><TableHead>Loại</TableHead><TableHead className="text-right">Số lượng</TableHead></TableRow></TableHeader>
              <TableBody>
                {(txnRes.data ?? []).map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm">{(t.ingredient as any)?.name}</TableCell>
                    <TableCell><Badge variant={t.txn_type==="in"?"success":"muted"}>{t.txn_type==="in"?"Nhập":"Xuất"}</Badge></TableCell>
                    <TableCell className="tnum text-right text-sm">{NUM(t.quantity)} {(t.ingredient as any)?.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
