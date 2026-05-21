"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRightIcon,
  AuthFooter,
  AuthTopbar,
  FieldLabel,
  InputWithIcon,
  LockIcon,
  Spinner,
} from "@/components/auth/AuthCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("resetPassword.errorTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("resetPassword.errorMismatch"));
      return;
    }

    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { password_set: true },
    });

    if (updateError) {
      setError(t("resetPassword.errorGeneric"));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0a0a0a] text-zinc-50">
      <AuthTopbar />

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#131313] p-7 shadow-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {t("resetPassword.eyebrow")}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-[1.75rem]">
              {t("resetPassword.title")}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {t("resetPassword.subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <FieldLabel htmlFor="password">
                  {t("resetPassword.passwordLabel")}
                </FieldLabel>
                <InputWithIcon
                  icon={<LockIcon />}
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder={t("resetPassword.passwordPlaceholder")}
                />
              </div>

              <div>
                <FieldLabel htmlFor="confirm-password">
                  {t("resetPassword.confirmLabel")}
                </FieldLabel>
                <InputWithIcon
                  icon={<LockIcon />}
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder={t("resetPassword.confirmPlaceholder")}
                />
                <p className="mt-2 text-[11px] text-zinc-500">
                  {t("resetPassword.passwordHint")}
                </p>
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
                    <Spinner /> {t("resetPassword.submitting")}
                  </>
                ) : (
                  <>
                    {t("resetPassword.submit")}
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
                {t("resetPassword.backToLogin")}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
