import { createClient } from "@/lib/supabase/server";
import { VND, NUM } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Users, TrendingUp, Shield } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  const sb = await createClient();
  const [tenantsRes, storesRes, profilesRes, salesRes] = await Promise.all([
    sb.from("tenants").select("*,owner:profiles(email,full_name)").order("created_at", { ascending: false }),
    sb.from("stores").select("id,name,tenant_id,is_active,created_at").order("created_at", { ascending: false }),
    sb.from("profiles").select("id,email,full_name,system_role,created_at").order("created_at", { ascending: false }),
    sb.from("sales").select("total_amount"),
  ]);
  const tenants = tenantsRes.data ?? [];
  const stores  = storesRes.data ?? [];
  const profiles = profilesRes.data ?? [];
  const totalRev = (salesRes.data ?? []).reduce((s,r) => s + Number(r.total_amount), 0);
  return (
    <>
      <PageHeader title="Tổng quan hệ thống" subtitle="CanêOS SaaS — Platform dashboard." />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Tenants" value={NUM(tenants.length)} icon={<Building2 className="h-5 w-5"/>} />
        <StatCard label="Cửa hàng" value={NUM(stores.length)} icon={<Building2 className="h-5 w-5"/>} />
        <StatCard label="Người dùng" value={NUM(profiles.length)} icon={<Users className="h-5 w-5"/>} />
        <StatCard accent label="Tổng GMV" value={VND(totalRev)} icon={<TrendingUp className="h-5 w-5"/>} />
      </div>
      <Card className="mb-4">
        <CardHeader><CardTitle>Tenants ({tenants.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Tên</TableHead><TableHead>Chủ sở hữu</TableHead><TableHead>Plan</TableHead><TableHead>Cửa hàng</TableHead></TableRow></TableHeader>
            <TableBody>
              {tenants.map(t => {
                const count = stores.filter(s => s.tenant_id === t.id).length;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{(t.owner as any)?.email}</TableCell>
                    <TableCell><Badge variant={t.plan==="pro"?"default":"muted"}>{t.plan}</Badge></TableCell>
                    <TableCell className="text-sm">{count} cửa hàng</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Người dùng gần đây</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Tên</TableHead><TableHead>Email</TableHead><TableHead>Vai trò</TableHead></TableRow></TableHeader>
            <TableBody>
              {profiles.slice(0,20).map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.email}</TableCell>
                  <TableCell>
                    {p.system_role === "super_admin" && <Badge variant="default"><Shield className="h-3 w-3 mr-1"/>Super Admin</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
