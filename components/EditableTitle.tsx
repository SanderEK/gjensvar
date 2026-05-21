"use client";

import { useState } from "react";
import { updateVideoTitle } from "@/app/actions/updateTitle";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface EditableTitleProps {
  date: string;
  initialTitle: string;
  isCustom: boolean;
}

export function EditableTitle({ date, initialTitle, isCustom }: EditableTitleProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (title.trim() === "") {
      setTitle(initialTitle);
      setIsEditing(false);
      return;
    }

    setSaving(true);
    const result = await updateVideoTitle(date, title);
    setSaving(false);

    if (result.success) {
      setIsEditing(false);
      // Refresh for å vise oppdatert tittel
      window.location.reload();
    } else {
      alert(result.message);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTitle(initialTitle);
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={saving}
        autoFocus
        className="w-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-500 dark:border-zinc-600 rounded px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="group flex items-center gap-2 text-left hover:text-blue-400 transition-colors"
      title={t("dashboard.rowEditTitle")}
    >
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {title.length > 25 ? title.slice(0, 25) + "…" : title}
      </span>
      <svg
        className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
      {isCustom && (
        <span className="text-[10px] text-blue-400" title={t("dashboard.rowEditTitle")}>
          *
        </span>
      )}
    </button>
  );
}
