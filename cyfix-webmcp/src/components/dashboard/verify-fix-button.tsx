"use client";

import { useState } from "react";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRegisteredTools } from "@/lib/webmcp";
import { useAuditStore, useScanStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

interface Verdict {
  ok: boolean;
  fixed?: boolean;
  message: string;
}

/**
 * Re-scans the live site and reports whether this finding is actually resolved.
 *
 * Notably, it does this by invoking the `verify_fix` WebMCP tool — the same
 * entry point an agent uses. The human UI is built on the tool surface rather
 * than beside it, so anything a person can do here, an agent can do too, and
 * both land in the same audit log.
 */
export function VerifyFixButton({ findingId }: { findingId: string }) {
  const { authorized, domain, result } = useScanStore();
  const log = useAuditStore((s) => s.log);
  const [running, setRunning] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const ready = authorized && !!result && domain.trim() === result.domain;

  async function verify() {
    setRunning(true);
    setVerdict(null);
    try {
      const tool = getRegisteredTools().find((t) => t.name === "verify_fix");
      if (!tool) throw new Error("verify_fix is not registered on this page.");

      const raw = (await tool.execute({ findingId })) as {
        ok?: boolean;
        message?: string;
        data?: { fixed?: boolean };
      };

      setVerdict({
        ok: raw.ok !== false,
        fixed: raw.data?.fixed,
        message: raw.message ?? "Re-scan complete.",
      });
      log({
        actor: "human",
        tool: "verify_fix",
        input: { findingId },
        summary: raw.message ?? "Re-scan complete.",
        ok: raw.ok !== false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setVerdict({ ok: false, message });
      log({ actor: "human", tool: "verify_fix", input: { findingId }, summary: message, ok: false });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="secondary" onClick={verify} disabled={running || !ready}>
          <RefreshCw size={13} className={cn(running && "animate-spin")} />
          {running ? "Re-scanning…" : "Verify fix"}
        </Button>
        <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-graphite-500">
          {ready
            ? "Applied the snippet? Re-scan the live site to confirm it landed."
            : "Re-scanning needs the domain entered and authorized above."}
        </p>
      </div>

      {verdict && (
        <p
          className={cn(
            "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs leading-relaxed",
            verdict.fixed
              ? "border-teal-500/40 bg-teal-500/10 text-teal-300"
              : verdict.ok
                ? "border-severity-medium/40 bg-severity-medium/10 text-severity-medium"
                : "border-severity-critical/40 bg-severity-critical/10 text-severity-critical",
          )}
        >
          {verdict.fixed ? (
            <CheckCircle2 size={14} className="mt-px shrink-0" />
          ) : (
            <XCircle size={14} className="mt-px shrink-0" />
          )}
          <span className="min-w-0">{verdict.message}</span>
        </p>
      )}
    </div>
  );
}
