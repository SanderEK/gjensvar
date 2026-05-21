"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { fetchFacebookPageVideos } from "@/lib/facebook";
import { requireActiveClient } from "./clients";

export async function syncFacebookData() {
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
      .eq("platform", "facebook")
      .single();

    if (accountError || !account) {
      return {
        success: false,
        message: "Ingen Facebook-side koblet til denne kunden. Koble til Facebook først.",
      };
    }

    const pageAccessToken = account.access_token;
    const pageId = account.platform_account_id;

    if (!pageId) {
      return {
        success: false,
        message: "Facebook Page ID mangler. Koble til Facebook på nytt.",
      };
    }

    const videos = await fetchFacebookPageVideos(pageAccessToken, pageId);

    if (videos.length === 0) {
      return {
        success: true,
        message: "Ingen videoer funnet på Facebook-siden.",
      };
    }

    let synced = 0;
    const errors: string[] = [];

    for (const video of videos) {
      const row = {
        facebook_video_id: video.id,
        client_id: clientId,
        permalink: video.permalink_url || null,
        title: video.title || video.description?.slice(0, 200) || null,
        posted_at: video.created_time,
        view_count: video.views || 0,
        like_count: video.likes || 0,
        comment_count: 0,
        share_count: 0,
      };

      const { error: upsertError } = await supabase
        .from("facebook_videos")
        .upsert(row, {
          onConflict: "facebook_video_id",
        });

      if (upsertError) {
        console.error(
          `Feil ved lagring av Facebook-video ${video.id}:`,
          upsertError
        );
        errors.push(`${video.id}: ${upsertError.message}`);
      } else {
        synced++;
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: `Synkroniserte ${synced} av ${videos.length}. Feil: ${errors.join(", ")}`,
      };
    }

    return {
      success: true,
      message: `Synkroniserte ${synced} Facebook-videoer.`,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Ukjent feil";
    console.error("syncFacebookData feilet:", errorMessage);
    return {
      success: false,
      message: `Feil ved Facebook-synkronisering: ${errorMessage}`,
    };
  }
}
