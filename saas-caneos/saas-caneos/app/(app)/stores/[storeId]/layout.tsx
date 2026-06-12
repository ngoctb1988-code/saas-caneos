import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronDown, User, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireStoreAccess } from "@/lib/auth/store-access";
import { StoreProvider } from "@/lib/auth/context";
import { can } from "@/lib/auth/permissions";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { StoreSideNav, StoreMobileNav } from "@/components/store-nav";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default async function StoreLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const access = await requireStoreAccess(storeId);

  const supabase = await createClient();
  const [storeRes, profileRes] = await Promise.all([
    supabase.from("stores").select("id,name,address,type").eq("id", storeId).single(),
    supabase.from("profiles").select("email,full_name").eq("id", access.userId).single(),
  ]);
  if (storeRes.error) redirect("/stores");
  const store = storeRes.data!;
  const profile = profileRes.data;

  return (
    <StoreProvider storeId={storeId} storeName={store.name} role={access.role} userId={access.userId}>
      <div className="flex min-h-dvh">
        <StoreSideNav storeId={storeId} storeName={store.name} role={access.role} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur lg:px-6">
            {/* Breadcrumb store name on mobile */}
            <div className="flex items-center gap-1.5 text-sm lg:hidden">
              <Link href="/stores" className="text-muted-foreground hover:text-foreground">Cửa hàng</Link>
              <ChevronRight className="h-3 w-3 text-muted-foreground"/>
              <span className="font-medium truncate max-w-[140px]">{store.name}</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-xs font-semibold">
                      {profile?.full_name?.[0]?.toUpperCase() ?? "U"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60"/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator/>
                  <DropdownMenuItem asChild><Link href="/stores">Đổi cửa hàng</Link></DropdownMenuItem>
                  <DropdownMenuSeparator/>
                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
        <StoreMobileNav storeId={storeId} role={access.role} />
      </div>
    </StoreProvider>
  );
}
