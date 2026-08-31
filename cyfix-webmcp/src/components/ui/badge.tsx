import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { Severity } from "@/types";

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "bg-severity-critical/15 text-severity-critical border-severity-critical/30",
  high: "bg-severity-high/15 text-severity-high border-severity-high/30",
  medium: "bg-severity-medium/15 text-severity-medium border-severity-medium/30",
  low: "bg-severity-low/15 text-severity-low border-severity-low/30",
  info: "bg-severity-info/15 text-severity-info border-severity-info/30",
};

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        className,
      )}
      {...props}
    />
  );
}

export function SeverityBadge({ severity, passed }: { severity: Severity; passed?: boolean }) {
  if (passed) {
    return (
      <Badge className="border-teal-500/30 bg-teal-500/15 text-teal-300">
        Passed
      </Badge>
    );
  }
  return <Badge className={SEVERITY_STYLES[severity]}>{severity}</Badge>;
}
