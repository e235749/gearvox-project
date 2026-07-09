import { NextResponse } from "next/server";

import { AUTH_ROUTES } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? AUTH_ROUTES.home;

  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : AUTH_ROUTES.home;

  if (!code) {
    return NextResponse.redirect(
      `${origin}${AUTH_ROUTES.login}?error=auth_callback_failed`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}${AUTH_ROUTES.login}?error=auth_callback_failed`,
    );
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
