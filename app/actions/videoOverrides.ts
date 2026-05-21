"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { requireActiveClient } from "./clients";
import { revalidatePath } from "next/cache";

export interface ManualVideoOverride {
  id: string;
  client_id: string;
  platform: string;
  platform_video_id: string;
  virtual_date: string; // YYYY-MM-DD
  created_at: string;
}

const VALID_PLATFORMS = new Set([
  "tiktok",
  "youtube",
  "instagram",
  "snapchat",
  "facebook",
]);

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Henter alle manuelle dato-overrides for den aktive kunden.
 * Returneres som en map { "platform:videoId" -> ManualVideoOverride }
 * for raskt oppslag i buildUnifiedRows.
 */
export async function getManualOverridesForActiveClient(
  clientId: string
): Promise<Map<string, ManualVideoOverride>> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("manual_video_overrides")
    .select("*")
    .eq("client_id", clientId);

  if (error) {
    console.error("Feil ved henting av video-overrides:", error);
    return new Map();
  }

  const map = new Map<string, ManualVideoOverride>();
  for (const row of (data || []) as ManualVideoOverride[]) {
    map.set(`${row.platform}:${row.platform_video_id}`, row);
  }
  return map;
}

/**
 * Setter (eller oppdaterer) en manuell virtuell dato for en plattform-post.
 */
export async function setVideoOverride(
  platform: string,
  platformVideoId: string,
  virtualDate: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!VALID_PLATFORMS.has(platform)) {
    return { ok: false, error: "Ukjent plattform" };
  }
  if (!platformVideoId) {
    return { ok: false, error: "Mangler video-id" };
  }
  if (!isValidIsoDate(virtualDate)) {
    return { ok: false, error: "Ugyldig dato (forventet YYYY-MM-DD)" };
  }

  const ctx = await requireActiveClient();
  if (!ctx.ok) {
    return { ok: false, error: ctx.message };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("manual_video_overrides")
    .upsert(
      {
        client_id: ctx.clientId,
        platform,
        platform_video_id: platformVideoId,
        virtual_date: virtualDate,
      },
      { onConflict: "client_id,platform,platform_video_id" }
    );

  if (error) {
    console.error("Feil ved lagring av video-override:", error);
    return { ok: false, error: "Kunne ikke lagre overstyringen" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Fjerner en manuell virtuell dato for en plattform-post (tilbakestiller
 * til opprinnelig publiseringsdato).
 */
export async function removeVideoOverride(
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
    .from("manual_video_overrides")
    .delete()
    .eq("client_id", ctx.clientId)
    .eq("platform", platform)
    .eq("platform_video_id", platformVideoId);

  if (error) {
    console.error("Feil ved fjerning av video-override:", error);
    return { ok: false, error: "Kunne ikke fjerne overstyringen" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Fjerner overrides for en gitt liste av plattform-IDer. Brukes til å
 * angre en hel sammenslåing i ett klikk fra rad-menyen.
 */
export async function removeOverridesForPlatforms(
  videoIds: Array<{ platform: string; platformVideoId: string }>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await requireActiveClient();
  if (!ctx.ok) {
    return { ok: false, error: ctx.message };
  }

  const valid = videoIds.filter(
    (v) => VALID_PLATFORMS.has(v.platform) && v.platformVideoId
  );
  if (valid.length === 0) {
    return { ok: true };
  }

  const supabase = await getSupabaseServerClient();
  for (const v of valid) {
    const { error } = await supabase
      .from("manual_video_overrides")
      .delete()
      .eq("client_id", ctx.clientId)
      .eq("platform", v.platform)
      .eq("platform_video_id", v.platformVideoId);
    if (error) {
      console.error("Feil ved fjerning av video-override:", error);
      return { ok: false, error: "Kunne ikke fjerne alle overstyringene" };
    }
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Slår sammen alle plattform-poster fra én dato (sourceDate) inn i en
 * annen dato (targetDate) ved å sette virtuell dato på hver plattform-id
 * som tilhører source-dato. Brukes av "Slå sammen rader"-knappen.
 */
export async function mergeRowIntoDate(
  sourceDate: string,
  targetDate: string,
  videoIdsBySource: Array<{ platform: string; platformVideoId: string }>
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isValidIsoDate(sourceDate) || !isValidIsoDate(targetDate)) {
    return { ok: false, error: "Ugyldig dato" };
  }
  if (sourceDate === targetDate) {
    return { ok: false, error: "Kilde og mål er samme dato" };
  }

  const ctx = await requireActiveClient();
  if (!ctx.ok) {
    return { ok: false, error: ctx.message };
  }

  const rows = videoIdsBySource
    .filter((v) => VALID_PLATFORMS.has(v.platform) && v.platformVideoId)
    .map((v) => ({
      client_id: ctx.clientId,
      platform: v.platform,
      platform_video_id: v.platformVideoId,
      virtual_date: targetDate,
    }));

  if (rows.length === 0) {
    return { ok: false, error: "Ingen plattform-poster å flytte" };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("manual_video_overrides")
    .upsert(rows, { onConflict: "client_id,platform,platform_video_id" });

  if (error) {
    console.error("Feil ved sammenslåing av rader:", error);
    return { ok: false, error: "Kunne ikke slå sammen radene" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
