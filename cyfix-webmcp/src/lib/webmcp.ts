"use client";

import { useAuditStore, useScanStore } from "@/lib/stores";
import { explainFinding, generateFix } from "@/lib/findings";
import { buildJsonReport, buildMarkdownReport, downloadFile } from "@/lib/report";
import type { Finding, ToolResult } from "@/types";

export interface ModelContextToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
}

export interface ModelContext {
  /** Native implementations return a promise; the polyfill returns void. */
  registerTool: (tool: ModelContextToolDef) => void | Promise<unknown>;
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

/**
 * A tool result has two audiences. A native WebMCP agent consumes MCP-style
 * content blocks (`content: [{ type: "text", ... }]`, `isError`); Cyfix's own
 * Agent Console renders the structured payload. Return both shapes rather
 * than forcing either side to guess at the other's format.
 */
function toolResponse(result: ToolResult) {
  return {
    content: [{ type: "text" as const, text: result.message }],
    structuredContent: result.data,
    isError: !result.ok,
    ok: result.ok,
    message: result.message,
    data: result.data,
  };
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

  // Wraps each tool so its ToolResult is delivered in the MCP-compatible
  // envelope, and so a rejected native registerTool surfaces instead of
  // becoming an unhandled promise.
  const registerTool = (tool: {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    execute: (input: Record<string, unknown>) => Promise<ToolResult> | ToolResult;
  }) => {
    void Promise.resolve(
      ctx.registerTool({
        ...tool,
        execute: async (input) => toolResponse(await tool.execute(input)),
      }),
    ).catch((err) => {
      console.error(`[Cyfix] Could not register WebMCP tool "${tool.name}"`, err);
    });
  };

  registerTool({
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
            `Human authorization required for "${domain}". Call prepare_scan with this domain to put it in front of the human, then ask them to tick "I confirm I am authorized to test this domain" in the Cyfix dashboard. Cyfix will not scan a domain the human has not explicitly approved.`,
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

  registerTool({
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

  registerTool({
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

  registerTool({
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

  registerTool({
    name: "prepare_scan",
    description:
      "Propose a domain for the human to authorize. Writes the domain into the Cyfix dashboard (navigating there if the human is on another page) and leaves the authorization checkbox deliberately unticked. Call this first whenever scan_domain reports that authorization is missing — Cyfix never lets an agent authorize a scan on the human's behalf.",
    inputSchema: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Bare domain to propose, e.g. example.com" },
      },
      required: ["domain"],
    },
    execute: (input) => {
      const domain = String(input.domain ?? "").trim();
      if (!domain) {
        const result: ToolResult = { ok: false, message: "A domain is required." };
        audit().log({ actor: "agent", tool: "prepare_scan", input, summary: result.message, ok: false });
        return result;
      }

      // Writing the domain also revokes any authorization held for a previous
      // target (see useScanStore.setDomain), so proposing a new domain can
      // never inherit approval the human gave for a different one.
      scan().setDomain(domain);

      const onDashboard = window.location.pathname === "/app";
      if (!onDashboard) {
        window.location.href = `/app?domain=${encodeURIComponent(domain)}`;
      }

      const message = `Proposed "${domain}" in the Cyfix dashboard${onDashboard ? "" : " and opened it for the human"}. The human must now tick "I confirm I am authorized to test this domain" before scan_domain will run.`;
      audit().log({ actor: "agent", tool: "prepare_scan", input, summary: message, ok: true });
      return { ok: true, message, data: { domain, authorized: false } } satisfies ToolResult;
    },
  });

  registerTool({
    name: "list_findings",
    description:
      "List findings from the current scan as compact records (id, title, severity, category, passed), optionally filtered by severity or narrowed to only the checks that failed. Use this to decide which finding to explain or fix next instead of re-running a scan.",
    inputSchema: {
      type: "object",
      properties: {
        severity: {
          type: "string",
          enum: ["critical", "high", "medium", "low", "info"],
          description: "Only return findings at this severity",
        },
        onlyFailed: {
          type: "boolean",
          description: "Return only checks that did not pass. Defaults to true.",
        },
      },
    },
    execute: (input) => {
      const result_ = scan().result;
      if (!result_) {
        const result: ToolResult = {
          ok: false,
          message: "No scan result yet. Run scan_domain first (after a human has authorized the domain).",
        };
        audit().log({ actor: "agent", tool: "list_findings", input, summary: result.message, ok: false });
        return result;
      }

      const onlyFailed = input.onlyFailed === undefined ? true : input.onlyFailed === true;
      const severity = typeof input.severity === "string" ? input.severity : undefined;

      const matches = result_.findings
        .filter((f) => (onlyFailed ? !f.passed : true))
        .filter((f) => (severity ? f.severity === severity : true))
        .map((f) => ({
          id: f.id,
          title: f.title,
          severity: f.severity,
          category: f.category,
          passed: f.passed,
        }));

      const message = `${matches.length} finding(s) for ${result_.domain}${severity ? ` at severity ${severity}` : ""}${onlyFailed ? " that need attention" : ""}.`;
      audit().log({ actor: "agent", tool: "list_findings", input, summary: message, ok: true });
      return { ok: true, message, data: matches } satisfies ToolResult;
    },
  });

  registerTool({
    name: "verify_fix",
    description:
      "Re-run the passive scan and report whether a specific finding is now resolved. Use this after a human has applied a remediation, to confirm the fix actually landed on the live site instead of assuming it did. Requires the same human authorization as any other scan.",
    inputSchema: {
      type: "object",
      properties: {
        findingId: {
          type: "string",
          description:
            "The finding to verify. Omit to re-scan and report every check that changed.",
        },
      },
    },
    execute: async (input) => {
      const state = scan();
      const before = state.result;

      if (!before) {
        const result: ToolResult = {
          ok: false,
          message: "Nothing to verify yet — run scan_domain first.",
        };
        audit().log({ actor: "agent", tool: "verify_fix", input, summary: result.message, ok: false });
        return result;
      }

      const domain = before.domain;

      // Verification is a fresh scan of a live host, so it goes through exactly
      // the same human gate as the first one. A fix is not a licence to re-scan.
      if (!state.authorized || state.domain !== domain) {
        const result: ToolResult = {
          ok: false,
          message: `Verifying re-scans ${domain}, which needs the same human authorization as any scan. Call prepare_scan with "${domain}" and ask the human to approve it.`,
        };
        audit().log({ actor: "agent", tool: "verify_fix", input, summary: result.message, ok: false });
        return result;
      }

      state.beginScan();
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, authorized: true }),
        });
        const after = await res.json();
        if (!res.ok) throw new Error(after.error ?? "Re-scan failed");
        state.setResult(after);

        const changed = (after.findings as Finding[])
          .map((now) => {
            const then = before.findings.find((f) => f.id === now.id);
            if (!then || then.passed === now.passed) return null;
            return { id: now.id, title: now.title, severity: now.severity, fixed: now.passed };
          })
          .filter(Boolean) as {
          id: string;
          title: string;
          severity: string;
          fixed: boolean;
        }[];

        const findingId = typeof input.findingId === "string" ? input.findingId : undefined;

        if (findingId) {
          const then = before.findings.find((f) => f.id === findingId);
          const now = (after.findings as Finding[]).find((f) => f.id === findingId);
          if (!then || !now) {
            const result: ToolResult = {
              ok: false,
              message: `No finding with id "${findingId}" in this scan.`,
            };
            audit().log({ actor: "agent", tool: "verify_fix", input, summary: result.message, ok: false });
            return result;
          }

          const message = now.passed
            ? then.passed
              ? `"${now.title}" still passes. Nothing regressed.`
              : `Confirmed: "${now.title}" is now fixed on ${domain}. Score ${before.score} → ${after.score}.`
            : `Not fixed yet — "${now.title}" still fails on ${domain}. Evidence: ${now.evidence ?? "none"}.`;

          const result: ToolResult = {
            ok: true,
            message,
            data: {
              findingId,
              wasPassing: then.passed,
              nowPassing: now.passed,
              fixed: !then.passed && now.passed,
              evidence: now.evidence,
              scoreBefore: before.score,
              scoreAfter: after.score,
            },
          };
          audit().log({ actor: "agent", tool: "verify_fix", input, summary: message, ok: true });
          return result;
        }

        const fixedCount = changed.filter((c) => c.fixed).length;
        const brokeCount = changed.length - fixedCount;
        const message =
          changed.length === 0
            ? `Re-scanned ${domain}: nothing changed. Score still ${after.score}/100.`
            : `Re-scanned ${domain}: ${fixedCount} check(s) now pass${brokeCount ? `, ${brokeCount} regressed` : ""}. Score ${before.score} → ${after.score}.`;

        const result: ToolResult = {
          ok: true,
          message,
          data: { domain, scoreBefore: before.score, scoreAfter: after.score, changed },
        };
        audit().log({ actor: "agent", tool: "verify_fix", input, summary: message, ok: true });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Re-scan failed";
        state.setError(message);
        audit().log({ actor: "agent", tool: "verify_fix", input, summary: message, ok: false });
        return { ok: false, message } satisfies ToolResult;
      }
    },
  });
}
