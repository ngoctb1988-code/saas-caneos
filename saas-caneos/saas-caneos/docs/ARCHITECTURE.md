# CanêOS SaaS — Kiến trúc hệ thống

## Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 3, Radix UI primitives
- **Backend:** Supabase (PostgreSQL 15, Auth, Row Level Security)
- **Hosting:** Vercel (frontend) + Supabase Cloud (database)

---

## Multi-Tenant Model

```
┌─────────────────────────────────────────────┐
│                 CanêOS Platform             │
│                                             │
│  Tenant A (WOW Sport Group)                 │
│  ├─ Store: WOW Pickleball  ← storeId: uuid  │
│  └─ Store: WOW River Park  ← storeId: uuid  │
│                                             │
│  Tenant B (Mía Xanh)                        │
│  └─ Store: Mía Xanh Q.3    ← storeId: uuid  │
└─────────────────────────────────────────────┘
```

**Shared DB, isolated by RLS.**  
Mỗi row trong bảng data (`sales`, `products`, …) đều có `store_id`.  
RLS dùng hàm `has_store_role(store_id, roles[])` để kiểm tra quyền truy cập tự động.

---

## ERD

```
auth.users ──1:1── profiles
                      │
                   1:N│
                   tenants ──1:N── stores
                                      │
                                   1:N│
                              store_members (role: owner|manager|staff)
                                      │
                   ┌──────────────────┴───────────────────┐
                   │                                      │
                categories                           ingredients
                   │                                      │
                products ──N:M── recipe_items ────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
       sales              expenses
         │                investments
       sale_items         audit_logs
         │
   inventory_transactions (auto via trigger)
```

---

## Role Hierarchy

| Permission               | Owner | Manager | Staff |
|--------------------------|:-----:|:-------:|:-----:|
| Xem doanh thu            | ✅    | ✅      | ❌    |
| Xem lợi nhuận            | ✅    | ✅      | ❌    |
| Xem báo cáo              | ✅    | ✅      | ❌    |
| Bán hàng (POS)           | ✅    | ✅      | ✅    |
| Ghi chi phí              | ✅    | ✅      | ✅    |
| Quản lý menu             | ✅    | ✅      | ❌    |
| Xoá sản phẩm             | ✅    | ❌      | ❌    |
| Quản lý nhân sự          | ✅    | ❌      | ❌    |
| Xem tồn kho              | ✅    | ✅      | ✅    |
| Quản lý đầu tư           | ✅    | ❌      | ❌    |
| Cài đặt cửa hàng         | ✅    | ❌      | ❌    |

---

## Data Flow: POS Checkout

```
1. Staff chọn món trên POS (client)
2. onClick → checkoutOrder() [Server Action]
3. Server: validate store access (store_members)
4. Server: load prices from DB (không trust client)
5. INSERT sales + sale_items
6. Trigger: deduct_inventory_for_sale()
   → INSERT inventory_transactions (out, sale_id)
   → Trigger: recompute_ingredient_stock()
   → UPDATE ingredients.current_stock
7. INSERT audit_logs
8. revalidatePath() → dashboard tự refresh
```

---

## Security Layers

1. **Middleware** (`middleware.ts`): kiểm tra session → redirect nếu chưa login
2. **Server Components** (`requireStoreAccess()`): validate store access trước khi render
3. **Server Actions** (`requireStoreAccess()` trong mỗi action): validate lại ở write path
4. **RLS Policies**: lớp bảo vệ cuối cùng tại database level
5. **Audit Log**: ghi lại mọi thao tác quan trọng

---

## Folder Structure

```
saas-caneos/
├── app/
│   ├── (auth)/          # Login, Register, Forgot Password
│   ├── (onboarding)/    # 2-step onboarding flow
│   ├── (app)/
│   │   └── stores/
│   │       ├── page.tsx              # Store switcher
│   │       └── [storeId]/
│   │           ├── layout.tsx        # Auth guard + StoreProvider
│   │           ├── page.tsx          # Dashboard
│   │           ├── pos/              # POS interface
│   │           ├── menu/             # Product management
│   │           ├── expenses/         # Expense tracking
│   │           ├── inventory/        # Stock management
│   │           ├── reports/          # Financial reports
│   │           ├── cashflow/         # Cash flow
│   │           ├── investments/      # ROI tracking
│   │           ├── team/             # Member management
│   │           └── settings/         # Store settings
│   └── (admin)/admin/   # Super admin panel
├── components/
│   ├── ui/              # Radix UI primitives
│   ├── charts/          # Recharts wrappers
│   └── (shared)/        # Nav, StatCard, etc.
├── lib/
│   ├── auth/            # Permissions, StoreContext, store-access
│   ├── queries/         # Server-only DB queries
│   ├── supabase/        # Client, server, middleware
│   ├── types.ts         # Domain types
│   └── format.ts        # VND, date helpers
└── supabase/
    └── migrations/
        ├── 0001_saas_init.sql   # Full schema + RLS + triggers
        └── 0002_seed.sql        # Demo data
```
