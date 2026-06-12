import { redirect } from "next/navigation";
import Link from "next/link";
import { CupSoda, LayoutDashboard, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await sb.from("profiles").select("system_role,full_name").eq("id", user.id).single();
  if (profile?.system_role !== "super_admin") redirect("/stores");
  return (
    <div className="min-h-dvh flex">
      <aside className="hidden w-52 flex-col border-r bg-card/40 px-3 py-4 lg:flex">
        <div className="flex items-center gap-2.5 px-2 mb-5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground"><CupSoda className="h-4 w-4"/></span>
          <span className="text-sm font-semibold">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          <Link href="/admin" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
            <LayoutDashboard className="h-4 w-4"/>Tổng quan hệ thống
          </Link>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-primary"/>
            <span className="font-medium">Super Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle/>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {profile?.full_name?.[0]?.toUpperCase()}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuSeparator/>
                <SignOutButton/>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8"><div className="mx-auto max-w-5xl">{children}</div></main>
      </div>
    </div>
  );
}
