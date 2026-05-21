"use client";

import { useMemo, useState } from "react";
import { signupUser } from "@/app/actions/signup";
import Link from "next/link";
import {
  ArrowRightIcon,
  AuthFooter,
  AuthTabs,
  AuthTopbar,
  BuildingIcon,
  FieldLabel,
  InputWithIcon,
  LockIcon,
  MailIcon,
  PasswordVisibilityToggle,
  Spinner,
  UserIcon,
} from "@/components/auth/AuthCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function SignupPage() {
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(password),
    [password],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 10) {
      setError(t("signup.errorPasswordShort"));
      return;
    }

    if (!acceptedTerms) {
      setError(t("signup.errorTermsRequired"));
      return;
    }

    setLoading(true);

    const result = await signupUser(email, password);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
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
            {t("signup.successTitle")}
          </h1>
          <p className="text-sm text-zinc-400">{t("signup.successDesc")}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-100 px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
          >
            {t("signup.successLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0a0a0a] text-zinc-50">
      <AuthTopbar
        right={
          <p className="text-xs text-zinc-500">
            {t("signup.haveAccount")}{" "}
            <Link
              href="/login"
              className="font-medium text-zinc-100 transition-colors hover:text-white"
            >
              {t("signup.loginLink")}
            </Link>
          </p>
        }
      />

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#131313] p-7 shadow-2xl">
            <AuthTabs active="signup" />

            <p className="mt-7 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {t("signup.eyebrow")}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-[1.75rem]">
              {t("signup.title")}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {t("signup.subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel htmlFor="firstName">
                    {t("signup.firstNameLabel")}
                  </FieldLabel>
                  <InputWithIcon
                    icon={<UserIcon />}
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    placeholder={t("signup.firstNamePlaceholder")}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="lastName">
                    {t("signup.lastNameLabel")}
                  </FieldLabel>
                  <InputWithIcon
                    icon={<UserIcon />}
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    placeholder={t("signup.lastNamePlaceholder")}
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="company">
                  {t("signup.companyLabel")}
                </FieldLabel>
                <InputWithIcon
                  icon={<BuildingIcon />}
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                  placeholder={t("signup.companyPlaceholder")}
                />
              </div>

              <div>
                <FieldLabel htmlFor="email">
                  {t("signup.emailLabel")}
                </FieldLabel>
                <InputWithIcon
                  icon={<MailIcon />}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder={t("signup.emailPlaceholder")}
                />
              </div>

              <div>
                <FieldLabel htmlFor="password">
                  {t("signup.passwordLabel")}
                </FieldLabel>
                <InputWithIcon
                  icon={<LockIcon />}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={10}
                  autoComplete="new-password"
                  placeholder={t("signup.passwordPlaceholder")}
                  trailing={
                    <PasswordVisibilityToggle
                      visible={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                    />
                  }
                />
                <PasswordStrength
                  level={passwordStrength}
                  className="mt-2"
                />
                <p className="mt-1.5 text-[11px] text-zinc-500">
                  {t("signup.passwordHint")}
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-700 bg-zinc-900 accent-zinc-100"
                />
                <span>
                  {t("signup.acceptTermsBefore")}
                  <Link
                    href="/terms"
                    className="font-medium text-zinc-100 underline-offset-2 hover:underline"
                  >
                    {t("signup.acceptTermsLinkTerms")}
                  </Link>
                  {t("signup.acceptTermsAnd")}
                  <Link
                    href="/privacy"
                    className="font-medium text-zinc-100 underline-offset-2 hover:underline"
                  >
                    {t("signup.acceptTermsLinkPrivacy")}
                  </Link>
                  .
                </span>
              </label>

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
                    <Spinner /> {t("signup.submitting")}
                  </>
                ) : (
                  <>
                    {t("signup.submit")}
                    <ArrowRightIcon />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center text-xs text-zinc-500">
              {t("signup.alreadyMember")}{" "}
              <Link
                href="/login"
                className="font-medium text-zinc-200 transition-colors hover:text-white"
              >
                {t("signup.loginLink")}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}

// 0 = none, 1 = svak, 2 = ok, 3 = bra, 4 = sterk
function calculatePasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

function PasswordStrength({
  level,
  className = "",
}: {
  level: number;
  className?: string;
}) {
  const segments = 4;
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"];
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: segments }, (_, i) => {
        const filled = i < level;
        const color = filled
          ? colors[Math.min(level, colors.length) - 1]
          : "bg-zinc-800";
        return (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${color}`}
          />
        );
      })}
    </div>
  );
}
