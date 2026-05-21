"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  fetchInstagramMedia,
  fetchMediaInsights,
} from "@/lib/instagram";
import { requireActiveClient } from "./clients";

export async function syncInstagramData() {
  try {
    const auth = await requireActiveClient();
    if (!auth.ok) {
      return { success: false, message: auth.message };
    }
    const { clientId } = auth;

    const supabase = await getSupabaseServerClient();

    const { data: account, error: accountError } = await supabase
      .from("connected_accounts")
      .select("*")
      .eq("client_id", clientId)
      .eq("platform", "instagram")
      .single();

    if (accountError || !account) {
      return {
        success: false,
        message: "Ingen Instagram-konto koblet til denne kunden. Koble til Instagram først.",
      };
    }

    const accessToken = account.access_token;
    const accountId = account.platform_account_id;

    if (!accountId) {
      return {
        success: false,
        message: "Instagram Business Account ID mangler. Koble til Instagram på nytt.",
      };
    }

    return syncWithCredentials(supabase, accessToken, accountId, clientId);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Ukjent feil";
    console.error("syncInstagramData feilet:", errorMessage);
    return {
      success: false,
      message: `Feil ved Instagram-synkronisering: ${errorMessage}`,
    };
  }
}

async function syncWithCredentials(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  accessToken: string,
  accountId: string,
  clientId: string
) {
  console.log("Henter media fra Instagram...");
  const mediaList = await fetchInstagramMedia(accessToken, accountId);
  console.log(`Fant ${mediaList.length} media`);

  let synced = 0;
  const errors: string[] = [];

  for (const media of mediaList) {
    if (media.media_type !== "VIDEO" && media.media_type !== "REELS") {
      continue;
    }

    const insights = await fetchMediaInsights(
      accessToken,
      media.id,
      media.media_type
    );
    const views = insights.impressions || 0;

    const { error: upsertError } = await supabase
      .from("instagram_videos")
      .upsert(
        {
          instagram_media_id: media.id,
          client_id: clientId,
          caption: media.caption || null,
          permalink: media.permalink || null,
          posted_at: media.timestamp,
          view_count: views,
          like_count: media.like_count ?? 0,
        },
        {
          onConflict: "instagram_media_id",
        }
      );

    if (upsertError) {
      console.error(`Feil ved lagring av video ${media.id}: ${upsertError.message}`);
      errors.push(`${media.id}: ${upsertError.message}`);
    } else {
      synced++;
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: `Synkroniserte ${synced} av ${mediaList.length}. Feil: ${errors.join(", ")}`,
    };
  }

  return {
    success: true,
    message: `Synkroniserte ${synced} Instagram-videoer.`,
  };
}
