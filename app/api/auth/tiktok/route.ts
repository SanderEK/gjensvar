import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { requireActiveClient } from "@/app/actions/clients";

// GET /api/auth/tiktok – Redirect bruker til TikTok login
export async function GET(request: NextRequest) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;

  if (!clientKey) {
    return NextResponse.json(
      { error: "TikTok client key mangler" },
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

  const state = randomBytes(16).toString("hex");
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/tiktok/callback`;
  const scopes = "user.info.profile,video.list";

  const tiktokAuthUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  tiktokAuthUrl.searchParams.set("client_key", clientKey);
  tiktokAuthUrl.searchParams.set("scope", scopes);
  tiktokAuthUrl.searchParams.set("response_type", "code");
  tiktokAuthUrl.searchParams.set("redirect_uri", redirectUri);
  tiktokAuthUrl.searchParams.set("state", state);
  tiktokAuthUrl.searchParams.set("code_challenge", codeChallenge);
  tiktokAuthUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(tiktokAuthUrl.toString());

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  };

  response.cookies.set("tiktok_code_verifier", codeVerifier, cookieOpts);
  response.cookies.set("tiktok_user_id", userId, cookieOpts);
  response.cookies.set("tiktok_client_id", clientId, cookieOpts);

  return response;
}
