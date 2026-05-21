"use server";

import { getSupabaseServerClient, getSupabaseAuthClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const COOKIE_NAME = "active_client_id";

export async function getActiveClientId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

export type ActiveClientContext =
  | { ok: true; userId: string; clientId: string }
  | {
      ok: false;
      reason: "not_authenticated" | "no_client" | "not_member";
      message: string;
    };

/**
 * Sentral autorisering: bekrefter at brukeren er innlogget OG faktisk er
 * medlem av kunden cookien peker på. Bruk denne i alle server actions og
 * route handlers før data leses/skrives basert på active_client_id.
 *
 * Uten dette vil en innlogget bruker som setter active_client_id-cookien
 * manuelt få tilgang til en hvilken som helst kunde – fordi server-clienten
 * bruker SUPABASE_SERVICE_ROLE_KEY og bypasser RLS.
 *
 * "Self-heal": hvis cookien mangler eller peker på en kunde brukeren ikke
 * er medlem av, faller vi tilbake til første kunde brukeren faktisk har
 * tilgang til, og oppdaterer cookien (når set() er tilgjengelig).
 */
export async function requireActiveClient(): Promise<ActiveClientContext> {
  const supabaseAuth = await getSupabaseAuthClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return {
      ok: false,
      reason: "not_authenticated",
      message: "Du er ikke innlogget.",
    };
  }

  const cookieStore = await cookies();
  const cookieClientId = cookieStore.get(COOKIE_NAME)?.value;
  const supabase = await getSupabaseServerClient();

  if (cookieClientId) {
    const { data: membership } = await supabase
      .from("client_members")
      .select("id")
      .eq("client_id", cookieClientId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership) {
      return { ok: true, userId: user.id, clientId: cookieClientId };
    }
    // Cookien peker på en kunde brukeren ikke er medlem av – ignorer den
    // og fall tilbake til en gyldig kunde under.
  }

  const { data: firstMembership } = await supabase
    .from("client_members")
    .select("client_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!firstMembership) {
    return {
      ok: false,
      reason: "no_client",
      message: "Du har ingen kunder ennå. Opprett en først.",
    };
  }

  const fallbackClientId = firstMembership.client_id as string;

  try {
    cookieStore.set(COOKIE_NAME, fallbackClientId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  } catch {
    // Server Components kan ikke sette cookies. Det er OK – neste request
    // som går gjennom en route handler eller server action vil sette den.
  }

  return { ok: true, userId: user.id, clientId: fallbackClientId };
}

export async function setActiveClient(clientId: string) {
  const supabaseAuth = await getSupabaseAuthClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return { success: false, message: "Du er ikke innlogget." };

  const supabase = await getSupabaseServerClient();
  const { data: membership } = await supabase
    .from("client_members")
    .select("id")
    .eq("client_id", clientId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return { success: false, message: "Du har ikke tilgang til denne kunden." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, clientId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getMyClients() {
  const supabaseAuth = await getSupabaseAuthClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return [];

  const supabase = await getSupabaseServerClient();

  // Forsøk først med report_brand-kolonnen. Hvis migrasjon 008 ikke er
  // kjørt enda faller vi tilbake til en select uten den slik at lista
  // fortsatt fungerer.
  let memberships: Record<string, unknown>[] | null = null;
  let hasReportBrand = true;

  const primary = await supabase
    .from("client_members")
    .select("client_id, role, clients(id, name, report_brand, created_at)")
    .eq("user_id", user.id);

  if (primary.error) {
    const code = (primary.error as { code?: string }).code;
    const message = primary.error.message ?? "";
    const isMissingColumn =
      code === "42703" || /report_brand/i.test(message);

    if (!isMissingColumn) {
      console.error("Feil ved henting av kunder:", primary.error);
      return [];
    }

    hasReportBrand = false;
    const fallback = await supabase
      .from("client_members")
      .select("client_id, role, clients(id, name, created_at)")
      .eq("user_id", user.id);

    if (fallback.error || !fallback.data) {
      console.error("Feil ved henting av kunder:", fallback.error);
      return [];
    }
    memberships = fallback.data as Record<string, unknown>[];
  } else {
    memberships = (primary.data ?? []) as Record<string, unknown>[];
  }

  return memberships.map((m: Record<string, unknown>) => {
    const clients = m.clients as
      | { id: string; name: string; report_brand?: string | null; created_at: string }[]
      | { id: string; name: string; report_brand?: string | null; created_at: string }
      | null;
    const client = Array.isArray(clients) ? clients[0] : clients;
    return {
      id: client?.id || (m.client_id as string),
      name: client?.name || "Ukjent",
      reportBrand: hasReportBrand ? client?.report_brand ?? null : null,
      role: m.role as string,
      created_at: client?.created_at || "",
    };
  });
}

export async function createClient(name: string) {
  try {
    const supabaseAuth = await getSupabaseAuthClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { success: false, message: "Du er ikke innlogget." };

    if (!name || name.trim().length === 0) {
      return { success: false, message: "Kundenavn kan ikke være tomt." };
    }

    const supabase = await getSupabaseServerClient();

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({ name: name.trim(), created_by: user.id })
      .select("id")
      .single();

    if (clientError || !client) {
      console.error("Feil ved opprettelse av kunde:", clientError);
      return { success: false, message: "Kunne ikke opprette kunden." };
    }

    const { error: memberError } = await supabase
      .from("client_members")
      .insert({ client_id: client.id, user_id: user.id, role: "admin" });

    if (memberError) {
      console.error("Feil ved medlemskap:", memberError);
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, client.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    revalidatePath("/dashboard");
    return { success: true, message: `${name.trim()} opprettet.`, clientId: client.id };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil";
    return { success: false, message: errorMessage };
  }
}

export async function renameClient(clientId: string, newName: string) {
  try {
    const supabaseAuth = await getSupabaseAuthClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { success: false, message: "Du er ikke innlogget." };

    const trimmed = newName.trim();
    if (!trimmed) {
      return { success: false, message: "Kundenavn kan ikke være tomt." };
    }
    if (trimmed.length > 120) {
      return { success: false, message: "Kundenavn er for langt." };
    }

    const supabase = await getSupabaseServerClient();

    const { data: membership } = await supabase
      .from("client_members")
      .select("role")
      .eq("client_id", clientId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "admin") {
      return {
        success: false,
        message: "Du har ikke tilgang til å endre denne kunden.",
      };
    }

    const { error } = await supabase
      .from("clients")
      .update({ name: trimmed })
      .eq("id", clientId);

    if (error) {
      console.error("Feil ved omdøping av kunde:", error);
      return { success: false, message: "Kunne ikke endre kundenavnet." };
    }

    revalidatePath("/dashboard");
    return { success: true, message: `Kunden er nå "${trimmed}".` };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil";
    return { success: false, message: errorMessage };
  }
}

export async function setClientReportBrand(clientId: string, brand: string) {
  try {
    const supabaseAuth = await getSupabaseAuthClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user) return { success: false, message: "Du er ikke innlogget." };

    const trimmed = brand.trim();
    if (trimmed.length > 80) {
      return { success: false, message: "Merkenavn er for langt." };
    }

    const supabase = await getSupabaseServerClient();

    const { data: membership } = await supabase
      .from("client_members")
      .select("role")
      .eq("client_id", clientId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return {
        success: false,
        message: "Du har ikke tilgang til denne kunden.",
      };
    }

    const { error } = await supabase
      .from("clients")
      .update({ report_brand: trimmed.length > 0 ? trimmed : null })
      .eq("id", clientId);

    if (error) {
      const code = (error as { code?: string }).code;
      const message = error.message ?? "";
      if (code === "42703" || /report_brand/i.test(message)) {
        return {
          success: false,
          message:
            "Mangler 'report_brand'-kolonnen. Kjør migrasjon 008 i Supabase først.",
        };
      }
      console.error("Feil ved oppdatering av merkenavn:", error);
      return { success: false, message: "Kunne ikke lagre merkenavnet." };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil";
    return { success: false, message: errorMessage };
  }
}

export async function deleteClient(clientId: string) {
  try {
    const supabaseAuth = await getSupabaseAuthClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { success: false, message: "Du er ikke innlogget." };

    const supabase = await getSupabaseServerClient();

    const { data: membership } = await supabase
      .from("client_members")
      .select("role")
      .eq("client_id", clientId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "admin") {
      return { success: false, message: "Du har ikke tilgang til å slette denne kunden." };
    }

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);

    if (error) {
      console.error("Feil ved sletting av kunde:", error);
      return { success: false, message: "Kunne ikke slette kunden." };
    }

    const cookieStore = await cookies();
    const activeId = cookieStore.get(COOKIE_NAME)?.value;
    if (activeId === clientId) {
      cookieStore.delete(COOKIE_NAME);
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Kunden ble slettet." };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil";
    return { success: false, message: errorMessage };
  }
}
