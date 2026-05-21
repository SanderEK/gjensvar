"use client";

import { UnifiedVideoRow } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ---------- Plattform-farger ----------

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "#a855f7",
  youtube: "#ef4444",
  instagram: "#f97316",
  snapchat: "#eab308",
  facebook: "#3b82f6",
};

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  youtube: "YouTube",
  instagram: "Instagram",
  snapchat: "Snapchat",
  facebook: "Facebook",
};

const PLATFORM_KEYS = ["tiktok", "youtube", "instagram", "snapchat", "facebook"] as const;

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

// Internt brukt for object-keys i grupperinger; XAxis tickFormatter mapper
// dette tilbake til oversettelser via MONTH_SHORT_KEYS.
const MONTH_NAMES = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
];

// ---------- Hjelpefunksjoner ----------

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return n.toString();
}

function formatFull(n: number): string {
  return n.toLocaleString("no-NO");
}

interface MonthlyData {
  month: string;
  tiktok: number;
  youtube: number;
  instagram: number;
  snapchat: number;
  facebook: number;
  total: number;
}

interface MonthlyPostData {
  month: string;
  tiktok: number;
  youtube: number;
  instagram: number;
  snapchat: number;
  facebook: number;
  totalPosts: number;
  totalViews: number;
}

function buildMonthlyData(rows: UnifiedVideoRow[], year: number): MonthlyData[] {
  const monthly: MonthlyData[] = MONTH_NAMES.map((name) => ({
    month: name,
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
    const idx = d.getMonth();
    const m = monthly[idx];
    m.tiktok += row.tiktok?.views ?? 0;
    m.youtube += row.youtube?.views ?? 0;
    m.instagram += row.instagram?.views ?? 0;
    m.snapchat += row.snapchat?.views ?? 0;
    m.facebook += row.facebook?.views ?? 0;
    m.total += (row.tiktok?.views ?? 0) + (row.youtube?.views ?? 0) + (row.instagram?.views ?? 0) + (row.snapchat?.views ?? 0) + (row.facebook?.views ?? 0);
  }

  return monthly;
}

function buildPostsVsViewsData(rows: UnifiedVideoRow[], year: number): MonthlyPostData[] {
  const monthly: MonthlyPostData[] = MONTH_NAMES.map((name) => ({
    month: name,
    tiktok: 0,
    youtube: 0,
    instagram: 0,
    snapchat: 0,
    facebook: 0,
    totalPosts: 0,
    totalViews: 0,
  }));

  for (const row of rows) {
    const d = new Date(row.date + "T00:00:00");
    if (d.getFullYear() !== year) continue;
    const idx = d.getMonth();
    const m = monthly[idx];

    if (row.tiktok) { m.tiktok += 1; m.totalPosts += 1; }
    if (row.youtube) { m.youtube += 1; m.totalPosts += 1; }
    if (row.instagram) { m.instagram += 1; m.totalPosts += 1; }
    if (row.snapchat) { m.snapchat += 1; m.totalPosts += 1; }
    if (row.facebook) { m.facebook += 1; m.totalPosts += 1; }

    m.totalViews += (row.tiktok?.views ?? 0) + (row.youtube?.views ?? 0) + (row.instagram?.views ?? 0) + (row.snapchat?.views ?? 0) + (row.facebook?.views ?? 0);
  }

  return monthly;
}

interface AvgData {
  month: string;
  tiktok: number;
  youtube: number;
  instagram: number;
  snapchat: number;
  facebook: number;
}

function buildAvgPerPostData(rows: UnifiedVideoRow[], year: number): AvgData[] {
  const views: Record<string, Record<string, number>> = {};
  const counts: Record<string, Record<string, number>> = {};

  for (let i = 0; i < 12; i++) {
    const key = MONTH_NAMES[i];
    views[key] = { tiktok: 0, youtube: 0, instagram: 0, snapchat: 0, facebook: 0 };
    counts[key] = { tiktok: 0, youtube: 0, instagram: 0, snapchat: 0, facebook: 0 };
  }

  for (const row of rows) {
    const d = new Date(row.date + "T00:00:00");
    if (d.getFullYear() !== year) continue;
    const key = MONTH_NAMES[d.getMonth()];

    for (const p of PLATFORM_KEYS) {
      if (row[p]) {
        views[key][p] += row[p]!.views;
        counts[key][p] += 1;
      }
    }
  }

  return MONTH_NAMES.map((m) => ({
    month: m,
    tiktok: counts[m].tiktok > 0 ? Math.round(views[m].tiktok / counts[m].tiktok) : 0,
    youtube: counts[m].youtube > 0 ? Math.round(views[m].youtube / counts[m].youtube) : 0,
    instagram: counts[m].instagram > 0 ? Math.round(views[m].instagram / counts[m].instagram) : 0,
    snapchat: counts[m].snapchat > 0 ? Math.round(views[m].snapchat / counts[m].snapchat) : 0,
    facebook: counts[m].facebook > 0 ? Math.round(views[m].facebook / counts[m].facebook) : 0,
  }));
}

interface TopVideo {
  title: string;
  total: number;
  tiktok: number;
  youtube: number;
  instagram: number;
  snapchat: number;
  facebook: number;
}

function buildTopVideos(
  rows: UnifiedVideoRow[],
  year: number,
  noTitleLabel: string,
): TopVideo[] {
  return rows
    .filter((r) => {
      const d = new Date(r.date + "T00:00:00");
      return d.getFullYear() === year;
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((r, idx) => {
      const rawTitle = (r.title ?? "").trim() || noTitleLabel;
      const truncated =
        rawTitle.length > 24 ? rawTitle.slice(0, 24).trimEnd() + "…" : rawTitle;
      return {
        title: `${idx + 1}. ${truncated}`,
        total: r.total,
        tiktok: r.tiktok?.views ?? 0,
        youtube: r.youtube?.views ?? 0,
        instagram: r.instagram?.views ?? 0,
        snapchat: r.snapchat?.views ?? 0,
        facebook: r.facebook?.views ?? 0,
      };
    });
}

// ---------- Tooltip ----------

function DarkTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-zinc-600 dark:text-zinc-400">{p.name}:</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Chart Card ----------

function ChartCard({
  title,
  subtitle,
  children,
  wide,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm ${
        wide ? "col-span-1 lg:col-span-2" : ""
      }`}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// ---------- Props ----------

interface AnalyticsViewProps {
  rows: UnifiedVideoRow[];
  selectedYear: number;
}

// ---------- Main ----------

export function AnalyticsView({ rows, selectedYear }: AnalyticsViewProps) {
  const { t } = useLanguage();
  const monthTick = (v: string) => t(MONTH_SHORT_KEYS[Number(v)] ?? "dashboard.monthShortJan");
  const monthlyData = buildMonthlyData(rows, selectedYear);
  const postsVsViews = buildPostsVsViewsData(rows, selectedYear);
  const avgPerPost = buildAvgPerPostData(rows, selectedYear);
  const topVideos = buildTopVideos(rows, selectedYear, t("dashboard.noTitle"));

  // Donut data
  const platformTotals = PLATFORM_KEYS.map((key) => ({
    name: PLATFORM_LABELS[key],
    value: rows
      .filter((r) => new Date(r.date + "T00:00:00").getFullYear() === selectedYear)
      .reduce((s, r) => s + (r[key]?.views ?? 0), 0),
    color: PLATFORM_COLORS[key],
  })).filter((p) => p.value > 0);

  const totalViews = platformTotals.reduce((s, p) => s + p.value, 0);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* 1. Visninger over tid (linjediagram) */}
      <ChartCard
        title={t("dashboard.analyticsViewsOverTime")}
        subtitle={t("dashboard.analyticsViewsOverTimeSub", { year: String(selectedYear) })}
        wide
      >
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="month" tickFormatter={monthTick} tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#3f3f46" />
            <YAxis tickFormatter={formatCompact} tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#3f3f46" />
            <Tooltip content={<DarkTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value: string) => <span className="text-zinc-600 dark:text-zinc-400">{value}</span>}
            />
            {PLATFORM_KEYS.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={PLATFORM_LABELS[key]}
                stroke={PLATFORM_COLORS[key]}
                strokeWidth={2}
                dot={{ r: 3, fill: PLATFORM_COLORS[key] }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 2. Plattformfordeling (donut) */}
      <ChartCard
        title={t("dashboard.analyticsByPlatform")}
        subtitle={t("dashboard.analyticsByPlatformSub", { year: String(selectedYear) })}
      >
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={platformTotals}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={{ stroke: "#52525b" }}
            >
              {platformTotals.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) => formatFull(value ?? 0)}
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 8,
                fontSize: 12,
              }}
              itemStyle={{ color: "#e4e4e7" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-500">
          {t("dashboard.analyticsTotalLabel")}: {formatFull(totalViews)} {t("dashboard.analyticsViews").toLowerCase()}
        </p>
      </ChartCard>

      {/* 3. Stacked bar -- visninger per måned */}
      <ChartCard
        title={t("dashboard.analyticsViewsPerMonth")}
        subtitle={t("dashboard.analyticsViewsPerMonthSub", { year: String(selectedYear) })}
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="month" tickFormatter={monthTick} tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#3f3f46" />
            <YAxis tickFormatter={formatCompact} tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#3f3f46" />
            <Tooltip content={<DarkTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value: string) => <span className="text-zinc-600 dark:text-zinc-400">{value}</span>}
            />
            {PLATFORM_KEYS.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                name={PLATFORM_LABELS[key]}
                stackId="views"
                fill={PLATFORM_COLORS[key]}
                radius={key === "facebook" ? [4, 4, 0, 0] : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 4. Poster vs. visninger (kombinert) */}
      <ChartCard
        title={t("dashboard.analyticsPostsVsViews")}
        subtitle={t("dashboard.analyticsPostsVsViewsSub", { year: String(selectedYear) })}
        wide
      >
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={postsVsViews}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="month" tickFormatter={monthTick} tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#3f3f46" />
            <YAxis
              yAxisId="posts"
              orientation="left"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              stroke="#3f3f46"
              label={{ value: t("dashboard.analyticsPostsLabel"), angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 11 }}
            />
            <YAxis
              yAxisId="views"
              orientation="right"
              tickFormatter={formatCompact}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              stroke="#3f3f46"
              label={{ value: t("dashboard.analyticsViews"), angle: 90, position: "insideRight", fill: "#71717a", fontSize: 11 }}
            />
            <Tooltip content={<DarkTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value: string) => <span className="text-zinc-600 dark:text-zinc-400">{value}</span>}
            />
            {PLATFORM_KEYS.map((key) => (
              <Bar
                key={key}
                yAxisId="posts"
                dataKey={key}
                name={`${PLATFORM_LABELS[key]} ${t("dashboard.analyticsPostsLabel").toLowerCase()}`}
                stackId="posts"
                fill={PLATFORM_COLORS[key]}
                opacity={0.7}
                radius={key === "facebook" ? [4, 4, 0, 0] : undefined}
              />
            ))}
            <Line
              yAxisId="views"
              type="monotone"
              dataKey="totalViews"
              name={t("dashboard.analyticsTotalViews")}
              stroke="#ffffff"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#ffffff", stroke: "#18181b", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 6. Gjennomsnitt visninger per post */}
      <ChartCard
        title={t("dashboard.analyticsAvgViews")}
        subtitle={t("dashboard.analyticsAvgViewsSub", { year: String(selectedYear) })}
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={avgPerPost}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="month" tickFormatter={monthTick} tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#3f3f46" />
            <YAxis tickFormatter={formatCompact} tick={{ fill: "#a1a1aa", fontSize: 12 }} stroke="#3f3f46" />
            <Tooltip content={<DarkTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value: string) => <span className="text-zinc-600 dark:text-zinc-400">{value}</span>}
            />
            {PLATFORM_KEYS.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                name={PLATFORM_LABELS[key]}
                fill={PLATFORM_COLORS[key]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 6. Beste videoer (horisontal bar) */}
      <ChartCard
        title={t("dashboard.analyticsTopVideos")}
        subtitle={t("dashboard.analyticsTopVideosSub", { year: String(selectedYear) })}
      >
        {topVideos.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-500">{t("dashboard.analyticsNoVideos")}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(280, topVideos.length * 32)}>
            <BarChart
              data={topVideos}
              layout="vertical"
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={formatCompact}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                stroke="#3f3f46"
              />
              <YAxis
                type="category"
                dataKey="title"
                width={180}
                interval={0}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                stroke="#3f3f46"
              />
              <Tooltip content={<DarkTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value: string) => <span className="text-zinc-600 dark:text-zinc-400">{value}</span>}
              />
              {PLATFORM_KEYS.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={PLATFORM_LABELS[key]}
                  stackId="total"
                  fill={PLATFORM_COLORS[key]}
                  radius={key === "facebook" ? [0, 4, 4, 0] : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
