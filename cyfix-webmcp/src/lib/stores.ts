"use client";

import { create } from "zustand";
import type { AuditActor, AuditEntry, ScanResult } from "@/types";
import { buildDemoResult } from "@/lib/demo-data";
import { recordScan } from "@/lib/history";
import { uid } from "@/lib/utils";

interface ScanState {
  domain: string;
  authorized: boolean;
  isScanning: boolean;
  result: ScanResult | null;
  /** The scan this one replaced, when both cover the same domain. Lets
   *  verify_fix say what actually changed rather than just restating state. */
  previousResult: ScanResult | null;
  error: string | null;
  setDomain: (domain: string) => void;
  setAuthorized: (authorized: boolean) => void;
  beginScan: () => void;
  setResult: (result: ScanResult) => void;
  setError: (error: string) => void;
  loadDemo: () => ScanResult;
  reset: () => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  domain: "",
  authorized: false,
  isScanning: false,
  result: null,
  previousResult: null,
  error: null,
  setDomain: (domain) =>
    set((state) => ({
      domain,
      error: null,
      // Authorization is granted per domain. Retargeting always revokes it, so
      // a human's approval for one domain can never be silently reused for
      // another — including when an agent proposes a different target.
      authorized: state.domain === domain ? state.authorized : false,
    })),
  setAuthorized: (authorized) => set({ authorized }),
  beginScan: () => set({ isScanning: true, error: null }),
  setResult: (result) => {
    // Persisted before the state update so the history panel and the dashboard
    // never disagree about what the latest scan was.
    recordScan(result);
    set((state) => ({
      result,
      previousResult:
        state.result && state.result.domain === result.domain && !state.result.isDemo
          ? state.result
          : null,
      isScanning: false,
      error: null,
    }));
  },
  setError: (error) => set({ error, isScanning: false }),
  loadDemo: () => {
    const result = buildDemoResult();
    // Deliberately does NOT prefill the form with the demo host. It is a
    // fictional domain, so pre-authorizing it would leave the primary button
    // armed to fail: one tap on "Run Passive Scan" and the first thing a new
    // visitor sees is a connection error. The demo result is shown; the form
    // stays empty and ready for a real target.
    set({ result, previousResult: null, domain: "", authorized: false, isScanning: false, error: null });
    return result;
  },
  reset: () => set({ result: null, previousResult: null, error: null, isScanning: false }),
}));

interface AuditState {
  entries: AuditEntry[];
  log: (entry: {
    actor: AuditActor;
    tool: string;
    input: Record<string, unknown>;
    summary: string;
    ok: boolean;
  }) => AuditEntry;
  clear: () => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  entries: [],
  log: (entry) => {
    const full: AuditEntry = { id: uid("audit"), timestamp: new Date().toISOString(), ...entry };
    set((state) => ({ entries: [full, ...state.entries].slice(0, 200) }));
    return full;
  },
  clear: () => set({ entries: [] }),
}));
