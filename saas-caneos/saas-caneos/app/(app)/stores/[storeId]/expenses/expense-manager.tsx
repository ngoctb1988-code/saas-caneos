"use client";
import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createExpense, deleteExpense } from "./actions";
import { EXPENSE_LABELS } from "@/lib/types";
import type { ExpenseType, Expense } from "@/lib/types";
import { toDateKey } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddExpenseButton({ storeId }: { storeId: string }) {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<ExpenseType>("other");
  const [amount, setAmount] = React.useState(0);
  const [note, setNote] = React.useState("");
  const [date, setDate] = React.useState(toDateKey());
  const [loading, setLoading] = React.useState(false);
  async function onSave() {
    if (amount <= 0) { toast.error("Nhập số tiền"); return; }
    setLoading(true);
    const res = await createExpense(storeId, { type, amount, note, expense_date: date });
    setLoading(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success("Đã ghi chi phí");
    setAmount(0); setNote(""); setOpen(false);
  }
  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4"/>Thêm chi phí</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ghi nhận chi phí</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Loại chi phí</Label>
              <Select value={type} onValueChange={v => setType(v as ExpenseType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(Object.entries(EXPENSE_LABELS) as [ExpenseType,string][]).map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Số tiền (₫)</Label><Input type="number" inputMode="numeric" value={amount||""} onChange={e=>setAmount(+e.target.value)} placeholder="500000"/></div>
            <div className="space-y-1.5"><Label>Ngày</Label><Input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
            <div className="space-y-1.5"><Label>Ghi chú</Label><Input value={note} onChange={e=>setNote(e.target.value)} placeholder="Tiền điện tháng 6…"/></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Huỷ</Button></DialogClose>
            <Button onClick={onSave} disabled={loading}>{loading?"Đang lưu…":"Lưu"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DeleteExpenseButton({ storeId, expenseId }: { storeId: string; expenseId: string }) {
  const [loading, setLoading] = React.useState(false);
  async function onDelete() {
    if (!confirm("Xoá chi phí này?")) return;
    setLoading(true);
    const res = await deleteExpense(storeId, expenseId);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else toast.success("Đã xoá");
  }
  return <button onClick={onDelete} disabled={loading} className="text-xs text-destructive hover:underline disabled:opacity-50">{loading?"…":"Xoá"}</button>;
}
