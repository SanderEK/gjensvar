"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { VideoCategory } from "@/lib/types";
import {
  updateVideoCategory,
  createCategory,
  deleteCategory,
} from "@/app/actions/updateCategory";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

// ---------- Faste fargevalg ----------

const COLOR_OPTIONS = [
  { key: "green", label: "Grønn", badge: "bg-green-500/20 text-green-400 ring-green-500/30", dot: "bg-green-400" },
  { key: "blue", label: "Blå", badge: "bg-blue-500/20 text-blue-400 ring-blue-500/30", dot: "bg-blue-400" },
  { key: "purple", label: "Lilla", badge: "bg-purple-500/20 text-purple-400 ring-purple-500/30", dot: "bg-purple-400" },
  { key: "red", label: "Rød", badge: "bg-red-500/20 text-red-400 ring-red-500/30", dot: "bg-red-400" },
  { key: "orange", label: "Oransje", badge: "bg-orange-500/20 text-orange-400 ring-orange-500/30", dot: "bg-orange-400" },
  { key: "yellow", label: "Gul", badge: "bg-yellow-500/20 text-yellow-400 ring-yellow-500/30", dot: "bg-yellow-400" },
  { key: "pink", label: "Rosa", badge: "bg-pink-500/20 text-pink-400 ring-pink-500/30", dot: "bg-pink-400" },
] as const;

function getColorConfig(colorKey: string) {
  return COLOR_OPTIONS.find((c) => c.key === colorKey) ?? COLOR_OPTIONS[0];
}

// ---------- Single badge dropdown ----------

interface BadgeDropdownProps {
  date: string;
  slot: 1 | 2;
  currentCategoryId: string | null;
  currentCategoryName: string | null;
  currentCategoryColor: string | null;
  categories: VideoCategory[];
  onCategoriesChange: (categories: VideoCategory[]) => void;
}

function BadgeDropdown({
  date,
  slot,
  currentCategoryId,
  currentCategoryName,
  currentCategoryColor,
  categories,
  onCategoriesChange,
}: BadgeDropdownProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("green");
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowNewForm(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [isOpen]);

  async function handleSelect(categoryId: string | null) {
    setSaving(true);
    await updateVideoCategory(date, slot, categoryId);
    setSaving(false);
    setIsOpen(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setSaving(true);
    const result = await createCategory(newName.trim(), newColor);
    if (result.success && result.category) {
      const newCat = result.category as VideoCategory;
      onCategoriesChange([...categories, newCat]);
      await updateVideoCategory(date, slot, newCat.id);
      setNewName("");
      setShowNewForm(false);
    }
    setSaving(false);
    setIsOpen(false);
  }

  async function handleDelete(e: React.MouseEvent, catId: string) {
    e.stopPropagation();
    setSaving(true);
    const result = await deleteCategory(catId);
    if (result.success) {
      onCategoriesChange(categories.filter((c) => c.id !== catId));
    }
    setSaving(false);
  }

  const colorConfig = currentCategoryColor ? getColorConfig(currentCategoryColor) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={saving}
        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors ${
          colorConfig
            ? colorConfig.badge
            : "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-500 ring-zinc-300/50 dark:ring-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-400"
        }`}
      >
        {currentCategoryName ?? "—"}
        <svg
          className="ml-1 h-3 w-3 opacity-60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-56 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 shadow-xl"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <button
            onClick={() => handleSelect(null)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-800 ${
              !currentCategoryId ? "text-zinc-800 dark:text-zinc-200 font-medium" : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-500 dark:bg-zinc-600" />
            —
          </button>

          <div className="border-t border-zinc-200 dark:border-zinc-800" />

          <div className="max-h-48 overflow-y-auto">
            {categories.map((cat) => {
              const cc = getColorConfig(cat.color);
              const isActive = cat.id === currentCategoryId;
              return (
                <div
                  key={cat.id}
                  className={`group flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-zinc-800 cursor-pointer ${
                    isActive ? "text-zinc-800 dark:text-zinc-200 font-medium" : "text-zinc-600 dark:text-zinc-400"
                  }`}
                  onClick={() => handleSelect(cat.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${cc.dot}`} />
                    {cat.name}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, cat.id)}
                    className="hidden group-hover:block text-zinc-500 dark:text-zinc-600 hover:text-red-400 transition-colors"
                    title={t("dashboard.categoryRemove")}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800" />

          {showNewForm ? (
            <div className="p-2 space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                placeholder={t("dashboard.categoryPlaceholder")}
                autoFocus
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-2 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-1">
                {COLOR_OPTIONS.map((co) => (
                  <button
                    key={co.key}
                    onClick={() => setNewColor(co.key)}
                    className={`h-5 w-5 rounded-full ${co.dot} transition-all ${
                      newColor === co.key
                        ? "ring-2 ring-white ring-offset-1 ring-offset-zinc-900 scale-110"
                        : "opacity-50 hover:opacity-80"
                    }`}
                    title={co.label}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || saving}
                  className="flex-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-zinc-900 dark:text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  {t("dashboard.create")}
                </button>
                <button
                  onClick={() => { setShowNewForm(false); setNewName(""); }}
                  className="rounded-md px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  {t("dashboard.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewForm(true)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t("dashboard.categoryNew")}
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

// ---------- Props ----------

interface CategoryCellProps {
  date: string;
  currentCategoryId: string | null;
  currentCategoryName: string | null;
  currentCategoryColor: string | null;
  currentCategoryId2: string | null;
  currentCategoryName2: string | null;
  currentCategoryColor2: string | null;
  categories: VideoCategory[];
  onCategoriesChange: (categories: VideoCategory[]) => void;
}

// ---------- Komponent ----------

export function CategoryCell({
  date,
  currentCategoryId,
  currentCategoryName,
  currentCategoryColor,
  currentCategoryId2,
  currentCategoryName2,
  currentCategoryColor2,
  categories,
  onCategoriesChange,
}: CategoryCellProps) {
  return (
    <td className="px-4 py-3">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          {/* Slot 1 ikon: tag/etikett */}
          <svg className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <BadgeDropdown
            date={date}
            slot={1}
            currentCategoryId={currentCategoryId}
            currentCategoryName={currentCategoryName}
            currentCategoryColor={currentCategoryColor}
            categories={categories}
            onCategoriesChange={onCategoriesChange}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {/* Slot 2 ikon: mappe/tema */}
          <svg className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <BadgeDropdown
            date={date}
            slot={2}
            currentCategoryId={currentCategoryId2}
            currentCategoryName={currentCategoryName2}
            currentCategoryColor={currentCategoryColor2}
            categories={categories}
            onCategoriesChange={onCategoriesChange}
          />
        </div>
      </div>
    </td>
  );
}
