import { Shield, UserPlus } from "lucide-react";
import { getTeam } from "@/lib/queries/team";
import { requireStoreAccess } from "@/lib/auth/store-access";
import { can } from "@/lib/auth/permissions";
import { ROLE_LABELS } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TeamManager } from "./team-manager";
export const dynamic = "force-dynamic";
export default async function TeamPage({ params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const { role, userId } = await requireStoreAccess(storeId, ["owner","manager"]);
  const { members, invitations } = await getTeam(storeId);
  const isOwner = role === "owner";
  return (
    <>
      <PageHeader title="Nhân sự" subtitle="Quản lý thành viên và phân quyền truy cập cửa hàng."
        action={isOwner ? <TeamManager storeId={storeId} /> : undefined} />

      <Card className="mb-4">
        <CardHeader><CardTitle>Thành viên ({members.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Tên</TableHead><TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead><TableHead>Tham gia</TableHead>
              {isOwner && <TableHead className="w-20"></TableHead>}
            </TableRow></TableHeader>
            <TableBody>
              {members.map(m => {
                const p = m.profile as any;
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-semibold shrink-0">
                          {p?.full_name?.[0]?.toUpperCase() ?? "?"}
                        </span>
                        <span className="font-medium">{p?.full_name ?? "—"}{m.user_id===userId&&<span className="ml-1 text-xs text-muted-foreground">(bạn)</span>}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p?.email}</TableCell>
                    <TableCell>
                      <Badge variant={m.role==="owner"?"default":m.role==="manager"?"secondary":"muted"}>
                        <Shield className="h-3 w-3 mr-1"/>{ROLE_LABELS[m.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{fmtDate(m.created_at.slice(0,10))}</TableCell>
                    {isOwner && <TableCell>
                      {m.user_id !== userId && <MemberActions storeId={storeId} member={m} />}
                    </TableCell>}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Lời mời đang chờ ({invitations.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Vai trò</TableHead><TableHead>Hết hạn</TableHead></TableRow></TableHeader>
              <TableBody>
                {invitations.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell><Badge variant="muted">{ROLE_LABELS[inv.role]}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{fmtDate(inv.expires_at.slice(0,10))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function MemberActions({ storeId, member }: { storeId: string; member: any }) {
  "use client";
  return null; // handled by TeamManager dropdown in real implementation
}
