import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  const redirectTo = new URL(next, request.url);

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    let response = NextResponse.redirect(redirectTo);

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Hvis brukeren resetter passord skal vi alltid gå til /reset-password,
      // selv om de er en invitert bruker som ikke har "password_set" i metadata.
      if (next === "/reset-password" || redirectTo.pathname === "/reset-password") {
        return response;
      }

      // Sjekk om dette er en invitert bruker som må sette opp passord
      const { data: { user } } = await supabase.auth.getUser();

      if (user && !user.user_metadata?.password_set) {
        return NextResponse.redirect(new URL("/setup-password", request.url));
      }

      return response;
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
}
