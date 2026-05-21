"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthFooter, AuthTopbar } from "@/components/auth/AuthCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export function LegalPageShell({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsAuthenticated(!!data.session);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const backHref = isAuthenticated ? "/dashboard" : "/";
  const backLabel = isAuthenticated
    ? t("legal.backToDashboard")
    : t("legal.backToHome");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0a] text-zinc-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_60%)]"
      />

      <AuthTopbar
        right={
          <Link
            href={backHref}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
          >
            <svg
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t("legal.back")}
          </Link>
        }
      />

      <main className="relative z-10 flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href={backHref}
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <svg
              className="h-3 w-3 transition-transform group-hover:-translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {backLabel}
          </Link>

          <header className="mt-6">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              {title}
            </h1>
            <p className="mono mt-3 text-xs uppercase tracking-wider text-zinc-500">
              {lastUpdated}
            </p>
          </header>

          <article className="mt-8 rounded-2xl border border-zinc-800/80 bg-[#131313] p-6 sm:p-10">
            <div className="legal-prose space-y-6 text-sm leading-relaxed text-zinc-300">
              {children}
            </div>
          </article>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}

export function LegalSection({
  number,
  title,
  children,
  id,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`space-y-3 ${id ? "scroll-mt-20" : ""}`}
    >
      <h2 className="flex items-baseline gap-2.5 text-base font-semibold text-zinc-50">
        <span className="mono text-xs font-medium text-zinc-500">{number}</span>
        <span>{title}</span>
      </h2>
      <div className="space-y-3 text-zinc-400">{children}</div>
    </section>
  );
}

export function LegalLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="font-medium text-zinc-100 underline-offset-4 transition-colors hover:text-white hover:underline"
    >
      {children}
    </a>
  );
}
