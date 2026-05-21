import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { requireActiveClient } from "@/app/actions/clients";
import {
  Emit,
  Platform,
  SyncEvent,
  runFacebookSync,
  runInstagramSync,
  runTikTokSync,
  runYouTubeSync,
} from "@/lib/syncRunner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLATFORMS: Platform[] = ["instagram", "youtube", "tiktok", "facebook"];

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

  const supabase = await getSupabaseServerClient();

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: SyncEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      const emit: Emit = (event) => {
        try {
          send(event);
        } catch (err) {
          console.error("Stream emit feilet:", err);
        }
      };

      const runners: Record<Platform, () => Promise<void>> = {
        instagram: () => runInstagramSync(supabase, clientId, emit),
        youtube: () => runYouTubeSync(supabase, clientId, emit),
        tiktok: () => runTikTokSync(supabase, clientId, emit),
        facebook: () => runFacebookSync(supabase, clientId, emit),
      };

      // Kjør alle plattformer i parallell – egen progress per plattform.
      await Promise.allSettled(PLATFORMS.map((p) => runners[p]()));

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
