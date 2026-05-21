"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { fetchTikTokVideos } from "@/lib/tiktok";
import { requireActiveClient } from "./clients";

export async function syncTikTokData() {
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
      .eq("platform", "tiktok")
      .single();

    if (accountError || !account) {
      console.error("TikTok sync: Ingen konto funnet for client_id:", clientId, "Feil:", accountError);
      return {
        success: false,
        message: "Ingen TikTok-konto koblet til denne kunden. Koble til TikTok først.",
      };
    }

    console.log("TikTok sync: Fant konto @" + account.platform_username + ", henter videoer...");
    const videos = await fetchTikTokVideos(account.access_token);
    console.log("TikTok sync: API returnerte", videos.length, "videoer");

    if (videos.length === 0) {
      return {
        success: true,
        message: "Ingen videoer funnet på TikTok-kontoen.",
      };
    }

    let synced = 0;
    const errors: string[] = [];

    for (const video of videos) {
      const postedAt = new Date(video.create_time * 1000).toISOString();

      const row = {
        tiktok_video_id: video.id,
        client_id: clientId,
        permalink: video.share_url || null,
        caption: video.title || null,
        posted_at: postedAt,
        view_count: video.view_count || 0,
        like_count: video.like_count || 0,
        comment_count: video.comment_count || 0,
        share_count: video.share_count || 0,
      };

      const { error: upsertError } = await supabase
        .from("tiktok_videos")
        .upsert(row, {
          onConflict: "tiktok_video_id",
        });

      if (upsertError) {
        console.error(
          `Feil ved lagring av TikTok-video ${video.id}:`,
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
      message: `Synkroniserte ${synced} av ${videos.length} TikTok-videoer.`,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Ukjent feil";
    console.error("syncTikTokData feilet:", errorMessage);
    return {
      success: false,
      message: `Feil ved TikTok-synkronisering: ${errorMessage}`,
    };
  }
}
