import { Suspense } from "react";
import { getSupabaseServerClient, getSupabaseAuthClient } from "@/lib/supabaseServer";
import {
  InstagramVideo,
  TikTokVideo,
  YouTubeVideo,
  SnapchatVideo,
  FacebookVideo,
  UnifiedVideoRow,
  VideoCategory,
  PlatformEntry,
} from "@/lib/types";
import { Topbar } from "@/components/Topbar";
import { DashboardContent } from "@/components/DashboardContent";
import { OnboardingPrompt } from "@/components/OnboardingPrompt";
import { StatusBanner } from "@/components/StatusBanner";
import { AuthFooter } from "@/components/auth/AuthCard";
import { getActiveClientId, getMyClients } from "@/app/actions/clients";
import {
  getManualOverridesForActiveClient,
  type ManualVideoOverride,
} from "@/app/actions/videoOverrides";
import { getHiddenVideosForActiveClient } from "@/app/actions/hiddenVideos";

export const dynamic = "force-dynamic";

// ---------- Data-henting ----------

async function getInstagramVideos(clientId?: string | null) {
  if (!clientId) return [];
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("instagram_videos")
    .select("id, instagram_media_id, caption, permalink, posted_at, view_count, like_count")
    .eq("client_id", clientId)
    .order("posted_at", { ascending: false });

  if (error) {
    console.error("Feil ved henting av Instagram-videoer:", error);
    return [];
  }

  return (data ?? []) as InstagramVideo[];
}

async function getTikTokVideos(clientId?: string | null) {
  if (!clientId) return [];
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("tiktok_videos")
    .select("*")
    .eq("client_id", clientId)
    .order("posted_at", { ascending: false });

  if (error) {
    console.error("Feil ved henting av TikTok-videoer:", error);
    return [];
  }

  return (data ?? []) as TikTokVideo[];
}

async function getYouTubeVideos(clientId?: string | null) {
  if (!clientId) return [];
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("youtube_videos")
    .select("*")
    .eq("client_id", clientId)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Feil ved henting av YouTube-videoer:", error);
    return [];
  }

  return (data ?? []) as YouTubeVideo[];
}

async function getSnapchatVideos(clientId?: string | null) {
  if (!clientId) return [];
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("snapchat_videos")
    .select("*")
    .eq("client_id", clientId)
    .order("posted_at", { ascending: false });

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      console.log("snapchat_videos tabell eksisterer ikke ennå");
      return [];
    }
    console.error("Feil ved henting av Snapchat-videoer:", error);
    return [];
  }

  return (data ?? []) as SnapchatVideo[];
}

async function getFacebookVideos(clientId?: string | null) {
  if (!clientId) return [];
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("facebook_videos")
    .select("*")
    .eq("client_id", clientId)
    .order("posted_at", { ascending: false });

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      console.log("facebook_videos tabell eksisterer ikke ennå");
      return [];
    }
    console.error("Feil ved henting av Facebook-videoer:", error);
    return [];
  }

  return (data ?? []) as FacebookVideo[];
}

interface UnifiedVideoMeta {
  customTitle: string | null;
  categoryId: string | null;
  categoryId2: string | null;
}

async function getUnifiedVideoMeta(clientId?: string | null) {
  if (!clientId) return new Map<string, UnifiedVideoMeta>();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("unified_videos")
    .select("date, custom_title, category_id, category_id_2")
    .eq("client_id", clientId);

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      console.log(
        "unified_videos tabell eksisterer ikke ennå - hopper over custom titles"
      );
      return new Map<string, UnifiedVideoMeta>();
    }
    console.error("Feil ved henting av unified video meta:", error);
    return new Map<string, UnifiedVideoMeta>();
  }

  return new Map(
    (data ?? []).map((row: { date: string; custom_title: string | null; category_id: string | null; category_id_2: string | null }) => [
      row.date,
      { customTitle: row.custom_title, categoryId: row.category_id, categoryId2: row.category_id_2 } as UnifiedVideoMeta,
    ])
  );
}

async function getCategories(clientId?: string | null): Promise<VideoCategory[]> {
  if (!clientId) return [];
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("video_categories")
    .select("id, name, color")
    .eq("client_id", clientId)
    .order("name", { ascending: true });

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      console.log("video_categories tabell eksisterer ikke ennå");
      return [];
    }
    console.error("Feil ved henting av kategorier:", error);
    return [];
  }

  return (data ?? []) as VideoCategory[];
}

export interface ConnectedAccountInfo {
  platform: string;
  platform_username: string | null;
  connected_at: string;
}

async function getConnectedAccounts(clientId?: string | null): Promise<ConnectedAccountInfo[]> {
  if (!clientId) return [];
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("connected_accounts")
    .select("platform, platform_username, updated_at")
    .eq("client_id", clientId);

  if (error) {
    console.error("Feil ved henting av connected accounts:", error);
    return [];
  }

  return (data ?? []).map((a: { platform: string; platform_username: string | null; updated_at: string }) => ({
    platform: a.platform,
    platform_username: a.platform_username,
    connected_at: a.updated_at,
  }));
}

// ---------- Matching-logikk ----------

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function toDateKey(isoString: string | null): string | null {
  if (!isoString) return null;
  return isoString.slice(0, 10);
}

function buildUnifiedRows(
  instagramVideos: InstagramVideo[],
  youtubeVideos: YouTubeVideo[],
  tiktokVideos: TikTokVideo[],
  snapchatVideos: SnapchatVideo[],
  facebookVideos: FacebookVideo[],
  videoMeta: Map<string, UnifiedVideoMeta>,
  categories: VideoCategory[],
  overrides: Map<string, ManualVideoOverride>
): UnifiedVideoRow[] {
  const rowMap = new Map<string, UnifiedVideoRow>();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  function getOrCreateRow(dateKey: string, title: string, customTitle: string | null): UnifiedVideoRow {
    const existing = rowMap.get(dateKey);
    if (existing) return existing;
    const d = new Date(dateKey + "T00:00:00");
    const meta = videoMeta.get(dateKey);
    const cat = meta?.categoryId ? categoryMap.get(meta.categoryId) : null;
    const cat2 = meta?.categoryId2 ? categoryMap.get(meta.categoryId2) : null;
    const row: UnifiedVideoRow = {
      date: dateKey,
      month: MONTH_NAMES[d.getMonth()] ?? "",
      title: customTitle || title || "Uten tittel",
      customTitle: customTitle,
      categoryId: cat?.id ?? null,
      categoryName: cat?.name ?? null,
      categoryColor: cat?.color ?? null,
      categoryId2: cat2?.id ?? null,
      categoryName2: cat2?.name ?? null,
      categoryColor2: cat2?.color ?? null,
      tiktok: null, youtube: null, instagram: null, snapchat: null, facebook: null,
      total: 0,
      totalLikes: 0,
    };
    rowMap.set(dateKey, row);
    return row;
  }

  /**
   * Returnerer datokey-en denne plattformposten skal grupperes på og den
   * opprinnelige datoen hvis posten har en manuell override.
   */
  function resolveDateKey(
    platform: string,
    platformVideoId: string,
    rawTimestamp: string | null
  ): { dateKey: string | null; overriddenFrom: string | null } {
    const originalKey = toDateKey(rawTimestamp);
    const override = overrides.get(`${platform}:${platformVideoId}`);
    if (override) {
      return { dateKey: override.virtual_date, overriddenFrom: originalKey };
    }
    return { dateKey: originalKey, overriddenFrom: null };
  }

  /**
   * Akkumulerer views/likes for en plattformcelle når flere videoer er
   * postet samme dato på samme plattform. Permalink/platformVideoId og
   * override-info beholdes fra videoen med flest visninger.
   */
  function mergePlatformEntry(
    existing: PlatformEntry | null,
    next: { views: number; likes: number; permalink: string | null; platformVideoId: string; overriddenFromDate: string | null },
  ): PlatformEntry {
    if (!existing) {
      return { ...next };
    }
    const useNextMeta = next.views > existing.views;
    return {
      views: existing.views + next.views,
      likes: existing.likes + next.likes,
      permalink: useNextMeta ? next.permalink : existing.permalink,
      platformVideoId: useNextMeta ? next.platformVideoId : existing.platformVideoId,
      overriddenFromDate: useNextMeta ? next.overriddenFromDate : existing.overriddenFromDate,
    };
  }

  for (const video of instagramVideos) {
    const { dateKey, overriddenFrom } = resolveDateKey(
      "instagram",
      video.instagram_media_id,
      video.posted_at
    );
    if (!dateKey) continue;
    const customTitle = videoMeta.get(dateKey)?.customTitle || null;
    const row = getOrCreateRow(dateKey, video.caption || "Uten tittel", customTitle);
    const likes = video.like_count ?? 0;
    row.instagram = mergePlatformEntry(row.instagram, {
      views: video.view_count,
      likes,
      permalink: video.permalink,
      platformVideoId: video.instagram_media_id,
      overriddenFromDate: overriddenFrom,
    });
    row.total += video.view_count;
    row.totalLikes += likes;
    if (row.title === "Uten tittel" && video.caption) row.title = video.caption;
    if (customTitle) { row.customTitle = customTitle; row.title = customTitle; }
  }

  for (const video of youtubeVideos) {
    const { dateKey, overriddenFrom } = resolveDateKey(
      "youtube",
      video.youtube_video_id,
      video.published_at
    );
    if (!dateKey) continue;
    const customTitle = videoMeta.get(dateKey)?.customTitle || null;
    const row = getOrCreateRow(dateKey, video.title || "Uten tittel", customTitle);
    const likes = video.like_count ?? 0;
    row.youtube = mergePlatformEntry(row.youtube, {
      views: video.view_count,
      likes,
      permalink: video.permalink,
      platformVideoId: video.youtube_video_id,
      overriddenFromDate: overriddenFrom,
    });
    row.total += video.view_count;
    row.totalLikes += likes;
    if (row.title === "Uten tittel" && video.title) row.title = video.title;
    if (customTitle) { row.customTitle = customTitle; row.title = customTitle; }
  }

  for (const video of tiktokVideos) {
    const { dateKey, overriddenFrom } = resolveDateKey(
      "tiktok",
      video.tiktok_video_id,
      video.posted_at
    );
    if (!dateKey) continue;
    const customTitle = videoMeta.get(dateKey)?.customTitle || null;
    const row = getOrCreateRow(dateKey, video.caption || "Uten tittel", customTitle);
    const likes = video.like_count ?? 0;
    row.tiktok = mergePlatformEntry(row.tiktok, {
      views: video.view_count,
      likes,
      permalink: video.permalink,
      platformVideoId: video.tiktok_video_id,
      overriddenFromDate: overriddenFrom,
    });
    row.total += video.view_count;
    row.totalLikes += likes;
    if (row.title === "Uten tittel" && video.caption) row.title = video.caption;
    if (customTitle) { row.customTitle = customTitle; row.title = customTitle; }
  }

  for (const video of snapchatVideos) {
    const { dateKey, overriddenFrom } = resolveDateKey(
      "snapchat",
      video.snapchat_video_id,
      video.posted_at
    );
    if (!dateKey) continue;
    const customTitle = videoMeta.get(dateKey)?.customTitle || null;
    const row = getOrCreateRow(dateKey, video.caption || "Uten tittel", customTitle);
    const likes = video.screenshot_count ?? 0;
    row.snapchat = mergePlatformEntry(row.snapchat, {
      views: video.view_count,
      likes,
      permalink: video.permalink,
      platformVideoId: video.snapchat_video_id,
      overriddenFromDate: overriddenFrom,
    });
    row.total += video.view_count;
    row.totalLikes += likes;
    if (row.title === "Uten tittel" && video.caption) row.title = video.caption;
    if (customTitle) { row.customTitle = customTitle; row.title = customTitle; }
  }

  for (const video of facebookVideos) {
    const { dateKey, overriddenFrom } = resolveDateKey(
      "facebook",
      video.facebook_video_id,
      video.posted_at
    );
    if (!dateKey) continue;
    const customTitle = videoMeta.get(dateKey)?.customTitle || null;
    const row = getOrCreateRow(dateKey, video.title || "Uten tittel", customTitle);
    const likes = video.like_count ?? 0;
    row.facebook = mergePlatformEntry(row.facebook, {
      views: video.view_count,
      likes,
      permalink: video.permalink,
      platformVideoId: video.facebook_video_id,
      overriddenFromDate: overriddenFrom,
    });
    row.total += video.view_count;
    row.totalLikes += likes;
    if (row.title === "Uten tittel" && video.title) row.title = video.title;
    if (customTitle) { row.customTitle = customTitle; row.title = customTitle; }
  }

  return Array.from(rowMap.values()).sort((a, b) => b.date.localeCompare(a.date));
}

// ---------- Side ----------

export default async function DashboardPage() {
  const supabaseAuth = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  const clients = await getMyClients();
  const hasClients = clients.length > 0;

  // Sjekk at active_client_id-cookien faktisk peker på en kunde brukeren
  // er medlem av – hvis ikke, fall tilbake til første gyldige kunde.
  // Hindrer at en manipulert cookie viser data fra andre kunder.
  const cookieClientId = await getActiveClientId();
  const validClientIds = new Set(clients.map((c) => c.id));
  let clientId: string | null = null;

  if (cookieClientId && validClientIds.has(cookieClientId)) {
    clientId = cookieClientId;
  } else if (hasClients) {
    clientId = clients[0].id;
  }

  if (!hasClients || !clientId) {
    return (
      <div className="relative min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#0a0a0a] dark:text-zinc-50">
        <Topbar
          connectedAccounts={[]}
          userEmail={user?.email || null}
          clients={clients}
          activeClientId={null}
        />
        <main className="flex min-h-[calc(100vh-64px)] flex-col px-6">
          <Suspense fallback={null}>
            <StatusBanner />
          </Suspense>
          <div className="flex flex-1 items-center justify-center">
            <OnboardingPrompt />
          </div>
        </main>
      </div>
    );
  }

  const [instagramVideosAll, youtubeVideosAll, tiktokVideosAll, snapchatVideosAll, facebookVideosAll, videoMeta, categories, connectedAccountsData, overrides, hiddenSet] =
    await Promise.all([
      getInstagramVideos(clientId),
      getYouTubeVideos(clientId),
      getTikTokVideos(clientId),
      getSnapchatVideos(clientId),
      getFacebookVideos(clientId),
      getUnifiedVideoMeta(clientId),
      getCategories(clientId),
      getConnectedAccounts(clientId),
      getManualOverridesForActiveClient(clientId),
      getHiddenVideosForActiveClient(clientId),
    ]);

  const instagramVideos = instagramVideosAll.filter(
    (v) => !hiddenSet.has(`instagram:${v.instagram_media_id}`)
  );
  const youtubeVideos = youtubeVideosAll.filter(
    (v) => !hiddenSet.has(`youtube:${v.youtube_video_id}`)
  );
  const tiktokVideos = tiktokVideosAll.filter(
    (v) => !hiddenSet.has(`tiktok:${v.tiktok_video_id}`)
  );
  const snapchatVideos = snapchatVideosAll.filter(
    (v) => !hiddenSet.has(`snapchat:${v.snapchat_video_id}`)
  );
  const facebookVideos = facebookVideosAll.filter(
    (v) => !hiddenSet.has(`facebook:${v.facebook_video_id}`)
  );

  const hiddenCount = hiddenSet.size;

  const rows = buildUnifiedRows(
    instagramVideos,
    youtubeVideos,
    tiktokVideos,
    snapchatVideos,
    facebookVideos,
    videoMeta,
    categories,
    overrides
  );

  const activeClient = clients.find((c) => c.id === clientId) ?? null;
  const activeClientName = activeClient?.name ?? null;
  const activeClientReportBrand = activeClient?.reportBrand ?? null;

  return (
    <div className="relative min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#0a0a0a] dark:text-zinc-50">
      <Topbar
        connectedAccounts={connectedAccountsData}
        userEmail={user?.email || null}
        clients={clients}
        activeClientId={clientId}
        snapchatManualCount={snapchatVideosAll.length}
      />
      <main className="px-6 py-10">
        <Suspense fallback={null}>
          <StatusBanner />
        </Suspense>
        <div className="mx-auto max-w-[1600px] space-y-8">
          <DashboardContent
            rows={rows}
            categories={categories}
            hiddenCount={hiddenCount}
            activeClientId={clientId}
            activeClientName={activeClientName}
            activeClientReportBrand={activeClientReportBrand}
            isSynced={connectedAccountsData.length > 0}
          />
        </div>
      </main>
      <div className="mx-auto max-w-[1600px]">
        <AuthFooter />
      </div>
    </div>
  );
}
