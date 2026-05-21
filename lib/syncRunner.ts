import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchYouTubeVideos } from "./youtube";
import { fetchFacebookPageVideos } from "./facebook";
import { fetchTikTokVideos } from "./tiktok";
import { fetchInstagramMedia, fetchMediaInsights } from "./instagram";

export type Platform = "instagram" | "youtube" | "tiktok" | "facebook";

export type SyncEvent =
  | { type: "started"; platform: Platform }
  | { type: "phase"; platform: Platform; label: string }
  | {
      type: "progress";
      platform: Platform;
      current: number;
      total: number | null;
    }
  | {
      type: "completed";
      platform: Platform;
      synced: number;
      total: number;
      message: string;
    }
  | { type: "skipped"; platform: Platform; message: string }
  | { type: "failed"; platform: Platform; message: string };

export type Emit = (event: SyncEvent) => void;

interface ConnectedAccountRow {
  access_token: string;
  platform_account_id: string | null;
  platform_username: string | null;
}

async function getConnectedAccount(
  supabase: SupabaseClient,
  clientId: string,
  platform: Platform
): Promise<ConnectedAccountRow | null> {
  const { data, error } = await supabase
    .from("connected_accounts")
    .select("access_token, platform_account_id, platform_username")
    .eq("client_id", clientId)
    .eq("platform", platform)
    .maybeSingle();

  if (error) {
    console.error(`Feil ved henting av ${platform}-konto:`, error);
    return null;
  }
  return (data as ConnectedAccountRow | null) ?? null;
}

export async function runYouTubeSync(
  supabase: SupabaseClient,
  clientId: string,
  emit: Emit
): Promise<void> {
  emit({ type: "started", platform: "youtube" });
  const account = await getConnectedAccount(supabase, clientId, "youtube");
  if (!account) {
    emit({
      type: "skipped",
      platform: "youtube",
      message: "Ingen YouTube-konto koblet til.",
    });
    return;
  }

  try {
    emit({ type: "phase", platform: "youtube", label: "Henter kanal" });

    const videos = await fetchYouTubeVideos(account.access_token, (progress) => {
      if (progress.phase === "channel") {
        emit({ type: "phase", platform: "youtube", label: "Henter kanal" });
      } else if (progress.phase === "ids") {
        emit({
          type: "phase",
          platform: "youtube",
          label: `Finner videoer (${progress.current})`,
        });
      } else if (progress.phase === "details") {
        emit({
          type: "progress",
          platform: "youtube",
          current: progress.current,
          total: progress.total,
        });
      }
    });

    if (videos.length === 0) {
      emit({
        type: "completed",
        platform: "youtube",
        synced: 0,
        total: 0,
        message: "Ingen shorts funnet på YouTube-kanalen.",
      });
      return;
    }

    emit({ type: "phase", platform: "youtube", label: "Lagrer i database" });

    let synced = 0;
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const publishedAt = new Date(video.snippet.publishedAt).toISOString();
      const permalink = `https://www.youtube.com/shorts/${video.id}`;

      const { error: upsertError } = await supabase
        .from("youtube_videos")
        .upsert(
          {
            youtube_video_id: video.id,
            client_id: clientId,
            permalink,
            title: video.snippet.title || null,
            published_at: publishedAt,
            view_count: parseInt(video.statistics.viewCount || "0"),
            like_count: parseInt(video.statistics.likeCount || "0"),
            comment_count: parseInt(video.statistics.commentCount || "0"),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "youtube_video_id" }
        );

      if (!upsertError) synced++;

      emit({
        type: "progress",
        platform: "youtube",
        current: i + 1,
        total: videos.length,
      });
    }

    emit({
      type: "completed",
      platform: "youtube",
      synced,
      total: videos.length,
      message: `Synkroniserte ${synced} av ${videos.length} YouTube Shorts.`,
    });
  } catch (err) {
    emit({
      type: "failed",
      platform: "youtube",
      message: err instanceof Error ? err.message : "Ukjent feil",
    });
  }
}

export async function runFacebookSync(
  supabase: SupabaseClient,
  clientId: string,
  emit: Emit
): Promise<void> {
  emit({ type: "started", platform: "facebook" });
  const account = await getConnectedAccount(supabase, clientId, "facebook");
  if (!account || !account.platform_account_id) {
    emit({
      type: "skipped",
      platform: "facebook",
      message: "Ingen Facebook-side koblet til.",
    });
    return;
  }

  try {
    emit({ type: "phase", platform: "facebook", label: "Henter videoer" });

    const videos = await fetchFacebookPageVideos(
      account.access_token,
      account.platform_account_id,
      (progress) => {
        emit({
          type: "progress",
          platform: "facebook",
          current: progress.current,
          total: progress.total,
        });
      }
    );

    if (videos.length === 0) {
      emit({
        type: "completed",
        platform: "facebook",
        synced: 0,
        total: 0,
        message: "Ingen videoer funnet på Facebook-siden.",
      });
      return;
    }

    emit({ type: "phase", platform: "facebook", label: "Lagrer i database" });

    let synced = 0;
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const { error: upsertError } = await supabase
        .from("facebook_videos")
        .upsert(
          {
            facebook_video_id: video.id,
            client_id: clientId,
            permalink: video.permalink_url || null,
            title: video.title || video.description?.slice(0, 200) || null,
            posted_at: video.created_time,
            view_count: video.views || 0,
            like_count: video.likes || 0,
            comment_count: 0,
            share_count: 0,
          },
          { onConflict: "facebook_video_id" }
        );

      if (!upsertError) synced++;

      emit({
        type: "progress",
        platform: "facebook",
        current: i + 1,
        total: videos.length,
      });
    }

    emit({
      type: "completed",
      platform: "facebook",
      synced,
      total: videos.length,
      message: `Synkroniserte ${synced} av ${videos.length} Facebook-videoer.`,
    });
  } catch (err) {
    emit({
      type: "failed",
      platform: "facebook",
      message: err instanceof Error ? err.message : "Ukjent feil",
    });
  }
}

export async function runTikTokSync(
  supabase: SupabaseClient,
  clientId: string,
  emit: Emit
): Promise<void> {
  emit({ type: "started", platform: "tiktok" });
  const account = await getConnectedAccount(supabase, clientId, "tiktok");
  if (!account) {
    emit({
      type: "skipped",
      platform: "tiktok",
      message: "Ingen TikTok-konto koblet til.",
    });
    return;
  }

  try {
    emit({ type: "phase", platform: "tiktok", label: "Henter videoer" });

    const videos = await fetchTikTokVideos(account.access_token, (progress) => {
      emit({
        type: "progress",
        platform: "tiktok",
        current: progress.current,
        total: null,
      });
    });

    if (videos.length === 0) {
      emit({
        type: "completed",
        platform: "tiktok",
        synced: 0,
        total: 0,
        message: "Ingen videoer funnet på TikTok-kontoen.",
      });
      return;
    }

    emit({ type: "phase", platform: "tiktok", label: "Lagrer i database" });

    let synced = 0;
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const postedAt = new Date(video.create_time * 1000).toISOString();

      const { error: upsertError } = await supabase
        .from("tiktok_videos")
        .upsert(
          {
            tiktok_video_id: video.id,
            client_id: clientId,
            permalink: video.share_url || null,
            caption: video.title || null,
            posted_at: postedAt,
            view_count: video.view_count || 0,
            like_count: video.like_count || 0,
            comment_count: video.comment_count || 0,
            share_count: video.share_count || 0,
          },
          { onConflict: "tiktok_video_id" }
        );

      if (!upsertError) synced++;

      emit({
        type: "progress",
        platform: "tiktok",
        current: i + 1,
        total: videos.length,
      });
    }

    emit({
      type: "completed",
      platform: "tiktok",
      synced,
      total: videos.length,
      message: `Synkroniserte ${synced} av ${videos.length} TikTok-videoer.`,
    });
  } catch (err) {
    emit({
      type: "failed",
      platform: "tiktok",
      message: err instanceof Error ? err.message : "Ukjent feil",
    });
  }
}

export async function runInstagramSync(
  supabase: SupabaseClient,
  clientId: string,
  emit: Emit
): Promise<void> {
  emit({ type: "started", platform: "instagram" });
  const account = await getConnectedAccount(supabase, clientId, "instagram");
  if (!account || !account.platform_account_id) {
    emit({
      type: "skipped",
      platform: "instagram",
      message: "Ingen Instagram-konto koblet til.",
    });
    return;
  }

  try {
    emit({ type: "phase", platform: "instagram", label: "Henter media" });

    const mediaList = await fetchInstagramMedia(
      account.access_token,
      account.platform_account_id
    );

    const videoMedia = mediaList.filter(
      (m) => m.media_type === "VIDEO" || m.media_type === "REELS"
    );

    if (videoMedia.length === 0) {
      emit({
        type: "completed",
        platform: "instagram",
        synced: 0,
        total: 0,
        message: "Ingen video-/reel-poster funnet.",
      });
      return;
    }

    emit({
      type: "phase",
      platform: "instagram",
      label: "Henter visninger og lagrer",
    });

    let synced = 0;
    for (let i = 0; i < videoMedia.length; i++) {
      const media = videoMedia[i];
      const insights = await fetchMediaInsights(
        account.access_token,
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
          { onConflict: "instagram_media_id" }
        );

      if (!upsertError) synced++;

      emit({
        type: "progress",
        platform: "instagram",
        current: i + 1,
        total: videoMedia.length,
      });
    }

    emit({
      type: "completed",
      platform: "instagram",
      synced,
      total: videoMedia.length,
      message: `Synkroniserte ${synced} av ${videoMedia.length} Instagram-videoer.`,
    });
  } catch (err) {
    emit({
      type: "failed",
      platform: "instagram",
      message: err instanceof Error ? err.message : "Ukjent feil",
    });
  }
}
