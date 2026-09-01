"use client";

import type { ScanResult } from "@/types";

const KEY = "cyfix.scan-history.v1";
const LIMIT = 12;

export interface HistoryEntry {
  id: string;
  domain: string;
  score: number;
  failed: number;
  total: number;
  finishedAt: string;
  result: ScanResult;
}

/**
 * Recent scans, kept in this browser only.
 *
 * Every accessor is wrapped: localStorage throws outright in some contexts
 * (private windows, blocked site data, embedded previews), and a history panel
 * is never worth taking the dashboard down for.
 */
export function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function recordScan(result: ScanResult): HistoryEntry[] {
  if (typeof window === "undefined" || result.isDemo) return readHistory();
  try {
    const entry: HistoryEntry = {
      id: result.id,
      domain: result.domain,
      score: result.score,
      failed: result.findings.filter((f) => !f.passed).length,
      total: result.findings.length,
      finishedAt: result.finishedAt,
      result,
    };
    const next = [entry, ...readHistory().filter((e) => e.id !== entry.id)].slice(0, LIMIT);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return readHistory();
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to clean up if storage was never writable */
  }
}

/** Previous score for the same domain, so a re-scan can show movement. */
export function previousScoreFor(domain: string, excludeId: string): number | null {
  const prior = readHistory().find((e) => e.domain === domain && e.id !== excludeId);
  return prior ? prior.score : null;
}
