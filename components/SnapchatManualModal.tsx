"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  listSnapchatManualVideos,
  createSnapchatManualVideo,
  updateSnapchatManualVideo,
  deleteSnapchatManualVideo,
  type SnapchatManualVideo,
} from "@/app/actions/snapchatManual";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface FormState {
  id: string | null;
  caption: string;
  postedAt: string;
  views: string;
  screenshots: string;
  shares: string;
  permalink: string;
}

const EMPTY_FORM: FormState = {
  id: null,
  caption: "",
  postedAt: new Date().toISOString().slice(0, 10),
  views: "",
  screenshots: "",
  shares: "",
  permalink: "",
};

function buildEmptyForm(initialDate?: string | null): FormState {
  return {
    ...EMPTY_FORM,
    postedAt: initialDate || EMPTY_FORM.postedAt,
  };
}

function fromVideoToForm(video: SnapchatManualVideo): FormState {
  return {
    id: video.id,
    caption: video.caption ?? "",
    postedAt: video.posted_at
      ? new Date(video.posted_at).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    views: String(video.view_count ?? 0),
    screenshots: String(video.screenshot_count ?? 0),
    shares: String(video.share_count ?? 0),
    permalink: video.permalink ?? "",
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("no-NO");
}

export function SnapchatManualButton({ count }: { count: number }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-left transition-colors hover:bg-yellow-500/15"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-yellow-400 text-zinc-900">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.344-.134.553-.076.27-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.78-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.075-.54.075-.374 0-.523-.224-.583-.42-.061-.192-.09-.36-.135-.553-.045-.18-.105-.479-.166-.569-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.654.305-4.847C7.844 1.075 11.2.794 12.184.794l.484-.005h.035z" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Snapchat
            </span>
            <span className="block truncate text-xs text-zinc-600 dark:text-zinc-400">
              {count > 0
                ? t(
                    count === 1
                      ? "dashboard.snapchatManualWithCountSingular"
                      : "dashboard.snapchatManualWithCount",
                    { count: String(count) },
                  )
                : t("dashboard.snapchatManualNoCount")}
            </span>
          </span>
        </span>
        <span className="shrink-0 rounded-md border border-yellow-500/40 bg-yellow-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-300">
          {t("dashboard.manage")}
        </span>
      </button>

      {isOpen ? <Modal onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}

/**
 * Inline tall-input som vises i tomme Snapchat-celler i tabellen. Klikk
 * på «—» eller hover-feltet, skriv inn antall visninger, og trykk Enter
 * (eller blur) for å lagre. For å legge inn screenshots / delinger /
 * tittel / lenke må brukeren gå via «Plattformer» → «Snapchat».
 */
export function SnapchatInlineAdd({ date }: { date: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEdit() {
    setValue("");
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setValue("");
    setError(null);
  }

  function save() {
    const trimmed = value.trim();
    if (trimmed === "") {
      cancel();
      return;
    }
    const views = Number(trimmed);
    if (!Number.isFinite(views) || views < 0) {
      setError(t("dashboard.snapchatInvalidNumber"));
      return;
    }

    startTransition(async () => {
      const res = await createSnapchatManualVideo({
        caption: "",
        postedAt: date,
        views: Math.floor(views),
        screenshots: 0,
        shares: 0,
        permalink: null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      cancel();
      router.refresh();
    });
  }

  if (editing) {
    return (
      <span className="relative inline-flex items-center gap-1">
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onBlur={(e) => {
            // Ikke kanseller hvis brukeren klikker på selve feilboblen for
            // å lese hele meldingen.
            const next = e.relatedTarget as HTMLElement | null;
            if (next?.closest?.("[data-snapchat-error]")) return;
            save();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              save();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
          disabled={isPending}
          placeholder="0"
          aria-label={t("dashboard.snapchatViewsLabel")}
          title={error ?? t("dashboard.snapchatInlineHover")}
          className={`w-20 rounded-md border bg-white px-1.5 py-0.5 text-right text-sm tabular-nums text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 ${
            error
              ? "border-red-400 focus:ring-red-400/40"
              : "border-yellow-400/60 focus:ring-yellow-400/40"
          }`}
        />
        {error ? (
          <span
            data-snapchat-error
            tabIndex={-1}
            role="alert"
            className="absolute right-0 top-full z-30 mt-1 max-w-[260px] whitespace-normal rounded-md border border-red-400/40 bg-red-50 px-2 py-1 text-left text-[11px] font-medium leading-tight text-red-700 shadow-lg dark:border-red-500/40 dark:bg-red-950/90 dark:text-red-300"
          >
            {error}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      title={t("dashboard.snapchatInlineHover")}
      className="rounded px-1.5 py-0.5 text-sm tabular-nums text-zinc-400 transition-colors hover:bg-yellow-400/10 hover:text-yellow-500 dark:text-zinc-600 dark:hover:text-yellow-400"
    >
      —
    </button>
  );
}

function Modal({
  onClose,
  initialMode = "list",
  initialDate = null,
}: {
  onClose: () => void;
  initialMode?: "list" | "create";
  initialDate?: string | null;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [items, setItems] = useState<SnapchatManualVideo[] | null>(null);
  const [form, setForm] = useState<FormState>(() =>
    buildEmptyForm(initialDate)
  );
  const [isFormOpen, setIsFormOpen] = useState(initialMode === "create");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void refresh();
  }, []);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  async function refresh() {
    try {
      const data = await listSnapchatManualVideos();
      setItems(data);
    } catch {
      setItems([]);
    }
  }

  function startCreate() {
    setForm(buildEmptyForm(initialDate));
    setIsFormOpen(true);
    setError(null);
  }

  function startEdit(video: SnapchatManualVideo) {
    setForm(fromVideoToForm(video));
    setIsFormOpen(true);
    setError(null);
  }

  function closeForm() {
    // I "celle-modus" finnes ingen liste å gå tilbake til — lukk hele modalen.
    if (initialMode === "create") {
      onClose();
      return;
    }
    setIsFormOpen(false);
    setForm(buildEmptyForm(initialDate));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      caption: form.caption.trim(),
      postedAt: form.postedAt,
      views: Number(form.views) || 0,
      screenshots: Number(form.screenshots) || 0,
      shares: Number(form.shares) || 0,
      permalink: form.permalink.trim() || null,
    };

    startTransition(async () => {
      const res = form.id
        ? await updateSnapchatManualVideo(form.id, payload)
        : await createSnapchatManualVideo(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      closeForm();
      await refresh();
      router.refresh();
    });
  }

  function handleDelete(video: SnapchatManualVideo) {
    if (
      !confirm(
        `${t("dashboard.snapchatModalDelete")}: "${video.caption || t("dashboard.noTitle")}"?`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteSnapchatManualVideo(video.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      await refresh();
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
      <div className="flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#131313]">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-yellow-400 text-zinc-900">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.344-.134.553-.076.27-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.78-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.075-.54.075-.374 0-.523-.224-.583-.42-.061-.192-.09-.36-.135-.553-.045-.18-.105-.479-.166-.569-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.654.305-4.847C7.844 1.075 11.2.794 12.184.794l.484-.005h.035z" />
                </svg>
              </span>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {t("dashboard.snapchatModalTitle")}
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {t("dashboard.snapchatModalSubtitle")}
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

        {isFormOpen ? (
          <SnapchatForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isPending={isPending}
            error={error}
          />
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {items === null
                  ? t("dashboard.snapchatModalLoading")
                  : items.length === 0
                  ? t("dashboard.snapchatModalEmpty")
                  : t(
                      items.length === 1
                        ? "dashboard.snapchatManualWithCountSingular"
                        : "dashboard.snapchatManualWithCount",
                      { count: String(items.length) },
                    )}
              </span>
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-yellow-300"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="h-3.5 w-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t("dashboard.snapchatModalAdd")}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {items === null ? (
                <div className="px-6 py-10 text-center text-sm text-zinc-500">
                  {t("dashboard.snapchatModalLoading")}
                </div>
              ) : items.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-zinc-500">
                  {t("dashboard.snapchatModalEmpty")}
                </div>
              ) : (
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-4 px-6 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-zinc-500">
                            {formatDate(item.posted_at)}
                          </span>
                          <span className="text-xs text-zinc-500">·</span>
                          <span className="text-xs tabular-nums text-zinc-500">
                            {formatNumber(item.view_count)} {t("dashboard.analyticsViews").toLowerCase()}
                          </span>
                          {item.screenshot_count > 0 ? (
                            <>
                              <span className="text-xs text-zinc-500">·</span>
                              <span className="text-xs tabular-nums text-zinc-500">
                                {formatNumber(item.screenshot_count)}{" "}
                                {t("dashboard.snapchatScreenshotsLabel").toLowerCase()}
                              </span>
                            </>
                          ) : null}
                        </div>
                        <p className="mt-1 truncate text-sm text-zinc-900 dark:text-zinc-100">
                          {item.caption || `(${t("dashboard.noTitle").toLowerCase()})`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {item.permalink ? (
                          <a
                            href={item.permalink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            title={t("dashboard.snapchatPermalinkLabel")}
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
                          onClick={() => startEdit(item)}
                          className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          {t("dashboard.snapchatModalEdit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={isPending}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                          title={t("dashboard.snapchatModalDelete")}
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {error && !isFormOpen ? (
          <div className="border-t border-red-500/30 bg-red-500/10 px-6 py-2 text-xs text-red-500 dark:text-red-300">
            {error}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

function SnapchatForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  isPending,
  error,
}: {
  form: FormState;
  setForm: (form: FormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
  error: string | null;
}) {
  const { t } = useLanguage();
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-1 flex-col overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-4">
          <Field label={t("dashboard.snapchatCaptionLabel")}>
            <input
              type="text"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              maxLength={500}
              placeholder={t("dashboard.snapchatCaptionPlaceholder")}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600"
            />
          </Field>

          <Field label={t("dashboard.snapchatPostedAtLabel")} required>
            <input
              type="date"
              required
              value={form.postedAt}
              onChange={(e) => setForm({ ...form, postedAt: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label={t("dashboard.snapchatViewsLabel")} required>
              <input
                type="number"
                min={0}
                step={1}
                required
                value={form.views}
                onChange={(e) =>
                  setForm({ ...form, views: e.target.value })
                }
                placeholder="0"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm tabular-nums text-zinc-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </Field>
            <Field label={t("dashboard.snapchatScreenshotsLabel")}>
              <input
                type="number"
                min={0}
                step={1}
                value={form.screenshots}
                onChange={(e) =>
                  setForm({ ...form, screenshots: e.target.value })
                }
                placeholder="0"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm tabular-nums text-zinc-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </Field>
            <Field label={t("dashboard.snapchatSharesLabel")}>
              <input
                type="number"
                min={0}
                step={1}
                value={form.shares}
                onChange={(e) =>
                  setForm({ ...form, shares: e.target.value })
                }
                placeholder="0"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm tabular-nums text-zinc-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </Field>
          </div>

          <Field label={t("dashboard.snapchatPermalinkLabel")}>
            <input
              type="url"
              value={form.permalink}
              onChange={(e) =>
                setForm({ ...form, permalink: e.target.value })
              }
              placeholder={t("dashboard.snapchatPermalinkPlaceholder")}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600"
            />
          </Field>
        </div>
      </div>

      {error ? (
        <div className="border-t border-red-500/30 bg-red-500/10 px-6 py-2 text-xs text-red-500 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {t("dashboard.cancel")}
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-yellow-300 disabled:opacity-50"
        >
          {isPending ? (
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
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
          ) : null}
          {form.id ? t("dashboard.saveChanges") : t("dashboard.snapchatModalAdd")}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required ? <span className="ml-0.5 text-yellow-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}
