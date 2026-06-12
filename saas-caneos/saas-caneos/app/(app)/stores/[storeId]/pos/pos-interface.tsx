"use client";
import * as React from "react";
import { ShoppingCart, Plus, Minus, X, Check, Banknote, CreditCard, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product, Category, PaymentMethod } from "@/lib/types";
import { VND, NUM, PAYMENT_LABELS } from "@/lib/types";
import { VND as fmtVND, NUM as fmtNUM } from "@/lib/format";
import { checkoutOrder } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CartEntry { product: Product; qty: number; }

export function PosInterface({ storeId, products, categories }: {
  storeId: string; products: Product[]; categories: Category[];
}) {
  const [cart, setCart] = React.useState<Map<string, CartEntry>>(new Map());
  const [activeCat, setActiveCat] = React.useState<string>("all");
  const [payment, setPayment] = React.useState<PaymentMethod>("cash");
  const [note, setNote] = React.useState("");
  const [showNote, setShowNote] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<{total:number;id:string}|null>(null);

  const filteredProducts = activeCat === "all"
    ? products
    : products.filter(p => p.category_id === activeCat);

  const cartItems = [...cart.values()].filter(e => e.qty > 0);
  const total = cartItems.reduce((s, e) => s + e.qty * e.product.price, 0);
  const totalUnits = cartItems.reduce((s, e) => s + e.qty, 0);

  function addToCart(product: Product) {
    setCart(prev => {
      const m = new Map(prev);
      const cur = m.get(product.id) ?? { product, qty: 0 };
      m.set(product.id, { ...cur, qty: cur.qty + 1 });
      return m;
    });
  }
  function setQty(productId: string, qty: number) {
    setCart(prev => {
      const m = new Map(prev);
      if (qty <= 0) m.delete(productId);
      else {
        const cur = m.get(productId);
        if (cur) m.set(productId, { ...cur, qty });
      }
      return m;
    });
  }
  function clearCart() { setCart(new Map()); setNote(""); setShowNote(false); }

  async function onCheckout() {
    if (!cartItems.length) return;
    setLoading(true);
    const res = await checkoutOrder(
      storeId,
      cartItems.map(e => ({ product_id: e.product.id, quantity: e.qty })),
      payment, note
    );
    setLoading(false);
    if (res.error) { toast.error("Thanh toán thất bại", { description: res.error }); return; }
    setSuccess({ total: res.totalAmount!, id: res.saleId! });
    clearCart();
    setTimeout(() => setSuccess(null), 3000);
  }

  if (success) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center animate-fade-in">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
        <Check className="h-10 w-10"/>
      </div>
      <div>
        <p className="text-2xl font-bold tnum">{fmtVND(success.total)}</p>
        <p className="text-muted-foreground text-sm mt-1">Thanh toán thành công · {PAYMENT_LABELS[payment]}</p>
      </div>
      <Button onClick={() => setSuccess(null)} variant="outline">Tạo đơn mới</Button>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-0 lg:flex-row lg:gap-4">
      {/* Products panel */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Category filter */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button onClick={() => setActiveCat("all")}
            className={cn("shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              activeCat==="all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
            Tất cả
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={cn("shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                activeCat===c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Product grid — big cards for touch */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4 pb-2">
            {filteredProducts.map(p => {
              const inCart = cart.get(p.id)?.qty ?? 0;
              return (
                <button key={p.id} onClick={() => addToCart(p)}
                  className={cn(
                    "relative flex flex-col items-start justify-between rounded-xl border p-3.5 text-left transition-all active:scale-[.97]",
                    "bg-card hover:border-primary/40 hover:shadow-sm",
                    inCart > 0 && "border-primary/50 bg-primary/[0.04] shadow-sm"
                  )}>
                  {inCart > 0 && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold tnum">
                      {inCart}
                    </span>
                  )}
                  <div className="mb-3 text-3xl select-none">🥤</div>
                  <div className="w-full min-w-0">
                    <p className="text-sm font-medium leading-tight line-clamp-2">{p.name}</p>
                    <p className="tnum mt-1 text-base font-bold text-primary">{fmtVND(p.price)}</p>
                  </div>
                </button>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center text-sm text-muted-foreground">Không có sản phẩm nào.</div>
            )}
          </div>
        </div>
      </div>

      {/* Cart panel */}
      <div className={cn(
        "flex flex-col border-t pt-3 lg:w-80 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0",
        cartItems.length === 0 && "lg:flex hidden"
      )}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground"/>
            <span className="text-sm font-semibold">Đơn hàng</span>
            {totalUnits > 0 && <Badge variant="default" className="h-5 px-1.5">{totalUnits}</Badge>}
          </div>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
              <Trash2 className="h-3.5 w-3.5"/>Xoá hết
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 max-h-48 lg:max-h-none">
          {cartItems.length === 0
            ? <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">Chọn món để bắt đầu</div>
            : cartItems.map(e => (
              <div key={e.product.id} className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
                <span className="min-w-0 text-sm font-medium truncate">{e.product.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => setQty(e.product.id, e.qty-1)} className="grid h-7 w-7 place-items-center rounded-md border hover:bg-accent"><Minus className="h-3 w-3"/></button>
                  <span className="tnum w-6 text-center text-sm font-semibold">{e.qty}</span>
                  <button onClick={() => setQty(e.product.id, e.qty+1)} className="grid h-7 w-7 place-items-center rounded-md border hover:bg-accent"><Plus className="h-3 w-3"/></button>
                  <span className="tnum w-20 text-right text-sm font-medium">{fmtVND(e.qty*e.product.price)}</span>
                </div>
              </div>
            ))}
        </div>

        {/* Payment + checkout */}
        {cartItems.length > 0 && (
          <div className="mt-3 space-y-3 border-t pt-3">
            {/* Payment method */}
            <div className="flex gap-2">
              {(["cash","bank_transfer"] as PaymentMethod[]).map(pm => (
                <button key={pm} onClick={() => setPayment(pm)}
                  className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors",
                    payment===pm ? "border-primary bg-primary/8 text-primary" : "hover:bg-accent text-muted-foreground")}>
                  {pm==="cash" ? <Banknote className="h-4 w-4"/> : <CreditCard className="h-4 w-4"/>}
                  {pm==="cash" ? "Tiền mặt" : "Chuyển khoản"}
                </button>
              ))}
            </div>

            {/* Note */}
            <div>
              {showNote
                ? <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Ghi chú đơn hàng…"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"/>
                : <button onClick={()=>setShowNote(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <StickyNote className="h-3.5 w-3.5"/>Thêm ghi chú
                  </button>
              }
            </div>

            {/* Total + checkout */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tổng cộng</p>
                <p className="tnum text-xl font-bold">{fmtVND(total)}</p>
              </div>
              <Button size="lg" onClick={onCheckout} disabled={loading} className="px-6">
                {loading ? "Đang xử lý…" : "Thanh toán"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
