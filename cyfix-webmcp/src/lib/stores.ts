"use client";

import { create } from "zustand";
import type { AuditActor, AuditEntry, ScanResult } from "@/types";
import { buildDemoResult } from "@/lib/demo-data";
import { uid } from "@/lib/utils";

interface ScanState {
  domain: string;
  authorized: boolean;
  isScanning: boolean;
  result: ScanResult | null;
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
  error: null,
  setDomain: (domain) => set({ domain, error: null }),
  setAuthorized: (authorized) => set({ authorized }),
  beginScan: () => set({ isScanning: true, error: null }),
  setResult: (result) => set({ result, isScanning: false, error: null }),
  setError: (error) => set({ error, isScanning: false }),
  loadDemo: () => {
    const result = buildDemoResult();
    set({ result, domain: result.domain, authorized: true, isScanning: false, error: null });
    return result;
  },
  reset: () => set({ result: null, error: null, isScanning: false }),
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
