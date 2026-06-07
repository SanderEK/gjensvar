// Demo-modus for synkronisering. Når DEMO_SYNC=true er satt i miljøet bruker
// /api/sync denne i stedet for de ekte plattform-runnerne. Den simulerer
// nøyaktig samme SyncEvent-strøm som den ekte synken (started → phase →
// progress → completed) slik at progress-dialogen oppfører seg helt likt.
//
// Genererer 110 "kampanjer" jevnt fordelt over de siste 365 dagene. Hver
// kampanje publiseres på alle fem plattformene, slik at samme dato dukker
// opp overalt i unified-tabellen og cross-platform-matching ser realistisk
// ut i demoen.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Emit, Platform } from "./syncRunner";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const TITLES = [
  "Ny lansering — ute nå!",
  "Bak kulissene fra forrige uke",
  "Vi prøvde noe nytt i dag",
  "Tre tips du burde kjenne til",
  "Da alt nesten gikk galt",
  "Møt teamet vårt",
  "Quick wins for hverdagen",
  "Rask tutorial: hvordan vi løste det",
  "Throwback til forrige måned",
  "Spørsmålet vi får oftest",
  "Slik gjør du det selv",
  "Helgens høydepunkt",
  "En dag på kontoret",
  "Q&A: spørsmål fra følgerne",
  "Topp 5 verktøy vi bruker",
  "Test: ny strategi for innhold",
  "Behind the scenes",
  "Highlights fra forrige måned",
  "Gjør slik om du står fast",
  "Det vi lærte i fjor",
  "Helgens beste øyeblikk",
  "Ny artikkel ute nå",
  "Inspirasjon til uka som kommer",
  "Slik var lanseringen",
  "Stor takk til kundene våre",
  "Vi feirer en milepæl",
  "Bli med på reisen videre",
  "Ny case-studie publisert",
  "Sjekk ut den nye videoen vår",
  "Mini-tutorial for begynnere",
];

const ALL_PLATFORMS = [
  "instagram",
  "youtube",
  "tiktok",
  "facebook",
  "snapchat",
] as const;
type AnyPlatform = (typeof ALL_PLATFORMS)[number];

const DASHBOARD_PLATFORMS: Platform[] = [
  "instagram",
  "youtube",
  "tiktok",
  "facebook",
];

interface CampaignPost {
  date: Date;
  title: string;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function randomId(prefix: string): string {
  const chars = "abcdef0123456789";
  let s = prefix;
  for (let i = 0; i < 20; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

const CAMPAIGN_COUNT = 110;

function planCampaigns(): Record<AnyPlatform, CampaignPost[]> {
  const dayMs = 86_400_000;
  const now = Date.now();
  const result: Record<AnyPlatform, CampaignPost[]> = {
    instagram: [],
    youtube: [],
    tiktok: [],
    facebook: [],
    snapchat: [],
  };

  // 110 kampanjer fordelt jevnt over 365 dager. Hver kampanje publiseres
  // på alle fem plattformer slik at unified-tabellen alltid har full bredde.
  for (let i = 0; i < CAMPAIGN_COUNT; i++) {
    const baseDay = Math.floor((365 / CAMPAIGN_COUNT) * i) + randInt(0, 2);
    const ts =
      now -
      baseDay * dayMs -
      randInt(8, 22) * 3_600_000 -
      randInt(0, 59) * 60_000;
    const date = new Date(ts);
    const title = pick(TITLES);
    for (const p of ALL_PLATFORMS) {
      result[p].push({ date, title });
    }
  }

  return result;
}

async function insertInstagram(
  supabase: SupabaseClient,
  clientId: string,
  post: CampaignPost,
): Promise<void> {
  await supabase
    .from("instagram_videos")
    .upsert(
      {
        instagram_media_id: randomId("demo-instagram-"),
        client_id: clientId,
        caption: post.title,
        permalink: `https://www.instagram.com/reel/${randomId("")}`,
        posted_at: post.date.toISOString(),
        view_count: randInt(400, 30_000),
        like_count: randInt(15, 2_000),
      },
      { onConflict: "instagram_media_id" },
    );
}

async function insertYouTube(
  supabase: SupabaseClient,
  clientId: string,
  post: CampaignPost,
): Promise<void> {
  await supabase
    .from("youtube_videos")
    .upsert(
      {
        youtube_video_id: randomId("demo-youtube-"),
        client_id: clientId,
        title: post.title,
        permalink: `https://www.youtube.com/shorts/${randomId("")}`,
        published_at: post.date.toISOString(),
        view_count: randInt(500, 25_000),
        like_count: randInt(20, 1_500),
        comment_count: randInt(0, 80),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "youtube_video_id" },
    );
}

async function insertTikTok(
  supabase: SupabaseClient,
  clientId: string,
  post: CampaignPost,
): Promise<void> {
  await supabase
    .from("tiktok_videos")
    .upsert(
      {
        tiktok_video_id: randomId("demo-tiktok-"),
        client_id: clientId,
        caption: post.title,
        permalink: `https://www.tiktok.com/@demo/video/${randInt(
          1_000_000,
          9_999_999,
        )}`,
        posted_at: post.date.toISOString(),
        view_count: randInt(300, 80_000),
        like_count: randInt(10, 4_000),
        comment_count: randInt(0, 200),
        share_count: randInt(0, 500),
      },
      { onConflict: "tiktok_video_id" },
    );
}

async function insertFacebook(
  supabase: SupabaseClient,
  clientId: string,
  post: CampaignPost,
): Promise<void> {
  await supabase
    .from("facebook_videos")
    .upsert(
      {
        facebook_video_id: randomId("demo-facebook-"),
        client_id: clientId,
        permalink: `https://www.facebook.com/watch?v=${randInt(
          100_000,
          999_999,
        )}`,
        title: post.title,
        posted_at: post.date.toISOString(),
        view_count: randInt(200, 18_000),
        like_count: randInt(8, 1_200),
        comment_count: randInt(0, 70),
        share_count: randInt(0, 200),
      },
      { onConflict: "facebook_video_id" },
    );
}

async function insertSnapchat(
  supabase: SupabaseClient,
  clientId: string,
  post: CampaignPost,
): Promise<void> {
  await supabase.from("snapchat_videos").insert({
    snapchat_video_id: randomId("demo-snapchat-"),
    client_id: clientId,
    caption: post.title,
    posted_at: post.date.toISOString(),
    view_count: randInt(150, 12_000),
    screenshot_count: randInt(0, 600),
    share_count: randInt(0, 150),
  });
}

const INSERTERS: Record<
  AnyPlatform,
  (s: SupabaseClient, c: string, p: CampaignPost) => Promise<void>
> = {
  instagram: insertInstagram,
  youtube: insertYouTube,
  tiktok: insertTikTok,
  facebook: insertFacebook,
  snapchat: insertSnapchat,
};

const FETCH_PHASE: Record<Platform, string> = {
  instagram: "Henter media",
  youtube: "Henter kanal",
  tiktok: "Henter videoer",
  facebook: "Henter videoer",
};

const SAVE_PHASE: Record<Platform, string> = {
  instagram: "Henter visninger og lagrer",
  youtube: "Lagrer i database",
  tiktok: "Lagrer i database",
  facebook: "Lagrer i database",
};

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  youtube: "YouTube Shorts",
  tiktok: "TikTok",
  facebook: "Facebook",
};

async function runPlatformDemo(
  platform: Platform,
  posts: CampaignPost[],
  supabase: SupabaseClient,
  clientId: string,
  emit: Emit,
): Promise<void> {
  emit({ type: "started", platform });
  await sleep(200 + Math.random() * 300);

  emit({ type: "phase", platform, label: FETCH_PHASE[platform] });
  await sleep(700 + Math.random() * 600);

  if (posts.length === 0) {
    emit({
      type: "completed",
      platform,
      synced: 0,
      total: 0,
      message: "Ingen videoer funnet.",
    });
    return;
  }

  emit({ type: "phase", platform, label: SAVE_PHASE[platform] });

  const insert = INSERTERS[platform];
  for (let i = 0; i < posts.length; i++) {
    await insert(supabase, clientId, posts[i]);
    emit({
      type: "progress",
      platform,
      current: i + 1,
      total: posts.length,
    });
    await sleep(30 + Math.random() * 60);
  }

  emit({
    type: "completed",
    platform,
    synced: posts.length,
    total: posts.length,
    message: `Synkroniserte ${posts.length} av ${posts.length} ${PLATFORM_LABEL[platform]}-videoer.`,
  });
}

async function seedSnapchatSilently(
  posts: CampaignPost[],
  supabase: SupabaseClient,
  clientId: string,
): Promise<void> {
  // Snapchat har ingen public API, så det vises ikke i progress-dialogen.
  // Vi seeder data i bakgrunnen så Snapchat-kolonnen i tabellen fylles ut.
  for (const post of posts) {
    await insertSnapchat(supabase, clientId, post);
  }
}

export async function runDemoSync(
  supabase: SupabaseClient,
  clientId: string,
  emit: Emit,
): Promise<void> {
  const plan = planCampaigns();

  await Promise.all([
    ...DASHBOARD_PLATFORMS.map((p) =>
      runPlatformDemo(p, plan[p], supabase, clientId, emit),
    ),
    seedSnapchatSilently(plan.snapchat, supabase, clientId),
  ]);
}
