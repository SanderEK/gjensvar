"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { requireActiveClient } from "./clients";

const VIDEO_TABLES: Record<string, string> = {
  tiktok: "tiktok_videos",
  youtube: "youtube_videos",
  instagram: "instagram_videos",
  facebook: "facebook_videos",
  snapchat: "snapchat_videos",
};

export async function disconnectAccount(platform: string) {
  try {
    const auth = await requireActiveClient();
    if (!auth.ok) {
      return { success: false, message: auth.message };
    }
    const { clientId } = auth;

    const supabase = await getSupabaseServerClient();

    const videoTable = VIDEO_TABLES[platform];
    if (videoTable) {
      const { error: videoError } = await supabase
        .from(videoTable)
        .delete()
        .eq("client_id", clientId);

      if (videoError) {
        console.error(`Feil ved sletting av ${platform}-videoer:`, videoError);
      }
    }

    const { error } = await supabase
      .from("connected_accounts")
      .delete()
      .eq("client_id", clientId)
      .eq("platform", platform);

    if (error) {
      console.error(`Feil ved frakobling av ${platform}:`, error);
      return { success: false, message: `Kunne ikke koble fra ${platform}.` };
    }

    return {
      success: true,
      message: `${platform} ble koblet fra og data ble slettet.`,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Ukjent feil";
    return { success: false, message: errorMessage };
  }
}
