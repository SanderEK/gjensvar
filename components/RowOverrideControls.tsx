"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  mergeRowIntoDate,
  removeOverridesForPlatforms,
  setVideoOverride,
  removeVideoOverride,
} from "@/app/actions/videoOverrides";
import { hideVideos } from "@/app/actions/hiddenVideos";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { PlatformEntry, UnifiedVideoRow } from "@/lib/types";

type PlatformKey = "tiktok" | "youtube" | "instagram" | "snapchat" | "facebook";

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  tiktok: "TikTok",
  youtube: "YouTube",
  instagram: "Instagram",
  snapchat: "Snapchat",
  facebook: "Facebook",
};

const PLATFORM_DOT_COLORS: Record<PlatformKey, string> = {
  tiktok: "bg-purple-400",
  youtube: "bg-red-400",
  instagram: "bg-orange-400",
  snapchat: "bg-yellow-400",
  facebook: "bg-blue-400",
};

function formatNorwegianDate(dateKey: string | null): string {
  if (!dateKey) return "";
  const d = new Date(dateKey + "T00:00:00");
  return d.toLocaleDateString("no-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ---------- Per plattform-celle (kun visuell markør) ----------

interface PlatformCellOverrideProps {
  entry: PlatformEntry;
  currentRowDate: string;
}

/**
 * Statisk indikator som vises i en plattform-celle hvis posten er manuelt
 * flyttet til en annen dato. Ikke klikkbar — alle handlinger gjøres fra
 * rad-kebaben.
 */
export function PlatformCellOverride({
  entry,
  currentRowDate,
}: PlatformCellOverrideProps) {
  const { t } = useLanguage();
  if (entry.overriddenFromDate == null) return null;
  return (
    <span
      className="inline-flex h-3.5 w-3.5 items-center justify-center text-violet-500 dark:text-violet-400"
      title={`${t("dashboard.rowDateOverridden")}: ${formatNorwegianDate(entry.overriddenFromDate)} → ${formatNorwegianDate(currentRowDate)}`}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-3 w-3"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 4l5 4-5 4M8 4l5 4-5 4"
        />
      </svg>
    </span>
  );
}

// ---------- FloatingPopover ----------

interface FloatingPopoverProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}

function FloatingPopover({
  anchorRef,
  open,
  onClose,
  width = 280,
  children,
}: FloatingPopoverProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    function update() {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = rect.bottom + 6;
      let left = rect.right - width;
      const margin = 8;
      if (left < margin) left = margin;
      const maxLeft = window.innerWidth - width - margin;
      if (left > maxLeft) left = maxLeft;
      setPos({ top, left });
    }
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, anchorRef, width]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (popoverRef.current && popoverRef.current.contains(target)) return;
      if (anchorRef.current && anchorRef.current.contains(target)) return;
      onClose();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !mounted || !pos) return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width,
        zIndex: 1000,
      }}
      className="rounded-lg border border-zinc-200 bg-white p-3 text-left shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
    >
      {children}
    </div>,
    document.body
  );
}

// ---------- Hele rader ----------

interface RowMergeButtonProps {
  row: UnifiedVideoRow;
  allRows: UnifiedVideoRow[];
}

export function RowMergeButton({ row, allRows }: RowMergeButtonProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mergeFor, setMergeFor] = useState<PlatformKey | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const otherDates = allRows
    .map((r) => r.date)
    .filter((d) => d !== row.date)
    .sort((a, b) => b.localeCompare(a));

  const platformEntries = (
    [
      ["tiktok", row.tiktok],
      ["youtube", row.youtube],
      ["instagram", row.instagram],
      ["snapchat", row.snapchat],
      ["facebook", row.facebook],
    ] as const
  ).filter(
    (entry): entry is readonly [PlatformKey, PlatformEntry] =>
      entry[1] !== null
  );

  const platformIds = platformEntries.map(([platform, e]) => ({
    platform,
    platformVideoId: e.platformVideoId,
  }));

  const overriddenIds = platformEntries
    .filter(([, e]) => e.overriddenFromDate !== null)
    .map(([platform, e]) => ({
      platform,
      platformVideoId: e.platformVideoId,
    }));

  function handleMerge(targetDate: string) {
    setError(null);
    startTransition(async () => {
      const res = await mergeRowIntoDate(row.date, targetDate, platformIds);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setIsOpen(false);
      router.refresh();
    });
  }

  function handleResetAll() {
    setError(null);
    startTransition(async () => {
      const res = await removeOverridesForPlatforms(overriddenIds);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setIsOpen(false);
      router.refresh();
    });
  }

  function handleMergePlatform(
    platform: PlatformKey,
    platformVideoId: string,
    targetDate: string
  ) {
    setError(null);
    startTransition(async () => {
      const res = await setVideoOverride(platform, platformVideoId, targetDate);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMergeFor(null);
      setIsOpen(false);
      router.refresh();
    });
  }

  function handleResetPlatform(
    platform: PlatformKey,
    platformVideoId: string
  ) {
    setError(null);
    startTransition(async () => {
      const res = await removeVideoOverride(platform, platformVideoId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handleHidePlatform(
    platform: PlatformKey,
    platformVideoId: string
  ) {
    const ok = window.confirm(
      `${t("dashboard.rowDeletePlatform")}: ${PLATFORM_LABELS[platform]}?`
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const res = await hideVideos([{ platform, platformVideoId }]);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // Lukk popover hvis dette var siste plattform.
      if (platformIds.length <= 1) setIsOpen(false);
      router.refresh();
    });
  }

  function handleHideRow() {
    const ok = window.confirm(
      `${t("dashboard.rowHideRow")} (${formatNorwegianDate(row.date)})?`
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const res = await hideVideos(platformIds);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setIsOpen(false);
      router.refresh();
    });
  }

  if (platformIds.length === 0) return null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="inline-flex h-7 w-7 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        title={t("dashboard.rowMoreActions")}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>

      <FloatingPopover
        anchorRef={buttonRef}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        width={300}
      >
        {/* Slå sammen rader */}
        {otherDates.length > 0 ? (
          <section>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {t("dashboard.rowMergeWith")}
            </div>
            <div className="max-h-40 overflow-y-auto pr-0.5">
              {otherDates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleMerge(d)}
                  disabled={isPending}
                  className="block w-full rounded px-2 py-1 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {formatNorwegianDate(d)}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {/* Slett / slå sammen / tilbakestill enkeltposter */}
        <section
          className={
            otherDates.length > 0
              ? "mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800"
              : ""
          }
        >
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            {t("dashboard.platforms")}
          </div>
          <ul className="space-y-0.5">
            {platformEntries.map(([platform, entry]) => {
              const isOverridden = entry.overriddenFromDate !== null;
              const isExpanded = mergeFor === platform;
              return (
                <li key={platform} className="rounded">
                  <div className="flex items-center justify-between gap-2 rounded px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${PLATFORM_DOT_COLORS[platform]}`}
                      />
                      <span className="text-zinc-800 dark:text-zinc-200">
                        {PLATFORM_LABELS[platform]}
                      </span>
                      {isOverridden ? (
                        <span
                          className="text-violet-500 dark:text-violet-400"
                          title={`${t("dashboard.rowDateOverridden")}: ${formatNorwegianDate(entry.overriddenFromDate)}`}
                        >
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            className="h-3 w-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 4l5 4-5 4M8 4l5 4-5 4"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </span>
                    <span className="flex items-center gap-0.5">
                      {otherDates.length > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setMergeFor(isExpanded ? null : platform)
                          }
                          disabled={isPending}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded transition-colors disabled:opacity-50 ${
                            isExpanded
                              ? "bg-violet-500/15 text-violet-500 dark:text-violet-400"
                              : "text-zinc-500 hover:bg-violet-500/10 hover:text-violet-500"
                          }`}
                          title={`${t("dashboard.rowMerge")}: ${PLATFORM_LABELS[platform]}`}
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
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                        </button>
                      ) : null}
                      {isOverridden ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleResetPlatform(platform, entry.platformVideoId)
                          }
                          disabled={isPending}
                          className="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-violet-500/10 hover:text-violet-500 disabled:opacity-50"
                          title={t("dashboard.rowResetDate")}
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
                              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                            />
                          </svg>
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          handleHidePlatform(platform, entry.platformVideoId)
                        }
                        disabled={isPending}
                        className="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                        title={`${t("dashboard.rowDeletePlatform")}: ${PLATFORM_LABELS[platform]}`}
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                          />
                        </svg>
                      </button>
                    </span>
                  </div>
                  {isExpanded ? (
                    <div className="ml-3.5 mt-1 rounded border-l-2 border-violet-500/40 pl-2">
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        {t("dashboard.rowMergeWith")}
                      </div>
                      <div className="max-h-32 overflow-y-auto pr-0.5">
                        {otherDates.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() =>
                              handleMergePlatform(
                                platform,
                                entry.platformVideoId,
                                d
                              )
                            }
                            disabled={isPending}
                            className="block w-full rounded px-2 py-1 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                          >
                            {formatNorwegianDate(d)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Tilbakestill manuelle datoer */}
        {overriddenIds.length > 0 ? (
          <button
            type="button"
            onClick={handleResetAll}
            disabled={isPending}
            className="mt-3 w-full rounded-md border border-violet-500/40 bg-violet-500/10 px-2 py-1.5 text-xs text-violet-700 transition-colors hover:bg-violet-500/20 disabled:opacity-50 dark:text-violet-200"
          >
            {t("dashboard.rowResetDate")} ({overriddenIds.length})
          </button>
        ) : null}

        {/* Slett hele raden */}
        <button
          type="button"
          onClick={handleHideRow}
          disabled={isPending}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-500/20 disabled:opacity-50 dark:text-red-300"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
            />
          </svg>
          {t("dashboard.rowHideRow")}
        </button>

        {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
      </FloatingPopover>
    </>
  );
}
