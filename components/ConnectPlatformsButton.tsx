"use client";

import { useState, useTransition } from "react";
import { disconnectAccount } from "@/app/actions/connectedAccounts";
import { SnapchatManualButton } from "./SnapchatManualModal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { ConnectedAccountInfo } from "@/app/dashboard/page";

interface PlatformConfig {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  bgClass: string;
  bgConnected: string;
}

const platforms: PlatformConfig[] = [
  {
    key: "tiktok",
    label: "TikTok",
    href: "/api/auth/tiktok",
    bgClass: "bg-purple-600 hover:bg-purple-700",
    bgConnected: "bg-purple-600/20 border-purple-500/40",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13v-3.5a6.37 6.37 0 0 0-.88-.07 6.26 6.26 0 0 0 0 12.51 6.27 6.27 0 0 0 6.26-6.26V8.55a8.16 8.16 0 0 0 3.84.96V6.09a4.84 4.84 0 0 1 0 .6Z" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    href: "/api/auth/youtube",
    bgClass: "bg-red-600 hover:bg-red-700",
    bgConnected: "bg-red-600/20 border-red-500/40",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "/api/auth/meta?platform=instagram",
    bgClass: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90",
    bgConnected: "bg-pink-600/20 border-pink-500/40",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    href: "/api/auth/meta?platform=facebook",
    bgClass: "bg-blue-600 hover:bg-blue-700",
    bgConnected: "bg-blue-600/20 border-blue-500/40",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

function getProfileUrl(platform: string, username: string | null): string | null {
  if (!username) return null;
  const clean = username.replace(/^@/, "");
  switch (platform) {
    case "tiktok":
      return `https://www.tiktok.com/@${clean}`;
    case "youtube":
      return `https://www.youtube.com/@${clean}`;
    case "instagram":
      return `https://www.instagram.com/${clean}`;
    case "facebook":
      return `https://www.facebook.com/${clean}`;
    default:
      return null;
  }
}

export function ConnectPlatformsButton({
  connectedAccounts = [],
  snapchatManualCount = 0,
}: {
  connectedAccounts?: ConnectedAccountInfo[];
  snapchatManualCount?: number;
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const accountMap = new Map(connectedAccounts.map((a) => [a.platform, a]));

  function handleDisconnect(platform: string) {
    setDisconnecting(platform);
    startTransition(async () => {
      const result = await disconnectAccount(platform);
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.message);
        setDisconnecting(null);
      }
    });
  }

  const connectedCount =
    connectedAccounts.length + (snapchatManualCount > 0 ? 1 : 0);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        {t("dashboard.platforms")}
        {connectedCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
            {connectedCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 z-20 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
            <div className="p-2 space-y-1">
              {platforms.map((p) => {
                const account = accountMap.get(p.key);
                const isConnected = !!account;
                const isThisDisconnecting = disconnecting === p.key;

                if (isConnected) {
                  return (
                    <div
                      key={p.key}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 ${p.bgConnected}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 text-zinc-900 dark:text-white">{p.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{p.label}</span>
                            <svg className="h-3.5 w-3.5 shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                          </div>
                          {account.platform_username && (
                            (() => {
                              const profileUrl = getProfileUrl(p.key, account.platform_username);
                              return profileUrl ? (
                                <a
                                  href={profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 truncate text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                                >
                                  @{account.platform_username}
                                  <svg className="h-2.5 w-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              ) : (
                                <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                                  @{account.platform_username}
                                </p>
                              );
                            })()
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 ml-2">
                        <a
                          href={p.href}
                          className="rounded p-1 text-zinc-500 dark:text-zinc-500 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300"
                          title={t("dashboard.switchAccount")}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </a>
                        <button
                          onClick={() => handleDisconnect(p.key)}
                          disabled={isPending}
                          className="rounded p-1 text-zinc-500 dark:text-zinc-500 transition-colors hover:bg-red-950 hover:text-red-400 disabled:opacity-50"
                          title={t("dashboard.disconnect")}
                        >
                          {isThisDisconnecting ? (
                            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <a
                    key={p.key}
                    href={p.href}
                    onClick={() => setIsOpen(false)}
                    className={`inline-flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-zinc-900 dark:text-white shadow-sm transition-colors ${p.bgClass}`}
                  >
                    {p.icon}
                    {t("dashboard.connectPlatform", { platform: p.label })}
                  </a>
                );
              })}

              <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />

              <SnapchatManualButton count={snapchatManualCount} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
