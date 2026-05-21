"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/app/actions/clients";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function OnboardingPrompt() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");

    startTransition(async () => {
      const result = await createClient(name.trim());
      if (result.success) {
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {t("dashboard.onboardingTitle")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t("dashboard.onboardingDesc")}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white/60 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800/80 dark:bg-[#131313] dark:shadow-2xl sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="client-name"
              className="block text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
            >
              {t("dashboard.clientNamePlaceholder")}
            </label>
            <input
              id="client-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("dashboard.onboardingPlaceholder")}
              autoFocus
              className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-50 dark:placeholder-zinc-600"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              t("dashboard.onboardingCreating")
            ) : (
              <>
                {t("dashboard.onboardingButton")}
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
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
