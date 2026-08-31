"use client";

import { Bot, CheckCircle2, User2, XCircle } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuditStore } from "@/lib/stores";
import { formatTime } from "@/lib/utils";

export function AuditLog() {
  const entries = useAuditStore((s) => s.entries);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <span className="text-xs text-graphite-500">{entries.length} event(s)</span>
      </CardHeader>
      <CardBody className="max-h-80 overflow-y-auto p-0 sm:max-h-96">
        {entries.length === 0 ? (
          <p className="p-5 text-sm text-graphite-500">
            Every human and agent action will appear here — nothing happens silently.
          </p>
        ) : (
          <ul className="divide-y divide-graphite-700">
            {entries.map((e) => (
              <li key={e.id} className="flex items-start gap-3 px-4 py-3 sm:px-5">
                <div className="mt-0.5 shrink-0 text-graphite-500">
                  {e.actor === "agent" ? <Bot size={15} className="text-teal-400" /> : <User2 size={15} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="break-all font-mono text-xs text-white">{e.tool}</span>
                    <span className="text-[10px] uppercase tracking-wide text-graphite-500">
                      {e.actor}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-graphite-600">
                      {formatTime(e.timestamp)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-graphite-500">
                    {e.summary}
                  </p>
                </div>
                {e.ok ? (
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal-400" />
                ) : (
                  <XCircle size={14} className="mt-0.5 shrink-0 text-severity-critical" />
                )}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
