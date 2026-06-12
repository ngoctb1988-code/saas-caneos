"use client";
import * as React from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { inviteMember } from "./actions";
import { ROLE_LABELS } from "@/lib/types";
import type { StoreRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TeamManager({ storeId }: { storeId: string }) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<StoreRole>("staff");
  const [loading, setLoading] = React.useState(false);

  async function onInvite() {
    if (!email.trim()) { toast.error("Nhập email"); return; }
    setLoading(true);
    const res = await inviteMember(storeId, email, role);
    setLoading(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success(`Đã gửi lời mời đến ${email}`);
    setEmail(""); setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><UserPlus className="h-4 w-4"/>Mời thành viên</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mời thành viên mới</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nhanvien@email.com"/>
            </div>
            <div className="space-y-1.5">
              <Label>Vai trò</Label>
              <Select value={role} onValueChange={v=>setRole(v as StoreRole)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  {(["manager","staff"] as StoreRole[]).map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Quyền hạn {ROLE_LABELS[role]}:</p>
              {role==="manager"
                ? <ul className="space-y-0.5 list-disc list-inside"><li>Xem doanh thu & báo cáo</li><li>Quản lý thực đơn</li><li>Quản lý chi phí</li><li>Không xoá cửa hàng</li></ul>
                : <ul className="space-y-0.5 list-disc list-inside"><li>Tạo đơn bán (POS)</li><li>Nhập chi phí</li><li>Xem tồn kho</li><li>Không xem lợi nhuận / báo cáo</li></ul>
              }
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Huỷ</Button></DialogClose>
            <Button onClick={onInvite} disabled={loading}>{loading?"Đang gửi…":"Gửi lời mời"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
