"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, CupSoda, Receipt, Boxes, BarChart3, Users, Settings, ArrowRightLeft, PiggyBank, MonitorSmartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { can } from "@/lib/auth/permissions";
import type { StoreRole } from "@/lib/types";

interface NavItem { href: string; label: string; icon: React.ElementType; permission?: string; }

function buildNav(storeId: string, role: StoreRole) {
  const base = `/stores/${storeId}`;
  const all: NavItem[] = [
    { href: base, label: "Tổng quan", icon: LayoutDashboard },
    { href: `${base}/pos`, label: "Bán hàng (POS)", icon: MonitorSmartphone },
    { href: `${base}/menu`, label: "Thực đơn", icon: CupSoda },
    { href: `${base}/expenses`, label: "Chi phí", icon: Receipt },
    { href: `${base}/inventory`, label: "Tồn kho", icon: Boxes },
    { href: `${base}/reports`, label: "Báo cáo", icon: BarChart3, permission: "view_reports" },
    { href: `${base}/cashflow`, label: "Dòng tiền", icon: ArrowRightLeft, permission: "view_financials" },
    { href: `${base}/investments`, label: "Đầu tư & ROI", icon: PiggyBank, permission: "manage_investments" },
    { href: `${base}/team`, label: "Nhân sự", icon: Users, permission: "view_team" },
    { href: `${base}/settings`, label: "Cài đặt", icon: Settings, permission: "manage_store_settings" },
  ];
  return all.filter(item => !item.permission || can(role, item.permission as any));
}

export function StoreSideNav({ storeId, storeName, role }: { storeId: string; storeName: string; role: StoreRole }) {
  const pathname = usePathname();
  const nav = buildNav(storeId, role);
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r bg-card/40 px-3 py-4 lg:flex">
      <Link href="/stores" className="flex items-center gap-2.5 px-2 mb-1">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground text-xl shrink-0">🥤</span>
        <span className="text-sm font-semibold truncate">{storeName}</span>
      </Link>
      <nav className="mt-5 flex flex-col gap-0.5">
        {nav.map(item => {
          const active = item.href === `/stores/${storeId}` ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}>
              <Icon className="h-[17px] w-[17px] shrink-0" />{item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

const BOT_IDS = ["", "pos", "menu", "inventory", "reports"] as const;
export function StoreMobileNav({ storeId, role }: { storeId: string; role: StoreRole }) {
  const pathname = usePathname();
  const base = `/stores/${storeId}`;
  const mobileItems = [
    { href: base, label: "Tổng quan", icon: LayoutDashboard },
    { href: `${base}/pos`, label: "POS", icon: MonitorSmartphone },
    { href: `${base}/menu`, label: "Menu", icon: CupSoda },
    { href: `${base}/inventory`, label: "Kho", icon: Boxes },
    ...(can(role,"view_reports") ? [{ href: `${base}/reports`, label: "Báo cáo", icon: BarChart3 }] : []),
  ].slice(0, 5);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t bg-background/96 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      {mobileItems.map(item => {
        const active = item.href === base ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
            active ? "text-primary" : "text-muted-foreground"
          )}>
            <Icon className="h-5 w-5"/>{item.label}
          </Link>
        );
      })}
    </nav>
  );
}
