"use client";

import { ConnectTikTokButton } from "./ConnectTikTokButton";
import { ConnectYouTubeButton } from "./ConnectYouTubeButton";
import { SyncAllButton } from "./SyncAllButton";
import { LogoutButton } from "./LogoutButton";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col gap-8">
      {/* Logo / Header */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Gjensvar</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-6 flex-1">
        {/* Plattformer */}
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            Plattformer
          </h2>
          <div className="flex flex-col gap-2">
            <ConnectTikTokButton />
            <ConnectYouTubeButton />
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-600 cursor-not-allowed"
              title="Instagram OAuth kommer snart"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Instagram
              <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-600">*</span>
            </button>
          </div>
        </div>

        {/* Data */}
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            Data
          </h2>
          <SyncAllButton />
        </div>
      </nav>

      {/* Footer - Logg ut */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
          Konto
        </h2>
        <LogoutButton />
      </div>
    </aside>
  );
}
