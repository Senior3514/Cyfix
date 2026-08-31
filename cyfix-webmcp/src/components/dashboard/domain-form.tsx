"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Loader2, Search, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useAuditStore, useScanStore } from "@/lib/stores";

/** Shown one after another while a scan is in flight, so the wait reads as progress. */
const SCAN_STEPS = [
  "Resolving host over HTTPS…",
  "Checking HTTPS enforcement…",
  "Reading security headers…",
  "Inspecting cookie flags…",
  "Checking well-known paths…",
  "Scoring findings…",
];

/** One tap to try the app without typing a domain on a phone keyboard. */
const QUICK_TARGETS = ["example.com", "github.com", "vercel.com"];

export function DomainForm() {
  const { domain, authorized, isScanning, setDomain, setAuthorized, beginScan, setResult, setError, error } =
    useScanStore();
  const log = useAuditStore((s) => s.log);
  // The domain lives in the shared store rather than local state: an agent's
  // `prepare_scan` writes to the same field the human sees and edits, so both
  // actors are always looking at exactly one agreed-upon target.
  const target = domain.trim();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setStep(0);
      return;
    }
    const t = setInterval(() => setStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1)), 550);
    return () => clearInterval(t);
  }, [isScanning]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!authorized || !target || isScanning) return;

    beginScan();
    log({
      actor: "human",
      tool: "scan_domain",
      input: { domain: target },
      summary: `Started passive scan of ${target}`,
      ok: true,
    });

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: target, authorized: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Scan failed");
      setResult(json);
      log({
        actor: "human",
        tool: "scan_domain",
        input: { domain: target },
        summary: `Scan complete: score ${json.score}/100`,
        ok: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Scan failed";
      setError(message);
      log({ actor: "human", tool: "scan_domain", input: { domain: target }, summary: message, ok: false });
    }
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cyfix-domain" className="mb-1.5 block text-xs font-medium text-graphite-500">
              Domain to scan
            </label>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-graphite-500"
              />
              <input
                id="cyfix-domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                // A phone keyboard would otherwise capitalise, autocorrect and
                // spell-check what is a hostname, not prose.
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="go"
                aria-describedby="cyfix-authorization"
                className="w-full rounded-lg border border-graphite-600 bg-graphite-900 py-3 pl-9 pr-10 text-base text-white placeholder:text-graphite-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:py-2.5 sm:text-sm"
              />
              {domain && !isScanning && (
                <button
                  type="button"
                  onClick={() => setDomain("")}
                  aria-label="Clear domain"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-graphite-500 hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {!domain && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {QUICK_TARGETS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDomain(t)}
                    className="rounded-full border border-graphite-700 bg-graphite-900/80 px-3 py-1.5 text-[11px] text-graphite-400 transition-colors hover:border-teal-500/60 hover:text-white"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label
            id="cyfix-authorization"
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-graphite-700 bg-graphite-900/60 p-3.5"
          >
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-graphite-600 bg-graphite-900 accent-teal-500"
            />
            <span className="min-w-0 text-xs leading-relaxed text-graphite-400">
              I confirm I am authorized to test this domain, and understand Cyfix only performs
              passive, non-destructive checks (no exploits, brute force, or port scanning).
            </span>
          </label>

          <Button type="submit" disabled={!authorized || !target || isScanning} className="w-full">
            {isScanning ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Scanning…
              </>
            ) : (
              <>
                <ShieldCheck size={16} /> Run Passive Scan
              </>
            )}
          </Button>

          {isScanning && (
            <div className="space-y-2" aria-live="polite">
              <div className="h-1 w-full overflow-hidden rounded-full bg-graphite-800">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${((step + 1) / SCAN_STEPS.length) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-graphite-500">{SCAN_STEPS[step]}</p>
            </div>
          )}

          {!isScanning && !authorized && target && (
            <p className="text-[11px] leading-relaxed text-graphite-500">
              Tick the box above to authorize this scan. An agent can propose a domain, but only you
              can approve it.
            </p>
          )}

          {error && (
            <p className="flex items-start gap-2 rounded-lg border border-severity-critical/40 bg-severity-critical/10 px-3 py-2.5 text-xs leading-relaxed text-severity-critical">
              <AlertCircle size={14} className="mt-px shrink-0" />
              <span className="min-w-0">{error}</span>
            </p>
          )}
        </form>
      </CardBody>
    </Card>
  );
}
