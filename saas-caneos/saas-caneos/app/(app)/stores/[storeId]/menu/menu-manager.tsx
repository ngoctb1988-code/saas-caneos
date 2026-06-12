"use client";
import * as React from "react";
import { Plus, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { saveProduct, saveRecipe } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function MenuManager({ storeId, categories, ingredients }: {
  storeId: string;
  categories: { id: string; name: string }[];
  ingredients: { id: string; name: string; unit: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [catId, setCatId] = React.useState<string | null>(null);
  const [price, setPrice] = React.useState(0);
  const [cost, setCost] = React.useState(0);
  const [recipeParts, setRecipeParts] = React.useState<{ ingredient_id: string; quantity: number }[]>([]);
  const [saving, setSaving] = React.useState(false);

  function openNew() {
    setName(""); setCatId(null); setPrice(0); setCost(0); setRecipeParts([]); setOpen(true);
  }
  function addRecipePart() { setRecipeParts(prev => [...prev, { ingredient_id: ingredients[0]?.id ?? "", quantity: 0 }]); }
  function updatePart(i: number, field: string, val: string | number) {
    setRecipeParts(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  }
  function removePart(i: number) { setRecipeParts(prev => prev.filter((_, idx) => idx !== i)); }

  async function onSave() {
    if (!name.trim()) { toast.error("Nhập tên món"); return; }
    setSaving(true);
    const res = await saveProduct(storeId, { name, category_id: catId, price, cost, is_active: true });
    setSaving(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success("Đã thêm món");
    setOpen(false);
  }

  return (
    <>
      <Button onClick={openNew}><Plus className="h-4 w-4"/>Thêm món</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Thêm món mới</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Tên món</Label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Nước mía truyền thống"/></div>
            <div className="space-y-1.5"><Label>Danh mục</Label>
              <Select value={catId ?? "none"} onValueChange={v=>setCatId(v==="none"?null:v)}>
                <SelectTrigger><SelectValue placeholder="Chọn danh mục"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Không —</SelectItem>
                  {categories.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Giá bán (₫)</Label><Input type="number" inputMode="numeric" value={price||""} onChange={e=>setPrice(+e.target.value)}/></div>
              <div className="space-y-1.5"><Label>Giá vốn (₫)</Label><Input type="number" inputMode="numeric" value={cost||""} onChange={e=>setCost(+e.target.value)}/></div>
            </div>
            {/* Recipe */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Công thức nguyên liệu</Label>
                <button onClick={addRecipePart} className="text-xs text-primary hover:underline">+ Thêm nguyên liệu</button>
              </div>
              {recipeParts.map((part, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center">
                  <Select value={part.ingredient_id} onValueChange={v=>updatePart(i,"ingredient_id",v)}>
                    <SelectTrigger className="flex-1"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {ingredients.map(ing=><SelectItem key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" className="w-24" value={part.quantity||""} onChange={e=>updatePart(i,"quantity",+e.target.value)} placeholder="Số lượng"/>
                  <button onClick={()=>removePart(i)} className="text-muted-foreground hover:text-destructive text-sm px-1">×</button>
                </div>
              ))}
              {ingredients.length === 0 && <p className="text-xs text-muted-foreground">Thêm nguyên liệu trong mục Tồn kho trước.</p>}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Huỷ</Button></DialogClose>
            <Button onClick={onSave} disabled={saving}>{saving?"Đang lưu…":"Lưu món"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
