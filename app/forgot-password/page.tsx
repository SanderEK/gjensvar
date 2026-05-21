"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import {
  ArrowRightIcon,
  AuthFooter,
  AuthTopbar,
  FieldLabel,
  InputWithIcon,
  MailIcon,
  Spinner,
} from "@/components/auth/AuthCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = getSupabaseBrowserClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      },
    );

    if (resetError) {
      setError(t("forgotPassword.errorGeneric"));
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0a0a0a] text-zinc-50">
      <AuthTopbar
        right={
          <p className="text-xs text-zinc-500">
            {t("forgotPassword.rememberQuestion")}{" "}
            <Link
              href="/login"
              className="font-medium text-zinc-100 transition-colors hover:text-white"
            >
              {t("forgotPassword.loginLink")}
            </Link>
          </p>
        }
      />

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#131313] p-7 shadow-2xl">
            {sent ? (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                  <svg
                    className="h-6 w-6 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
                  {t("forgotPassword.successHeading")}
                </h1>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {t("forgotPassword.successDescBefore")}
                  <span className="font-medium text-zinc-200">{email}</span>
                  {t("forgotPassword.successDescAfter")}
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
                >
                  {t("forgotPassword.backToLogin")}
                </Link>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  {t("forgotPassword.eyebrow")}
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-[1.75rem]">
                  {t("forgotPassword.title")}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {t("forgotPassword.subtitle")}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <FieldLabel htmlFor="email">
                      {t("forgotPassword.emailLabel")}
                    </FieldLabel>
                    <InputWithIcon
                      icon={<MailIcon />}
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder={t("forgotPassword.emailPlaceholder")}
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Spinner /> {t("forgotPassword.submitting")}
                      </>
                    ) : (
                      <>
                        {t("forgotPassword.submit")}
                        <ArrowRightIcon />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center text-xs text-zinc-500">
                  <Link
                    href="/login"
                    className="font-medium text-zinc-200 transition-colors hover:text-white"
                  >
                    {t("forgotPassword.backToLogin")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
