"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { requireActiveClient } from "./clients";
import { revalidatePath } from "next/cache";

export interface HiddenVideo {
  id: string;
  client_id: string;
  platform: string;
  platform_video_id: string;
  hidden_at: string;
}

const VALID_PLATFORMS = new Set([
  "tiktok",
  "youtube",
  "instagram",
  "snapchat",
  "facebook",
]);

/**
 * Henter alle skjulte plattform-poster for den aktive kunden.
 * Returneres som et Set med "platform:videoId"-nøkler for raskt oppslag.
 */
export async function getHiddenVideosForActiveClient(
  clientId: string
): Promise<Set<string>> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("hidden_videos")
    .select("platform, platform_video_id")
    .eq("client_id", clientId);

  if (error) {
    console.error("Feil ved henting av skjulte videoer:", error);
    return new Set();
  }

  const set = new Set<string>();
  for (const row of (data || []) as Array<{
    platform: string;
    platform_video_id: string;
  }>) {
    set.add(`${row.platform}:${row.platform_video_id}`);
  }
  return set;
}

/**
 * Returnerer hele listen av skjulte poster for visning i modalen,
 * inkludert metadata fra plattform-tabellene (caption, posted_at osv.)
 * slik at brukeren kan vurdere om de vil gjenopprette en skjult video.
 */
export interface HiddenVideoListItem {
  platform: string;
  platformVideoId: string;
  hiddenAt: string;
  caption: string | null;
  permalink: string | null;
  postedAt: string | null;
  views: number;
}

export async function getHiddenVideoList(): Promise<HiddenVideoListItem[]> {
  const ctx = await requireActiveClient();
  if (!ctx.ok) return [];
  const clientId = ctx.clientId;

  const supabase = await getSupabaseServerClient();
  const { data: hidden, error } = await supabase
    .from("hidden_videos")
    .select("platform, platform_video_id, hidden_at")
    .eq("client_id", clientId)
    .order("hidden_at", { ascending: false });

  if (error || !hidden || hidden.length === 0) {
    if (error) console.error("Feil ved henting av skjult-liste:", error);
    return [];
  }

  // Slå opp metadata pr plattform i én batch hver.
  const byPlatform = new Map<string, string[]>();
  for (const row of hidden) {
    const list = byPlatform.get(row.platform) || [];
    list.push(row.platform_video_id);
    byPlatform.set(row.platform, list);
  }

  const metaMap = new Map<
    string,
    {
      caption: string | null;
      permalink: string | null;
      postedAt: string | null;
      views: number;
    }
  >();

  async function loadMeta(
    platform: string,
    table: string,
    idColumn: string,
    captionColumn: string | null,
    dateColumn: string,
    ids: string[]
  ) {
    if (ids.length === 0) return;
    const select = [
      idColumn,
      captionColumn || null,
      "permalink",
      dateColumn,
      "view_count",
    ]
      .filter(Boolean)
      .join(",");
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq("client_id", clientId)
      .in(idColumn, ids);
    if (error) {
      console.error(`Feil ved meta-oppslag for ${platform}:`, error);
      return;
    }
    for (const row of (data || []) as unknown as Array<
      Record<string, unknown>
    >) {
      const videoId = String(row[idColumn] ?? "");
      metaMap.set(`${platform}:${videoId}`, {
        caption: captionColumn
          ? ((row[captionColumn] as string | null) ?? null)
          : null,
        permalink: (row.permalink as string | null) ?? null,
        postedAt: (row[dateColumn] as string | null) ?? null,
        views: Number(row.view_count ?? 0),
      });
    }
  }

  await Promise.all([
    loadMeta(
      "instagram",
      "instagram_videos",
      "instagram_media_id",
      "caption",
      "posted_at",
      byPlatform.get("instagram") || []
    ),
    loadMeta(
      "tiktok",
      "tiktok_videos",
      "tiktok_video_id",
      "caption",
      "posted_at",
      byPlatform.get("tiktok") || []
    ),
    loadMeta(
      "youtube",
      "youtube_videos",
      "youtube_video_id",
      "title",
      "published_at",
      byPlatform.get("youtube") || []
    ),
    loadMeta(
      "facebook",
      "facebook_videos",
      "facebook_video_id",
      "title",
      "posted_at",
      byPlatform.get("facebook") || []
    ),
    loadMeta(
      "snapchat",
      "snapchat_videos",
      "snapchat_video_id",
      "caption",
      "posted_at",
      byPlatform.get("snapchat") || []
    ),
  ]);

  return hidden.map((row) => {
    const meta = metaMap.get(`${row.platform}:${row.platform_video_id}`);
    return {
      platform: row.platform,
      platformVideoId: row.platform_video_id,
      hiddenAt: row.hidden_at,
      caption: meta?.caption ?? null,
      permalink: meta?.permalink ?? null,
      postedAt: meta?.postedAt ?? null,
      views: meta?.views ?? 0,
    };
  });
}

/**
 * Skjuler en eller flere plattform-poster fra dashboard-oversikten.
 */
export async function hideVideos(
  videoIds: Array<{ platform: string; platformVideoId: string }>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const valid = videoIds.filter(
    (v) => VALID_PLATFORMS.has(v.platform) && v.platformVideoId
  );
  if (valid.length === 0) {
    return { ok: false, error: "Ingen videoer å skjule" };
  }

  const ctx = await requireActiveClient();
  if (!ctx.ok) {
    return { ok: false, error: ctx.message };
  }

  const supabase = await getSupabaseServerClient();
  const rows = valid.map((v) => ({
    client_id: ctx.clientId,
    platform: v.platform,
    platform_video_id: v.platformVideoId,
  }));

  const { error } = await supabase
    .from("hidden_videos")
    .upsert(rows, { onConflict: "client_id,platform,platform_video_id" });

  if (error) {
    console.error("Feil ved skjuling av videoer:", error);
    return { ok: false, error: "Kunne ikke skjule videoene" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Gjør en skjult plattform-post synlig igjen.
 */
export async function unhideVideo(
  platform: string,
  platformVideoId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!VALID_PLATFORMS.has(platform)) {
    return { ok: false, error: "Ukjent plattform" };
  }

  const ctx = await requireActiveClient();
  if (!ctx.ok) {
    return { ok: false, error: ctx.message };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("hidden_videos")
    .delete()
    .eq("client_id", ctx.clientId)
    .eq("platform", platform)
    .eq("platform_video_id", platformVideoId);

  if (error) {
    console.error("Feil ved gjenoppretting:", error);
    return { ok: false, error: "Kunne ikke gjenopprette videoen" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
