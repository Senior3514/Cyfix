import { Card, CardBody } from "@/components/ui/card";
import type { ScanResult, Severity } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-severity-critical",
  high: "bg-severity-high",
  medium: "bg-severity-medium",
  low: "bg-severity-low",
  info: "bg-severity-info",
};

function scoreColor(score: number) {
  if (score >= 80) return "text-teal-400";
  if (score >= 50) return "text-severity-medium";
  return "text-severity-critical";
}

export function ScoreSummary({ result }: { result: ScanResult }) {
  const failedBySeverity = SEVERITY_ORDER.map((sev) => ({
    severity: sev,
    count: result.findings.filter((f) => !f.passed && f.severity === sev).length,
  })).filter((s) => s.count > 0);

  return (
    <Card>
      <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {result.isDemo && (
              <span className="rounded-full border border-teal-500/40 bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-300">
                Demo data
              </span>
            )}
            <p className="min-w-0 text-xs text-graphite-500">
              {result.isDemo ? "Sample scan" : "Scan"} of{" "}
              <span className="break-all text-white">{result.domain}</span>
            </p>
          </div>
          <p className="mt-1 text-xs text-graphite-600">Finished {formatDate(result.finishedAt)}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {failedBySeverity.map((s) => (
              <span key={s.severity} className="flex items-center gap-1.5 text-xs text-graphite-400">
                <span className={cn("h-2 w-2 rounded-full", SEVERITY_DOT[s.severity])} />
                {s.count} {s.severity}
              </span>
            ))}
            {failedBySeverity.length === 0 && (
              <span className="text-xs text-teal-400">All passive checks passed</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-graphite-700 pt-4 sm:justify-end sm:border-0 sm:pt-0">
          <p className="text-xs uppercase tracking-wide text-graphite-500 sm:hidden">Security score</p>
          <div className="text-right">
            <p className="hidden text-xs uppercase tracking-wide text-graphite-500 sm:block">
              Security score
            </p>
            <p className={cn("text-4xl font-bold leading-none", scoreColor(result.score))}>
              {result.score}
              <span className="ml-1 text-base font-medium text-graphite-600">/100</span>
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
