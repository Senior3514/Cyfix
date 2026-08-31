"use client";

import { Bot, Wrench } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/badge";
import { explainFinding } from "@/lib/findings";
import type { Finding } from "@/types";

export function FindingDetail({ finding }: { finding: Finding | null }) {
  if (!finding) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-graphite-500">
            Select a finding from the table to see its AI explanation and remediation.
          </p>
        </CardBody>
      </Card>
    );
  }

  const { explanation, snippets } = explainFinding(finding);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{finding.title}</CardTitle>
          <p className="mt-1 text-xs text-graphite-500">{finding.category}</p>
        </div>
        <SeverityBadge severity={finding.severity} passed={finding.passed} />
      </CardHeader>
      <CardBody className="space-y-6">
        <div>
          <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-400">
            <Bot size={13} /> AI Explanation
          </h4>
          <p className="text-sm leading-relaxed text-graphite-300">{explanation}</p>
          <p className="mt-3 text-xs text-graphite-500">
            <span className="font-medium text-graphite-400">Impact: </span>
            {finding.impact}
          </p>
          {finding.evidence && (
            <p className="mt-2 rounded-md bg-graphite-900 px-3 py-2 font-mono text-[11px] text-graphite-500">
              {finding.evidence}
            </p>
          )}
        </div>

        {!finding.passed && snippets.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-400">
              <Wrench size={13} /> Suggested Remediation
            </h4>
            <div className="space-y-3">
              {snippets.map((s) => (
                <div key={s.label} className="overflow-hidden rounded-lg border border-graphite-700">
                  <div className="border-b border-graphite-700 bg-graphite-900 px-3 py-1.5 text-[11px] font-medium text-graphite-500">
                    {s.label}
                  </div>
                  <pre className="overflow-x-auto bg-graphite-950 px-3 py-2.5 text-[12px] leading-relaxed text-teal-300">
                    <code>{s.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {finding.passed && (
          <p className="text-sm text-teal-400">✅ This check already passes — no action needed.</p>
        )}
      </CardBody>
    </Card>
  );
}
