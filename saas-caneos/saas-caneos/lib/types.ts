// CanêOS SaaS — Domain types (khớp với schema Supabase)

export type StoreRole  = "owner" | "manager" | "staff";
export type SystemRole = "super_admin";
export type ExpenseType       = "rent"|"staff"|"electricity"|"water"|"ingredients"|"marketing"|"other";
export type InvestmentCategory = "machine"|"setup"|"signage"|"equipment"|"other";
export type PaymentMethod     = "cash"|"bank_transfer"|"mixed";

// ──── Auth / Tenant ──────────────────────────────────────────
export interface Profile {
  id: string; email: string | null; full_name: string | null;
  avatar_url: string | null; system_role: SystemRole | null;
  onboarded: boolean; created_at: string;
}

export interface Tenant {
  id: string; name: string; owner_id: string;
  plan: string; status: string; created_at: string;
}

export interface Store {
  id: string; tenant_id: string; name: string; slug: string | null;
  address: string | null; phone: string | null; type: string;
  logo_url: string | null; is_active: boolean; created_at: string;
}

export interface StoreMember {
  id: string; store_id: string; user_id: string;
  role: StoreRole; invited_by: string | null; created_at: string;
  profile?: Profile | null;
}

export interface PendingInvitation {
  id: string; store_id: string; email: string;
  role: StoreRole; token: string; status: string;
  expires_at: string; created_at: string;
}

// ──── Store data ─────────────────────────────────────────────
export interface Category {
  id: string; store_id: string; name: string;
  sort_order: number; created_at: string;
}

export interface Product {
  id: string; store_id: string; category_id: string | null;
  name: string; price: number; cost: number; image_url: string | null;
  is_active: boolean; sort_order: number; created_at: string;
  category?: Category | null;
}

export interface RecipeItem {
  id: string; product_id: string; ingredient_id: string; quantity: number;
  ingredient?: Ingredient | null;
}

export interface Ingredient {
  id: string; store_id: string; name: string; unit: string;
  current_stock: number; reorder_point: number; unit_cost: number;
  created_at: string;
}

export interface Sale {
  id: string; store_id: string; created_by: string;
  sale_date: string; payment_method: PaymentMethod;
  note: string | null; total_amount: number; total_cost: number;
  created_at: string; creator?: Profile | null;
}

export interface SaleItem {
  id: string; sale_id: string; product_id: string;
  quantity: number; unit_price: number; unit_cost: number; subtotal: number;
  product?: Product | null;
}

export interface Expense {
  id: string; store_id: string; created_by: string;
  expense_date: string; type: ExpenseType; amount: number;
  note: string | null; created_at: string;
}

export interface Investment {
  id: string; store_id: string; name: string;
  category: InvestmentCategory; amount: number;
  invest_date: string; created_at: string;
}

export interface InventoryTxn {
  id: string; store_id: string; ingredient_id: string;
  txn_type: "in"|"out"; quantity: number; unit_cost: number;
  sale_id: string | null; txn_date: string; note: string | null;
  ingredient?: Ingredient | null;
}

export interface AuditLog {
  id: string; store_id: string | null; user_id: string | null;
  action: string; table_name: string | null; record_id: string | null;
  old_data: Record<string,unknown> | null; new_data: Record<string,unknown> | null;
  created_at: string; profile?: Profile | null;
}

// ──── POS ────────────────────────────────────────────────────
export interface CartItem {
  product: Product; quantity: number;
}

// ──── Reports ────────────────────────────────────────────────
export interface DailyRow {
  date: string; revenue: number; cogs: number;
  expenses: number; grossProfit: number; netProfit: number;
  units: number; orders: number;
}
export interface ProductPerf {
  productId: string; name: string;
  units: number; revenue: number; cost: number; profit: number;
}

// ──── Labels ────────────────────────────────────────────────
export const ROLE_LABELS: Record<StoreRole, string> = {
  owner: "Chủ quán", manager: "Quản lý", staff: "Nhân viên",
};
export const EXPENSE_LABELS: Record<ExpenseType, string> = {
  rent: "Thuê mặt bằng", staff: "Nhân viên", electricity: "Điện",
  water: "Nước", ingredients: "Nguyên liệu", marketing: "Marketing", other: "Khác",
};
export const INVESTMENT_LABELS: Record<InvestmentCategory, string> = {
  machine: "Máy ép mía", setup: "Setup quầy", signage: "Bảng hiệu",
  equipment: "Thiết bị", other: "Khác",
};
export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Tiền mặt", bank_transfer: "Chuyển khoản", mixed: "Kết hợp",
};
