"use client";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/badge";
import type { Finding } from "@/types";
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

export function FindingsTable({ findings, selectedId, onSelect }: FindingsTableProps) {
  const sorted = [...findings].sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? 1 : -1;
    return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Findings ({findings.length})</CardTitle>
        <span className="text-xs text-graphite-500">
          {findings.filter((f) => !f.passed).length} need attention
        </span>
      </CardHeader>
      <CardBody className="p-0">
        <ul className="divide-y divide-graphite-700">
          {sorted.map((f) => (
            <li key={f.id}>
              <button
                onClick={() => onSelect(f.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-graphite-800/60",
                  selectedId === f.id && "bg-graphite-800/80",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{f.title}</p>
                  <p className="mt-0.5 truncate text-xs text-graphite-500">{f.description}</p>
                </div>
                <SeverityBadge severity={f.severity} passed={f.passed} />
              </button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
