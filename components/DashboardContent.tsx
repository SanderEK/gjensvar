"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { UnifiedVideoRow, VideoCategory } from "@/lib/types";
import { setClientReportBrand } from "@/app/actions/clients";
import { EditableTitle } from "./EditableTitle";
import { CategoryCell } from "./CategoryCell";
import { PlatformCellOverride, RowMergeButton } from "./RowOverrideControls";
import { HiddenVideosButton } from "./HiddenVideosModal";
import { SnapchatInlineAdd } from "./SnapchatManualModal";
import { Sparkline } from "./Sparkline";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";
import {
  exportVideosCsv,
  exportMonthlyCsv,
  exportWeeklyCsv,
  exportPostsCsv,
  exportPdf,
  exportClientReport,
  exportPeriodReport,
  getWeekDateRange,
} from "@/lib/exportUtils";

const AnalyticsView = dynamic(
  () => import("./AnalyticsView").then((mod) => mod.AnalyticsView),
  { ssr: false, loading: () => <div className="flex h-96 items-center justify-center text-zinc-500 dark:text-zinc-500">…</div> }
);

const MONTH_KEYS: TranslationKey[] = [
  "dashboard.monthJan",
  "dashboard.monthFeb",
  "dashboard.monthMar",
  "dashboard.monthApr",
  "dashboard.monthMay",
  "dashboard.monthJun",
  "dashboard.monthJul",
  "dashboard.monthAug",
  "dashboard.monthSep",
  "dashboard.monthOct",
  "dashboard.monthNov",
  "dashboard.monthDec",
];

const MONTH_SHORT_KEYS: TranslationKey[] = [
  "dashboard.monthShortJan",
  "dashboard.monthShortFeb",
  "dashboard.monthShortMar",
  "dashboard.monthShortApr",
  "dashboard.monthShortMay",
  "dashboard.monthShortJun",
  "dashboard.monthShortJul",
  "dashboard.monthShortAug",
  "dashboard.monthShortSep",
  "dashboard.monthShortOct",
  "dashboard.monthShortNov",
  "dashboard.monthShortDec",
];

function getMonthIndex(dateStr: string): number {
  return new Date(dateStr + "T00:00:00").getMonth();
}

// ---------- Plattform-config ----------

interface PlatformColumn {
  key: "tiktok" | "youtube" | "instagram" | "snapchat" | "facebook";
  label: string;
  active: boolean;
  /** Hex-farge på dotten foran kolonnenavnet */
  dot: string;
}

const PLATFORMS: PlatformColumn[] = [
  { key: "tiktok", label: "TikTok", active: true, dot: "#c084fc" },
  { key: "youtube", label: "YouTube", active: true, dot: "#ef4444" },
  { key: "instagram", label: "Instagram", active: true, dot: "#fb923c" },
  { key: "facebook", label: "Facebook", active: true, dot: "#3b82f6" },
  { key: "snapchat", label: "Snapchat", active: true, dot: "#facc15" },
];

const MONTH_NAMES = [
  "Januar",
  "Februar",
  "Mars",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// ---------- Hjelpefunksjoner ----------

function formatNumber(n: number): string {
  return n.toLocaleString("no-NO");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

// ---------- Sort ----------

type SortDirection = "asc" | "desc";

interface SortState {
  column: string | null;
  direction: SortDirection;
}

function toggleSort(state: SortState, col: string): SortState {
  if (state.column === col) {
    if (state.direction === "asc") return { column: col, direction: "desc" };
    return { column: null, direction: "asc" };
  }
  return { column: col, direction: "asc" };
}

function SortIcon({ column, sort }: { column: string; sort: SortState }) {
  const active = sort.column === column;
  if (!active) {
    return (
      <svg
        className="ml-1 inline h-3 w-3 text-zinc-500 dark:text-zinc-600 opacity-0 group-hover/th:opacity-100 transition-opacity"
        viewBox="0 0 12 12"
        fill="currentColor"
      >
        <path d="M6 1.5L9 5H3z" />
        <path d="M6 10.5L3 7H9z" />
      </svg>
    );
  }
  return (
    <svg className="ml-1 inline h-3 w-3 text-zinc-700 dark:text-zinc-300" viewBox="0 0 12 12" fill="currentColor">
      {sort.direction === "asc" ? (
        <path d="M6 2L10 7H2z" />
      ) : (
        <path d="M6 10L2 5H10z" />
      )}
    </svg>
  );
}

function SortableTh({
  column,
  label,
  sort,
  onSort,
  className = "",
}: {
  column: string;
  label: string;
  sort: SortState;
  onSort: (col: string) => void;
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 cursor-pointer select-none group/th hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors ${className}`}
      onClick={() => onSort(column)}
    >
      {label}
      <SortIcon column={column} sort={sort} />
    </th>
  );
}

// ---------- Monthly summary ----------

interface MonthlyRow {
  month: string;
  monthIndex: number;
  tiktok: number;
  youtube: number;
  instagram: number;
  snapchat: number;
  facebook: number;
  total: number;
  totalLikes: number;
}

function buildMonthlyRows(rows: UnifiedVideoRow[], year: number): MonthlyRow[] {
  const monthly: MonthlyRow[] = MONTH_NAMES.map((name, i) => ({
    month: name,
    monthIndex: i,
    tiktok: 0,
    youtube: 0,
    instagram: 0,
    snapchat: 0,
    facebook: 0,
    total: 0,
    totalLikes: 0,
  }));

  for (const row of rows) {
    const d = new Date(row.date + "T00:00:00");
    if (d.getFullYear() !== year) continue;

    const monthIdx = d.getMonth();
    const m = monthly[monthIdx];

    const tiktokViews = row.tiktok?.views ?? 0;
    const youtubeViews = row.youtube?.views ?? 0;
    const instagramViews = row.instagram?.views ?? 0;
    const snapchatViews = row.snapchat?.views ?? 0;
    const facebookViews = row.facebook?.views ?? 0;

    m.tiktok += tiktokViews;
    m.youtube += youtubeViews;
    m.instagram += instagramViews;
    m.snapchat += snapchatViews;
    m.facebook += facebookViews;
    m.total += tiktokViews + youtubeViews + instagramViews + snapchatViews + facebookViews;
    m.totalLikes += row.totalLikes ?? 0;
  }

  return monthly;
}

// ---------- Monthly post count ----------

interface MonthlyPostRow {
  month: string;
  monthIndex: number;
  tiktok: number;
  youtube: number;
  instagram: number;
  snapchat: number;
  facebook: number;
  total: number;
}

function buildMonthlyPostRows(rows: UnifiedVideoRow[], year: number): MonthlyPostRow[] {
  const monthly: MonthlyPostRow[] = MONTH_NAMES.map((name, i) => ({
    month: name,
    monthIndex: i,
    tiktok: 0,
    youtube: 0,
    instagram: 0,
    snapchat: 0,
    facebook: 0,
    total: 0,
  }));

  for (const row of rows) {
    const d = new Date(row.date + "T00:00:00");
    if (d.getFullYear() !== year) continue;

    const monthIdx = d.getMonth();
    const m = monthly[monthIdx];

    if (row.tiktok) { m.tiktok += 1; m.total += 1; }
    if (row.youtube) { m.youtube += 1; m.total += 1; }
    if (row.instagram) { m.instagram += 1; m.total += 1; }
    if (row.snapchat) { m.snapchat += 1; m.total += 1; }
    if (row.facebook) { m.facebook += 1; m.total += 1; }
  }

  return monthly;
}

// ---------- Weekly summary ----------

interface WeeklyRow {
  week: number;
  tiktok: number;
  youtube: number;
  instagram: number;
  snapchat: number;
  facebook: number;
  total: number;
}

/** Returnerer ISO-ukenummer (1-53) for en dato */
function getISOWeek(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  const target = new Date(d.valueOf());
  // Torsdag i inneværende uke avgjør ukenummeret
  const dayNr = (d.getDay() + 6) % 7; // mandag = 0
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

function buildWeeklyRows(rows: UnifiedVideoRow[], year: number): WeeklyRow[] {
  // Initialiser uke 1-53
  const weekMap = new Map<number, WeeklyRow>();
  for (let w = 1; w <= 53; w++) {
    weekMap.set(w, { week: w, tiktok: 0, youtube: 0, instagram: 0, snapchat: 0, facebook: 0, total: 0 });
  }

  for (const row of rows) {
    const d = new Date(row.date + "T00:00:00");
    if (d.getFullYear() !== year) continue;

    const weekNum = getISOWeek(row.date);
    const w = weekMap.get(weekNum);
    if (!w) continue;

    const tiktokViews = row.tiktok?.views ?? 0;
    const youtubeViews = row.youtube?.views ?? 0;
    const instagramViews = row.instagram?.views ?? 0;
    const snapchatViews = row.snapchat?.views ?? 0;
    const facebookViews = row.facebook?.views ?? 0;

    w.tiktok += tiktokViews;
    w.youtube += youtubeViews;
    w.instagram += instagramViews;
    w.snapchat += snapchatViews;
    w.facebook += facebookViews;
    w.total += tiktokViews + youtubeViews + instagramViews + snapchatViews + facebookViews;
  }

  return Array.from(weekMap.values()).sort((a, b) => a.week - b.week);
}

function getAvailableYears(rows: UnifiedVideoRow[]): number[] {
  const years = new Set<number>();
  for (const row of rows) {
    const d = new Date(row.date + "T00:00:00");
    years.add(d.getFullYear());
  }
  // Legg til inneværende år uansett (så brukeren kan navigere dit)
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

/** Året for nyeste video, eller inneværende år hvis det ikke finnes data. */
function getDefaultYear(rows: UnifiedVideoRow[]): number {
  let latest = 0;
  for (const row of rows) {
    const y = new Date(row.date + "T00:00:00").getFullYear();
    if (y > latest) latest = y;
  }
  return latest || new Date().getFullYear();
}

// ---------- Plattform-header ----------

function PlatformHeaders({ sort, onSort }: { sort: SortState; onSort: (col: string) => void }) {
  const { t } = useLanguage();
  return (
    <>
      {PLATFORMS.map((p, i) => (
        <th
          key={p.key}
          className={`whitespace-nowrap px-4 py-3 text-right cursor-pointer select-none group/th ${i === 0 ? "border-l border-zinc-200/60 dark:border-zinc-800/60" : ""}`}
          title={p.active ? undefined : t("dashboard.comingSoon")}
          onClick={() => onSort(p.key)}
        >
          <span className="inline-flex items-center justify-end gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 transition-colors group-hover/th:text-zinc-700 dark:group-hover/th:text-zinc-300">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: p.dot }}
            />
            {p.label}
            {!p.active && (
              <span className="text-[9px] font-normal">*</span>
            )}
          </span>
          <SortIcon column={p.key} sort={sort} />
        </th>
      ))}
      <th
        className="whitespace-nowrap px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 border-r border-zinc-200/60 dark:border-zinc-800/60 cursor-pointer select-none group/th hover:text-zinc-900 dark:hover:text-white transition-colors"
        onClick={() => onSort("total")}
      >
        {t("dashboard.tableTotal")}
        <SortIcon column="total" sort={sort} />
      </th>
    </>
  );
}

function PlatformHeadersWithLikes({ sort, onSort }: { sort: SortState; onSort: (col: string) => void }) {
  const { t } = useLanguage();
  return (
    <>
      <PlatformHeaders sort={sort} onSort={onSort} />
      <th
        className="whitespace-nowrap px-4 py-3 text-right cursor-pointer select-none group/th"
        onClick={() => onSort("likes")}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 transition-colors group-hover/th:text-zinc-700 dark:group-hover/th:text-zinc-300">
          {t("dashboard.tableLikes")}
        </span>
        <SortIcon column="likes" sort={sort} />
      </th>
    </>
  );
}

// ---------- Plattform-footer ----------

function PlatformFooter({ totals }: { totals: Record<string, number> }) {
  return (
    <>
      {PLATFORMS.map((p, i) => (
        <td
          key={p.key}
          className={`whitespace-nowrap px-4 py-3 text-right ${i === 0 ? "border-l border-zinc-200/60 dark:border-zinc-800/60" : ""}`}
        >
          <span
            style={p.active ? { color: p.dot } : undefined}
            className={`tabular-nums font-semibold ${
              p.active ? "" : "text-zinc-400 dark:text-zinc-600"
            }`}
          >
            {p.active ? formatNumber(totals[p.key] ?? 0) : "—"}
          </span>
        </td>
      ))}
      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums font-bold text-zinc-900 dark:text-white border-r border-zinc-200/60 dark:border-zinc-800/60">
        {formatNumber(totals.grand ?? 0)}
      </td>
    </>
  );
}

function PlatformFooterWithLikes({ totals }: { totals: Record<string, number> }) {
  return (
    <>
      <PlatformFooter totals={totals} />
      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums font-bold text-pink-400">
        {formatNumber(totals.likes ?? 0)}
      </td>
    </>
  );
}

// ---------- Props ----------

// ---------- Plattform-farger for tooltip ----------

const PLATFORM_TOOLTIP_COLORS: Record<string, string> = {
  tiktok: "text-purple-400",
  youtube: "text-red-400",
  instagram: "text-orange-400",
  snapchat: "text-yellow-400",
  facebook: "text-blue-400",
};

interface DashboardContentProps {
  rows: UnifiedVideoRow[];
  categories: VideoCategory[];
  hiddenCount?: number;
  activeClientId?: string | null;
  activeClientName?: string | null;
  activeClientReportBrand?: string | null;
  isSynced?: boolean;
}

// ---------- Komponent ----------

export function DashboardContent({
  rows,
  categories: initialCategories,
  hiddenCount = 0,
  activeClientId = null,
  activeClientName = null,
  activeClientReportBrand = null,
  isSynced = false,
}: DashboardContentProps) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<VideoCategory[]>(initialCategories);
  const [view, setView] = useState<"videos" | "views" | "posts" | "analyse">("videos");
  const [viewsPeriod, setViewsPeriod] = useState<"monthly" | "weekly">("monthly");
  const [reportBrand, setReportBrandState] = useState<string>(
    activeClientReportBrand ?? activeClientName ?? "",
  );
  const [reportBrandDraft, setReportBrandDraft] = useState<string>(reportBrand);
  const [isSavingBrand, startBrandTransition] = useTransition();
  useEffect(() => {
    const next = activeClientReportBrand ?? activeClientName ?? "";
    setReportBrandState(next);
    setReportBrandDraft(next);
  }, [activeClientReportBrand, activeClientName]);
  function commitReportBrand(next: string) {
    const trimmed = next.trim();
    if (trimmed === reportBrand) return;
    setReportBrandState(trimmed);
    if (!activeClientId) return;
    startBrandTransition(async () => {
      await setClientReportBrand(activeClientId, trimmed);
    });
  }
  const availableYears = getAvailableYears(rows);
  const [selectedYear, setSelectedYear] = useState(() => getDefaultYear(rows));
  const [selectedScope, setSelectedScope] = useState<"year" | "month" | "week">(
    "year",
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(() =>
    new Date().getMonth(),
  );
  const [selectedWeek, setSelectedWeek] = useState<number>(() =>
    getISOWeek(new Date().toISOString().split("T")[0]),
  );

  // Hjelpe-funksjon for å sjekke om en rad er i valgt periode-scope
  const isInScope = (row: UnifiedVideoRow, year: number) => {
    const d = new Date(row.date + "T00:00:00");
    if (d.getFullYear() !== year) return false;
    if (selectedScope === "month" && d.getMonth() !== selectedMonth)
      return false;
    if (selectedScope === "week" && getISOWeek(row.date) !== selectedWeek)
      return false;
    return true;
  };

  // Filtrer videoer etter valgt år + evt. måned/uke
  const filteredRows = rows.filter((r) => isInScope(r, selectedYear));

  // Totaler for video-visning (basert på filtrert år)
  const videoTotals = {
    tiktok: filteredRows.reduce((s, r) => s + (r.tiktok?.views ?? 0), 0),
    youtube: filteredRows.reduce((s, r) => s + (r.youtube?.views ?? 0), 0),
    instagram: filteredRows.reduce((s, r) => s + (r.instagram?.views ?? 0), 0),
    snapchat: filteredRows.reduce((s, r) => s + (r.snapchat?.views ?? 0), 0),
    facebook: filteredRows.reduce((s, r) => s + (r.facebook?.views ?? 0), 0),
    grand: filteredRows.reduce((s, r) => s + r.total, 0),
    likes: filteredRows.reduce((s, r) => s + r.totalLikes, 0),
  };

  // KPI-beregninger — sammenligning med samme periode året før
  const prevYearRows = rows.filter((r) => isInScope(r, selectedYear - 1));
  const prevYearTotal = prevYearRows.reduce((s, r) => s + r.total, 0);
  const growthPercent =
    prevYearTotal > 0
      ? ((videoTotals.grand - prevYearTotal) / prevYearTotal) * 100
      : null;

  const bestVideo =
    filteredRows.length > 0
      ? filteredRows.reduce((best, r) => (r.total > best.total ? r : best), filteredRows[0])
      : null;

  const engagementRate =
    videoTotals.grand > 0
      ? (videoTotals.likes / videoTotals.grand) * 100
      : 0;

  const totalPosts = filteredRows.reduce((s, r) => {
    let count = 0;
    if (r.tiktok) count++;
    if (r.youtube) count++;
    if (r.instagram) count++;
    if (r.snapchat) count++;
    if (r.facebook) count++;
    return s + count;
  }, 0);

  // Månedlig visningsdata (filtrert etter scope)
  const monthlyRows = buildMonthlyRows(filteredRows, selectedYear);
  const monthlyTotals = {
    tiktok: monthlyRows.reduce((s, m) => s + m.tiktok, 0),
    youtube: monthlyRows.reduce((s, m) => s + m.youtube, 0),
    instagram: monthlyRows.reduce((s, m) => s + m.instagram, 0),
    snapchat: monthlyRows.reduce((s, m) => s + m.snapchat, 0),
    facebook: monthlyRows.reduce((s, m) => s + m.facebook, 0),
    grand: monthlyRows.reduce((s, m) => s + m.total, 0),
  };

  // Månedlig poster-data (filtrert etter scope)
  const postRows = buildMonthlyPostRows(filteredRows, selectedYear);
  const postTotals = {
    tiktok: postRows.reduce((s, m) => s + m.tiktok, 0),
    youtube: postRows.reduce((s, m) => s + m.youtube, 0),
    instagram: postRows.reduce((s, m) => s + m.instagram, 0),
    snapchat: postRows.reduce((s, m) => s + m.snapchat, 0),
    facebook: postRows.reduce((s, m) => s + m.facebook, 0),
    grand: postRows.reduce((s, m) => s + m.total, 0),
  };

  // Ukentlig visningsdata (filtrert etter scope)
  const weeklyRows = buildWeeklyRows(filteredRows, selectedYear);
  const weeklyTotals = {
    tiktok: weeklyRows.reduce((s, w) => s + w.tiktok, 0),
    youtube: weeklyRows.reduce((s, w) => s + w.youtube, 0),
    instagram: weeklyRows.reduce((s, w) => s + w.instagram, 0),
    snapchat: weeklyRows.reduce((s, w) => s + w.snapchat, 0),
    facebook: weeklyRows.reduce((s, w) => s + w.facebook, 0),
    grand: weeklyRows.reduce((s, w) => s + w.total, 0),
  };

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Lukk eksport-menyen ved klikk utenfor
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showExportMenu]);

  const kpiData = {
    totalViews: videoTotals.grand,
    growthPercent,
    prevYearTotal,
    bestVideoTitle: bestVideo?.title ?? null,
    bestVideoViews: bestVideo?.total ?? 0,
    engagementRate,
    totalLikes: videoTotals.likes,
    totalPosts,
  };

  function handleExportCsv() {
    setShowExportMenu(false);
    if (view === "videos") {
      exportVideosCsv(filteredRows, selectedYear);
    } else if (view === "views") {
      if (viewsPeriod === "monthly") {
        exportMonthlyCsv(monthlyRows, selectedYear);
      } else {
        exportWeeklyCsv(weeklyRows, selectedYear);
      }
    } else if (view === "posts") {
      exportPostsCsv(postRows, selectedYear);
    }
  }

  function handleExportPdf() {
    setShowExportMenu(false);
    const pdfView =
      view === "videos"
        ? "videos"
        : view === "views"
          ? viewsPeriod === "monthly"
            ? "views-monthly"
            : "views-weekly"
          : "posts";

    exportPdf(
      pdfView as "videos" | "views-monthly" | "views-weekly" | "posts",
      selectedYear,
      kpiData,
      {
        videoRows: view === "videos" ? filteredRows : undefined,
        monthlyRows: view === "views" && viewsPeriod === "monthly" ? monthlyRows : undefined,
        weeklyRows: view === "views" && viewsPeriod === "weekly" ? weeklyRows : undefined,
        postRows: view === "posts" ? postRows : undefined,
        totals:
          view === "videos"
            ? videoTotals
            : view === "views"
              ? viewsPeriod === "monthly"
                ? monthlyTotals
                : weeklyTotals
              : postTotals,
      },
      reportBrand,
    );
  }

  function handleExportClientReport() {
    setShowExportMenu(false);
    exportClientReport(
      selectedYear,
      kpiData,
      monthlyRows,
      filteredRows,
      videoTotals,
      reportBrand,
    );
  }

  // Periode-rapport state
  const defaultPrevWeek = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return {
      week: getISOWeek(d.toISOString().split("T")[0]),
      year: d.getFullYear(),
    };
  })();
  const [reportWeek, setReportWeek] = useState(defaultPrevWeek.week);
  const [reportWeekYear, setReportWeekYear] = useState(defaultPrevWeek.year);
  const [reportMonth, setReportMonth] = useState(
    new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1
  );
  const [reportMonthYear, setReportMonthYear] = useState(
    new Date().getMonth() === 0
      ? new Date().getFullYear() - 1
      : new Date().getFullYear()
  );

  function filterVideosByWeek(week: number, yr: number) {
    return rows.filter((r) => {
      const d = new Date(r.date + "T00:00:00");
      return d.getFullYear() === yr && getISOWeek(r.date) === week;
    });
  }

  function filterVideosByMonth(month: number, yr: number) {
    return rows.filter((r) => {
      const d = new Date(r.date + "T00:00:00");
      return d.getFullYear() === yr && d.getMonth() === month;
    });
  }

  function handleExportWeekReport() {
    setShowExportMenu(false);
    const periodVideos = filterVideosByWeek(reportWeek, reportWeekYear);
    const prevWeek = reportWeek > 1 ? reportWeek - 1 : 52;
    const prevYear = reportWeek > 1 ? reportWeekYear : reportWeekYear - 1;
    const prevVideos = filterVideosByWeek(prevWeek, prevYear);
    exportPeriodReport("week", reportWeek, reportWeekYear, periodVideos, prevVideos, reportBrand);
  }

  function handleExportMonthReport() {
    setShowExportMenu(false);
    const periodVideos = filterVideosByMonth(reportMonth, reportMonthYear);
    const prevMonth = reportMonth > 0 ? reportMonth - 1 : 11;
    const prevYear = reportMonth > 0 ? reportMonthYear : reportMonthYear - 1;
    const prevVideos = filterVideosByMonth(prevMonth, prevYear);
    exportPeriodReport("month", reportMonth, reportMonthYear, periodVideos, prevVideos, reportBrand);
  }

  const periodLabel = (() => {
    if (selectedScope === "month")
      return `${t(MONTH_KEYS[selectedMonth])} ${selectedYear}`;
    if (selectedScope === "week")
      return t("dashboard.weekShort", { n: String(selectedWeek) }) + `, ${selectedYear}`;
    return `${selectedYear}`;
  })();

  const viewDescription =
    view === "videos"
      ? t("dashboard.viewsCaptionVideos", { period: periodLabel })
      : view === "views"
        ? viewsPeriod === "monthly"
          ? t("dashboard.viewsCaptionMonthly", { period: periodLabel })
          : t("dashboard.viewsCaptionWeekly", { period: periodLabel })
        : view === "posts"
          ? t("dashboard.viewsCaptionPosts", { period: periodLabel })
          : t("dashboard.analyticsTitle") + ` — ${periodLabel}`;

  return (
    <div className="space-y-8">
      {/* ---- Header: tittel + år/eksport ---- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          {activeClientName ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/60 px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-600 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              {activeClientName}
              {isSynced ? null : (
                <>
                  <span className="text-zinc-400 dark:text-zinc-600">·</span>
                  <span className="text-zinc-500 dark:text-zinc-500">
                    {t("dashboard.notSynced")}
                  </span>
                </>
              )}
            </span>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.5rem]">
            {t("dashboard.welcome")}
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            {t("dashboard.overviewSubtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {view === "views" && (
            <select
              value={viewsPeriod}
              onChange={(e) =>
                setViewsPeriod(e.target.value as "monthly" | "weekly")
              }
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <option value="monthly">{t("dashboard.monthly")}</option>
              <option value="weekly">{t("dashboard.weekly")}</option>
            </select>
          )}

          {/* Måned-velger (kun synlig når scope=month) — plassert FØR scope-toggle
              så den ikke flytter på de andre kontrollene når den dukker opp. */}
          {selectedScope === "month" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {MONTH_KEYS.map((key, i) => (
                <option key={i} value={i}>
                  {t(key)}
                </option>
              ))}
            </select>
          )}

          {/* Uke-velger (kun synlig når scope=week) — plassert FØR scope-toggle. */}
          {selectedScope === "week" && (
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {Array.from({ length: 53 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  {t("dashboard.weekShort", { n: String(w) })}
                </option>
              ))}
            </select>
          )}

          {/* Periode-scope: År / Måned / Uke */}
          <div className="flex h-9 rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900/60">
            {(
              [
                { id: "year", label: t("dashboard.year") },
                { id: "month", label: t("dashboard.month") },
                { id: "week", label: t("dashboard.week") },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedScope(s.id)}
                className={`rounded-md px-3 text-sm font-medium transition-colors ${
                  selectedScope === s.id
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* År-velger */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-9 appearance-none rounded-lg border border-zinc-200 bg-white pl-8 pr-8 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <HiddenVideosButton hiddenCount={hiddenCount} />

          {/* Eksport-knapp */}
          <div className="relative" ref={exportRef}>
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t("dashboard.export")}
                <svg className={`h-3 w-3 transition-transform ${showExportMenu ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full z-50 mt-1.5 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-[#131313]">
                  {/* ---- Merkenavn på rapport ---- */}
                  <div className="border-b border-zinc-200 px-3 pb-2.5 pt-2.5 dark:border-zinc-800">
                    <label className="block">
                      <span className="block pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                        {t("dashboard.exportBrandLabel")}
                      </span>
                      <input
                        type="text"
                        value={reportBrandDraft}
                        onChange={(e) => setReportBrandDraft(e.target.value)}
                        onBlur={() => commitReportBrand(reportBrandDraft)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            (e.currentTarget as HTMLInputElement).blur();
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        maxLength={80}
                        placeholder={t("dashboard.exportBrandPlaceholder")}
                        disabled={!activeClientId}
                        className="block w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-800 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600"
                      />
                      <span className="mt-1 block text-[10px] text-zinc-500 dark:text-zinc-500">
                        {isSavingBrand
                          ? t("dashboard.exportBrandSaving")
                          : t("dashboard.exportBrandHint")}
                      </span>
                    </label>
                  </div>

                  {/* ---- Data-eksport ---- */}
                  <div className="px-2 pt-2 pb-1">
                    <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                      {t("dashboard.export")}
                    </p>
                    <button
                      onClick={handleExportCsv}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      <span className="flex-1">
                        <span className="block">{t("dashboard.exportCsv")}</span>
                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-500">
                          {t("dashboard.exportCsvDesc")}
                        </span>
                      </span>
                    </button>
                    <button
                      onClick={handleExportPdf}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-500/15 text-red-600 dark:text-red-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span className="flex-1">
                        <span className="block">{t("dashboard.exportPdf")}</span>
                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-500">
                          {t("dashboard.exportPdfDesc")}
                        </span>
                      </span>
                    </button>
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-800" />

                  {/* ---- Kunderapporter ---- */}
                  <div className="px-2 pt-2 pb-2">
                    <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                      {t("dashboard.exportYearReport")}
                    </p>
                    <button
                      onClick={handleExportClientReport}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      <span className="flex-1">
                        <span className="block">{t("dashboard.exportYearReport")}</span>
                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-500">
                          {t("dashboard.exportYearReportDesc")}
                        </span>
                      </span>
                    </button>

                    {/* Ukerapport */}
                    <div className="mt-1.5 rounded-md border border-zinc-200/80 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-[#181818]">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-blue-500 dark:text-blue-400">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                          {t("dashboard.exportWeekReport")}
                        </span>
                        <span className="ml-auto mono text-[10px] text-zinc-500 dark:text-zinc-500">
                          {(() => {
                            const range = getWeekDateRange(reportWeek, reportWeekYear);
                            return `${range.start.toLocaleDateString("no-NO", { day: "numeric", month: "short" })} – ${range.end.toLocaleDateString("no-NO", { day: "numeric", month: "short" })}`;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={reportWeek}
                          onChange={(e) => setReportWeek(Number(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        >
                          {Array.from({ length: 53 }, (_, i) => i + 1).map((w) => (
                            <option key={w} value={w}>
                              {t("dashboard.weekShort", { n: String(w) })}
                            </option>
                          ))}
                        </select>
                        <select
                          value={reportWeekYear}
                          onChange={(e) => setReportWeekYear(Number(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-16 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        >
                          {availableYears.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleExportWeekReport}
                          className="rounded-md bg-blue-500 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
                        >
                          {t("dashboard.download")}
                        </button>
                      </div>
                    </div>

                    {/* Månedsrapport */}
                    <div className="mt-1.5 rounded-md border border-zinc-200/80 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-[#181818]">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-purple-500 dark:text-purple-400">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                          {t("dashboard.exportMonthReport")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={reportMonth}
                          onChange={(e) => setReportMonth(Number(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        >
                          {MONTH_KEYS.map((key, i) => (
                            <option key={i} value={i}>{t(key)}</option>
                          ))}
                        </select>
                        <select
                          value={reportMonthYear}
                          onChange={(e) => setReportMonthYear(Number(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-16 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        >
                          {availableYears.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleExportMonthReport}
                          className="rounded-md bg-purple-500 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-purple-600"
                        >
                          {t("dashboard.download")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* ---- KPI-kort ---- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Totale visninger */}
        <KpiCard
          label={t("dashboard.kpiTotalViews")}
          value={formatNumber(videoTotals.grand)}
          icon={
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          }
          trend={
            growthPercent !== null
              ? {
                  value: `${growthPercent >= 0 ? "+" : ""}${growthPercent.toFixed(1)}%`,
                  direction: growthPercent >= 0 ? "up" : "down",
                }
              : undefined
          }
          footer={`${totalPosts} ${t("dashboard.tabPosts").toLowerCase()} · ${periodLabel}`}
          sparkline={monthlyRows.map((m) => m.total)}
          sparklineColor="#3b82f6"
        />

        {/* Vekst */}
        <KpiCard
          label={t("dashboard.kpiGrowth")}
          icon={
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
          value={
            growthPercent !== null
              ? `${growthPercent >= 0 ? "+" : ""}${growthPercent.toFixed(1)}%`
              : "—"
          }
          valueClass={
            growthPercent !== null
              ? growthPercent >= 0
                ? "text-emerald-500 dark:text-emerald-400"
                : "text-red-500 dark:text-red-400"
              : undefined
          }
          trend={
            growthPercent !== null
              ? {
                  value: `${growthPercent >= 0 ? "+" : ""}${formatNumber(
                    videoTotals.grand - prevYearTotal,
                  )} ${t("dashboard.analyticsViews").toLowerCase()}`,
                  direction: growthPercent >= 0 ? "up" : "down",
                }
              : undefined
          }
          footer={
            growthPercent !== null
              ? t("dashboard.comparedTo", { value: formatNumber(prevYearTotal) })
              : t("dashboard.noPreviousData")
          }
          sparkline={monthlyRows.map((m) => m.total)}
          sparklineColor="#10b981"
        />

        {/* Beste video */}
        <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 backdrop-blur-sm shadow-sm dark:border-zinc-800/80 dark:bg-[#131313] dark:shadow-none">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <p className="text-[10px] font-semibold uppercase tracking-wider">
              {t("dashboard.kpiBestVideo")}
            </p>
          </div>
          <p
            className="mt-3 line-clamp-2 text-base font-semibold text-zinc-900 dark:text-zinc-100"
            title={bestVideo?.title}
          >
            {bestVideo ? bestVideo.title : "—"}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
            {bestVideo ? (
              <>
                <span>{formatNumber(bestVideo.total)} {t("dashboard.analyticsViews").toLowerCase()}</span>
                <span className="text-zinc-400 dark:text-zinc-700">·</span>
                <BestVideoPlatforms row={bestVideo} />
              </>
            ) : (
              <span>{t("dashboard.noBestVideo")}</span>
            )}
          </div>
        </div>

        {/* Engagement rate */}
        <KpiCard
          label={t("dashboard.kpiEngagement")}
          icon={
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          }
          value={`${engagementRate.toFixed(1)}%`}
          footer={`${formatNumber(videoTotals.likes)} ${t("dashboard.tableLikes").toLowerCase()} / ${formatNumber(videoTotals.grand)} ${t("dashboard.analyticsViews").toLowerCase()}`}
          sparkline={monthlyRows.map((m) =>
            m.total > 0 ? (m.totalLikes ?? 0) / m.total : 0,
          )}
          sparklineColor="#ec4899"
        />
      </div>

      {/* ---- View-beskrivelse + tabs ---- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {viewDescription}
        </p>
        <div className="flex rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900/60">
          {(
            [
              { id: "videos", label: t("dashboard.tabVideos") },
              { id: "views", label: t("dashboard.tabViews") },
              { id: "posts", label: t("dashboard.tabPosts") },
              { id: "analyse", label: t("dashboard.tabAnalytics") },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                view === tab.id
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Tabeller ---- */}
      {view === "videos" ? (
        <VideoTable rows={filteredRows} totals={videoTotals} categories={categories} onCategoriesChange={setCategories} />
      ) : view === "views" ? (
        viewsPeriod === "monthly" ? (
          <MonthlyTable
            monthlyRows={monthlyRows}
            totals={monthlyTotals}
          />
        ) : (
          <WeeklyTable
            weeklyRows={weeklyRows}
            totals={weeklyTotals}
          />
        )
      ) : view === "posts" ? (
        <PostsTable
          postRows={postRows}
          totals={postTotals}
        />
      ) : (
        <AnalyticsView rows={filteredRows} selectedYear={selectedYear} />
      )}

    </div>
  );
}

// ---------- KPI-kort ----------

interface KpiTrend {
  value: string;
  direction: "up" | "down";
}

function KpiCard({
  label,
  value,
  valueClass,
  trend,
  footer,
  sparkline,
  sparklineColor = "#3b82f6",
  icon,
}: {
  label: string;
  value: string;
  valueClass?: string;
  trend?: KpiTrend;
  footer?: string;
  sparkline?: number[];
  sparklineColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white/70 p-4 backdrop-blur-sm shadow-sm dark:border-zinc-800/80 dark:bg-[#131313] dark:shadow-none">
      <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p
        className={`mt-3 text-3xl font-semibold tabular-nums ${
          valueClass ?? "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {value}
      </p>
      {trend ? (
        <p
          className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
            trend.direction === "up"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={
                trend.direction === "up"
                  ? "M7 17l5-5 5 5M7 7h10"
                  : "M7 7l5 5 5-5M7 17h10"
              }
            />
          </svg>
          {trend.value}
        </p>
      ) : null}
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          {footer ?? ""}
        </p>
        {sparkline && sparkline.length > 0 ? (
          <Sparkline
            values={sparkline}
            width={96}
            height={32}
            color={sparklineColor}
            className="shrink-0"
          />
        ) : null}
      </div>
    </div>
  );
}

function BestVideoPlatforms({ row }: { row: UnifiedVideoRow }) {
  const platforms: { key: string; label: string; dot: string }[] = [];
  if (row.tiktok) platforms.push({ key: "tiktok", label: "TikTok", dot: "#c084fc" });
  if (row.youtube) platforms.push({ key: "youtube", label: "YouTube", dot: "#ef4444" });
  if (row.instagram) platforms.push({ key: "instagram", label: "Instagram", dot: "#fb923c" });
  if (row.facebook) platforms.push({ key: "facebook", label: "Facebook", dot: "#3b82f6" });
  if (row.snapchat) platforms.push({ key: "snapchat", label: "Snapchat", dot: "#facc15" });

  if (platforms.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      {platforms.map((p, i) => (
        <span key={p.key} className="inline-flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: p.dot }}
          />
          <span>{p.label}</span>
          {i < platforms.length - 1 ? (
            <span className="text-zinc-400 dark:text-zinc-700">+</span>
          ) : null}
        </span>
      ))}
    </span>
  );
}

// ---------- Video-tabell ----------

function LikesCell({
  row,
  allRows,
}: {
  row: UnifiedVideoRow;
  allRows: UnifiedVideoRow[];
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const cellRef = useRef<HTMLSpanElement>(null);

  const platforms = PLATFORMS.map((p) => ({
    label: p.label,
    key: p.key,
    likes: row[p.key]?.likes ?? 0,
    colorClass: PLATFORM_TOOLTIP_COLORS[p.key] ?? "text-zinc-600 dark:text-zinc-400",
  })).filter((p) => p.likes > 0);

  useEffect(() => {
    if (showTooltip && cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [showTooltip]);

  return (
    <td className="whitespace-nowrap px-4 py-3 text-right">
      <div className="flex items-center justify-end gap-1.5">
        <span
          ref={cellRef}
          className="text-sm tabular-nums font-semibold text-pink-400 cursor-default"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {row.totalLikes > 0 ? formatNumber(row.totalLikes) : "-"}
        </span>
        <RowMergeButton row={row} allRows={allRows} />
      </div>
      {showTooltip &&
        row.totalLikes > 0 &&
        platforms.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[9999] w-44 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 p-2.5 shadow-xl pointer-events-none"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="space-y-1">
              {platforms.map((p) => (
                <div
                  key={p.key}
                  className="flex items-center justify-between text-xs"
                >
                  <span className={p.colorClass}>{p.label}</span>
                  <span className="tabular-nums text-zinc-800 dark:text-zinc-200">
                    {formatNumber(p.likes)}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-700" />
          </div>,
          document.body
        )}
    </td>
  );
}

function VideoTable({
  rows,
  totals,
  categories,
  onCategoriesChange,
}: {
  rows: UnifiedVideoRow[];
  totals: Record<string, number>;
  categories: VideoCategory[];
  onCategoriesChange: (categories: VideoCategory[]) => void;
}) {
  const { t } = useLanguage();
  const [sort, setSort] = useState<SortState>({ column: null, direction: "asc" });
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const handleSort = (col: string) => setSort(toggleSort(sort, col));

  // Filter by category
  const filteredRows = categoryFilter
    ? rows.filter((r) => r.categoryId === categoryFilter || r.categoryId2 === categoryFilter)
    : rows;

  // Sort
  const sortedRows = sort.column
    ? [...filteredRows].sort((a, b) => {
        let cmp = 0;
        switch (sort.column) {
          case "month": {
            const ma = new Date(a.date + "T00:00:00").getMonth();
            const mb = new Date(b.date + "T00:00:00").getMonth();
            cmp = ma - mb;
            break;
          }
          case "title":
            cmp = a.title.localeCompare(b.title, "no-NO");
            break;
          case "date":
            cmp = a.date.localeCompare(b.date);
            break;
          case "week":
            cmp = getISOWeek(a.date) - getISOWeek(b.date);
            break;
          case "total":
            cmp = a.total - b.total;
            break;
          case "likes":
            cmp = a.totalLikes - b.totalLikes;
            break;
          default: {
            const col = sort.column as "tiktok" | "youtube" | "instagram" | "snapchat" | "facebook";
            cmp = (a[col]?.views ?? 0) - (b[col]?.views ?? 0);
          }
        }
        return sort.direction === "asc" ? cmp : -cmp;
      })
    : filteredRows;

  // Recalculate totals when filter is active
  const displayTotals = categoryFilter
    ? {
        tiktok: filteredRows.reduce((s, r) => s + (r.tiktok?.views ?? 0), 0),
        youtube: filteredRows.reduce((s, r) => s + (r.youtube?.views ?? 0), 0),
        instagram: filteredRows.reduce((s, r) => s + (r.instagram?.views ?? 0), 0),
        snapchat: filteredRows.reduce((s, r) => s + (r.snapchat?.views ?? 0), 0),
        facebook: filteredRows.reduce((s, r) => s + (r.facebook?.views ?? 0), 0),
        grand: filteredRows.reduce((s, r) => s + r.total, 0),
        likes: filteredRows.reduce((s, r) => s + r.totalLikes, 0),
      }
    : totals;

  return (
    <section className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-[#131313] backdrop-blur-sm shadow-sm dark:shadow-2xl">
      {/* Category filter bar */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-100/50 dark:bg-zinc-900/50">
          <svg
            className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-500 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <button
            onClick={() => setCategoryFilter(null)}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
              categoryFilter === null
                ? "bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900"
                : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {t("dashboard.tabVideos")}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(categoryFilter === c.id ? null : c.id)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-2 transition-all ${
                categoryFilter === c.id
                  ? ""
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              style={{
                backgroundColor: c.color + "33",
                color: c.color,
                ...(categoryFilter === c.id ? { borderColor: c.color } : {}),
              }}
            >
              {c.name}
            </button>
          ))}
          {categoryFilter && (
            <span className="text-xs text-zinc-500 dark:text-zinc-500 ml-1">
              {filteredRows.length} {t("dashboard.of")} {rows.length} {t("dashboard.tabVideos").toLowerCase()}
            </span>
          )}
        </div>
      )}
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#181818] text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            <SortableTh column="month" label={t("dashboard.monthShortJan").length > 0 ? t("dashboard.tableMonth").slice(0, 3) : "Mnd"} sort={sort} onSort={handleSort} />
            <SortableTh column="title" label={t("dashboard.tableTitle")} sort={sort} onSort={handleSort} className="min-w-[100px] max-w-[160px]" />
            <th className="whitespace-nowrap px-4 py-3 min-w-[150px]">{t("dashboard.tableTags")}</th>
            <SortableTh column="date" label={t("dashboard.tableDate")} sort={sort} onSort={handleSort} />
            <SortableTh column="week" label={t("dashboard.tableWeek")} sort={sort} onSort={handleSort} />
            <PlatformHeadersWithLikes sort={sort} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td
                colSpan={5 + PLATFORMS.length + 2}
                className="px-4 py-10 text-center text-zinc-500 dark:text-zinc-500"
              >
                {categoryFilter
                  ? t("dashboard.noVideosYet")
                  : t("dashboard.noDataYet")}
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr
                key={row.date}
                className="border-t border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                  {t(MONTH_SHORT_KEYS[getMonthIndex(row.date)])}
                </td>
                <td className="px-4 py-3">
                  <EditableTitle
                    date={row.date}
                    initialTitle={row.title}
                    isCustom={row.customTitle !== null}
                  />
                </td>
                <CategoryCell
                  date={row.date}
                  currentCategoryId={row.categoryId}
                  currentCategoryName={row.categoryName}
                  currentCategoryColor={row.categoryColor}
                  currentCategoryId2={row.categoryId2}
                  currentCategoryName2={row.categoryName2}
                  currentCategoryColor2={row.categoryColor2}
                  categories={categories}
                  onCategoriesChange={onCategoriesChange}
                />
                <td className="mono whitespace-nowrap px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDate(row.date)}
                </td>
                <td className="mono whitespace-nowrap px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {getISOWeek(row.date)}
                </td>
                {PLATFORMS.map((p, pIdx) => {
                  const entry = row[p.key];
                  const hasLink = !!entry?.permalink;
                  const isOverridden = entry?.overriddenFromDate != null;
                  const showSnapchatAdd = p.key === "snapchat" && !entry;
                  return (
                    <td
                      key={p.key}
                      className={`whitespace-nowrap px-4 py-3 text-right ${pIdx === 0 ? "border-l border-zinc-200 dark:border-zinc-800/60" : ""} ${isOverridden ? "bg-violet-500/[0.07]" : ""}`}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {p.active && entry ? (
                          hasLink ? (
                            <a
                              href={entry.permalink!}
                              target="_blank"
                              rel="noreferrer"
                              title={t("dashboard.rowOpenOn", { platform: p.label })}
                              style={{ color: p.dot }}
                              className="rounded px-1.5 py-0.5 text-sm font-semibold tabular-nums transition-colors hover:underline"
                            >
                              {formatNumber(entry.views)}
                            </a>
                          ) : (
                            <span
                              style={{ color: p.dot }}
                              className="text-sm font-semibold tabular-nums"
                            >
                              {formatNumber(entry.views)}
                            </span>
                          )
                        ) : showSnapchatAdd ? (
                          <SnapchatInlineAdd date={row.date} />
                        ) : (
                          <span className="text-sm tabular-nums text-zinc-400 dark:text-zinc-600">
                            —
                          </span>
                        )}
                        {entry ? (
                          <PlatformCellOverride
                            entry={entry}
                            currentRowDate={row.date}
                          />
                        ) : null}
                      </div>
                    </td>
                  );
                })}
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50 border-r border-zinc-200/60 dark:border-zinc-800/60">
                  {formatNumber(row.total)}
                </td>
                <LikesCell row={row} allRows={sortedRows} />
              </tr>
            ))
          )}
        </tbody>
        {sortedRows.length > 0 && (
          <tfoot>
            <tr className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#181818] font-semibold text-zinc-700 dark:text-zinc-300">
              <td className="px-4 py-4" colSpan={5}>
                {t("dashboard.tableTotalLower")}
              </td>
              <PlatformFooterWithLikes totals={displayTotals} />
            </tr>
          </tfoot>
        )}
      </table>
    </section>
  );
}

// ---------- Ukevisning-tabell ----------

function WeeklyTable({
  weeklyRows,
  totals,
}: {
  weeklyRows: WeeklyRow[];
  totals: Record<string, number>;
}) {
  const { t } = useLanguage();
  const [sort, setSort] = useState<SortState>({ column: null, direction: "asc" });
  const handleSort = (col: string) => setSort(toggleSort(sort, col));

  const sortedRows = sort.column
    ? [...weeklyRows].sort((a, b) => {
        let cmp = 0;
        if (sort.column === "week") {
          cmp = a.week - b.week;
        } else if (sort.column === "total") {
          cmp = a.total - b.total;
        } else {
          const va = a[sort.column as keyof WeeklyRow] as number;
          const vb = b[sort.column as keyof WeeklyRow] as number;
          cmp = (va ?? 0) - (vb ?? 0);
        }
        return sort.direction === "asc" ? cmp : -cmp;
      })
    : weeklyRows;

  return (
    <section className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-[#131313] backdrop-blur-sm shadow-sm dark:shadow-2xl">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#181818] text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            <SortableTh column="week" label={t("dashboard.tableWeek")} sort={sort} onSort={handleSort} className="min-w-[80px]" />
            <PlatformHeaders sort={sort} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((w) => {
            const hasData = w.total > 0;
            return (
              <tr
                key={w.week}
                className={`border-t border-zinc-800/60 hover:bg-zinc-900/50 transition-colors ${
                  !hasData ? "opacity-40" : ""
                }`}
              >
                <td className="whitespace-nowrap px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {w.week}
                </td>
                {PLATFORMS.map((p, pIdx) => {
                  const value = w[p.key as keyof WeeklyRow] as number;
                  return (
                    <td
                      key={p.key}
                      className={`whitespace-nowrap px-4 py-2.5 text-right ${pIdx === 0 ? "border-l border-zinc-800/60" : ""}`}
                    >
                      <span
                        style={
                          p.active && hasData && value > 0
                            ? { color: p.dot }
                            : undefined
                        }
                        className={`text-sm tabular-nums ${
                          p.active
                            ? hasData && value > 0
                              ? "font-semibold"
                              : "text-zinc-500 dark:text-zinc-600"
                            : "text-zinc-300 dark:text-zinc-700"
                        }`}
                      >
                        {p.active ? (value > 0 ? formatNumber(value) : "0") : "—"}
                      </span>
                    </td>
                  );
                })}
                <td className="whitespace-nowrap px-4 py-2.5 text-right text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50 border-r border-zinc-200/60 dark:border-zinc-800/60">
                  {hasData ? formatNumber(w.total) : "0"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#181818] font-semibold text-zinc-700 dark:text-zinc-300">
            <td className="px-4 py-4">{t("dashboard.tableTotalLower")}</td>
            <PlatformFooter totals={totals} />
          </tr>
        </tfoot>
      </table>
    </section>
  );
}

// ---------- Poster-tabell ----------

function PostsTable({
  postRows,
  totals,
}: {
  postRows: MonthlyPostRow[];
  totals: Record<string, number>;
}) {
  const { t } = useLanguage();
  const [sort, setSort] = useState<SortState>({ column: null, direction: "asc" });
  const handleSort = (col: string) => setSort(toggleSort(sort, col));

  const sortedRows = sort.column
    ? [...postRows].sort((a, b) => {
        let cmp = 0;
        if (sort.column === "month") {
          cmp = a.monthIndex - b.monthIndex;
        } else if (sort.column === "total") {
          cmp = a.total - b.total;
        } else {
          const va = a[sort.column as keyof MonthlyPostRow] as number;
          const vb = b[sort.column as keyof MonthlyPostRow] as number;
          cmp = (va ?? 0) - (vb ?? 0);
        }
        return sort.direction === "asc" ? cmp : -cmp;
      })
    : postRows;

  return (
    <section className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-[#131313] backdrop-blur-sm shadow-sm dark:shadow-2xl">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#181818] text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            <SortableTh column="month" label={t("dashboard.tabPosts")} sort={sort} onSort={handleSort} className="min-w-[120px]" />
            <PlatformHeaders sort={sort} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((m) => {
            const hasData = m.total > 0;
            return (
              <tr
                key={m.monthIndex}
                className="border-t border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t(MONTH_KEYS[m.monthIndex])}
                </td>
                {PLATFORMS.map((p, pIdx) => {
                  const value = m[p.key as keyof MonthlyPostRow] as number;
                  return (
                    <td
                      key={p.key}
                      className={`whitespace-nowrap px-4 py-3 text-right ${pIdx === 0 ? "border-l border-zinc-800/60" : ""}`}
                    >
                      <span
                        style={
                          p.active && hasData && value > 0
                            ? { color: p.dot }
                            : undefined
                        }
                        className={`text-sm tabular-nums ${
                          p.active
                            ? hasData && value > 0
                              ? "font-semibold"
                              : "text-zinc-500 dark:text-zinc-600"
                            : "text-zinc-300 dark:text-zinc-700"
                        }`}
                      >
                        {p.active ? (value > 0 ? value : "—") : "—"}
                      </span>
                    </td>
                  );
                })}
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50 border-r border-zinc-200/60 dark:border-zinc-800/60">
                  {hasData ? m.total : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#181818] font-semibold text-zinc-700 dark:text-zinc-300">
            <td className="px-4 py-4">{t("dashboard.tableTotalLower")}</td>
            <PlatformFooter totals={totals} />
          </tr>
        </tfoot>
      </table>
    </section>
  );
}

// ---------- Månedsoversikt-tabell ----------

function MonthlyTable({
  monthlyRows,
  totals,
}: {
  monthlyRows: MonthlyRow[];
  totals: Record<string, number>;
}) {
  const { t } = useLanguage();
  const [sort, setSort] = useState<SortState>({ column: null, direction: "asc" });
  const handleSort = (col: string) => setSort(toggleSort(sort, col));

  const sortedRows = sort.column
    ? [...monthlyRows].sort((a, b) => {
        let cmp = 0;
        if (sort.column === "month") {
          cmp = a.monthIndex - b.monthIndex;
        } else if (sort.column === "total") {
          cmp = a.total - b.total;
        } else {
          const va = a[sort.column as keyof MonthlyRow] as number;
          const vb = b[sort.column as keyof MonthlyRow] as number;
          cmp = (va ?? 0) - (vb ?? 0);
        }
        return sort.direction === "asc" ? cmp : -cmp;
      })
    : monthlyRows;

  return (
    <section className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-[#131313] backdrop-blur-sm shadow-sm dark:shadow-2xl">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#181818] text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            <SortableTh column="month" label={t("dashboard.analyticsViews")} sort={sort} onSort={handleSort} className="min-w-[120px]" />
            <PlatformHeaders sort={sort} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((m) => {
            const hasData = m.total > 0;
            return (
              <tr
                key={m.monthIndex}
                className="border-t border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t(MONTH_KEYS[m.monthIndex])}
                </td>
                {PLATFORMS.map((p, pIdx) => {
                  const value = m[p.key as keyof MonthlyRow] as number;
                  return (
                    <td
                      key={p.key}
                      className={`whitespace-nowrap px-4 py-3 text-right ${pIdx === 0 ? "border-l border-zinc-800/60" : ""}`}
                    >
                      <span
                        style={
                          p.active && hasData && value > 0
                            ? { color: p.dot }
                            : undefined
                        }
                        className={`text-sm tabular-nums ${
                          p.active
                            ? hasData && value > 0
                              ? "font-semibold"
                              : "text-zinc-500 dark:text-zinc-600"
                            : "text-zinc-300 dark:text-zinc-700"
                        }`}
                      >
                        {p.active ? (value > 0 ? formatNumber(value) : "—") : "—"}
                      </span>
                    </td>
                  );
                })}
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50 border-r border-zinc-200/60 dark:border-zinc-800/60">
                  {hasData ? formatNumber(m.total) : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#181818] font-semibold text-zinc-700 dark:text-zinc-300">
            <td className="px-4 py-4">{t("dashboard.tableTotalLower")}</td>
            <PlatformFooter totals={totals} />
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
