"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { useAuditStore, useScanStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

const QUICK = ["cyfix.vercel.app", "example.com", "github.com"];

const STEPS = [
  "Resolving over HTTPS…",
  "Reading security headers…",
  "Checking cookie flags…",
  "Probing well-known paths…",
  "Scoring…",
];

/**
 * A real scan on the first screen.
 *
 * The landing page used to show a screenshot of a result. This is the product:
 * same API, same store, same authorization gate — so the gate is the first
 * thing a visitor meets rather than a claim they read about. Because it writes
 * to the shared store, the result travels with them into the dashboard.
 */
export function LiveScan() {
  const { domain, authorized, isScanning, result, setDomain, setAuthorized, beginScan, setResult, setError, error, loadDemo } =
    useScanStore();
  const log = useAuditStore((s) => s.log);
  const [step, setStep] = useState(0);

  const target = domain.trim();

  useEffect(() => {
    if (!isScanning) {
      setStep(0);
      return;
    }
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 520);
    return () => clearInterval(t);
  }, [isScanning]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!authorized || !target || isScanning) return;

    beginScan();
    log({ actor: "human", tool: "scan_domain", input: { domain: target }, summary: `Started passive scan of ${target}`, ok: true });

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: target, authorized: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Scan failed");
      setResult(json);
      log({ actor: "human", tool: "scan_domain", input: { domain: target }, summary: `Scan complete: score ${json.score}/100`, ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Scan failed";
      setError(message);
      log({ actor: "human", tool: "scan_domain", input: { domain: target }, summary: message, ok: false });
    }
  }

  const top = result
    ? [...result.findings]
        .sort((a, b) => (a.passed === b.passed ? 0 : a.passed ? 1 : -1))
        .slice(0, 4)
    : [];

  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-teal-500/10 blur-3xl sm:-inset-6" />

      <div className="overflow-hidden rounded-2xl border border-graphite-700 bg-graphite-900/90 shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-graphite-700 px-4 py-3 sm:px-5 sm:py-3.5">
          <span className="flex items-center gap-2 font-display text-xs font-semibold text-white">
            <ShieldCheck size={14} className="text-teal-400" />
            Scan a domain, right here
          </span>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-graphite-600">
            live
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 p-4 sm:p-5">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-graphite-500" />
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="yourdomain.com"
              aria-label="Domain to scan"
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="go"
              className="w-full rounded-lg border border-graphite-600 bg-graphite-950 py-3 pl-9 pr-3 text-base text-white placeholder:text-graphite-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
            />
          </div>

          {!domain && (
            <div className="flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setDomain(q)}
                  className="rounded-full border border-graphite-700 bg-graphite-950 px-3 py-1.5 font-mono text-[11px] text-graphite-400 transition-colors hover:border-teal-500/60 hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* The gate, on screen one. Not a promise in a paragraph. */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-graphite-700 bg-graphite-950/80 p-3">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-graphite-600 bg-graphite-900 accent-teal-500"
            />
            <span className="min-w-0 text-[11px] leading-relaxed text-graphite-400">
              I&apos;m authorized to test this domain. Cyfix runs passive checks only — no exploits,
              no brute force, no port scanning.
            </span>
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={!authorized || !target || isScanning} className="w-full sm:flex-1">
              {isScanning ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Scanning…
                </>
              ) : (
                <>
                  <ShieldCheck size={16} /> Run passive scan
                </>
              )}
            </Button>
            {!result && !isScanning && (
              <Button type="button" variant="secondary" onClick={() => loadDemo()} className="w-full sm:w-auto">
                <Sparkles size={15} /> Instant example
              </Button>
            )}
          </div>

          {isScanning && (
            <div className="space-y-2" aria-live="polite">
              <div className="h-1 w-full overflow-hidden rounded-full bg-graphite-800">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                />
              </div>
              <p className="font-mono text-[11px] text-graphite-500">{STEPS[step]}</p>
            </div>
          )}

          {error && (
            <p className="flex items-start gap-2 rounded-lg border border-severity-critical/40 bg-severity-critical/10 px-3 py-2.5 text-xs leading-relaxed text-severity-critical">
              <AlertCircle size={14} className="mt-px shrink-0" />
              <span className="min-w-0">{error}</span>
            </p>
          )}

          {!authorized && target && !isScanning && (
            <p className="text-[11px] leading-relaxed text-graphite-500">
              Tick the box to authorize. An agent can propose a domain — only you can approve it.
            </p>
          )}
        </form>

        {result && (
          <div className="border-t border-graphite-700">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-xs text-graphite-500">
                  {result.isDemo && (
                    <span className="rounded-full border border-teal-500/40 bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-300">
                      Example
                    </span>
                  )}
                  <span className="break-all text-white">{result.domain}</span>
                </p>
                <p className="mt-1.5 text-xs text-graphite-500">
                  {result.findings.filter((f) => !f.passed).length === 0
                    ? "Every passive check passed."
                    : `${result.findings.filter((f) => !f.passed).length} of ${result.findings.length} checks need attention.`}
                </p>
              </div>
              <ScoreRing score={result.score} size={80} />
            </div>

            <div className="space-y-2 px-4 pb-4 sm:px-5 sm:pb-5">
              {top.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-graphite-700 bg-graphite-850 px-3.5 py-2.5"
                >
                  <span className="min-w-0 text-xs leading-snug text-graphite-300">{f.title}</span>
                  <SeverityBadge severity={f.severity} passed={f.passed} />
                </div>
              ))}
            </div>

            <Link
              href="/app"
              className={cn(
                "flex min-h-[48px] items-center justify-center gap-2 border-t border-graphite-700 bg-graphite-950/60 px-5 text-sm font-medium text-teal-300 transition-colors hover:bg-graphite-850 hover:text-teal-200",
              )}
            >
              Open the full dashboard — explanations, fixes, agent console
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {!result && (
          <div className="border-t border-graphite-700 px-4 py-3 font-mono text-[10px] leading-relaxed text-teal-400/70 sm:px-5 sm:text-[11px]">
            agent → prepare_scan(&quot;acme.com&quot;) · awaiting human approval
          </div>
        )}
      </div>
    </div>
  );
}
