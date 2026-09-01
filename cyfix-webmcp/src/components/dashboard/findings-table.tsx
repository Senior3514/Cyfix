"use client";

import { useState } from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/badge";
import type { Finding, Severity } from "@/types";
import { cn } from "@/lib/utils";

interface FindingsTableProps {
  findings: Finding[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const SEVERITY_ORDER: Record<Finding["severity"], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

/** Left edge marker — severity is readable at a glance before any text is read. */
const SEVERITY_BAR: Record<Severity, string> = {
  critical: "bg-severity-critical",
  high: "bg-severity-high",
  medium: "bg-severity-medium",
  low: "bg-severity-low",
  info: "bg-severity-info",
};

type Filter = "attention" | "all" | "passed";

export function FindingsTable({ findings, selectedId, onSelect }: FindingsTableProps) {
  const failedTotal = findings.filter((f) => !f.passed).length;
  // A clean site would otherwise land on "Needs attention (0)" and see an empty
  // list — the worst possible reward for having nothing wrong.
  const [filter, setFilter] = useState<Filter>(failedTotal > 0 ? "attention" : "all");

  const sorted = [...findings].sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? 1 : -1;
    return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
  });

  const failedCount = failedTotal;
  const passedCount = findings.length - failedCount;

  const visible = sorted.filter((f) =>
    filter === "all" ? true : filter === "passed" ? f.passed : !f.passed,
  );

  // Mirrors the list_findings WebMCP tool, so the human's filter and the
  // agent's query are the same three views of one result set.
  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "attention", label: "Needs attention", count: failedCount },
    { key: "all", label: "All", count: findings.length },
    { key: "passed", label: "Passed", count: passedCount },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Findings ({findings.length})</CardTitle>
        {failedCount === 0 ? (
          <span className="flex items-center gap-1.5 rounded-full border border-teal-500/40 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300">
            <ShieldCheck size={12} /> All clear
          </span>
        ) : (
          <span className="text-xs text-graphite-500">{failedCount} need attention</span>
        )}
      </CardHeader>

      <div className="flex gap-1.5 overflow-x-auto border-b border-graphite-700 px-4 py-2.5 sm:px-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
              filter === t.key
                ? "bg-teal-500 text-graphite-950"
                : "bg-graphite-800 text-graphite-400 hover:text-white",
            )}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <CardBody className="p-0">
        {visible.length === 0 ? (
          <div className="px-4 py-8 text-center sm:px-5">
            {filter === "attention" ? (
              <>
                <ShieldCheck size={26} className="mx-auto text-teal-400" />
                <p className="mt-2.5 font-display text-sm font-semibold text-white">
                  Every passive check passed
                </p>
                <p className="mt-1 text-xs text-graphite-500">
                  Nothing needs attention on this domain.
                </p>
              </>
            ) : (
              <p className="text-sm text-graphite-500">No checks in this view.</p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-graphite-700">
            {visible.map((f) => (
              <li key={f.id}>
                <button
                  onClick={() => onSelect(f.id)}
                  aria-current={selectedId === f.id}
                  className={cn(
                    "flex w-full min-h-[56px] items-center gap-3 py-3.5 pr-3 text-left transition-colors active:bg-graphite-800 hover:bg-graphite-800/60",
                    selectedId === f.id && "bg-graphite-800/80",
                  )}
                >
                  <span
                    className={cn(
                      "h-9 w-1 shrink-0 rounded-r",
                      f.passed ? "bg-graphite-600" : SEVERITY_BAR[f.severity],
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug text-white">{f.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-graphite-500">
                      {f.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <SeverityBadge severity={f.severity} passed={f.passed} />
                    <ChevronRight
                      size={15}
                      className={cn(
                        "text-graphite-600 transition-colors",
                        selectedId === f.id && "text-teal-400",
                      )}
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
