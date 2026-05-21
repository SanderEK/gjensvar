"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface LanguageToggleProps {
  variant?: "auth" | "dashboard";
}

export function LanguageToggle({ variant = "auth" }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage();

  const isAuth = variant === "auth";

  const baseClasses = isAuth
    ? "inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5 text-[11px] font-medium"
    : "inline-flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 text-[11px] font-medium dark:border-zinc-800 dark:bg-zinc-900/60";

  const optionBase =
    "rounded-md px-2 py-1 transition-colors min-w-[28px] text-center";

  const activeClasses = isAuth
    ? "bg-zinc-700 text-zinc-50"
    : "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50";

  const inactiveClasses = isAuth
    ? "text-zinc-400 hover:text-zinc-100"
    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

  return (
    <div
      role="group"
      aria-label="Language"
      className={baseClasses}
    >
      <button
        type="button"
        onClick={() => setLang("nb")}
        aria-pressed={lang === "nb"}
        className={`${optionBase} ${lang === "nb" ? activeClasses : inactiveClasses}`}
      >
        NO
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`${optionBase} ${lang === "en" ? activeClasses : inactiveClasses}`}
      >
        EN
      </button>
    </div>
  );
}
