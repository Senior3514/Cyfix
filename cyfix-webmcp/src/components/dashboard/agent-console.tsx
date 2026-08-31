"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Play, Terminal } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRegisteredTools, isUsingPolyfill, registerCyfixTools, type ModelContextToolDef } from "@/lib/webmcp";
import { useScanStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

function ToolCard({ tool }: { tool: ModelContextToolDef }) {
  const { domain, result } = useScanStore();
  const [expanded, setExpanded] = useState(false);
  const [findingId, setFindingId] = useState("");
  const [format, setFormat] = useState<"json" | "markdown">("markdown");
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
      if (tool.name === "scan_domain") input = { domain };
      if (tool.name === "explain_finding" || tool.name === "generate_fix") input = { findingId };
      if (tool.name === "export_report") input = { format };

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

  return (
    <div className="rounded-lg border border-graphite-700 bg-graphite-900/60">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="font-mono text-sm text-teal-300">{tool.name}</p>
          <p className="mt-0.5 truncate text-xs text-graphite-500">{tool.description}</p>
        </div>
        <ChevronDown size={16} className={cn("shrink-0 text-graphite-500 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-graphite-700 px-4 py-3.5">
          {tool.name === "scan_domain" && (
            <p className="text-xs text-graphite-500">
              Uses the domain currently entered above (<span className="text-graphite-300">{domain || "none set"}</span>
              ). Requires the authorization checkbox to be checked.
            </p>
          )}

          {needsFinding && (
            <div>
              <label className="mb-1 block text-xs text-graphite-500">Finding</label>
              <select
                value={findingId}
                onChange={(e) => setFindingId(e.target.value)}
                className="w-full rounded-md border border-graphite-600 bg-graphite-900 px-2.5 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
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

          {needsFormat && (
            <div className="flex gap-4 text-xs text-graphite-400">
              {(["markdown", "json"] as const).map((f) => (
                <label key={f} className="flex items-center gap-1.5">
                  <input type="radio" checked={format === f} onChange={() => setFormat(f)} className="accent-teal-500" />
                  {f}
                </label>
              ))}
            </div>
          )}

          <Button size="sm" onClick={run} disabled={running}>
            <Play size={13} /> {running ? "Running…" : "Run tool"}
          </Button>

          {output !== null && (
            <pre className="max-h-56 overflow-auto rounded-md bg-graphite-950 px-3 py-2.5 text-[11px] leading-relaxed text-graphite-400">
              {JSON.stringify(output, null, 2)}
            </pre>
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
          <Terminal size={15} className="text-teal-400" /> Agent Console
        </CardTitle>
        <span className="text-xs text-graphite-500">
          {tools.length} tool(s) via {polyfill ? "polyfill" : "document.modelContext"}
        </span>
      </CardHeader>
      <CardBody className="space-y-3">
        <p className="text-xs text-graphite-500">
          These are the exact WebMCP tools registered on <code className="text-teal-400">document.modelContext</code>.
          An AI agent embedded in the browser can call them directly — use the controls below to simulate that
          yourself.
        </p>
        {tools.map((t) => (
          <ToolCard key={t.name} tool={t} />
        ))}
      </CardBody>
    </Card>
  );
}
