"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "demoResetButtonVisible";

// Vises kun når den aktive kunden er en demo-kunde (sjekkes server-side i
// app/dashboard/page.tsx via DEMO_CLIENT_IDS). Knappen kaller
// /api/demo/reset som tømmer dummy-data slik at man kan starte et nytt
// videoopptak fra et tomt dashbord.
//
// Trykk "o" på tastaturet for å skjule/vise knappen. Nyttig for å holde
// den ute av selve opptaket. Valget lagres i localStorage slik at det
// overlever sidelastingen som skjer ved synk og reset.
export function DemoResetButton() {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setVisible(stored === "true");
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.toLowerCase() !== "o") return;

      const el = document.activeElement as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      ) {
        return;
      }

      setVisible((prev) => {
        const next = !prev;
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // localStorage utilgjengelig (privat modus e.l.) – ignorer.
        }
        return next;
      });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleReset() {
    if (running) return;
    if (
      !window.confirm(
        "Slette alle demo-data for denne kunden? Dashboardet blir tomt.",
      )
    ) {
      return;
    }
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Feil (${res.status}).`);
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukjent feil");
      setRunning(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="relative">
      <button
        onClick={handleReset}
        disabled={running}
        title="Tilbakestill demo-data (trykk O for å skjule/vise)"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/20"
      >
        <svg
          className={running ? "h-4 w-4 animate-spin" : "h-4 w-4"}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M16 7V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3"
          />
        </svg>
        {running ? "Tilbakestiller…" : "Tilbakestill demo"}
      </button>
      {error ? (
        <div className="absolute right-0 top-full mt-1 whitespace-nowrap rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}
