import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

// GET /api/auth/tiktok/callback – TikTok sender brukeren hit etter login
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    console.error("TikTok auth feilet:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=tiktok_auth_failed", request.url)
    );
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/tiktok/callback`;

  if (!clientKey || !clientSecret) {
    console.error("TikTok credentials mangler");
    return NextResponse.redirect(
      new URL("/dashboard?error=config_error", request.url)
    );
  }

  const codeVerifier = request.cookies.get("tiktok_code_verifier")?.value;
  const userId = request.cookies.get("tiktok_user_id")?.value;
  const clientId = request.cookies.get("tiktok_client_id")?.value;

  if (!codeVerifier) {
    console.error("code_verifier cookie mangler");
    return NextResponse.redirect(
      new URL("/dashboard?error=pkce_missing", request.url)
    );
  }

  if (!userId) {
    console.error("user_id cookie mangler");
    return NextResponse.redirect(
      new URL("/login?error=not_authenticated", request.url)
    );
  }

  if (!clientId) {
    console.error("client_id cookie mangler");
    return NextResponse.redirect(
      new URL("/dashboard?error=no_client_selected", request.url)
    );
  }

  try {
    const tokenResponse = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("Feil ved token-utveksling:", tokenData);
      return NextResponse.redirect(
        new URL("/dashboard?error=token_exchange_failed", request.url)
      );
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      open_id,
    } = tokenData;

    const userResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=display_name,username",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userData = await userResponse.json();
    const username =
      userData.data?.user?.username ||
      userData.data?.user?.display_name ||
      open_id;

    const supabase = await getSupabaseServerClient();

    const expiresAt = new Date(
      Date.now() + (expires_in || 86400) * 1000
    ).toISOString();

    // Remove any old rows for this user+platform or client+platform to avoid constraint conflicts
    await supabase
      .from("connected_accounts")
      .delete()
      .eq("platform", "tiktok")
      .or(`user_id.eq.${userId},client_id.eq.${clientId}`);

    const { error: dbError } = await supabase
      .from("connected_accounts")
      .insert({
        user_id: userId,
        client_id: clientId,
        platform: "tiktok",
        platform_username: username,
        access_token: access_token,
        refresh_token: refresh_token || null,
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Feil ved lagring av TikTok-token:", dbError);
      return NextResponse.redirect(
        new URL("/dashboard?error=db_error", request.url)
      );
    }

    console.log(`TikTok-konto koblet til: @${username}`);

    const successResponse = NextResponse.redirect(
      new URL("/dashboard?success=tiktok_connected", request.url)
    );
    successResponse.cookies.delete("tiktok_code_verifier");
    successResponse.cookies.delete("tiktok_user_id");
    successResponse.cookies.delete("tiktok_client_id");
    return successResponse;
  } catch (err) {
    console.error("Uventet feil i TikTok callback:", err);
    return NextResponse.redirect(
      new URL("/dashboard?error=unexpected_error", request.url)
    );
  }
}
