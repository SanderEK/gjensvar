"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getGreenlistedEmails,
  addEmailToGreenlist,
  removeEmailFromGreenlist,
} from "@/app/actions/allowedEmails";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface AllowedEmail {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminGreenlistPage() {
  const { t, lang } = useLanguage();
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [fetching, setFetching] = useState(true);

  const fetchEmails = useCallback(async () => {
    setFetching(true);
    const result = await getGreenlistedEmails();
    if (result.success) {
      setEmails(result.emails);
    } else {
      setMessage({ text: result.message || t("dashboard.adminFetchError"), success: false });
    }
    setFetching(false);
  }, [t]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await addEmailToGreenlist(newEmail);
    setMessage({ text: result.message, success: result.success });
    setLoading(false);

    if (result.success) {
      setNewEmail("");
      fetchEmails();
    }
  };

  const handleRemove = async (id: string) => {
    setRemoving(id);
    const result = await removeEmailFromGreenlist(id);
    setMessage({ text: result.message, success: result.success });
    setRemoving(null);

    if (result.success) {
      setEmails((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black px-4">
      <div className="w-full max-w-lg space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t("dashboard.adminBack")}
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t("dashboard.adminTitle")}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {t("dashboard.adminSubtitle")}
          </p>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t("dashboard.adminEmailPlaceholder")}
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("dashboard.adminAdding") : t("dashboard.adminAdd")}
          </button>
        </form>

        {message && (
          <p className={`text-sm ${message.success ? "text-green-400" : "text-red-400"}`}>
            {message.text}
          </p>
        )}

        <div className="space-y-2">
          {fetching ? (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">{t("dashboard.adminLoading")}</p>
          ) : emails.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">{t("dashboard.adminEmpty")}</p>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800">
              {emails.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{entry.email}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      {t("dashboard.adminAddedAt", {
                        date: new Date(entry.created_at).toLocaleDateString(lang === "nb" ? "nb-NO" : "en-US"),
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(entry.id)}
                    disabled={removing === entry.id}
                    className="rounded-md px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-400/10 disabled:opacity-50"
                  >
                    {removing === entry.id ? t("dashboard.adminRemoving") : t("dashboard.adminRemove")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
