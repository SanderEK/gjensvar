"use server";

import { getSupabaseServerClient, getSupabaseAuthClient } from "@/lib/supabaseServer";

const ADMIN_EMAILS = ["sekapstad@gmail.com"];

async function requireAdmin() {
  const supabaseAuth = await getSupabaseAuthClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    throw new Error("Ikke autorisert.");
  }

  return user;
}

export async function getGreenlistedEmails() {
  const user = await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("allowed_emails")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Feil ved henting av greenliste:", error);
    return { success: false as const, message: error.message, emails: [] };
  }

  return {
    success: true as const,
    emails: (data ?? []) as { id: string; email: string; created_at: string }[],
  };
}

export async function addEmailToGreenlist(email: string) {
  await requireAdmin();

  if (!email || !email.includes("@")) {
    return { success: false, message: "Ugyldig e-postadresse." };
  }

  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("allowed_emails")
    .insert({ email: email.toLowerCase().trim() });

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "Denne e-postadressen er allerede i listen." };
    }
    console.error("Feil ved opprettelse:", error);
    return { success: false, message: `Kunne ikke legge til: ${error.message}` };
  }

  return { success: true, message: `${email} er lagt til.` };
}

export async function removeEmailFromGreenlist(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("allowed_emails")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Feil ved sletting:", error);
    return { success: false, message: `Kunne ikke fjerne: ${error.message}` };
  }

  return { success: true, message: "E-post fjernet fra listen." };
}

export async function isEmailAllowed(email: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("allowed_emails")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error) {
    console.error("Feil ved sjekk av greenlist:", error);
    return false;
  }

  return !!data;
}
