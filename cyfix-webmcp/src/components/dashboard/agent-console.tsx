"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Play, Terminal } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { getRegisteredTools, isUsingPolyfill, registerCyfixTools, type ModelContextToolDef } from "@/lib/webmcp";
import { useScanStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import type { Severity } from "@/types";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low", "info"];

function ToolCard({ tool }: { tool: ModelContextToolDef }) {
  const { domain, result } = useScanStore();
  const [expanded, setExpanded] = useState(false);
  const [findingId, setFindingId] = useState("");
  const [format, setFormat] = useState<"json" | "markdown">("markdown");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<unknown>(null);

  const findings = result?.findings ?? [];

  useEffect(() => {
    if (!findingId && result && result.findings.length > 0) setFindingId(result.findings[0].id);
  }, [result, findingId]);

  async function run() {
    setRunning(true);
    setOutput(null);
    try {
      let input: Record<string, unknown> = {};
      if (tool.name === "scan_domain" || tool.name === "prepare_scan") input = { domain };
      if (tool.name === "explain_finding" || tool.name === "generate_fix") input = { findingId };
      if (tool.name === "export_report") input = { format };
      if (tool.name === "list_findings") input = severity ? { severity } : {};

      const res = await tool.execute(input);
      setOutput(res);
    } catch (err) {
      setOutput({ ok: false, message: err instanceof Error ? err.message : "Tool call failed" });
    } finally {
      setRunning(false);
    }
  }

  const needsFinding = tool.name === "explain_finding" || tool.name === "generate_fix";
  const needsFormat = tool.name === "export_report";
  const needsDomain = tool.name === "scan_domain" || tool.name === "prepare_scan";
  const needsSeverity = tool.name === "list_findings";
  const serialized = output === null ? "" : JSON.stringify(output, null, 2);

  return (
    <div className="min-w-0 rounded-lg border border-graphite-700 bg-graphite-900/60">
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full min-h-[52px] items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="font-mono text-sm text-teal-300">{tool.name}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-graphite-500">
            {tool.description}
          </p>
        </div>
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-graphite-500 transition-transform", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <div className="min-w-0 space-y-3 border-t border-graphite-700 px-4 py-3.5">
          {needsDomain && (
            <p className="text-xs leading-relaxed text-graphite-500">
              Uses the domain currently entered above (
              <span className="break-all text-graphite-300">{domain || "none set"}</span>).
              {tool.name === "scan_domain"
                ? " Requires the authorization checkbox to be checked."
                : " Proposes it for approval — it cannot tick the box for you."}
            </p>
          )}

          {needsFinding && (
            <div>
              <label className="mb-1 block text-xs text-graphite-500">Finding</label>
              <select
                value={findingId}
                onChange={(e) => setFindingId(e.target.value)}
                className="w-full rounded-md border border-graphite-600 bg-graphite-900 px-2.5 py-2.5 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                {findings.length === 0 && <option value="">Run a scan first</option>}
                {findings.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {needsSeverity && (
            <div>
              <label className="mb-1 block text-xs text-graphite-500">Severity filter (optional)</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity | "")}
                className="w-full rounded-md border border-graphite-600 bg-graphite-900 px-2.5 py-2.5 text-xs text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="">Any severity</option>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {needsFormat && (
            <div className="flex gap-4 text-xs text-graphite-400">
              {(["markdown", "json"] as const).map((f) => (
                <label key={f} className="flex min-h-[36px] cursor-pointer items-center gap-2 py-1">
                  <input
                    type="radio"
                    checked={format === f}
                    onChange={() => setFormat(f)}
                    className="h-5 w-5 accent-teal-500"
                  />
                  {f}
                </label>
              ))}
            </div>
          )}

          <Button size="sm" onClick={run} disabled={running}>
            <Play size={13} /> {running ? "Running…" : "Run tool"}
          </Button>

          {output !== null && (
            <div className="min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wide text-graphite-500">Result</span>
                <CopyButton value={serialized} label="Copy JSON" />
              </div>
              {/*
                Wraps rather than scrolls: a single long line of JSON used to
                widen the entire page on a phone.
              */}
              <pre className="max-h-64 max-w-full overflow-auto whitespace-pre-wrap break-all rounded-md bg-graphite-950 px-3 py-2.5 text-[11px] leading-relaxed text-graphite-400">
                {serialized}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AgentConsole() {
  const [tools, setTools] = useState<ModelContextToolDef[]>([]);
  const [polyfill, setPolyfill] = useState(false);

  useEffect(() => {
    registerCyfixTools();
    setTools(getRegisteredTools());
    setPolyfill(isUsingPolyfill());
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal size={15} className="shrink-0 text-teal-400" /> Agent Console
        </CardTitle>
        <span className="text-xs text-graphite-500">
          {tools.length} tool(s) via {polyfill ? "polyfill" : "document.modelContext"}
        </span>
      </CardHeader>
      <CardBody className="space-y-3">
        <p className="text-xs leading-relaxed text-graphite-500">
          These are the exact WebMCP tools registered on{" "}
          <code className="break-all text-teal-400">document.modelContext</code>. An AI agent embedded
          in the browser can call them directly — use the controls below to simulate that yourself.
        </p>
        {tools.map((t) => (
          <ToolCard key={t.name} tool={t} />
        ))}
      </CardBody>
    </Card>
  );
}
