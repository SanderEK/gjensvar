"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type Platform = "instagram" | "youtube" | "tiktok" | "facebook";

type SyncEvent =
  | { type: "started"; platform: Platform }
  | { type: "phase"; platform: Platform; label: string }
  | {
      type: "progress";
      platform: Platform;
      current: number;
      total: number | null;
    }
  | {
      type: "completed";
      platform: Platform;
      synced: number;
      total: number;
      message: string;
    }
  | { type: "skipped"; platform: Platform; message: string }
  | { type: "failed"; platform: Platform; message: string };

type Status = "idle" | "running" | "done" | "skipped" | "failed";

interface PlatformState {
  status: Status;
  phase: string;
  current: number;
  total: number | null;
  message: string;
}

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  facebook: "Facebook",
};

const PLATFORM_ORDER: Platform[] = [
  "instagram",
  "youtube",
  "tiktok",
  "facebook",
];

const initialState = (): Record<Platform, PlatformState> => ({
  instagram: { status: "idle", phase: "", current: 0, total: null, message: "" },
  youtube: { status: "idle", phase: "", current: 0, total: null, message: "" },
  tiktok: { status: "idle", phase: "", current: 0, total: null, message: "" },
  facebook: { status: "idle", phase: "", current: 0, total: null, message: "" },
});

export function SyncAllButton() {
  const { t } = useLanguage();
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] =
    useState<Record<Platform, PlatformState>>(initialState());

  const applyEvent = (event: SyncEvent) => {
    setState((prev) => {
      const next = { ...prev };
      const current = { ...next[event.platform] };

      switch (event.type) {
        case "started":
          current.status = "running";
          current.phase = t("dashboard.syncStarting");
          current.current = 0;
          current.total = null;
          current.message = "";
          break;
        case "phase":
          current.status = "running";
          current.phase = event.label;
          break;
        case "progress":
          current.status = "running";
          current.current = event.current;
          current.total = event.total;
          break;
        case "completed":
          current.status = "done";
          current.phase = "";
          current.current = event.synced;
          current.total = event.total;
          current.message = event.message;
          break;
        case "skipped":
          current.status = "skipped";
          current.phase = "";
          current.message = event.message;
          break;
        case "failed":
          current.status = "failed";
          current.phase = "";
          current.message = event.message;
          break;
      }

      next[event.platform] = current;
      return next;
    });
  };

  async function handleSync() {
    setRunning(true);
    setOpen(true);
    setError(null);
    setState(initialState());

    try {
      const res = await fetch("/api/sync", { method: "POST" });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || t("dashboard.syncErrorPrefix", { status: String(res.status) }),
        );
      }

      if (!res.body) {
        throw new Error(t("dashboard.syncStreamEmpty"));
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const event = JSON.parse(trimmed) as SyncEvent;
            applyEvent(event);
          } catch (err) {
            console.error(t("dashboard.syncEmptyError"), trimmed, err);
          }
        }
      }

      // Bygget om dashboardet med nye data
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("dashboard.syncUnknownError"));
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <button
        onClick={handleSync}
        disabled={running}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        {running ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {t("dashboard.syncing")}
          </>
        ) : (
          <>
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t("dashboard.sync")}
          </>
        )}
      </button>

      {open && (
        <SyncProgressDialog
          state={state}
          running={running}
          error={error}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function SyncProgressDialog({
  state,
  running,
  error,
  onClose,
}: {
  state: Record<Platform, PlatformState>;
  running: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="fixed right-6 top-20 z-50 w-full max-w-sm">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {running ? t("dashboard.syncDataTitle") : t("dashboard.syncDoneTitle")}
          </h2>
          {!running && (
            <button
              onClick={onClose}
              className="rounded-md p-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              aria-label={t("dashboard.close")}
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {PLATFORM_ORDER.map((platform) => (
            <PlatformProgressRow
              key={platform}
              platform={platform}
              state={state[platform]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlatformProgressRow({
  platform,
  state,
}: {
  platform: Platform;
  state: PlatformState;
}) {
  const { t } = useLanguage();
  const label = PLATFORM_LABEL[platform];

  let percent = 0;
  if (state.total && state.total > 0) {
    percent = Math.min(100, Math.round((state.current / state.total) * 100));
  } else if (state.status === "done") {
    percent = 100;
  }

  let statusLabel = "";
  let statusColor = "text-zinc-600 dark:text-zinc-400";
  if (state.status === "idle") {
    statusLabel = t("dashboard.syncWaiting");
  } else if (state.status === "running") {
    if (state.total && state.total > 0) {
      statusLabel = t("dashboard.syncProgress", {
        current: String(state.current),
        total: String(state.total),
      });
    } else if (state.phase) {
      statusLabel = state.phase;
    } else {
      statusLabel = t("dashboard.syncWorking");
    }
    statusColor = "text-zinc-800 dark:text-zinc-200";
  } else if (state.status === "done") {
    statusLabel =
      state.total && state.total > 0
        ? t("dashboard.syncProgress", {
            current: String(state.current),
            total: String(state.total),
          })
        : t("dashboard.syncNoData");
    statusColor = "text-emerald-400";
  } else if (state.status === "skipped") {
    statusLabel = t("dashboard.syncNotConnected");
    statusColor = "text-zinc-500 dark:text-zinc-500";
  } else if (state.status === "failed") {
    statusLabel = t("dashboard.syncFailed");
    statusColor = "text-red-400";
  }

  const barColor =
    state.status === "failed"
      ? "bg-red-500"
      : state.status === "done"
      ? "bg-emerald-500"
      : state.status === "skipped"
      ? "bg-zinc-300 dark:bg-zinc-700"
      : "bg-blue-500";

  const indeterminate =
    state.status === "running" && (!state.total || state.total <= 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
          {state.status === "running" && (
            <svg
              className="h-3 w-3 animate-spin text-zinc-600 dark:text-zinc-400"
              viewBox="0 0 24 24"
              fill="none"
            >
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
        </div>
        <span className={`text-xs ${statusColor}`}>{statusLabel}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        {indeterminate ? (
          <div className={`h-full w-1/3 animate-pulse ${barColor}`} />
        ) : (
          <div
            className={`h-full transition-all duration-200 ${barColor}`}
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
      {state.status === "failed" && state.message && (
        <p className="mt-1 text-xs text-red-400">{state.message}</p>
      )}
    </div>
  );
}
