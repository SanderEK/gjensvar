"use client";

import { useState } from "react";
import { syncTikTokData } from "@/app/actions/syncTikTok";

export function SyncTikTokButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSync() {
    setLoading(true);
    setMessage("");

    try {
      const result = await syncTikTokData();
      setMessage(result.message);
    } catch {
      setMessage("Noe gikk galt ved synkronisering.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        {loading ? "Synkroniserer TikTok…" : "Sync TikTok"}
      </button>
      {message && (
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          {message}
        </span>
      )}
    </div>
  );
}
