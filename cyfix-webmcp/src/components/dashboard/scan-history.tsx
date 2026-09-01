"use client";

import { useEffect, useState } from "react";
import { History, Minus, RotateCcw, TrendingDown, TrendingUp, Trash2 } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { clearHistory, readHistory, type HistoryEntry } from "@/lib/history";
import { useAuditStore, useScanStore } from "@/lib/stores";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Recent scans, and — for a domain scanned more than once — which way the score
 * moved. This is what makes a fix feel finished: you can see the number that
 * was 61 is now 100, rather than taking the last tool call's word for it.
 *
 * History lives in this browser only. Nothing is uploaded.
 */
export function ScanHistory() {
  const result = useScanStore((s) => s.result);
  const setResult = useScanStore((s) => s.setResult);
  const setDomain = useScanStore((s) => s.setDomain);
  const log = useAuditStore((s) => s.log);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // Re-read whenever a scan lands, and once on mount for the stored backlog.
  useEffect(() => {
    setEntries(readHistory());
  }, [result]);

  if (entries.length === 0) return null;

  function reopen(entry: HistoryEntry) {
    setDomain(entry.domain);
    setResult(entry.result);
    log({
      actor: "human",
      tool: "open_history",
      input: { scanId: entry.id },
      summary: `Reopened the ${formatTime(entry.finishedAt)} scan of ${entry.domain}`,
      ok: true,
    });
  }

  /** The next older scan of the same domain, if there is one. */
  function delta(entry: HistoryEntry, index: number): number | null {
    const older = entries.slice(index + 1).find((e) => e.domain === entry.domain);
    return older ? entry.score - older.score : null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History size={15} className="shrink-0 text-teal-400" /> Scan history
        </CardTitle>
        <button
          onClick={() => {
            clearHistory();
            setEntries([]);
          }}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-graphite-500 transition-colors hover:text-white"
        >
          <Trash2 size={12} /> Clear
        </button>
      </CardHeader>

      <CardBody className="max-h-72 overflow-y-auto p-0">
        <ul className="divide-y divide-graphite-700">
          {entries.map((e, idx) => {
            const d = delta(e, idx);
            const active = result?.id === e.id;
            return (
              <li key={e.id}>
                <button
                  onClick={() => reopen(e)}
                  className={cn(
                    "flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-graphite-800 hover:bg-graphite-800/60 sm:px-5",
                    active && "bg-graphite-800/80",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-display text-xs font-bold",
                      e.score >= 80
                        ? "border-teal-500/40 bg-teal-500/10 text-teal-300"
                        : e.score >= 50
                          ? "border-severity-medium/40 bg-severity-medium/10 text-severity-medium"
                          : "border-severity-critical/40 bg-severity-critical/10 text-severity-critical",
                    )}
                  >
                    {e.score}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{e.domain}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-graphite-600">
                      {formatTime(e.finishedAt)} · {e.failed}/{e.total} need attention
                    </p>
                  </div>

                  {d !== null ? (
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px]",
                        d > 0
                          ? "border-teal-500/40 bg-teal-500/10 text-teal-300"
                          : d < 0
                            ? "border-severity-critical/40 bg-severity-critical/10 text-severity-critical"
                            : "border-graphite-600 text-graphite-500",
                      )}
                    >
                      {d > 0 ? <TrendingUp size={10} /> : d < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                      {d > 0 ? `+${d}` : d}
                    </span>
                  ) : (
                    <RotateCcw size={13} className="shrink-0 text-graphite-600" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </CardBody>

      <div className="border-t border-graphite-700 px-4 py-2.5 text-[10px] leading-relaxed text-graphite-600 sm:px-5">
        Stored in this browser only — never uploaded.
      </div>
    </Card>
  );
}
