"use client";

import type { Finding, Severity } from "@/types";
import { cn } from "@/lib/utils";

const SEVERITY_FILL: Record<Severity, string> = {
  critical: "bg-severity-critical",
  high: "bg-severity-high",
  medium: "bg-severity-medium",
  low: "bg-severity-low",
  info: "bg-severity-info",
};

const ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

/**
 * Every check in the scan as one cell — the whole surface at a glance.
 *
 * The findings table answers "what is wrong"; this answers "how much of this
 * site did you actually look at, and how much of it held up", which is the
 * question a score alone quietly dodges. Failures sort first and keep their
 * severity colour; passes stay muted so the eye goes where the work is.
 *
 * Each cell is a real control: selecting one opens that finding, so the map is
 * a way to navigate the scan rather than a picture of it.
 */
export function CoverageMap({
  findings,
  selectedId,
  onSelect,
}: {
  findings: Finding[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  if (findings.length === 0) return null;

  const sorted = [...findings].sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? 1 : -1;
    return ORDER[a.severity] - ORDER[b.severity];
  });

  const failed = findings.filter((f) => !f.passed).length;

  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-display text-[11px] font-semibold uppercase tracking-wide text-graphite-500">
          Coverage
        </span>
        <span className="font-mono text-[10px] text-graphite-600">
          {findings.length - failed}/{findings.length} held up
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sorted.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelect?.(f.id)}
            title={`${f.title} — ${f.passed ? "passed" : f.severity}`}
            aria-label={`${f.title}: ${f.passed ? "passed" : f.severity}`}
            className={cn(
              "group relative h-7 w-7 shrink-0 rounded-md border transition-all duration-200",
              f.passed
                ? "border-graphite-700 bg-graphite-800/70 hover:border-graphite-500"
                : "border-transparent hover:scale-110",
              selectedId === f.id && "ring-2 ring-teal-400 ring-offset-2 ring-offset-graphite-850",
            )}
          >
            {f.passed ? (
              <span className="absolute inset-0 flex items-center justify-center text-[11px] text-graphite-600">
                ✓
              </span>
            ) : (
              <span className={cn("absolute inset-0 rounded-md opacity-90", SEVERITY_FILL[f.severity])} />
            )}
          </button>
        ))}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        {(["critical", "high", "medium", "low", "info"] as Severity[])
          .filter((s) => findings.some((f) => !f.passed && f.severity === s))
          .map((s) => (
            <span key={s} className="flex items-center gap-1 text-[10px] text-graphite-500">
              <span className={cn("h-2 w-2 rounded-sm", SEVERITY_FILL[s])} />
              {s}
            </span>
          ))}
        {failed < findings.length && (
          <span className="flex items-center gap-1 text-[10px] text-graphite-600">
            <span className="h-2 w-2 rounded-sm border border-graphite-600 bg-graphite-800" />
            passed
          </span>
        )}
      </div>
    </div>
  );
}
