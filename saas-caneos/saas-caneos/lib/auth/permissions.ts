import type { StoreRole } from "@/lib/types";

// ──── Permission definitions ──────────────────────────────────
const PERMS = {
  // Financials
  view_revenue:          ["owner", "manager"],
  view_profit:           ["owner", "manager"],
  view_reports:          ["owner", "manager"],
  view_financials:       ["owner", "manager"],
  manage_investments:    ["owner"],
  // Operations
  create_sales:          ["owner", "manager", "staff"],
  delete_sales:          ["owner", "manager"],
  manage_menu:           ["owner", "manager"],
  delete_menu:           ["owner"],
  manage_expenses:       ["owner", "manager", "staff"],
  delete_expenses:       ["owner", "manager"],
  manage_inventory:      ["owner", "manager", "staff"],
  view_inventory:        ["owner", "manager", "staff"],
  // Team
  manage_team:           ["owner"],
  view_team:             ["owner", "manager"],
  // Store
  manage_store_settings: ["owner"],
  delete_store:          ["owner"],
} as const;

export type Permission = keyof typeof PERMS;

export function can(role: StoreRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMS[permission] as readonly string[]).includes(role);
}

export function requireRole(role: StoreRole | null, allowed: StoreRole[]): boolean {
  return role !== null && allowed.includes(role);
}

// Role hierarchy: owner > manager > staff
const ROLE_LEVEL: Record<StoreRole, number> = { owner: 3, manager: 2, staff: 1 };
export function isAtLeast(role: StoreRole | null, min: StoreRole): boolean {
  if (!role) return false;
  return ROLE_LEVEL[role] >= ROLE_LEVEL[min];
}
