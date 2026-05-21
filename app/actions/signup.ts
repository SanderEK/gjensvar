"use server";

import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { isEmailAllowed } from "./allowedEmails";

export async function signupUser(email: string, password: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return { success: false, message: "Ugyldig e-postadresse." };
    }

    if (!password || password.length < 8) {
      return { success: false, message: "Passordet må være minst 8 tegn." };
    }

    const allowed = await isEmailAllowed(normalizedEmail);
    if (!allowed) {
      return { success: false, message: "Denne e-postadressen har ikke tilgang til å registrere seg. Kontakt administrator." };
    }

    const supabase = await getSupabaseServerClient();

    const { error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { password_set: true },
    });

    if (error) {
      if (error.message.includes("already been registered") || error.message.includes("already exists")) {
        return { success: false, message: "Denne e-postadressen er allerede registrert." };
      }
      console.error("Feil ved registrering:", error);
      return { success: false, message: `Kunne ikke opprette bruker: ${error.message}` };
    }

    return { success: true, message: "Bruker opprettet! Du kan nå logge inn." };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Ukjent feil";
    return { success: false, message: errorMessage };
  }
}
