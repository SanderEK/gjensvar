"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ConnectPlatformsButton } from "./ConnectPlatformsButton";
import { SyncAllButton } from "./SyncAllButton";
import { LogoutButton } from "./LogoutButton";
import { ClientSwitcher } from "./ClientSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { ConnectedAccountInfo } from "@/app/dashboard/page";

const ADMIN_EMAILS = ["sekapstad@gmail.com"];

interface ClientInfo {
  id: string;
  name: string;
  role: string;
}

export function Topbar({
  connectedAccounts = [],
  userEmail = null,
  clients = [],
  activeClientId = null,
  snapchatManualCount = 0,
}: {
  connectedAccounts?: ConnectedAccountInfo[];
  userEmail?: string | null;
  clients?: ClientInfo[];
  activeClientId?: string | null;
  snapchatManualCount?: number;
}) {
  const isAdmin = !!userEmail && ADMIN_EMAILS.includes(userEmail);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:border-zinc-800/70 dark:bg-zinc-950/70 dark:supports-[backdrop-filter]:bg-zinc-950/50">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-6">
        {/* Venstre: hamburger-meny + logo */}
        <div className="flex items-center gap-3">
          {isAdmin ? <MoreMenu /> : null}
          <Link
            href="/dashboard"
            className="flex items-center"
            aria-label="Gjensvar"
          >
            <Image
              src="/logos/gjensvar-white.png"
              alt="Gjensvar"
              width={1024}
              height={348}
              priority
              className="h-10 w-auto invert dark:invert-0"
            />
          </Link>
        </div>

        {/* Senter-venstre: client + plattformer */}
        <div className="ml-2 flex items-center gap-2">
          <ClientSwitcher clients={clients} activeClientId={activeClientId} />
          <ConnectPlatformsButton
            connectedAccounts={connectedAccounts}
            snapchatManualCount={snapchatManualCount}
          />
        </div>

        {/* Høyre: synk + språk + tema + logout */}
        <div className="ml-auto flex items-center gap-2">
          <SyncAllButton />
          <LanguageToggle variant="dashboard" />
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

function MoreMenu() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("dashboard.menu")}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      {open ? (
        <div className="absolute left-0 top-full mt-1.5 w-56 rounded-lg border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <Link
            href="/dashboard/admin"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            {t("dashboard.adminApprovedEmails")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
