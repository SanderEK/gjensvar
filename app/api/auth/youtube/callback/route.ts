import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

// GET /api/auth/youtube/callback – Google sender brukeren hit etter login
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    console.error("YouTube auth feilet:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=youtube_auth_failed", request.url)
    );
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/youtube/callback`;

  if (!clientId || !clientSecret) {
    console.error("YouTube credentials mangler");
    return NextResponse.redirect(
      new URL("/dashboard?error=config_error", request.url)
    );
  }

  const userId = request.cookies.get("youtube_user_id")?.value;
  const activeClientId = request.cookies.get("youtube_client_id")?.value;

  if (!userId) {
    console.error("user_id cookie mangler");
    return NextResponse.redirect(
      new URL("/login?error=not_authenticated", request.url)
    );
  }

  if (!activeClientId) {
    console.error("client_id cookie mangler");
    return NextResponse.redirect(
      new URL("/dashboard?error=no_client_selected", request.url)
    );
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("Feil ved token-utveksling:", tokenData);
      return NextResponse.redirect(
        new URL("/dashboard?error=token_exchange_failed", request.url)
      );
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userInfo = await userInfoResponse.json();
    const username = userInfo.email || userInfo.name || "YouTube User";

    const supabase = await getSupabaseServerClient();

    const expiresAt = new Date(
      Date.now() + (expires_in || 3600) * 1000
    ).toISOString();

    await supabase
      .from("connected_accounts")
      .delete()
      .eq("platform", "youtube")
      .or(`user_id.eq.${userId},client_id.eq.${activeClientId}`);

    const { error: dbError } = await supabase
      .from("connected_accounts")
      .insert({
        user_id: userId,
        client_id: activeClientId,
        platform: "youtube",
        platform_username: username,
        access_token: access_token,
        refresh_token: refresh_token || null,
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Feil ved lagring av YouTube-token:", dbError);
      return NextResponse.redirect(
        new URL("/dashboard?error=db_error", request.url)
      );
    }

    console.log(`YouTube-konto koblet til: ${username}`);

    const successResponse = NextResponse.redirect(
      new URL("/dashboard?success=youtube_connected", request.url)
    );
    successResponse.cookies.delete("youtube_user_id");
    successResponse.cookies.delete("youtube_client_id");
    return successResponse;
  } catch (err) {
    console.error("Uventet feil i YouTube callback:", err);
    return NextResponse.redirect(
      new URL("/dashboard?error=unexpected_error", request.url)
    );
  }
}
