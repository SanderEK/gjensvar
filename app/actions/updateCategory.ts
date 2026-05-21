"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { requireActiveClient } from "./clients";

export async function updateVideoCategory(date: string, slot: 1 | 2, categoryId: string | null) {
  try {
    const auth = await requireActiveClient();
    if (!auth.ok) {
      return { success: false, message: auth.message };
    }
    const { clientId } = auth;

    const supabase = await getSupabaseServerClient();

    const columnName = slot === 1 ? "category_id" : "category_id_2";

    const { error } = await supabase
      .from("unified_videos")
      .upsert(
        {
          client_id: clientId,
          date: date,
          [columnName]: categoryId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "client_id,date",
        }
      );

    if (error) {
      console.error("Feil ved lagring av kategori:", error);
      return { success: false, message: "Kunne ikke lagre kategori." };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil";
    console.error("updateVideoCategory feilet:", errorMessage);
    return { success: false, message: `Feil: ${errorMessage}` };
  }
}

export async function createCategory(name: string, color: string) {
  try {
    const auth = await requireActiveClient();
    if (!auth.ok) {
      return { success: false, message: auth.message, category: null };
    }
    const { clientId } = auth;

    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from("video_categories")
      .insert({
        client_id: clientId,
        name: name.trim(),
        color,
      })
      .select("id, name, color")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "Kategorien finnes allerede.", category: null };
      }
      console.error("Feil ved opprettelse av kategori:", error);
      return { success: false, message: "Kunne ikke opprette kategori.", category: null };
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Kategori opprettet.", category: data };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil";
    console.error("createCategory feilet:", errorMessage);
    return { success: false, message: `Feil: ${errorMessage}`, category: null };
  }
}

export async function deleteCategory(id: string) {
  try {
    const auth = await requireActiveClient();
    if (!auth.ok) {
      return { success: false, message: auth.message };
    }
    const { clientId } = auth;

    const supabase = await getSupabaseServerClient();

    await supabase
      .from("unified_videos")
      .update({ category_id: null })
      .eq("category_id", id)
      .eq("client_id", clientId);

    const { error } = await supabase
      .from("video_categories")
      .delete()
      .eq("id", id)
      .eq("client_id", clientId);

    if (error) {
      console.error("Feil ved sletting av kategori:", error);
      return { success: false, message: "Kunne ikke slette kategori." };
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Kategori slettet." };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil";
    console.error("deleteCategory feilet:", errorMessage);
    return { success: false, message: `Feil: ${errorMessage}` };
  }
}
