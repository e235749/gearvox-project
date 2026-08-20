import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { AUTH_ROUTES, INTERNAL_API_PREFIXES, PUBLIC_ROUTES } from "@/lib/auth/constants";
import type { Database } from "@/types/database";

function isPublicRoute(pathname: string): boolean {
  if (
    INTERNAL_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return true;
  }

  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.login;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (
    user
    && (pathname === AUTH_ROUTES.login || pathname === AUTH_ROUTES.signup)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.home;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
