"use client";

import { useAuditStore, useScanStore } from "@/lib/stores";
import { explainFinding, generateFix } from "@/lib/findings";
import { buildJsonReport, buildMarkdownReport, downloadFile } from "@/lib/report";
import type { ToolResult } from "@/types";

export interface ModelContextToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
}

export interface ModelContext {
  registerTool: (tool: ModelContextToolDef) => void;
  unregisterTool?: (name: string) => void;
  tools?: ModelContextToolDef[];
}

declare global {
  interface Document {
    /**
     * WebMCP's proposed extension point: a page-authored registry of tools
     * an embedding AI agent can discover and call directly, without a
     * separate server-side MCP connection. See:
     * https://github.com/webmachinelearning/webmcp
     */
    modelContext?: ModelContext;
  }
}

let usingPolyfill = false;
const polyfillRegistry: ModelContextToolDef[] = [];

/**
 * Returns the browser's native document.modelContext if present, otherwise
 * installs a minimal same-shape polyfill so Cyfix's tools are always
 * registered and testable via the on-page Agent Console — even before
 * browsers ship native WebMCP support.
 */
function ensureModelContext(): ModelContext {
  if (document.modelContext) return document.modelContext;

  usingPolyfill = true;
  const ctx: ModelContext = {
    registerTool(tool) {
      const idx = polyfillRegistry.findIndex((t) => t.name === tool.name);
      if (idx >= 0) polyfillRegistry[idx] = tool;
      else polyfillRegistry.push(tool);
    },
    unregisterTool(name) {
      const idx = polyfillRegistry.findIndex((t) => t.name === name);
      if (idx >= 0) polyfillRegistry.splice(idx, 1);
    },
    tools: polyfillRegistry,
  };
  document.modelContext = ctx;
  return ctx;
}

export function isUsingPolyfill(): boolean {
  return usingPolyfill;
}

export function getRegisteredTools(): ModelContextToolDef[] {
  if (typeof document === "undefined") return [];
  return document.modelContext?.tools ? [...document.modelContext.tools] : [...polyfillRegistry];
}

let registered = false;

/**
 * Registers the four Cyfix WebMCP tools. Idempotent — safe to call from a
 * component effect that may re-run in dev/StrictMode.
 */
export function registerCyfixTools() {
  if (typeof document === "undefined" || registered) return;
  registered = true;

  const ctx = ensureModelContext();
  const audit = () => useAuditStore.getState();
  const scan = () => useScanStore.getState();

  ctx.registerTool({
    name: "scan_domain",
    description:
      "Run a passive, authorized-only security scan of a domain (HTTPS, security headers, cookie flags, basic public exposure checks). Requires that a human has already checked the on-page authorization box for this domain — never scans without it.",
    inputSchema: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Bare domain to scan, e.g. example.com" },
      },
      required: ["domain"],
    },
    execute: async (input) => {
      const domain = String(input.domain ?? "").trim();
      const state = scan();

      if (!state.authorized || state.domain !== domain) {
        const result: ToolResult = {
          ok: false,
          message:
            "Human authorization required. Ask the user to enter this exact domain and check 'I confirm I am authorized to test this domain' in the Cyfix dashboard before I can scan it.",
        };
        audit().log({ actor: "agent", tool: "scan_domain", input, summary: result.message, ok: false });
        return result;
      }

      audit().log({
        actor: "agent",
        tool: "scan_domain",
        input,
        summary: `Started passive scan of ${domain}`,
        ok: true,
      });
      state.beginScan();

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, authorized: true }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Scan failed");

        state.setResult(json);
        const result: ToolResult = {
          ok: true,
          message: `Scan complete for ${domain}: score ${json.score}/100, ${json.findings.filter((f: { passed: boolean }) => !f.passed).length} finding(s) need attention.`,
          data: json,
        };
        audit().log({ actor: "agent", tool: "scan_domain", input, summary: result.message, ok: true });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Scan failed";
        state.setError(message);
        audit().log({ actor: "agent", tool: "scan_domain", input, summary: message, ok: false });
        return { ok: false, message } satisfies ToolResult;
      }
    },
  });

  ctx.registerTool({
    name: "explain_finding",
    description:
      "Explain, in plain language, why a specific finding from the current scan matters and what its real-world impact is.",
    inputSchema: {
      type: "object",
      properties: {
        findingId: { type: "string", description: "The finding id from the current scan result" },
      },
      required: ["findingId"],
    },
    execute: (input) => {
      const findingId = String(input.findingId ?? "");
      const finding = scan().result?.findings.find((f) => f.id === findingId);
      if (!finding) {
        const result: ToolResult = { ok: false, message: `No finding with id "${findingId}" in the current scan.` };
        audit().log({ actor: "agent", tool: "explain_finding", input, summary: result.message, ok: false });
        return result;
      }
      const explanation = explainFinding(finding);
      const result: ToolResult = { ok: true, message: explanation.explanation, data: explanation };
      audit().log({
        actor: "agent",
        tool: "explain_finding",
        input,
        summary: `Explained "${finding.title}"`,
        ok: true,
      });
      return result;
    },
  });

  ctx.registerTool({
    name: "generate_fix",
    description:
      "Generate a concrete, copy-pasteable remediation snippet (config or header) for a specific finding from the current scan.",
    inputSchema: {
      type: "object",
      properties: {
        findingId: { type: "string", description: "The finding id from the current scan result" },
      },
      required: ["findingId"],
    },
    execute: (input) => {
      const findingId = String(input.findingId ?? "");
      const finding = scan().result?.findings.find((f) => f.id === findingId);
      if (!finding) {
        const result: ToolResult = { ok: false, message: `No finding with id "${findingId}" in the current scan.` };
        audit().log({ actor: "agent", tool: "generate_fix", input, summary: result.message, ok: false });
        return result;
      }
      const snippets = generateFix(finding);
      const result: ToolResult = {
        ok: true,
        message: `Generated ${snippets.length} remediation snippet(s) for "${finding.title}".`,
        data: snippets,
      };
      audit().log({
        actor: "agent",
        tool: "generate_fix",
        input,
        summary: result.message,
        ok: true,
      });
      return result;
    },
  });

  ctx.registerTool({
    name: "export_report",
    description:
      "Export the current scan as a downloadable report. Format is 'json' or 'markdown'. Triggers a file download for the human and returns the report content for the agent.",
    inputSchema: {
      type: "object",
      properties: {
        format: { type: "string", enum: ["json", "markdown"], description: "Report format" },
      },
      required: ["format"],
    },
    execute: (input) => {
      const format = input.format === "json" ? "json" : "markdown";
      const result_ = scan().result;
      if (!result_) {
        const result: ToolResult = { ok: false, message: "No scan result to export yet. Run scan_domain first." };
        audit().log({ actor: "agent", tool: "export_report", input, summary: result.message, ok: false });
        return result;
      }
      const content = format === "json" ? buildJsonReport(result_) : buildMarkdownReport(result_);
      const filename = `cyfix-report-${result_.domain}.${format === "json" ? "json" : "md"}`;
      downloadFile(filename, content, format === "json" ? "application/json" : "text/markdown");

      const result: ToolResult = { ok: true, message: `Exported ${filename}`, data: content };
      audit().log({ actor: "agent", tool: "export_report", input, summary: result.message, ok: true });
      return result;
    },
  });
}
