"use client";

import { useId } from "react";

interface SparklineProps {
  values: number[];
  /** Bredde i pixels */
  width?: number;
  /** Høyde i pixels */
  height?: number;
  /** Farge på linjen (hex eller css) */
  color?: string;
  /** Vis fyll under linjen */
  fill?: boolean;
  className?: string;
}

/**
 * Mini line chart for KPI-kort. Tar in en serie med tall og tegner
 * en glatt SVG-linje som dekker hele bredden. Hvis alle verdier er like
 * (eller listen er tom) viser den en horisontal linje midt i.
 */
export function Sparkline({
  values,
  width = 120,
  height = 40,
  color = "currentColor",
  fill = true,
  className,
}: SparklineProps) {
  // useId må kalles før evt. early-return for å overholde React's regler
  // for hooks. ID-en er stabil mellom SSR og hydration, så vi unngår
  // hydration-mismatch som Math.random() ga oss tidligere.
  const reactId = useId();
  const gradientId = `sparkline-grad-${reactId.replace(/:/g, "")}`;

  if (!values || values.length === 0) {
    return null;
  }

  const safe = values.length === 1 ? [values[0], values[0]] : values;
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const range = max - min || 1;

  const stepX = width / (safe.length - 1);
  const points = safe.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return [x, y] as [number, number];
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  const fillPath = `${linePath} L${width.toFixed(2)},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      className={className}
      style={{ color }}
      aria-hidden
    >
      {fill ? (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.25} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={fillPath} fill={`url(#${gradientId})`} />
        </>
      ) : null}
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
