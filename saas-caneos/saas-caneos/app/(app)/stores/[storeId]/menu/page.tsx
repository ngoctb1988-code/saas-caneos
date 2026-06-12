import { createClient } from "@/lib/supabase/server";
import { requireStoreAccess } from "@/lib/auth/store-access";
import { can } from "@/lib/auth/permissions";
import { VND, PCT } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MenuManager } from "./menu-manager";
export const dynamic = "force-dynamic";
export default async function MenuPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const { role } = await requireStoreAccess(storeId);
  const sb = await createClient();
  const [prodRes, catRes, ingRes] = await Promise.all([
    sb.from("products").select("*,category:categories(id,name),recipe_items(*,ingredient:ingredients(id,name,unit))").eq("store_id", storeId).order("sort_order"),
    sb.from("categories").select("*").eq("store_id", storeId).order("sort_order"),
    sb.from("ingredients").select("id,name,unit").eq("store_id", storeId).order("name"),
  ]);
  const canWrite = can(role, "manage_menu");
  return (
    <>
      <PageHeader title="Thực đơn" subtitle="Quản lý món, giá bán, giá vốn và công thức nguyên liệu."
        action={canWrite ? <MenuManager storeId={storeId} categories={catRes.data??[]} ingredients={ingRes.data??[]} /> : undefined} />
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Món</TableHead>
            <TableHead className="text-right">Giá bán</TableHead>
            <TableHead className="text-right">Giá vốn</TableHead>
            <TableHead className="text-right">Biên LN</TableHead>
            <TableHead>Công thức</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {(prodRes.data??[]).map(p => {
              const margin = p.price > 0 ? (p.price - p.cost) / p.price : 0;
              const recipes = (p.recipe_items as any[]) ?? [];
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{(p.category as any)?.name}</div>
                  </TableCell>
                  <TableCell className="tnum text-right">{VND(p.price)}</TableCell>
                  <TableCell className="tnum text-right text-muted-foreground">{VND(p.cost)}</TableCell>
                  <TableCell className="tnum text-right">{PCT(margin)}</TableCell>
                  <TableCell>
                    {recipes.length > 0
                      ? <div className="flex flex-wrap gap-1">
                          {recipes.map((r:any) => <Badge key={r.id} variant="muted" className="text-xs">{r.quantity} {r.ingredient?.unit} {r.ingredient?.name}</Badge>)}
                        </div>
                      : <span className="text-xs text-muted-foreground">Chưa có</span>
                    }
                  </TableCell>
                  <TableCell><Badge variant={p.is_active?"success":"muted"}>{p.is_active?"Đang bán":"Ngừng"}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
