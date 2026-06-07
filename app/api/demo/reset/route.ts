import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { requireActiveClient } from "@/app/actions/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/demo/reset
//
// Tømmer alle demo-rader (ID-er som starter med "demo-") for den aktive
// kunden, samt skjulte videoer og manuelle dato-overrides. Krever at den
// aktive kunden er eksplisitt listet i DEMO_CLIENT_IDS-miljøvariabelen –
// ellers nektes forespørselen. Dette gjør at endepunktet trygt kan ligge
// ute i produksjon uten å være en risiko for ekte kunder.
export async function POST() {
  const auth = await requireActiveClient();
  if (!auth.ok) {
    const status =
      auth.reason === "not_authenticated"
        ? 401
        : auth.reason === "not_member"
        ? 403
        : 400;
    return NextResponse.json({ error: auth.message }, { status });
  }
  const { clientId } = auth;

  const demoClientIds = (process.env.DEMO_CLIENT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!demoClientIds.includes(clientId)) {
    return NextResponse.json(
      { error: "Aktiv kunde er ikke en demo-kunde." },
      { status: 403 },
    );
  }

  const supabase = await getSupabaseServerClient();

  const tables: { table: string; idColumn: string }[] = [
    { table: "tiktok_videos", idColumn: "tiktok_video_id" },
    { table: "youtube_videos", idColumn: "youtube_video_id" },
    { table: "instagram_videos", idColumn: "instagram_media_id" },
    { table: "facebook_videos", idColumn: "facebook_video_id" },
    { table: "snapchat_videos", idColumn: "snapchat_video_id" },
  ];

  for (const { table, idColumn } of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("client_id", clientId)
      .like(idColumn, "demo-%");
    if (error) {
      console.error(`Demo-reset feilet for ${table}:`, error);
    }
  }

  await supabase.from("hidden_videos").delete().eq("client_id", clientId);
  await supabase
    .from("manual_video_overrides")
    .delete()
    .eq("client_id", clientId);

  return NextResponse.json({ ok: true });
}
