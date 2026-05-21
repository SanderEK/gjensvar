"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  AuthFooter,
  AuthTopbar,
} from "@/components/auth/AuthCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const PLATFORMS: {
  name: PlatformName;
  color: string;
}[] = [
  { name: "TikTok", color: "#a855f7" },
  { name: "Instagram", color: "#f97316" },
  { name: "YouTube", color: "#ef4444" },
  { name: "Facebook", color: "#3b82f6" },
  { name: "Snapchat", color: "#eab308" },
];

type PlatformName =
  | "TikTok"
  | "Instagram"
  | "YouTube"
  | "Facebook"
  | "Snapchat";

export default function LandingPage() {
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.slice(1));
      const hashType = hashParams.get("type");
      if (hashType === "recovery" || hashParams.get("access_token")) {
        const target = hashType === "recovery" ? "/reset-password" : "/dashboard";
        window.location.replace(`${target}${hash}`);
        return;
      }
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const tokenHash = params.get("token_hash");
    const type = params.get("type");

    if (tokenHash && type) {
      const next = type === "recovery" ? "/reset-password" : "/dashboard";
      window.location.replace(
        `/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}&next=${encodeURIComponent(next)}`,
      );
      return;
    }

    if (code) {
      const next = type === "recovery" ? "/reset-password" : "/dashboard";
      window.location.replace(
        `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`,
      );
    }
  }, []);

  const FEATURES = [
    {
      title: t("landing.feature1Title"),
      description: t("landing.feature1Desc"),
      icon: <FeatureIconLayers />,
    },
    {
      title: t("landing.feature2Title"),
      description: t("landing.feature2Desc"),
      icon: <FeatureIconRefresh />,
    },
    {
      title: t("landing.feature3Title"),
      description: t("landing.feature3Desc"),
      icon: <FeatureIconUsers />,
    },
    {
      title: t("landing.feature4Title"),
      description: t("landing.feature4Desc"),
      icon: <FeatureIconDocument />,
    },
  ];

  const STEPS = [
    {
      number: "01",
      title: t("landing.step1Title"),
      description: t("landing.step1Desc"),
      icon: <StepIconMail />,
    },
    {
      number: "02",
      title: t("landing.step2Title"),
      description: t("landing.step2Desc"),
      icon: <StepIconLink />,
    },
    {
      number: "03",
      title: t("landing.step3Title"),
      description: t("landing.step3Desc"),
      icon: <StepIconChart />,
    },
    {
      number: "04",
      title: t("landing.step4Title"),
      description: t("landing.step4Desc"),
      icon: <StepIconReport />,
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0a] text-zinc-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[300px] -z-0 h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06),transparent_70%)]"
      />

      <AuthTopbar
        right={
          <Link
            href="/login"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
          >
            {t("landing.topbarLogin")}
            <ArrowRightIcon />
          </Link>
        }
      />

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="px-6 pt-16 pb-12 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {t("landing.badge")}
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl md:text-6xl">
              {t("landing.title")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              {t("landing.subtitle")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
              >
                {t("landing.ctaPrimary")}
                <ArrowRightIcon />
              </Link>
              <a
                href="mailto:sander@kapstadmedia.no?subject=Tilgang%20til%20Gjensvar"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
              >
                {t("landing.ctaSecondary")}
              </a>
            </div>
          </div>
        </section>

        {/* Dashboard preview */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-5xl">
            <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {t("landing.previewLabel")}
            </p>
            <DashboardPreview />
          </div>
        </section>

        {/* Plattformer */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {t("landing.platformsHeading")}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {PLATFORMS.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-2.5 rounded-lg border border-zinc-800/80 bg-[#131313] px-4 py-2.5"
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-md"
                    style={{ backgroundColor: p.color }}
                  >
                    <PlatformLogo platform={p.name} className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-zinc-200">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-zinc-500">
              {t("landing.platformsCaption")}
            </p>
          </div>
        </section>

        {/* Funksjoner */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {t("landing.featuresEyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                {t("landing.featuresHeading")}
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-zinc-800/80 bg-[#131313] p-6 transition-colors hover:border-zinc-700"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-300">
                    {f.icon}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-zinc-50">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hvordan det fungerer */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {t("landing.stepsEyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                {t("landing.stepsHeading")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {t("landing.stepsIntro")}
              </p>
            </div>
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <li
                  key={s.number}
                  className="rounded-xl border border-zinc-800/80 bg-[#131313] p-6"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-300">
                    {s.icon}
                  </span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="mono text-xs font-medium text-zinc-600">
                      {s.number}
                    </span>
                    <h3 className="text-base font-semibold text-zinc-50">
                      {s.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {s.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Målgruppe */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-zinc-800/80 bg-[#131313] p-8 sm:p-10">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-zinc-50 sm:text-2xl">
                    {t("landing.audienceHeading")}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {t("landing.audienceP1")}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {t("landing.audienceP2")}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {t("landing.audienceP3")}
                  </p>
                  <a
                    href="mailto:sander@kapstadmedia.no?subject=Tilgang%20til%20Gjensvar"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-100 transition-colors hover:text-white"
                  >
                    sander@kapstadmedia.no
                    <ArrowRightIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Avsluttende CTA */}
        <section className="px-6 pb-20 pt-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
              {t("landing.finalHeading")}
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              {t("landing.finalDesc")}
            </p>
            <Link
              href="/login"
              className="group mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
            >
              {t("landing.finalCta")}
              <ArrowRightIcon />
            </Link>
          </div>
        </section>
      </main>

      <AuthFooter />
    </div>
  );
}

/* -------------------------------------------------------------- */
/*  Plattform-logoer                                              */
/* -------------------------------------------------------------- */

function PlatformLogo({
  platform,
  className = "h-4 w-4",
}: {
  platform: PlatformName;
  className?: string;
}) {
  const baseProps = {
    viewBox: "0 0 24 24",
    fill: "currentColor",
    className: `${className} text-white`,
    "aria-hidden": true,
  } as const;

  switch (platform) {
    case "TikTok":
      return (
        <svg {...baseProps}>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.09Z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg {...baseProps}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      );
    case "YouTube":
      return (
        <svg {...baseProps}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "Facebook":
      return (
        <svg {...baseProps}>
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
      );
    case "Snapchat":
      return (
        <svg {...baseProps}>
          <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.344-.134.553-.076.27-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.78-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.075-.54.075-.374 0-.523-.224-.583-.42-.061-.192-.09-.36-.135-.553-.045-.18-.105-.479-.166-.569-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.654.305-4.847C7.844 1.075 11.2.794 12.184.794l.484-.005h.035z" />
        </svg>
      );
  }
}

/* -------------------------------------------------------------- */
/*  Stilisert dashboard-mockup                                    */
/* -------------------------------------------------------------- */

interface PreviewRow {
  date: string;
  title: string;
  values: number[]; // [tiktok, youtube, instagram, facebook, snapchat]
  total: number;
}

function DashboardPreview() {
  const { t } = useLanguage();

  const rows: PreviewRow[] = [
    {
      date: "14. apr",
      title: t("landing.previewVideo1"),
      values: [92400, 18500, 41200, 18100, 12000],
      total: 182200,
    },
    {
      date: "12. apr",
      title: t("landing.previewVideo2"),
      values: [63800, 28200, 22400, 11900, 8400],
      total: 134700,
    },
    {
      date: "10. apr",
      title: t("landing.previewVideo3"),
      values: [45200, 9100, 31700, 7600, 5200],
      total: 98800,
    },
    {
      date: "07. apr",
      title: t("landing.previewVideo4"),
      values: [28100, 14200, 22500, 7300, 4200],
      total: 76300,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#131313] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
      {/* Mini-topbar */}
      <div className="flex items-center justify-between border-b border-zinc-800/70 bg-[#0f0f0f] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          </span>
          <span className="text-[11px] font-semibold tracking-tight text-zinc-300">
            Gjensvar
          </span>
          <span className="hidden items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/80 px-2 py-1 text-[10px] font-medium text-zinc-300 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t("landing.previewClient")}
            <svg
              className="h-2.5 w-2.5 text-zinc-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {PLATFORMS.map((p) => (
            <span
              key={p.name}
              className="hidden h-5 w-5 items-center justify-center rounded sm:flex"
              style={{ backgroundColor: p.color }}
              aria-label={p.name}
            >
              <PlatformLogo platform={p.name} className="h-2.5 w-2.5" />
            </span>
          ))}
        </div>
      </div>

      {/* KPI-kort */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5">
        <KpiTile
          label={t("landing.previewKpiViews")}
          value="2 384 100"
          delta="+12,4%"
          deltaPositive
        />
        <KpiTile
          label={t("landing.previewKpiGrowth")}
          value="+12,4%"
          delta="vs. forrige"
        />
        <KpiTile
          label={t("landing.previewKpiLikes")}
          value="84 230"
          delta="+8,1%"
          deltaPositive
        />
        <KpiTile
          label={t("landing.previewKpiVideos")}
          value="47"
          delta="+3"
          deltaPositive
        />
      </div>

      {/* Tabell */}
      <div className="border-t border-zinc-800/70 px-4 pb-5 pt-4 sm:px-5">
        <div className="overflow-hidden rounded-lg border border-zinc-800/70">
          {/* Header */}
          <div className="grid grid-cols-[80px_1fr_repeat(5,28px)_70px] items-center gap-2 bg-[#181818] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 sm:grid-cols-[90px_1fr_repeat(5,36px)_90px]">
            <span>{t("landing.previewTableDate")}</span>
            <span>{t("landing.previewTableTitle")}</span>
            {PLATFORMS.map((p) => (
              <span
                key={p.name}
                className="flex justify-center"
                aria-label={p.name}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              </span>
            ))}
            <span className="text-right">{t("landing.previewTableTotal")}</span>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[80px_1fr_repeat(5,28px)_70px] items-center gap-2 border-t border-zinc-800/60 px-3 py-2.5 text-[11px] sm:grid-cols-[90px_1fr_repeat(5,36px)_90px] sm:text-xs"
            >
              <span className="mono tnum text-zinc-400">{row.date}</span>
              <span className="truncate text-zinc-200">{row.title}</span>
              {row.values.map((v, idx) => (
                <span
                  key={idx}
                  className="mono tnum text-right text-[10px] sm:text-[11px]"
                  style={{ color: PLATFORMS[idx].color }}
                >
                  {formatCompactNumber(v)}
                </span>
              ))}
              <span className="mono tnum text-right text-zinc-100">
                {formatCompactNumber(row.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiTile({
  label,
  value,
  delta,
  deltaPositive = false,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-800/70 bg-[#0f0f0f] p-3 sm:p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mono tnum mt-1.5 text-lg font-semibold text-zinc-50 sm:text-xl">
        {value}
      </p>
      {delta ? (
        <p
          className={`mt-1 text-[10px] font-medium ${
            deltaPositive ? "text-emerald-400" : "text-zinc-500"
          }`}
        >
          {delta}
        </p>
      ) : null}
    </div>
  );
}

function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(0)}K`;
  }
  return String(n);
}

/* -------------------------------------------------------------- */
/*  Ikoner                                                         */
/* -------------------------------------------------------------- */

function FeatureIconLayers() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5" />
    </svg>
  );
}

function FeatureIconRefresh() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114-3.5M20 15a8 8 0 01-14 3.5" />
    </svg>
  );
}

function FeatureIconUsers() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m10-7a4 4 0 11-8 0 4 4 0 018 0zM7 9a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  );
}

function FeatureIconDocument() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function StepIconMail() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function StepIconLink() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 015.656 5.656l-3 3a4 4 0 01-5.656-5.656M10.172 13.828a4 4 0 01-5.656-5.656l3-3a4 4 0 015.656 5.656" />
    </svg>
  );
}

function StepIconChart() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 14l3-3 4 4 6-6" />
    </svg>
  );
}

function StepIconReport() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m-3-3h6M7 21h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
    </svg>
  );
}
