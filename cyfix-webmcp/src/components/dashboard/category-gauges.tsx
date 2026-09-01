"use client";

import { useEffect, useState } from "react";
import type { Finding, FindingCategory } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<FindingCategory, string> = {
  transport: "Transport",
  headers: "Headers",
  cookies: "Cookies",
  exposure: "Exposure",
  disclosure: "Disclosure",
};

const ORDER: FindingCategory[] = ["transport", "headers", "cookies", "exposure", "disclosure"];

/** Small ring: pass rate for one family of checks. */
function Gauge({ label, passed, total }: { label: string; passed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((passed / total) * 100);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    const t = setTimeout(() => setShown(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);

  const size = 52;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (shown / 100) * c;

  const tone = pct === 100 ? "#2dd4bf" : pct >= 50 ? "#facc15" : "#f43f5e";

  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1c2733" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={tone}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-[11px] font-bold text-white">
          {passed}/{total}
        </span>
      </div>
      <span className="text-center text-[10px] leading-tight text-graphite-500">{label}</span>
      <span className="sr-only">
        {label}: {passed} of {total} checks passed
      </span>
    </div>
  );
}

/**
 * Where a site's weakness actually sits.
 *
 * A single score says how bad things are; this says which family of checks is
 * dragging it down, which is the first thing anyone asks next. Categories with
 * no checks in this scan are omitted rather than shown as an empty zero — a
 * site that sets no cookies has no cookie problem.
 */
export function CategoryGauges({ findings }: { findings: Finding[] }) {
  const groups = ORDER.map((c) => {
    const inCategory = findings.filter((f) => f.category === c);
    return {
      category: c,
      label: CATEGORY_LABEL[c],
      total: inCategory.length,
      passed: inCategory.filter((f) => f.passed).length,
    };
  }).filter((g) => g.total > 0);

  if (groups.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-start justify-center gap-x-5 gap-y-4 sm:justify-start")}>
      {groups.map((g) => (
        <Gauge key={g.category} label={g.label} passed={g.passed} total={g.total} />
      ))}
    </div>
  );
}
