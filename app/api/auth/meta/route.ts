import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireActiveClient } from "@/app/actions/clients";

// GET /api/auth/meta?platform=instagram|facebook
export async function GET(request: NextRequest) {
  const appId = process.env.META_APP_ID;

  if (!appId) {
    return NextResponse.json(
      { error: "META_APP_ID mangler" },
      { status: 500 }
    );
  }

  const auth = await requireActiveClient();
  if (!auth.ok) {
    if (auth.reason === "not_authenticated") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(
      new URL("/dashboard?error=no_client", request.url)
    );
  }
  const { userId, clientId } = auth;

  const platform = request.nextUrl.searchParams.get("platform") || "instagram";

  const scopes =
    platform === "facebook"
      ? "pages_show_list,pages_read_engagement"
      : "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement";

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/meta/callback`;

  const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("auth_type", "rerequest");

  const response = NextResponse.redirect(authUrl.toString());

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  };

  response.cookies.set("meta_user_id", userId, cookieOpts);
  response.cookies.set("meta_client_id", clientId, cookieOpts);
  response.cookies.set("meta_platform", platform, cookieOpts);
  response.cookies.set("meta_oauth_state", state, cookieOpts);

  return response;
}
