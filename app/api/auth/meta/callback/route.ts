import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const returnedState = searchParams.get("state");

  if (error || !code) {
    console.error("Meta auth feilet:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=meta_auth_failed", request.url)
    );
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/meta/callback`;

  if (!appId || !appSecret) {
    console.error("Meta credentials mangler");
    return NextResponse.redirect(
      new URL("/dashboard?error=config_error", request.url)
    );
  }

  const userId = request.cookies.get("meta_user_id")?.value;
  const clientId = request.cookies.get("meta_client_id")?.value;
  const platform = request.cookies.get("meta_platform")?.value || "instagram";
  const savedState = request.cookies.get("meta_oauth_state")?.value;

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

  if (!savedState || savedState !== returnedState) {
    console.error("OAuth state mismatch");
    return NextResponse.redirect(
      new URL("/dashboard?error=state_mismatch", request.url)
    );
  }

  try {
    // 1. Exchange code for short-lived token
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("Feil ved token-utveksling:", tokenData);
      return NextResponse.redirect(
        new URL("/dashboard?error=token_exchange_failed", request.url)
      );
    }

    // 2. Exchange short-lived token for long-lived token (60 days)
    const longLivedUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", appId);
    longLivedUrl.searchParams.set("client_secret", appSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", tokenData.access_token);

    const longLivedRes = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedRes.json();

    if (longLivedData.error || !longLivedData.access_token) {
      console.error("Feil ved long-lived token:", longLivedData);
      return NextResponse.redirect(
        new URL("/dashboard?error=long_lived_token_failed", request.url)
      );
    }

    const userAccessToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in || 5184000;

    // 1. Hent brukerens user-id (trengs til fallback hvis /me/accounts er tomt).
    const meRes = await fetch(
      `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${userAccessToken}`
    );
    const meData = await meRes.json();

    // 2. Hent brukerens Pages.
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`
    );
    const pagesData = await pagesRes.json();
    let pages = pagesData.data || [];

    // 3. Fallback A: noen Business Login-flyter krever eksplisitt user-id.
    if (pages.length === 0 && meData.id) {
      const altPagesRes = await fetch(
        `https://graph.facebook.com/v21.0/${meData.id}/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`
      );
      const altPagesData = await altPagesRes.json();
      if (altPagesData.data && altPagesData.data.length > 0) {
        pages = altPagesData.data;
      }
    }

    // 4. Fallback B: Business Login lagrer page-tilganger i granular_scopes
    //    (hentes via debug_token), så vi henter hver valgt side direkte.
    if (pages.length === 0) {
      const appAccessToken = `${appId}|${appSecret}`;
      const debugRes = await fetch(
        `https://graph.facebook.com/v21.0/debug_token?input_token=${userAccessToken}&access_token=${appAccessToken}`
      );
      const debugData = await debugRes.json();
      const granularScopes: Array<{ scope: string; target_ids?: string[] }> =
        debugData.data?.granular_scopes || [];
      const pageScope = granularScopes.find(
        (s) => s.scope === "pages_show_list"
      );

      if (pageScope?.target_ids?.length) {
        const fetchedPages: Array<{
          id: string;
          name?: string;
          access_token?: string;
          instagram_business_account?: { id: string };
        }> = [];
        for (const pageId of pageScope.target_ids) {
          const pageRes = await fetch(
            `https://graph.facebook.com/v21.0/${pageId}?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`
          );
          const pageJson = await pageRes.json();
          if (pageJson.id) {
            fetchedPages.push(pageJson);
          }
        }
        if (fetchedPages.length > 0) {
          pages = fetchedPages;
        }
      }
    }

    const supabase = await getSupabaseServerClient();
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    let platformUsername = "";

    if (platform === "instagram") {
      let igAccountId: string | null = null;

      if (pages.length > 0) {
        const pageWithIg = pages.find(
          (p: { instagram_business_account?: { id: string } }) => p.instagram_business_account
        );
        if (pageWithIg?.instagram_business_account?.id) {
          igAccountId = pageWithIg.instagram_business_account.id;
        }
      }

      if (!igAccountId && meData.id) {
        const igAccountsRes = await fetch(
          `https://graph.facebook.com/v21.0/${meData.id}/accounts?fields=id,name,instagram_business_account&access_token=${userAccessToken}`
        );
        const igAccountsData = await igAccountsRes.json();

        if (igAccountsData.data?.length) {
          const pageWithIg = igAccountsData.data.find(
            (p: { instagram_business_account?: { id: string } }) => p.instagram_business_account
          );
          if (pageWithIg?.instagram_business_account?.id) {
            igAccountId = pageWithIg.instagram_business_account.id;
          }
        }
      }

      if (!igAccountId) {
        console.error(
          "Ingen Instagram Business-konto funnet for bruker",
          meData.id
        );
        return NextResponse.redirect(
          new URL("/dashboard?error=no_ig_business_account", request.url)
        );
      }

      const igInfoRes = await fetch(
        `https://graph.facebook.com/v21.0/${igAccountId}?fields=username,name&access_token=${userAccessToken}`
      );
      const igInfo = await igInfoRes.json();
      platformUsername = igInfo.username || igInfo.name || igAccountId;

      await supabase
        .from("connected_accounts")
        .delete()
        .eq("platform", "instagram")
        .or(`user_id.eq.${userId},client_id.eq.${clientId}`);

      const { error: dbError } = await supabase
        .from("connected_accounts")
        .insert({
          user_id: userId,
          client_id: clientId,
          platform: "instagram",
          platform_username: platformUsername,
          platform_account_id: igAccountId,
          access_token: userAccessToken,
          refresh_token: null,
          token_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error("Feil ved lagring av Instagram-token:", dbError);
        return NextResponse.redirect(
          new URL("/dashboard?error=db_error", request.url)
        );
      }

      console.log(`Instagram-konto koblet til: @${platformUsername} (${igAccountId})`);
    } else {
      // Facebook
      if (!pages.length) {
        console.error(
          "Ingen Facebook-sider funnet for bruker",
          meData.id
        );
        return NextResponse.redirect(
          new URL("/dashboard?error=no_pages_found", request.url)
        );
      }

      const page = pages[0];
      platformUsername = page.name || page.id;

      await supabase
        .from("connected_accounts")
        .delete()
        .eq("platform", "facebook")
        .or(`user_id.eq.${userId},client_id.eq.${clientId}`);

      const { error: dbError } = await supabase
        .from("connected_accounts")
        .insert({
          user_id: userId,
          client_id: clientId,
          platform: "facebook",
          platform_username: platformUsername,
          platform_account_id: page.id,
          access_token: page.access_token,
          refresh_token: null,
          token_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error("Feil ved lagring av Facebook-token:", dbError);
        return NextResponse.redirect(
          new URL("/dashboard?error=db_error", request.url)
        );
      }

      console.log(`Facebook-side koblet til: ${platformUsername} (${page.id})`);
    }

    const successResponse = NextResponse.redirect(
      new URL(`/dashboard?success=${platform}_connected`, request.url)
    );

    successResponse.cookies.delete("meta_user_id");
    successResponse.cookies.delete("meta_client_id");
    successResponse.cookies.delete("meta_platform");
    successResponse.cookies.delete("meta_oauth_state");

    return successResponse;
  } catch (err) {
    console.error("Uventet feil i Meta callback:", err);
    return NextResponse.redirect(
      new URL("/dashboard?error=unexpected_error", request.url)
    );
  }
}
