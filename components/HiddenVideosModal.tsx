"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  getHiddenVideoList,
  unhideVideo,
  type HiddenVideoListItem,
} from "@/app/actions/hiddenVideos";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  youtube: "YouTube",
  instagram: "Instagram",
  snapchat: "Snapchat",
  facebook: "Facebook",
};

const PLATFORM_BADGES: Record<string, string> = {
  tiktok:
    "bg-purple-500/15 text-purple-700 ring-1 ring-purple-500/30 dark:text-purple-300",
  youtube:
    "bg-red-500/15 text-red-700 ring-1 ring-red-500/30 dark:text-red-300",
  instagram:
    "bg-orange-500/15 text-orange-700 ring-1 ring-orange-500/30 dark:text-orange-300",
  snapchat:
    "bg-yellow-500/15 text-yellow-700 ring-1 ring-yellow-500/30 dark:text-yellow-300",
  facebook:
    "bg-blue-500/15 text-blue-700 ring-1 ring-blue-500/30 dark:text-blue-300",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("no-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(n: number): string {
  return n.toLocaleString("no-NO");
}

export function HiddenVideosButton({
  hiddenCount,
}: {
  hiddenCount: number;
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (hiddenCount === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-3.5 w-3.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
        {t(
          hiddenCount === 1
            ? "dashboard.hiddenVideosCountSingular"
            : "dashboard.hiddenVideosCount",
          { count: String(hiddenCount) },
        )}
      </button>

      {isOpen ? <Modal onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}

function Modal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [items, setItems] = useState<HiddenVideoListItem[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getHiddenVideoList()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  function handleUnhide(platform: string, platformVideoId: string) {
    setError(null);
    startTransition(async () => {
      const res = await unhideVideo(platform, platformVideoId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setItems((prev) =>
        prev
          ? prev.filter(
              (i) =>
                !(
                  i.platform === platform &&
                  i.platformVideoId === platformVideoId
                )
            )
          : prev
      );
      router.refresh();
    });
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("dashboard.hiddenVideosTitle")}
            </h2>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {t("dashboard.hiddenVideosSubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label={t("dashboard.close")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <div className="max-h-[60vh] overflow-y-auto">
          {items === null ? (
            <div className="px-6 py-10 text-center text-sm text-zinc-500">
              {t("dashboard.snapchatModalLoading")}
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-zinc-500">
              {t("dashboard.hiddenVideosEmpty")}
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {items.map((item) => (
                <li
                  key={`${item.platform}:${item.platformVideoId}`}
                  className="flex items-start justify-between gap-4 px-6 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          PLATFORM_BADGES[item.platform] ??
                          "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {PLATFORM_LABELS[item.platform] ?? item.platform}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {formatDate(item.postedAt)}
                      </span>
                      <span className="text-xs text-zinc-500">·</span>
                      <span className="text-xs tabular-nums text-zinc-500">
                        {formatNumber(item.views)} {t("dashboard.analyticsViews").toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-zinc-900 dark:text-zinc-100">
                      {item.caption || `(${t("dashboard.noTitle").toLowerCase()})`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {item.permalink ? (
                      <a
                        href={item.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                        title={t("dashboard.rowOpenOn", { platform: PLATFORM_LABELS[item.platform] ?? item.platform })}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className="h-3.5 w-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        handleUnhide(item.platform, item.platformVideoId)
                      }
                      disabled={isPending}
                      className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      {t("dashboard.hiddenVideosUnhide")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error ? (
          <div className="border-t border-red-500/30 bg-red-500/10 px-6 py-2 text-xs text-red-300">
            {error}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
