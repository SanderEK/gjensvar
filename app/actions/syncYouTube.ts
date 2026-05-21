"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { fetchYouTubeVideos } from "@/lib/youtube";
import { requireActiveClient } from "./clients";

export async function syncYouTubeData() {
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
      .eq("platform", "youtube")
      .single();

    if (accountError || !account) {
      return {
        success: false,
        message: "Ingen YouTube-konto koblet til denne kunden. Koble til YouTube først.",
      };
    }

    const videos = await fetchYouTubeVideos(account.access_token);

    if (videos.length === 0) {
      return {
        success: true,
        message: "Ingen videoer funnet på YouTube-kanalen.",
      };
    }

    let synced = 0;
    const errors: string[] = [];

    for (const video of videos) {
      const publishedAt = new Date(video.snippet.publishedAt).toISOString();
      const permalink = `https://www.youtube.com/watch?v=${video.id}`;

      const row = {
        youtube_video_id: video.id,
        client_id: clientId,
        permalink: permalink,
        title: video.snippet.title || null,
        published_at: publishedAt,
        view_count: parseInt(video.statistics.viewCount || "0"),
        like_count: parseInt(video.statistics.likeCount || "0"),
        comment_count: parseInt(video.statistics.commentCount || "0"),
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from("youtube_videos")
        .upsert(row, {
          onConflict: "youtube_video_id",
        });

      if (upsertError) {
        console.error(
          `Feil ved lagring av YouTube-video ${video.id}:`,
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
      message: `Synkroniserte ${synced} av ${videos.length} YouTube-videoer.`,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil";
    console.error("syncYouTubeData feilet:", errorMessage);
    return {
      success: false,
      message: `Feil ved YouTube-synkronisering: ${errorMessage}`,
    };
  }
}
