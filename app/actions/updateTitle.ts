"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { requireActiveClient } from "./clients";

export async function updateVideoTitle(date: string, newTitle: string) {
  try {
    const auth = await requireActiveClient();
    if (!auth.ok) {
      return { success: false, message: auth.message };
    }
    const { clientId } = auth;

    const supabase = await getSupabaseServerClient();

    const { error } = await supabase
      .from("unified_videos")
      .upsert(
        {
          client_id: clientId,
          date: date,
          custom_title: newTitle,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "client_id,date",
        }
      );

    if (error) {
      console.error("Feil ved lagring av tittel:", error);
      return { success: false, message: "Kunne ikke lagre tittel." };
    }

    return { success: true, message: "Tittel oppdatert." };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil";
    console.error("updateVideoTitle feilet:", errorMessage);
    return { success: false, message: `Feil: ${errorMessage}` };
  }
}
