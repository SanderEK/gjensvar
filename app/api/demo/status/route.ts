import { NextResponse } from "next/server";
import { requireActiveClient } from "@/app/actions/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/demo/status — midlertidig diagnose-endepunkt.
//
// Åpne i nettleseren mens du er innlogget for å se om den deployede appen
// faktisk leser DEMO_CLIENT_IDS, og om den aktive kundens ID matcher.
// Fjern denne filen når demoen fungerer.
export async function GET() {
  const auth = await requireActiveClient();
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, reason: auth.reason, message: auth.message },
      { status: 401 },
    );
  }

  const raw = process.env.DEMO_CLIENT_IDS ?? null;
  const demoClientIds = (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return NextResponse.json({
    ok: true,
    activeClientId: auth.clientId,
    demoSyncGlobal: process.env.DEMO_SYNC === "true",
    demoClientIdsRaw: raw,
    demoClientIdsParsed: demoClientIds,
    isDemoClient: demoClientIds.includes(auth.clientId),
  });
}
