"use client";
import * as React from "react";
import { Plus, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { saveIngredient, recordStockIn } from "./actions";
import { toDateKey } from "@/lib/format";
import type { Ingredient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UNITS = ["kg","g","lít","ml","quả","cái","túi","thùng","lọ"];

export function AddIngredientButton({ storeId }: { storeId: string }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(""); const [unit, setUnit] = React.useState("kg"); const [rp, setRp] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  async function onSave() {
    if (!name.trim()) { toast.error("Nhập tên"); return; }
    setLoading(true);
    const res = await saveIngredient(storeId, { name, unit, reorder_point: rp });
    setLoading(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success("Đã thêm nguyên liệu");
    setName(""); setOpen(false);
  }
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4"/>Thêm nguyên liệu</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Thêm nguyên liệu</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Tên</Label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Mía nguyên liệu"/></div>
            <div className="space-y-1.5"><Label>Đơn vị</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{UNITS.map(u=><SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Ngưỡng cảnh báo hết kho</Label><Input type="number" value={rp||""} onChange={e=>setRp(+e.target.value)}/></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Huỷ</Button></DialogClose><Button onClick={onSave} disabled={loading}>{loading?"…":"Lưu"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function StockInButton({ storeId, ingredients }: { storeId: string; ingredients: Ingredient[] }) {
  const [open, setOpen] = React.useState(false);
  const [ingId, setIngId] = React.useState(ingredients[0]?.id ?? "");
  const [qty, setQty] = React.useState(0); const [cost, setCost] = React.useState(0);
  const [note, setNote] = React.useState(""); const [date, setDate] = React.useState(toDateKey());
  const [loading, setLoading] = React.useState(false);
  async function onSave() {
    if (!ingId || qty <= 0) { toast.error("Chọn nguyên liệu và nhập số lượng"); return; }
    setLoading(true);
    const res = await recordStockIn(storeId, { ingredient_id: ingId, quantity: qty, unit_cost: cost, note, txn_date: date });
    setLoading(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success("Đã nhập kho");
    setQty(0); setCost(0); setNote(""); setOpen(false);
  }
  return (
    <>
      <Button onClick={() => setOpen(true)}><PackageCheck className="h-4 w-4"/>Nhập kho</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nhập kho nguyên liệu</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Nguyên liệu</Label>
              <Select value={ingId} onValueChange={setIngId}>
                <SelectTrigger><SelectValue placeholder="Chọn…"/></SelectTrigger>
                <SelectContent>{ingredients.map(i=><SelectItem key={i.id} value={i.id}>{i.name} ({i.unit})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Số lượng</Label><Input type="number" inputMode="numeric" value={qty||""} onChange={e=>setQty(+e.target.value)}/></div>
              <div className="space-y-1.5"><Label>Giá nhập / đơn vị (₫)</Label><Input type="number" inputMode="numeric" value={cost||""} onChange={e=>setCost(+e.target.value)}/></div>
            </div>
            <div className="space-y-1.5"><Label>Ngày nhập</Label><Input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
            <div className="space-y-1.5"><Label>Ghi chú</Label><Input value={note} onChange={e=>setNote(e.target.value)} placeholder="NCC Anh Tuấn…"/></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Huỷ</Button></DialogClose><Button onClick={onSave} disabled={loading}>{loading?"…":"Nhập kho"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
