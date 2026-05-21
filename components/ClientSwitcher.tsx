"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
  setActiveClient,
  createClient,
  deleteClient,
  renameClient,
} from "@/app/actions/clients";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface ClientInfo {
  id: string;
  name: string;
  role: string;
}

export function ClientSwitcher({
  clients,
  activeClientId,
}: {
  clients: ClientInfo[];
  activeClientId: string | null;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<ClientInfo | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [renameTarget, setRenameTarget] = useState<ClientInfo | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const activeClient = clients.find((c) => c.id === activeClientId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCreate(false);
        setDeleteTarget(null);
        setDeleteConfirmName("");
        setRenameTarget(null);
        setRenameValue("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = (clientId: string) => {
    if (clientId === activeClientId) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await setActiveClient(clientId);
      setOpen(false);
      router.refresh();
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    startTransition(async () => {
      await createClient(newName.trim());
      setNewName("");
      setShowCreate(false);
      setOpen(false);
      router.refresh();
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget || deleteConfirmName !== deleteTarget.name) return;
    startTransition(async () => {
      await deleteClient(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteConfirmName("");
      router.refresh();
    });
  };

  const handleRenameConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget) return;
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === renameTarget.name) {
      setRenameTarget(null);
      setRenameValue("");
      return;
    }
    startTransition(async () => {
      await renameClient(renameTarget.id, trimmed);
      setRenameTarget(null);
      setRenameValue("");
      router.refresh();
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        {activeClient ? activeClient.name : t("dashboard.selectClient")}
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 shadow-xl">
          {deleteTarget ? (
            <div className="p-3 space-y-3">
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{t("dashboard.deleteClient")}</p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {(() => {
                    const parts = t("dashboard.deleteClientWarn", { name: "__NAME__" }).split("__NAME__");
                    return (
                      <>
                        {parts[0]}
                        <span className="font-semibold text-red-400">{deleteTarget.name}</span>
                        {parts[1]}
                      </>
                    );
                  })()}
                </p>
              </div>
              <input
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={deleteTarget.name}
                autoFocus
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteConfirmName("");
                  }}
                  className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t("dashboard.cancel")}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isPending || deleteConfirmName !== deleteTarget.name}
                  className="flex-1 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-zinc-900 dark:text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPending ? t("dashboard.deleting") : t("dashboard.delete")}
                </button>
              </div>
            </div>
          ) : renameTarget ? (
            <form onSubmit={handleRenameConfirm} className="p-3 space-y-3">
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{t("dashboard.renameClient")}</p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {renameTarget.name}
                </p>
              </div>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder={t("dashboard.clientNamePlaceholder")}
                autoFocus
                maxLength={120}
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRenameTarget(null);
                    setRenameValue("");
                  }}
                  className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t("dashboard.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isPending || !renameValue.trim() || renameValue.trim() === renameTarget.name}
                  className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPending ? t("dashboard.renaming") : t("dashboard.saveChanges")}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="p-2">
                <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                  {t("dashboard.clients")}
                </p>

                {clients.length === 0 ? (
                  <p className="px-2 py-3 text-center text-sm text-zinc-500 dark:text-zinc-500">
                    {t("dashboard.noClients")}
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className={`flex items-center justify-between rounded-md px-2 py-2 transition-colors ${
                          client.id === activeClientId
                            ? "bg-blue-600/20 text-blue-400"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <button
                          onClick={() => handleSwitch(client.id)}
                          className="flex flex-1 items-center gap-2 text-left text-sm"
                        >
                          {client.id === activeClientId && (
                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          <span className={client.id === activeClientId ? "" : "ml-5.5"}>{client.name}</span>
                        </button>
                        {client.role === "admin" && (
                          <div className="flex shrink-0 items-center gap-0.5">
                            <button
                              onClick={() => {
                                setRenameTarget(client);
                                setRenameValue(client.name);
                              }}
                              className="rounded p-1 text-zinc-500 dark:text-zinc-500 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300"
                              title={t("dashboard.renameClient")}
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(client)}
                              className="rounded p-1 text-zinc-500 dark:text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                              title={t("dashboard.deleteClient")}
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 p-2">
                {showCreate ? (
                  <form onSubmit={handleCreate} className="flex gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={t("dashboard.clientNamePlaceholder")}
                      autoFocus
                      className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isPending || !newName.trim()}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-zinc-900 dark:text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {t("dashboard.create")}
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-zinc-600 dark:text-zinc-400 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    {t("dashboard.createNewClient")}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
