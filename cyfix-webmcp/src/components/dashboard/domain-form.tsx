"use client";

import { FormEvent, useState } from "react";
import { Loader2, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useAuditStore, useScanStore } from "@/lib/stores";

export function DomainForm() {
  const { domain, authorized, isScanning, setDomain, setAuthorized, beginScan, setResult, setError, error } =
    useScanStore();
  const log = useAuditStore((s) => s.log);
  const [localDomain, setLocalDomain] = useState(domain);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!authorized || !localDomain.trim() || isScanning) return;

    setDomain(localDomain.trim());
    beginScan();
    log({
      actor: "human",
      tool: "scan_domain",
      input: { domain: localDomain.trim() },
      summary: `Started passive scan of ${localDomain.trim()}`,
      ok: true,
    });

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: localDomain.trim(), authorized: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Scan failed");
      setResult(json);
      log({
        actor: "human",
        tool: "scan_domain",
        input: { domain: localDomain.trim() },
        summary: `Scan complete: score ${json.score}/100`,
        ok: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Scan failed";
      setError(message);
      log({ actor: "human", tool: "scan_domain", input: { domain: localDomain.trim() }, summary: message, ok: false });
    }
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-graphite-500">
              Domain to scan
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-500" />
              <input
                value={localDomain}
                onChange={(e) => setLocalDomain(e.target.value)}
                placeholder="example.com"
                className="w-full rounded-lg border border-graphite-600 bg-graphite-900 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-graphite-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-graphite-700 bg-graphite-900/60 p-3">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-graphite-600 bg-graphite-900 accent-teal-500"
            />
            <span className="text-xs leading-relaxed text-graphite-400">
              I confirm I am authorized to test this domain, and understand Cyfix only performs
              passive, non-destructive checks (no exploits, brute force, or port scanning).
            </span>
          </label>

          <Button type="submit" disabled={!authorized || !localDomain.trim() || isScanning} className="w-full">
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

          {error && <p className="text-xs text-severity-critical">{error}</p>}
        </form>
      </CardBody>
    </Card>
  );
}
