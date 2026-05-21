"use client";

import { useState } from "react";
import { syncInstagramData } from "@/app/actions/syncInstagram";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setLoading(true);
    setMessage("");

    const result = await syncInstagramData();

    setLoading(false);
    setMessage(result.message);

    if (result.success) {
      // Refresh siden for å vise nye data
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {loading ? "Henter data..." : "Hent data fra Instagram"}
      </button>
      {message && (
        <p
          className={`text-sm ${
            message.includes("fullført")
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
