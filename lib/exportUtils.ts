import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ---------- Typer ----------

interface PlatformEntry {
  views: number;
  likes: number;
  permalink: string | null;
}

interface ExportVideoRow {
  date: string;
  month: string;
  title: string;
  categoryName: string | null;
  categoryName2: string | null;
  tiktok: PlatformEntry | null;
  youtube: PlatformEntry | null;
  instagram: PlatformEntry | null;
  snapchat: PlatformEntry | null;
  facebook: PlatformEntry | null;
  total: number;
  totalLikes: number;
}

interface ExportMonthlyRow {
  month: string;
  tiktok: number;
  youtube: number;
  instagram: number;
  snapchat: number;
  facebook: number;
  total: number;
}

interface ExportWeeklyRow {
  week: number;
  tiktok: number;
  youtube: number;
  instagram: number;
  snapchat: number;
  facebook: number;
  total: number;
}

interface KPIData {
  totalViews: number;
  growthPercent: number | null;
  prevYearTotal: number;
  bestVideoTitle: string | null;
  bestVideoViews: number;
  engagementRate: number;
  totalLikes: number;
  totalPosts: number;
}

const PLATFORM_NAMES = ["TikTok", "YouTube", "Instagram", "Snapchat", "Facebook"];
const PLATFORM_KEYS = ["tiktok", "youtube", "instagram", "snapchat", "facebook"] as const;

// ---------- Tema (matcher dashbordet) ----------

type RGB = [number, number, number];

/**
 * Sentral palett som speiler dashbordets dark-mode-paletten i appen.
 * Endrer du fargene her, oppdateres alle PDF-eksporter samtidig.
 */
const THEME = {
  page: [10, 10, 10] as RGB, // #0a0a0a — sidebakgrunn
  card: [19, 19, 19] as RGB, // #131313 — kort/tabeller
  header: [24, 24, 24] as RGB, // #181818 — header/footer i tabell
  border: [39, 39, 42] as RGB, // #27272a — zinc-800
  divider: [30, 30, 32] as RGB, // hårfine skillelinjer
  text: {
    primary: [250, 250, 250] as RGB, // zinc-50
    secondary: [161, 161, 170] as RGB, // zinc-400
    muted: [113, 113, 122] as RGB, // zinc-500
    faint: [82, 82, 91] as RGB, // zinc-600
  },
  accent: {
    positive: [52, 211, 153] as RGB, // emerald-400
    negative: [248, 113, 113] as RGB, // red-400
    pink: [236, 72, 153] as RGB, // pink-500 (likes)
    blue: [59, 130, 246] as RGB, // blue-500
    purple: [168, 85, 247] as RGB, // purple-500
  },
};

/**
 * Plattform-farger (matcher dot-fargene i tabellen og PLATFORMS-arrayet i
 * DashboardContent.tsx). Endres bare her — brukes overalt i PDFene.
 */
const PLATFORM_COLORS: Record<string, RGB> = {
  tiktok: [192, 132, 252], // #c084fc — purple-400
  youtube: [239, 68, 68], // #ef4444 — red-500
  instagram: [251, 146, 60], // #fb923c — orange-400
  facebook: [59, 130, 246], // #3b82f6 — blue-500
  snapchat: [250, 204, 21], // #facc15 — yellow-400
};

// ---------- Tegne-hjelpere ----------

function setFill(doc: jsPDF, c: RGB) {
  doc.setFillColor(c[0], c[1], c[2]);
}
function setStroke(doc: jsPDF, c: RGB) {
  doc.setDrawColor(c[0], c[1], c[2]);
}
function setText(doc: jsPDF, c: RGB) {
  doc.setTextColor(c[0], c[1], c[2]);
}

/**
 * Tegner sidebakgrunn (helt mørk) over hele siden.
 */
function paintPage(doc: jsPDF, W: number, H: number) {
  setFill(doc, THEME.page);
  doc.rect(0, 0, W, H, "F");
}

/**
 * Liten farget prikk — brukes foran plattformnavn i forklaringer og
 * tabell-headers, slik at PDFene matcher dot-stilen i dashboardet.
 */
function drawDot(
  doc: jsPDF,
  x: number,
  y: number,
  radius: number,
  color: RGB
) {
  setFill(doc, color);
  doc.circle(x, y, radius, "F");
}

/**
 * Tegner appens øvre header-stripe med wordmark (kundens merkenavn) til
 * venstre, en tittel/subtittel og en dato-stempel til høyre. Konsistent på
 * tvers av alle PDF-typer. `brand` faller tilbake til "Gjensvar" hvis tom.
 */
function drawAppHeader(
  doc: jsPDF,
  W: number,
  options: { title: string; subtitle?: string; trailing?: string; brand?: string }
) {
  // Tynn skillelinje under headeren — ingen "tung" zinc-blokk lenger.
  setFill(doc, THEME.header);
  doc.rect(0, 0, W, 24, "F");
  setStroke(doc, THEME.border);
  doc.setLineWidth(0.15);
  doc.line(0, 24, W, 24);

  // Wordmark.
  const brand = (options.brand && options.brand.trim()) || "Gjensvar";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setText(doc, THEME.text.primary);
  doc.text(brand, 14, 14);

  // Tittel og subtittel sentralt — separert med en hårtynn vertikal strek.
  const titleX = 14 + doc.getTextWidth(brand) + 8;
  setStroke(doc, THEME.border);
  doc.setLineWidth(0.3);
  doc.line(titleX - 4, 7, titleX - 4, 17);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setText(doc, THEME.text.primary);
  doc.text(options.title, titleX, 12);

  if (options.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setText(doc, THEME.text.muted);
    doc.text(options.subtitle, titleX, 17.5);
  }

  // Trailing tekst (oftest dato) til høyre.
  if (options.trailing) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setText(doc, THEME.text.secondary);
    doc.text(options.trailing, W - 14, 14, { align: "right" });
  }
}

/**
 * Footer på hver side: en hårfin skillelinje og side X av Y til høyre.
 * Vises uten merkesignatur slik at PDF-en ikke "lekker" Gjensvar til
 * sluttkunden.
 */
function drawAppFooter(
  doc: jsPDF,
  W: number,
  H: number,
  page: number,
  total: number
) {
  setStroke(doc, THEME.border);
  doc.setLineWidth(0.1);
  doc.line(14, H - 10, W - 14, H - 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  setText(doc, THEME.text.faint);
  doc.text(`Side ${page} av ${total}`, W - 14, H - 5, { align: "right" });
}

/**
 * Tegner et KPI-kort i appens stil. Etiketten ligger forankret øverst,
 * undertittelen forankret nederst, og verdien plasseres vertikalt sentrert
 * i mellomrommet uavhengig av korthøyde. Verdier kan også få egen font-
 * størrelse — nyttig for "Beste video" som inneholder lengre titler.
 */
function drawKpiCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  card: {
    label: string;
    value: string;
    sub: string;
    dot?: RGB;
    valueColor?: RGB;
    valueFontSize?: number;
  }
) {
  // Kort-bakgrunn + ramme.
  setFill(doc, THEME.card);
  doc.roundedRect(x, y, w, h, 2, 2, "F");
  setStroke(doc, THEME.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 2, 2, "S");

  const labelTopY = y + 7; // baseline for etikett
  const subBottomY = y + h - 3.5; // baseline for undertekst
  const valueFontSize = card.valueFontSize ?? 15;

  // Etikett — uppercase, dempet, med valgfri prikk.
  let labelX = x + 5;
  if (card.dot) {
    drawDot(doc, x + 6, y + 6.5, 1.1, card.dot);
    labelX = x + 9.5;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  setText(doc, THEME.text.muted);
  doc.text(card.label.toUpperCase(), labelX, labelTopY);

  // Verdi — sentrert vertikalt mellom etikett og undertekst.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(valueFontSize);
  setText(doc, card.valueColor ?? THEME.text.primary);
  // jsPDF: y er baseline. Tilnærmet høyde = fontSize * 0.353 mm/pt.
  const valueHeight = valueFontSize * 0.353;
  const middleTop = labelTopY + 2;
  const middleBottom = subBottomY - 4;
  const middleHeight = middleBottom - middleTop;
  const valueY = middleTop + middleHeight / 2 + valueHeight / 2;
  doc.text(card.value, x + 5, valueY);

  // Undertekst.
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  setText(doc, THEME.text.faint);
  doc.text(card.sub, x + 5, subBottomY);
}

// ---------- Hjelpefunksjoner ----------

function fmt(n: number): string {
  return n.toLocaleString("no-NO");
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("no-NO", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function getISOWeek(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- CSV Eksport ----------

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function toCsvRow(cells: (string | number)[]): string {
  return cells.map((c) => escapeCsv(String(c))).join(",");
}

export function exportVideosCsv(rows: ExportVideoRow[], year: number) {
  const header = [
    "Måned",
    "Tittel",
    "Info 1",
    "Info 2",
    "Publisert",
    "Uke",
    ...PLATFORM_NAMES,
    "Total",
    "Likes",
  ];

  const csvRows = [
    toCsvRow(header),
    ...rows.map((r) =>
      toCsvRow([
        r.month,
        r.title,
        r.categoryName ?? "",
        r.categoryName2 ?? "",
        fmtDate(r.date),
        getISOWeek(r.date),
        r.tiktok?.views ?? 0,
        r.youtube?.views ?? 0,
        r.instagram?.views ?? 0,
        r.snapchat?.views ?? 0,
        r.facebook?.views ?? 0,
        r.total,
        r.totalLikes,
      ])
    ),
  ];

  const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  downloadBlob(blob, `gjensvar-videoer-${year}.csv`);
}

export function exportMonthlyCsv(rows: ExportMonthlyRow[], year: number) {
  const header = ["Måned", ...PLATFORM_NAMES, "Total"];
  const csvRows = [
    toCsvRow(header),
    ...rows.map((r) =>
      toCsvRow([r.month, r.tiktok, r.youtube, r.instagram, r.snapchat, r.facebook, r.total])
    ),
  ];
  const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  downloadBlob(blob, `gjensvar-visninger-${year}.csv`);
}

export function exportWeeklyCsv(rows: ExportWeeklyRow[], year: number) {
  const header = ["Uke", ...PLATFORM_NAMES, "Total"];
  const csvRows = [
    toCsvRow(header),
    ...rows.filter((w) => w.total > 0).map((r) =>
      toCsvRow([r.week, r.tiktok, r.youtube, r.instagram, r.snapchat, r.facebook, r.total])
    ),
  ];
  const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  downloadBlob(blob, `gjensvar-ukentlig-${year}.csv`);
}

export function exportPostsCsv(rows: ExportMonthlyRow[], year: number) {
  const header = ["Måned", ...PLATFORM_NAMES, "Total"];
  const csvRows = [
    toCsvRow(header),
    ...rows.map((r) =>
      toCsvRow([r.month, r.tiktok, r.youtube, r.instagram, r.snapchat, r.facebook, r.total])
    ),
  ];
  const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  downloadBlob(blob, `gjensvar-poster-${year}.csv`);
}

// ---------- PDF Eksport ----------

export function exportPdf(
  view: "videos" | "views-monthly" | "views-weekly" | "posts",
  year: number,
  kpi: KPIData,
  data: {
    videoRows?: ExportVideoRow[];
    monthlyRows?: ExportMonthlyRow[];
    weeklyRows?: ExportWeeklyRow[];
    postRows?: ExportMonthlyRow[];
    totals: Record<string, number>;
  },
  brand?: string,
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  paintPage(doc, pageWidth, pageHeight);

  const viewLabels: Record<string, string> = {
    videos: "Videooversikt",
    "views-monthly": "Månedlige visninger",
    "views-weekly": "Ukentlige visninger",
    posts: "Poster per måned",
  };
  const now = new Date();
  drawAppHeader(doc, pageWidth, {
    title: viewLabels[view],
    subtitle: `${year}`,
    trailing: `Generert ${now.toLocaleDateString("no-NO")} kl. ${now.toLocaleTimeString(
      "no-NO",
      { hour: "2-digit", minute: "2-digit" }
    )}`,
    brand,
  });

  // ---------- KPI-kort ----------
  const kpiY = 32;
  const kpiGap = 5;
  const kpiW = (pageWidth - 28 - kpiGap * 3) / 4;
  const kpiH = 22;

  const growthValue =
    kpi.growthPercent !== null
      ? `${kpi.growthPercent >= 0 ? "+" : ""}${kpi.growthPercent.toFixed(1)}%`
      : "—";
  const growthColor =
    kpi.growthPercent === null
      ? THEME.text.primary
      : kpi.growthPercent >= 0
      ? THEME.accent.positive
      : THEME.accent.negative;

  const kpiItems: Array<{
    label: string;
    value: string;
    sub: string;
    dot?: RGB;
    valueColor?: RGB;
    valueFontSize?: number;
  }> = [
    {
      label: "Totale visninger",
      value: fmt(kpi.totalViews),
      sub: `${fmt(kpi.totalPosts)} poster`,
      dot: THEME.accent.blue,
    },
    {
      label: "Vekst",
      value: growthValue,
      sub:
        kpi.growthPercent !== null
          ? `vs. ${fmt(kpi.prevYearTotal)} i ${year - 1}`
          : `Ingen data for ${year - 1}`,
      dot: kpi.growthPercent === null
        ? THEME.text.muted
        : kpi.growthPercent >= 0
        ? THEME.accent.positive
        : THEME.accent.negative,
      valueColor: growthColor,
    },
    {
      label: "Beste video",
      value: kpi.bestVideoTitle
        ? kpi.bestVideoTitle.length > 28
          ? kpi.bestVideoTitle.substring(0, 26) + "…"
          : kpi.bestVideoTitle
        : "—",
      sub: kpi.bestVideoViews > 0 ? `${fmt(kpi.bestVideoViews)} visninger` : "",
      dot: THEME.accent.purple,
      valueFontSize: 9,
    },
    {
      label: "Engagement rate",
      value: `${kpi.engagementRate.toFixed(1)}%`,
      sub: `${fmt(kpi.totalLikes)} likes`,
      dot: THEME.accent.pink,
    },
  ];

  kpiItems.forEach((item, i) => {
    drawKpiCard(doc, 14 + i * (kpiW + kpiGap), kpiY, kpiW, kpiH, item);
  });

  // ---------- Tabell ----------
  const tableStartY = kpiY + kpiH + 8;

  const platformCols = PLATFORM_NAMES;

  if (view === "videos" && data.videoRows) {
    const head = [["Mnd", "Tittel", "Info", "Publisert", "Uke", ...platformCols, "Total", "Likes"]];
    const body = data.videoRows.map((r) => [
      r.month,
      r.title.length > 30 ? r.title.substring(0, 28) + "…" : r.title,
      [r.categoryName, r.categoryName2].filter(Boolean).join(", ") || "—",
      fmtDate(r.date),
      String(getISOWeek(r.date)),
      ...PLATFORM_KEYS.map((k) => (r[k]?.views ? fmt(r[k]!.views) : "—")),
      fmt(r.total),
      fmt(r.totalLikes),
    ]);

    const foot = [
      [
        "Totalt",
        "",
        "",
        "",
        "",
        ...PLATFORM_KEYS.map((k) => fmt(data.totals[k] ?? 0)),
        fmt(data.totals.grand ?? 0),
        fmt(data.totals.likes ?? 0),
      ],
    ];

    autoTable(doc, {
      startY: tableStartY,
      head,
      body,
      foot,
      theme: "plain",
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: THEME.text.primary,
        fillColor: THEME.card,
        lineColor: THEME.divider,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: THEME.header,
        textColor: THEME.text.muted,
        fontStyle: "bold",
        fontSize: 6,
        cellPadding: 2.5,
      },
      footStyles: {
        fillColor: THEME.header,
        textColor: THEME.text.primary,
        fontStyle: "bold",
        cellPadding: 2.5,
      },
      alternateRowStyles: {
        fillColor: [22, 22, 22],
      },
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 36 },
        2: { cellWidth: 22 },
        3: { cellWidth: 18 },
        4: { cellWidth: 10 },
      },
      margin: { left: 14, right: 14 },
    });
  } else if (
    (view === "views-monthly" && data.monthlyRows) ||
    (view === "posts" && data.postRows)
  ) {
    const rows = view === "views-monthly" ? data.monthlyRows! : data.postRows!;
    const head = [["Måned", ...platformCols, "Total"]];
    const body = rows.map((r) => [
      r.month,
      ...PLATFORM_KEYS.map((k) => (r[k as keyof typeof r] as number > 0 ? fmt(r[k as keyof typeof r] as number) : "—")),
      r.total > 0 ? fmt(r.total) : "—",
    ]);
    const foot = [
      [
        "Totalt",
        ...PLATFORM_KEYS.map((k) => fmt(data.totals[k] ?? 0)),
        fmt(data.totals.grand ?? 0),
      ],
    ];

    autoTable(doc, {
      startY: tableStartY,
      head,
      body,
      foot,
      theme: "plain",
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: THEME.text.primary,
        fillColor: THEME.card,
        lineColor: THEME.divider,
        lineWidth: 0.1,
        halign: "right",
      },
      headStyles: {
        fillColor: THEME.header,
        textColor: THEME.text.muted,
        fontStyle: "bold",
        fontSize: 6.5,
        cellPadding: 2.5,
      },
      footStyles: {
        fillColor: THEME.header,
        textColor: THEME.text.primary,
        fontStyle: "bold",
        cellPadding: 2.5,
      },
      alternateRowStyles: {
        fillColor: [22, 22, 22],
      },
      columnStyles: {
        0: { halign: "left", cellWidth: 30 },
      },
      margin: { left: 14, right: 14 },
    });
  } else if (view === "views-weekly" && data.weeklyRows) {
    const activeWeeks = data.weeklyRows.filter((w) => w.total > 0);
    const head = [["Uke", ...platformCols, "Total"]];
    const body = activeWeeks.map((r) => [
      String(r.week),
      ...PLATFORM_KEYS.map((k) => (r[k as keyof typeof r] as number > 0 ? fmt(r[k as keyof typeof r] as number) : "0")),
      fmt(r.total),
    ]);
    const foot = [
      [
        "Totalt",
        ...PLATFORM_KEYS.map((k) => fmt(data.totals[k] ?? 0)),
        fmt(data.totals.grand ?? 0),
      ],
    ];

    autoTable(doc, {
      startY: tableStartY,
      head,
      body,
      foot,
      theme: "plain",
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: THEME.text.primary,
        fillColor: THEME.card,
        lineColor: THEME.divider,
        lineWidth: 0.1,
        halign: "right",
      },
      headStyles: {
        fillColor: THEME.header,
        textColor: THEME.text.muted,
        fontStyle: "bold",
        fontSize: 6.5,
        cellPadding: 2.5,
      },
      footStyles: {
        fillColor: THEME.header,
        textColor: THEME.text.primary,
        fontStyle: "bold",
        cellPadding: 2.5,
      },
      alternateRowStyles: {
        fillColor: [22, 22, 22],
      },
      columnStyles: {
        0: { halign: "left", cellWidth: 14 },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ---------- Footer ----------
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawAppFooter(doc, pageWidth, pageHeight, i, pageCount);
  }

  doc.save(`gjensvar-${view}-${year}.pdf`);
}

// ========== Kunderapport (visuell PDF) ==========

function fmtShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return Math.round(n / 1_000) + "K";
  return String(n);
}

function drawSector(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  color: [number, number, number]
) {
  doc.setFillColor(color[0], color[1], color[2]);
  const segments = Math.max(2, Math.ceil(Math.abs(endAngle - startAngle) / 0.04));
  const step = (endAngle - startAngle) / segments;
  for (let i = 0; i < segments; i++) {
    const a1 = startAngle + step * i;
    const a2 = startAngle + step * (i + 1);
    doc.triangle(
      cx,
      cy,
      cx + r * Math.cos(a1),
      cy + r * Math.sin(a1),
      cx + r * Math.cos(a2),
      cy + r * Math.sin(a2),
      "F"
    );
  }
}

function drawReportHeader(doc: jsPDF, W: number, year: number, brand?: string) {
  const now = new Date();
  drawAppHeader(doc, W, {
    title: "Kunderapport",
    subtitle: String(year),
    trailing: now.toLocaleDateString("no-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    brand,
  });
}

function drawReportFooter(
  doc: jsPDF,
  W: number,
  H: number,
  page: number,
  totalPages: number
) {
  drawAppFooter(doc, W, H, page, totalPages);
}

export function exportClientReport(
  year: number,
  kpi: KPIData,
  monthlyRows: ExportMonthlyRow[],
  videoRows: ExportVideoRow[],
  totals: Record<string, number>,
  brand?: string,
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ===== SIDE 1: Oversikt =====

  paintPage(doc, W, H);
  drawReportHeader(doc, W, year, brand);

  // --- KPI-kort ---
  const kpiY = 32;
  const kpiGap = 5;
  const kpiW = (W - 28 - kpiGap * 3) / 4;
  const kpiH = 24;

  const growthValue =
    kpi.growthPercent !== null
      ? `${kpi.growthPercent >= 0 ? "+" : ""}${kpi.growthPercent.toFixed(1)}%`
      : "—";
  const growthValueColor =
    kpi.growthPercent === null
      ? THEME.text.primary
      : kpi.growthPercent >= 0
      ? THEME.accent.positive
      : THEME.accent.negative;
  const growthDot =
    kpi.growthPercent === null
      ? THEME.text.muted
      : kpi.growthPercent >= 0
      ? THEME.accent.positive
      : THEME.accent.negative;

  const kpiItems: Array<{
    label: string;
    value: string;
    sub: string;
    dot?: RGB;
    valueColor?: RGB;
    valueFontSize?: number;
  }> = [
    {
      label: "Totale visninger",
      value: fmt(kpi.totalViews),
      sub: `${fmt(kpi.totalPosts)} poster i ${year}`,
      dot: THEME.accent.blue,
    },
    {
      label: "Vekst",
      value: growthValue,
      sub:
        kpi.growthPercent !== null
          ? `vs. ${fmt(kpi.prevYearTotal)} i ${year - 1}`
          : `Ingen data for ${year - 1}`,
      dot: growthDot,
      valueColor: growthValueColor,
    },
    {
      label: "Engagement rate",
      value: `${kpi.engagementRate.toFixed(1)}%`,
      sub: `${fmt(kpi.totalLikes)} likes totalt`,
      dot: THEME.accent.pink,
    },
    {
      label: "Beste video",
      value: kpi.bestVideoTitle
        ? kpi.bestVideoTitle.length > 28
          ? kpi.bestVideoTitle.substring(0, 26) + "…"
          : kpi.bestVideoTitle
        : "—",
      sub:
        kpi.bestVideoViews > 0
          ? `${fmt(kpi.bestVideoViews)} visninger`
          : "",
      dot: THEME.accent.purple,
      valueFontSize: 9,
    },
  ];

  kpiItems.forEach((item, i) => {
    drawKpiCard(doc, 14 + i * (kpiW + kpiGap), kpiY, kpiW, kpiH, item);
  });

  // --- Diagramområde ---
  const chartsY = kpiY + kpiH + 8;
  const chartsH = H - chartsY - 14;
  const chartGap = 8;
  const barChartW = (W - 28 - chartGap) * 0.6;
  const donutChartW = (W - 28 - chartGap) * 0.4;

  // ---- Månedlig stolpediagram ----
  const barCardX = 14;
  setFill(doc, THEME.card);
  doc.roundedRect(barCardX, chartsY, barChartW, chartsH, 2, 2, "F");
  setStroke(doc, THEME.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(barCardX, chartsY, barChartW, chartsH, 2, 2, "S");

  // Tittel
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setText(doc, THEME.text.primary);
  doc.text("Månedlige visninger", barCardX + 8, chartsY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  setText(doc, THEME.text.muted);
  doc.text("Visninger per plattform fordelt på måned", barCardX + 8, chartsY + 16);

  const barAreaX = barCardX + 24;
  const barAreaY = chartsY + 22;
  const barAreaW = barChartW - 34;
  const barAreaH = chartsH - 34;
  const maxTotal = Math.max(...monthlyRows.map((m) => m.total), 1);
  const barGap2 = 2;
  const barWidth = (barAreaW - barGap2 * 11) / 12;

  // Y-akse rutenett
  const gridCount = 5;
  for (let g = 0; g <= gridCount; g++) {
    const y = barAreaY + barAreaH - (barAreaH * g) / gridCount;
    setStroke(doc, THEME.divider);
    doc.setLineWidth(0.1);
    doc.line(barAreaX, y, barAreaX + barAreaW, y);

    const val = Math.round((maxTotal * g) / gridCount);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    setText(doc, THEME.text.faint);
    doc.text(fmtShort(val), barAreaX - 3, y + 1.5, { align: "right" });
  }

  // Stolper
  const shortMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  monthlyRows.forEach((m, i) => {
    const x = barAreaX + i * (barWidth + barGap2);
    let currentY = barAreaY + barAreaH;

    for (const key of PLATFORM_KEYS) {
      const value = m[key as keyof ExportMonthlyRow] as number;
      if (value <= 0) continue;

      const barH = (value / maxTotal) * barAreaH;
      currentY -= barH;

      const color = PLATFORM_COLORS[key];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, currentY, barWidth, barH, "F");
    }

    // Månedsetikett
    doc.setFontSize(5.5);
    setText(doc, THEME.text.muted);
    doc.text(shortMonths[i], x + barWidth / 2, barAreaY + barAreaH + 5, {
      align: "center",
    });
  });

  // Miniforklaring under stolpediagrammet
  const legendBarY = barAreaY + barAreaH + 9;
  let legendBarX = barAreaX;
  PLATFORM_KEYS.forEach((key, i) => {
    drawDot(doc, legendBarX + 1.2, legendBarY + 1.4, 1.2, PLATFORM_COLORS[key]);
    doc.setFontSize(5.5);
    setText(doc, THEME.text.secondary);
    doc.text(PLATFORM_NAMES[i], legendBarX + 4, legendBarY + 2);
    legendBarX += doc.getTextWidth(PLATFORM_NAMES[i]) + 9;
  });

  // ---- Smultring-diagram ----
  const donutCardX = barCardX + barChartW + chartGap;
  setFill(doc, THEME.card);
  doc.roundedRect(donutCardX, chartsY, donutChartW, chartsH, 2, 2, "F");
  setStroke(doc, THEME.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(donutCardX, chartsY, donutChartW, chartsH, 2, 2, "S");

  // Tittel
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setText(doc, THEME.text.primary);
  doc.text("Plattformfordeling", donutCardX + 8, chartsY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  setText(doc, THEME.text.muted);
  doc.text("Andel av totale visninger", donutCardX + 8, chartsY + 16);

  const donutCx = donutCardX + donutChartW / 2;
  const donutCy = chartsY + 20 + (chartsH - 50) / 2;
  const outerR = Math.min(donutChartW * 0.32, (chartsH - 50) * 0.42);
  const innerR = outerR * 0.55;

  const grandTotal = PLATFORM_KEYS.reduce(
    (s, k) => s + (totals[k] ?? 0),
    0
  );

  const platformData = PLATFORM_KEYS.map((key) => ({
    key,
    value: totals[key] ?? 0,
    pct: grandTotal > 0 ? ((totals[key] ?? 0) / grandTotal) * 100 : 0,
  })).filter((p) => p.value > 0);

  if (grandTotal > 0) {
    let currentAngle = -Math.PI / 2;
    for (const p of platformData) {
      const angle = (p.value / grandTotal) * 2 * Math.PI;
      drawSector(
        doc,
        donutCx,
        donutCy,
        outerR,
        currentAngle,
        currentAngle + angle,
        PLATFORM_COLORS[p.key]
      );
      currentAngle += angle;
    }

    // Indre sirkel (smultring-hull)
    setFill(doc, THEME.card);
    doc.circle(donutCx, donutCy, innerR, "F");

    // Sentrumstekst
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    setText(doc, THEME.text.primary);
    doc.text(fmtShort(grandTotal), donutCx, donutCy - 1, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    setText(doc, THEME.text.muted);
    doc.text("visninger", donutCx, donutCy + 4, { align: "center" });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setText(doc, THEME.text.faint);
    doc.text("Ingen data", donutCx, donutCy, { align: "center" });
  }

  // Forklaring under smultring
  const legendStartY = donutCy + outerR + 10;
  platformData.forEach((p, i) => {
    const ly = legendStartY + i * 7;
    const lx = donutCardX + 12;

    // Farget prikk
    drawDot(doc, lx + 1.5, ly - 1, 1.3, PLATFORM_COLORS[p.key]);

    // Plattformnavn
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setText(doc, THEME.text.primary);
    doc.text(PLATFORM_NAMES[PLATFORM_KEYS.indexOf(p.key)], lx + 5, ly);

    // Verdi og prosent
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setText(doc, THEME.text.secondary);
    doc.text(
      `${fmtShort(p.value)}  (${p.pct.toFixed(1)}%)`,
      donutCardX + donutChartW - 10,
      ly,
      { align: "right" }
    );
  });

  // ===== SIDE 2: Topp videoer =====
  doc.addPage();
  paintPage(doc, W, H);
  drawReportHeader(doc, W, year, brand);

  // Seksjonsoverskrift
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setText(doc, THEME.text.primary);
  doc.text("Topp videoer", 14, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setText(doc, THEME.text.muted);
  doc.text("Rangert etter totale visninger", 14, 42);

  // Topp-videoer-tabell
  const topVideos = [...videoRows]
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);

  const head = [
    ["#", "Tittel", "Dato", ...PLATFORM_NAMES, "Total", "Likes"],
  ];
  const body = topVideos.map((r, i) => [
    String(i + 1),
    r.title.length > 38 ? r.title.substring(0, 36) + "…" : r.title,
    fmtDate(r.date),
    ...PLATFORM_KEYS.map((k) => (r[k]?.views ? fmt(r[k]!.views) : "—")),
    fmt(r.total),
    fmt(r.totalLikes),
  ]);

  autoTable(doc, {
    startY: 48,
    head,
    body,
    theme: "plain",
    styles: {
      fontSize: 7,
      cellPadding: 2.5,
      textColor: THEME.text.primary,
      fillColor: THEME.card,
      lineColor: THEME.divider,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: THEME.header,
      textColor: THEME.text.muted,
      fontStyle: "bold",
      fontSize: 6.5,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [22, 22, 22],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 50 },
      2: { cellWidth: 20 },
    },
    margin: { left: 14, right: 14 },
  });

  // ===== SIDE 3: Månedlig detaljer-tabell =====
  doc.addPage();
  paintPage(doc, W, H);
  drawReportHeader(doc, W, year, brand);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setText(doc, THEME.text.primary);
  doc.text("Månedlig oversikt", 14, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setText(doc, THEME.text.muted);
  doc.text("Visninger per plattform per måned", 14, 42);

  const mHead = [["Måned", ...PLATFORM_NAMES, "Total"]];
  const mBody = monthlyRows.map((r) => [
    r.month,
    ...PLATFORM_KEYS.map((k) =>
      (r[k as keyof ExportMonthlyRow] as number) > 0
        ? fmt(r[k as keyof ExportMonthlyRow] as number)
        : "—"
    ),
    r.total > 0 ? fmt(r.total) : "—",
  ]);
  const mFoot = [
    [
      "Totalt",
      ...PLATFORM_KEYS.map((k) => fmt(totals[k] ?? 0)),
      fmt(totals.grand ?? 0),
    ],
  ];

  autoTable(doc, {
    startY: 48,
    head: mHead,
    body: mBody,
    foot: mFoot,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: THEME.text.primary,
      fillColor: THEME.card,
      lineColor: THEME.divider,
      lineWidth: 0.1,
      halign: "right",
    },
    headStyles: {
      fillColor: THEME.header,
      textColor: THEME.text.muted,
      fontStyle: "bold",
      fontSize: 6.5,
      cellPadding: 2.5,
    },
    footStyles: {
      fillColor: THEME.header,
      textColor: THEME.text.primary,
      fontStyle: "bold",
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [22, 22, 22],
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer på alle sider
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawReportFooter(doc, W, H, p, totalPages);
  }

  doc.save(`gjensvar-kunderapport-${year}.pdf`);
}

// ========== Periode-rapport (uke / måned) ==========

const MONTH_NAMES_NO = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];

export function getWeekDateRange(
  week: number,
  year: number
): { start: Date; end: Date } {
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = (jan4.getDay() + 6) % 7; // mandag = 0
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday };
}

function fmtDateShort(d: Date): string {
  return d.toLocaleDateString("no-NO", { day: "numeric", month: "short" });
}

export function exportPeriodReport(
  type: "week" | "month",
  period: number, // uke 1-53 eller måned 0-11
  year: number,
  videos: ExportVideoRow[],
  prevVideos: ExportVideoRow[],
  brand?: string,
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // --- Beregn KPI-er ---
  const totalViews = videos.reduce((s, v) => s + v.total, 0);
  const totalLikes = videos.reduce((s, v) => s + v.totalLikes, 0);
  const prevViews = prevVideos.reduce((s, v) => s + v.total, 0);
  const growth = prevViews > 0 ? ((totalViews - prevViews) / prevViews) * 100 : null;
  const engagement = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

  const platformTotals: Record<string, number> = {};
  const platformLikes: Record<string, number> = {};
  for (const key of PLATFORM_KEYS) {
    platformTotals[key] = videos.reduce((s, v) => s + (v[key]?.views ?? 0), 0);
    platformLikes[key] = videos.reduce((s, v) => s + (v[key]?.likes ?? 0), 0);
  }

  let postCount = 0;
  for (const v of videos) {
    for (const key of PLATFORM_KEYS) {
      if (v[key]) postCount++;
    }
  }

  // --- Periode-tekster ---
  let periodTitle: string;
  let periodSubtitle: string;
  let prevLabel: string;
  let filename: string;

  if (type === "week") {
    const range = getWeekDateRange(period, year);
    periodTitle = `Uke ${period}, ${year}`;
    periodSubtitle = `${fmtDateShort(range.start)} – ${fmtDateShort(range.end)}`;
    const prevWeek = period > 1 ? period - 1 : 52;
    prevLabel = `vs. uke ${prevWeek}`;
    filename = `gjensvar-ukerapport-uke${period}-${year}`;
  } else {
    periodTitle = `${MONTH_NAMES_NO[period]} ${year}`;
    periodSubtitle = `Månedsrapport`;
    const prevMonth = period > 0 ? MONTH_NAMES_NO[period - 1] : MONTH_NAMES_NO[11];
    prevLabel = `vs. ${prevMonth}`;
    filename = `gjensvar-maanedsrapport-${String(period + 1).padStart(2, "0")}-${year}`;
  }

  // --- Bakgrunn + header ---
  paintPage(doc, W, H);
  const now = new Date();
  drawAppHeader(doc, W, {
    title: periodTitle,
    subtitle: periodSubtitle,
    trailing: now.toLocaleDateString("no-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    brand,
  });

  // --- KPI-kort ---
  const kpiY = 32;
  const kpiGap = 5;
  const kpiW = (W - 28 - kpiGap * 3) / 4;
  const kpiH = 22;

  const bestVideo = videos.length > 0
    ? videos.reduce((b, v) => (v.total > b.total ? v : b), videos[0])
    : null;

  const growthValueColor =
    growth === null
      ? THEME.text.primary
      : growth >= 0
      ? THEME.accent.positive
      : THEME.accent.negative;
  const growthDot =
    growth === null
      ? THEME.text.muted
      : growth >= 0
      ? THEME.accent.positive
      : THEME.accent.negative;

  const kpiItems: Array<{
    label: string;
    value: string;
    sub: string;
    dot?: RGB;
    valueColor?: RGB;
    valueFontSize?: number;
  }> = [
    {
      label: "Visninger",
      value: fmt(totalViews),
      sub: `${postCount} poster denne perioden`,
      dot: THEME.accent.blue,
    },
    {
      label: "Endring",
      value:
        growth !== null
          ? `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`
          : "—",
      sub:
        growth !== null
          ? `${prevLabel} (${fmt(prevViews)})`
          : "Ingen tidligere data",
      dot: growthDot,
      valueColor: growthValueColor,
    },
    {
      label: "Engagement",
      value: `${engagement.toFixed(1)}%`,
      sub: `${fmt(totalLikes)} likes`,
      dot: THEME.accent.pink,
    },
    {
      label: "Beste video",
      value: bestVideo
        ? bestVideo.title.length > 28
          ? bestVideo.title.substring(0, 26) + "…"
          : bestVideo.title
        : "—",
      sub: bestVideo ? `${fmt(bestVideo.total)} visninger` : "",
      dot: THEME.accent.purple,
      valueFontSize: 9,
    },
  ];

  kpiItems.forEach((item, i) => {
    drawKpiCard(doc, 14 + i * (kpiW + kpiGap), kpiY, kpiW, kpiH, item);
  });

  // --- Plattformfordeling (horisontal stablet bar) ---
  const barY = kpiY + kpiH + 8;
  const barCardH = 38;

  setFill(doc, THEME.card);
  doc.roundedRect(14, barY, W - 28, barCardH, 2, 2, "F");
  setStroke(doc, THEME.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(14, barY, W - 28, barCardH, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setText(doc, THEME.text.primary);
  doc.text("Plattformfordeling", 22, barY + 9);

  const grandTotal = PLATFORM_KEYS.reduce((s, k) => s + (platformTotals[k] ?? 0), 0);
  const barX = 22;
  const barW = W - 44;
  const barH = 8;
  const barTopY = barY + 14;

  if (grandTotal > 0) {
    let currentX = barX;
    const platformSegments = PLATFORM_KEYS.map((key) => ({
      key,
      value: platformTotals[key] ?? 0,
      pct: ((platformTotals[key] ?? 0) / grandTotal) * 100,
    })).filter((p) => p.value > 0);

    // Tegn stablede segmenter
    platformSegments.forEach((p, i) => {
      const segW = (p.value / grandTotal) * barW;
      const color = PLATFORM_COLORS[p.key];
      doc.setFillColor(color[0], color[1], color[2]);

      if (i === 0 && platformSegments.length === 1) {
        doc.roundedRect(currentX, barTopY, segW, barH, 2, 2, "F");
      } else if (i === 0) {
        doc.roundedRect(currentX, barTopY, segW + 2, barH, 2, 2, "F");
        doc.rect(currentX + segW - 0.5, barTopY, 2.5, barH, "F");
      } else if (i === platformSegments.length - 1) {
        doc.roundedRect(currentX - 2, barTopY, segW + 2, barH, 2, 2, "F");
        doc.rect(currentX - 2, barTopY, 2.5, barH, "F");
      } else {
        doc.rect(currentX, barTopY, segW, barH, "F");
      }
      currentX += segW;
    });

    // Forklaring under baren
    let legendX = barX;
    const legendY = barTopY + barH + 5;
    platformSegments.forEach((p) => {
      drawDot(doc, legendX + 1.2, legendY - 1, 1.2, PLATFORM_COLORS[p.key]);

      const name = PLATFORM_NAMES[PLATFORM_KEYS.indexOf(p.key)];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      setText(doc, THEME.text.secondary);
      const label = `${name}  ${fmtShort(p.value)} (${p.pct.toFixed(1)}%)`;
      doc.text(label, legendX + 4, legendY);
      legendX += doc.getTextWidth(label) + 12;
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setText(doc, THEME.text.faint);
    doc.text("Ingen data for denne perioden", barX, barTopY + 5);
  }

  // --- Video-tabell ---
  const tableY = barY + barCardH + 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setText(doc, THEME.text.primary);
  doc.text("Videoer", 14, tableY + 4);

  if (videos.length > 0) {
    const sortedVideos = [...videos].sort((a, b) => b.total - a.total);

    const head = [["#", "Tittel", "Dato", ...PLATFORM_NAMES, "Total", "Likes"]];
    const body = sortedVideos.map((r, i) => [
      String(i + 1),
      r.title.length > 40 ? r.title.substring(0, 38) + "…" : r.title,
      fmtDate(r.date),
      ...PLATFORM_KEYS.map((k) => (r[k]?.views ? fmt(r[k]!.views) : "—")),
      fmt(r.total),
      fmt(r.totalLikes),
    ]);

    autoTable(doc, {
      startY: tableY + 8,
      head,
      body,
      theme: "plain",
      styles: {
        fontSize: 7,
        cellPadding: 2.5,
        textColor: THEME.text.primary,
        fillColor: THEME.card,
        lineColor: THEME.divider,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: THEME.header,
        textColor: THEME.text.muted,
        fontStyle: "bold",
        fontSize: 6.5,
        cellPadding: 2.5,
      },
      alternateRowStyles: {
        fillColor: [22, 22, 22],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 55 },
        2: { cellWidth: 20 },
      },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setText(doc, THEME.text.faint);
    doc.text("Ingen videoer i denne perioden.", 14, tableY + 12);
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawReportFooter(doc, W, H, p, totalPages);
  }

  doc.save(`${filename}.pdf`);
}
