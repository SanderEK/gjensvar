"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRightIcon,
  AuthFooter,
  AuthTabs,
  AuthTopbar,
  FieldLabel,
  InputWithIcon,
  LockIcon,
  MailIcon,
  PasswordVisibilityToggle,
  Spinner,
} from "@/components/auth/AuthCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = getSupabaseBrowserClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(t("login.errorInvalid"));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0a0a0a] text-zinc-50">
      <AuthTopbar
        right={
          <p className="text-xs text-zinc-500">
            {t("login.haveNoAccount")}{" "}
            <Link
              href="/signup"
              className="font-medium text-zinc-100 transition-colors hover:text-white"
            >
              {t("login.createAccount")}
            </Link>
          </p>
        }
      />

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#131313] p-7 shadow-2xl">
            <AuthTabs active="login" />

            <p className="mt-7 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {t("login.welcomeEyebrow")}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-[1.75rem]">
              {t("login.title")}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">{t("login.subtitle")}</p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <FieldLabel htmlFor="email">{t("login.emailLabel")}</FieldLabel>
                <InputWithIcon
                  icon={<MailIcon />}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder={t("login.emailPlaceholder")}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <FieldLabel htmlFor="password" inline>
                    {t("login.passwordLabel")}
                  </FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>
                <InputWithIcon
                  icon={<LockIcon />}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  trailing={
                    <PasswordVisibilityToggle
                      visible={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                    />
                  }
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
                    <Spinner /> {t("login.submitting")}
                  </>
                ) : (
                  <>
                    {t("login.submit")}
                    <ArrowRightIcon />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center text-xs text-zinc-500">
              {t("login.newToGjensvar")}{" "}
              <Link
                href="/signup"
                className="font-medium text-zinc-200 transition-colors hover:text-white"
              >
                {t("login.createAccount")}
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-600">
            {t("login.legalAgree", {
              terms: "__TERMS__",
              privacy: "__PRIVACY__",
            })
              .split(/(__TERMS__|__PRIVACY__)/)
              .map((part, i) => {
                if (part === "__TERMS__") {
                  return (
                    <Link
                      key={i}
                      href="/terms"
                      className="text-zinc-400 underline-offset-2 transition-colors hover:text-zinc-200 hover:underline"
                    >
                      {t("auth.terms").toLowerCase()}
                    </Link>
                  );
                }
                if (part === "__PRIVACY__") {
                  return (
                    <Link
                      key={i}
                      href="/privacy"
                      className="text-zinc-400 underline-offset-2 transition-colors hover:text-zinc-200 hover:underline"
                    >
                      {t("auth.privacy").toLowerCase()}
                    </Link>
                  );
                }
                return <span key={i}>{part}</span>;
              })}
          </p>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
