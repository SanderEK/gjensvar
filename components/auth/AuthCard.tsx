"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";

export function AuthTabs({ active }: { active: "login" | "signup" }) {
  const { t } = useLanguage();
  return (
    <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5">
      <Link
        href="/login"
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
          active === "login"
            ? "bg-zinc-700 text-zinc-50 shadow-sm"
            : "text-zinc-400 hover:text-zinc-100"
        }`}
      >
        {t("auth.loginTab")}
      </Link>
      <Link
        href="/signup"
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
          active === "signup"
            ? "bg-zinc-700 text-zinc-50 shadow-sm"
            : "text-zinc-400 hover:text-zinc-100"
        }`}
      >
        {t("auth.signupTab")}
      </Link>
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  inline,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  inline?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-xs font-medium text-zinc-300 ${inline ? "" : "mb-1.5"}`}
    >
      {children}
    </label>
  );
}

export function InputWithIcon({
  icon,
  trailing,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-zinc-500">
        {icon}
      </span>
      <input
        {...props}
        className={`block w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2.5 pl-10 ${trailing ? "pr-10" : "pr-3.5"} text-sm text-zinc-50 placeholder-zinc-600 transition-colors focus:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700 ${className}`}
      />
      {trailing ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

export function PasswordVisibilityToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Skjul passord" : "Vis passord"}
      className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
    >
      {visible ? (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )}
    </button>
  );
}

export function MailIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11c1.657 0 3-1.343 3-3V7a3 3 0 10-6 0v1c0 1.657 1.343 3 3 3zM5 19a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2H7a2 2 0 00-2 2v7z"
      />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

export function BuildingIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"
      />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg
      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14M13 5l7 7-7 7"
      />
    </svg>
  );
}

export function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function AuthTopbar({ right }: { right?: React.ReactNode }) {
  return (
    <header className="relative z-10 flex w-full items-center justify-between px-6 py-5">
      <Link href="/" aria-label="Gjensvar" className="flex items-center">
        <Image
          src="/logos/gjensvar-white.png"
          alt="Gjensvar"
          width={1024}
          height={348}
          priority
          className="h-10 w-auto"
        />
      </Link>
      <div className="flex items-center gap-3">
        <LanguageToggle variant="auth" />
        {right ? <div>{right}</div> : null}
      </div>
    </header>
  );
}

export function AuthFooter() {
  const { t } = useLanguage();
  const parts = t("auth.footerCopyright", { company: "__COMPANY__" }).split(
    "__COMPANY__",
  );
  return (
    <footer className="relative z-10 flex w-full items-center justify-between px-6 py-5 text-xs text-zinc-600">
      <span>
        {parts[0]}
        <a
          href="https://kapstadmedia.no"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-zinc-400 transition-colors hover:text-zinc-200"
        >
          Kapstad Media AS
        </a>
        {parts[1]}
      </span>
      <div className="flex gap-4">
        <Link href="/terms" className="transition-colors hover:text-zinc-300">
          {t("auth.terms")}
        </Link>
        <Link
          href="/privacy"
          className="transition-colors hover:text-zinc-300"
        >
          {t("auth.privacy")}
        </Link>
      </div>
    </footer>
  );
}
