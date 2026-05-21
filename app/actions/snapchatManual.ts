"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { requireActiveClient } from "./clients";
import { revalidatePath } from "next/cache";

export interface SnapchatManualVideo {
  id: string;
  snapchat_video_id: string;
  caption: string | null;
  permalink: string | null;
  posted_at: string; // ISO timestamp
  view_count: number;
  screenshot_count: number;
  share_count: number;
}

export interface SnapchatManualInput {
  caption: string;
  postedAt: string; // YYYY-MM-DD
  views: number;
  screenshots: number;
  shares: number;
  permalink: string | null;
}

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function sanitizeNumber(input: unknown): number {
  const n = Number(input);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function sanitizeInput(
  input: SnapchatManualInput
): { ok: true; data: SnapchatManualInput } | { ok: false; error: string } {
  const caption = (input.caption || "").trim();
  if (caption.length > 500) {
    return { ok: false, error: "Tittelen er for lang (maks 500 tegn)" };
  }
  if (!isValidIsoDate(input.postedAt)) {
    return { ok: false, error: "Ugyldig dato (forventet YYYY-MM-DD)" };
  }
  const permalink =
    input.permalink && input.permalink.trim().length > 0
      ? input.permalink.trim()
      : null;
  if (permalink && !/^https?:\/\//i.test(permalink)) {
    return { ok: false, error: "Lenken må starte med http:// eller https://" };
  }
  return {
    ok: true,
    data: {
      caption,
      postedAt: input.postedAt,
      views: sanitizeNumber(input.views),
      screenshots: sanitizeNumber(input.screenshots),
      shares: sanitizeNumber(input.shares),
      permalink,
    },
  };
}

/**
 * Henter alle manuelt registrerte Snapchat-poster for den aktive kunden,
 * sortert etter publiseringsdato (nyeste først).
 */
export async function listSnapchatManualVideos(): Promise<
  SnapchatManualVideo[]
> {
  const ctx = await requireActiveClient();
  if (!ctx.ok) return [];

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("snapchat_videos")
    .select(
      "id, snapchat_video_id, caption, permalink, posted_at, view_count, screenshot_count, share_count"
    )
    .eq("client_id", ctx.clientId)
    .order("posted_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return [];
    console.error("Feil ved henting av manuelle Snapchat-poster:", error);
    return [];
  }

  return (data ?? []) as SnapchatManualVideo[];
}

/**
 * Oppretter en ny manuell Snapchat-post for den aktive kunden.
 * Genererer en intern video-id (manual-{uuid}) som brukes til å koble
 * mot hidden_videos / manual_video_overrides senere.
 */
export async function createSnapchatManualVideo(
  input: SnapchatManualInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const sanitized = sanitizeInput(input);
  if (!sanitized.ok) return sanitized;

  const ctx = await requireActiveClient();
  if (!ctx.ok) {
    return { ok: false, error: ctx.message };
  }

  const supabase = await getSupabaseServerClient();
  // Lagrer datoen som midnatt UTC for å matche resten av plattform-tabellene,
  // og slik at gruppering på dato (YYYY-MM-DD) treffer riktig dag.
  const postedAtIso = new Date(`${input.postedAt}T12:00:00Z`).toISOString();
  const snapchatVideoId = `manual-${crypto.randomUUID()}`;

  const { data, error } = await supabase
    .from("snapchat_videos")
    .insert({
      client_id: ctx.clientId,
      snapchat_video_id: snapchatVideoId,
      caption: sanitized.data.caption || null,
      permalink: sanitized.data.permalink,
      posted_at: postedAtIso,
      view_count: sanitized.data.views,
      screenshot_count: sanitized.data.screenshots,
      share_count: sanitized.data.shares,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Feil ved oppretting av Snapchat-post:", error);
    if (
      error.code === "42P01" ||
      (error.message && error.message.includes("does not exist"))
    ) {
      return {
        ok: false,
        error:
          "Tabellen «snapchat_videos» finnes ikke. Kjør migrasjonen 007_snapchat_videos.sql i Supabase.",
      };
    }
    if (
      error.code === "42703" ||
      (error.message && error.message.includes("column"))
    ) {
      return {
        ok: false,
        error: `Database-skjemaet er utdatert (${error.message}). Kjør migrasjonen 007_snapchat_videos.sql i Supabase.`,
      };
    }
    return {
      ok: false,
      error: error.message
        ? `Kunne ikke lagre: ${error.message}`
        : "Kunne ikke lagre Snapchat-posten",
    };
  }

  revalidatePath("/dashboard");
  return { ok: true, id: (data as { id: string }).id };
}

/**
 * Oppdaterer en eksisterende manuell Snapchat-post.
 */
export async function updateSnapchatManualVideo(
  id: string,
  input: SnapchatManualInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!id) {
    return { ok: false, error: "Mangler id" };
  }
  const sanitized = sanitizeInput(input);
  if (!sanitized.ok) return sanitized;

  const ctx = await requireActiveClient();
  if (!ctx.ok) {
    return { ok: false, error: ctx.message };
  }

  const supabase = await getSupabaseServerClient();
  const postedAtIso = new Date(`${input.postedAt}T12:00:00Z`).toISOString();

  const { error } = await supabase
    .from("snapchat_videos")
    .update({
      caption: sanitized.data.caption || null,
      permalink: sanitized.data.permalink,
      posted_at: postedAtIso,
      view_count: sanitized.data.views,
      screenshot_count: sanitized.data.screenshots,
      share_count: sanitized.data.shares,
    })
    .eq("id", id)
    .eq("client_id", ctx.clientId);

  if (error) {
    console.error("Feil ved oppdatering av Snapchat-post:", error);
    return { ok: false, error: "Kunne ikke oppdatere Snapchat-posten" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Sletter en manuell Snapchat-post permanent. Vi sletter også eventuelle
 * dato-overrides eller hidden-flagg som peker på den, slik at ingen ghost-data
 * blir liggende igjen.
 */
export async function deleteSnapchatManualVideo(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!id) {
    return { ok: false, error: "Mangler id" };
  }

  const ctx = await requireActiveClient();
  if (!ctx.ok) {
    return { ok: false, error: ctx.message };
  }

  const supabase = await getSupabaseServerClient();

  const { data: existing, error: lookupError } = await supabase
    .from("snapchat_videos")
    .select("snapchat_video_id")
    .eq("id", id)
    .eq("client_id", ctx.clientId)
    .maybeSingle();

  if (lookupError) {
    console.error("Feil ved oppslag av Snapchat-post:", lookupError);
    return { ok: false, error: "Kunne ikke slette Snapchat-posten" };
  }

  const { error } = await supabase
    .from("snapchat_videos")
    .delete()
    .eq("id", id)
    .eq("client_id", ctx.clientId);

  if (error) {
    console.error("Feil ved sletting av Snapchat-post:", error);
    return { ok: false, error: "Kunne ikke slette Snapchat-posten" };
  }

  if (existing?.snapchat_video_id) {
    await supabase
      .from("manual_video_overrides")
      .delete()
      .eq("client_id", ctx.clientId)
      .eq("platform", "snapchat")
      .eq("platform_video_id", existing.snapchat_video_id);

    await supabase
      .from("hidden_videos")
      .delete()
      .eq("client_id", ctx.clientId)
      .eq("platform", "snapchat")
      .eq("platform_video_id", existing.snapchat_video_id);
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
