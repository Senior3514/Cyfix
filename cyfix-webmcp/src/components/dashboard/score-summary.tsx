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
      <CardBody className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-graphite-500">
            {result.isDemo ? "Demo scan" : "Scan"} of <span className="text-white">{result.domain}</span>
          </p>
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
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-graphite-500">Security score</p>
            <p className={cn("text-4xl font-bold", scoreColor(result.score))}>{result.score}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
