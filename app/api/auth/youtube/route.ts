import { NextRequest, NextResponse } from "next/server";
import { requireActiveClient } from "@/app/actions/clients";

// GET /api/auth/youtube – Redirect bruker til Google/YouTube OAuth
export async function GET(request: NextRequest) {
  const clientId = process.env.YOUTUBE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "YouTube client ID mangler" },
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
  const { userId, clientId: activeClientId } = auth;

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/youtube/callback`;
  const scope = "https://www.googleapis.com/auth/youtube.readonly";

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", scope);
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "consent");

  const response = NextResponse.redirect(googleAuthUrl.toString());

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  };

  response.cookies.set("youtube_user_id", userId, cookieOpts);
  response.cookies.set("youtube_client_id", activeClientId, cookieOpts);

  return response;
}
