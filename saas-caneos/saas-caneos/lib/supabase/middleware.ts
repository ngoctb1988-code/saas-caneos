import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cs: any[]) {
          cs.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cs.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isAuthRoute = /^\/(login|register|forgot-password|auth)/.test(pathname);
  const isOnboarding = pathname.startsWith("/onboarding");
  const isPublic = isAuthRoute || pathname === "/";

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/stores", request.url));
  }
  if (user && !isOnboarding && !isAuthRoute) {
    // Check if user has completed onboarding (has at least one store)
    const { data: membership } = await supabase
      .from("store_members").select("id").eq("user_id", user.id).limit(1).single();
    if (!membership && !pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/onboarding/store", request.url));
    }
  }

  return response;
}
