"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileDown, PanelsTopLeft, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DomainForm } from "@/components/dashboard/domain-form";
import { FindingsTable } from "@/components/dashboard/findings-table";
import { FindingDetail } from "@/components/dashboard/finding-detail";
import { AgentConsole } from "@/components/dashboard/agent-console";
import { AuditLog } from "@/components/dashboard/audit-log";
import { ScanHistory } from "@/components/dashboard/scan-history";
import { SectionNav } from "@/components/dashboard/section-nav";
import { ReportModal } from "@/components/dashboard/report-modal";
import { ScoreSummary } from "@/components/dashboard/score-summary";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";
import { ToolStatusPill } from "@/components/dashboard/tool-status-pill";
import { useScanStore } from "@/lib/stores";
import { registerCyfixTools } from "@/lib/webmcp";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "cyfix.sidebar.collapsed";

function DashboardContent() {
  const searchParams = useSearchParams();
  const { result, loadDemo } = useScanStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    registerCyfixTools();
  }, []);

  // Read after mount rather than during render: the server has no localStorage,
  // and initialising from it would hydrate against a different DOM.
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* private mode, blocked storage — the default is fine */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    // An agent that called prepare_scan from another page hands the proposed
    // domain over via ?domain=, so the human lands on a prefilled — but still
    // unauthorized — form and only has to approve.
    const proposed = searchParams.get("domain");
    if (proposed) {
      useScanStore.getState().setDomain(proposed);
    }
    if (searchParams.get("demo") === "1" && !useScanStore.getState().result) {
      loadDemo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (result && (!selectedId || !result.findings.some((f) => f.id === selectedId))) {
      setSelectedId(result.findings.find((f) => !f.passed)?.id ?? result.findings[0]?.id ?? null);
    }
  }, [result, selectedId]);

  const selectedFinding = result?.findings.find((f) => f.id === selectedId) ?? null;

  // On a phone the detail card sits below a long list, so a tap that only
  // changed state would look like nothing happened.
  function selectFinding(id: string) {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => {
        document.getElementById("finding-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  return (
    <div className="min-h-screen bg-graphite-950">
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* The rail is fixed, so the content pane carries the matching offset.
          Below lg the rail is a drawer and the pane keeps the full width. */}
      <div className={cn("transition-[padding] duration-200 ease-out", collapsed ? "lg:pl-[72px]" : "lg:pl-[248px]")}>
        <header className="sticky top-0 z-30 border-b border-graphite-800/80 bg-graphite-950/90 backdrop-blur-md">
          <div className="flex h-[57px] items-center justify-between gap-3 px-4 sm:h-[65px] sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
                className="-m-1.5 shrink-0 rounded-md p-1.5 text-graphite-400 hover:text-white lg:hidden"
              >
                <PanelsTopLeft size={20} />
              </button>
              {/* On mobile the rail is hidden, so the mark lives here — and
                  still goes home, which is where people reach for it. */}
              <Link href="/" aria-label="Cyfix — back to home page" className="shrink-0 lg:hidden">
                <Logo size={24} showWordmark={false} idSuffix="-topbar" />
              </Link>
              <div className="min-w-0">
                <h1 className="truncate font-display text-sm font-semibold text-white sm:text-base">
                  Security Workspace
                </h1>
                <p className="hidden truncate text-xs text-graphite-500 sm:block">
                  {result ? `${result.domain} · score ${result.score}/100` : "Passive scan · human-authorized"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <ToolStatusPill />
              {!result && (
                <Button variant="secondary" size="sm" onClick={() => loadDemo()}>
                  <Sparkles size={14} />
                  <span className="hidden sm:inline">Load Demo Data</span>
                  <span className="sm:hidden">Demo</span>
                </Button>
              )}
              <Button size="sm" disabled={!result} onClick={() => setReportOpen(true)}>
                <FileDown size={14} />
                <span className="hidden sm:inline">Export Report</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionNav />

          <div className="space-y-5 py-6 sm:space-y-6 sm:py-8">
            {result && (
              <div id="overview" className="scroll-mt-28">
                <ScoreSummary result={result} selectedId={selectedId} onSelect={selectFinding} />
              </div>
            )}

            {/*
              minmax(0, 1fr) rather than 1fr: a grid track defaults to min-width
              auto, so one wide child (a code block, a long header value) would
              otherwise stretch the track and scroll the whole page sideways.

              Mobile order deliberately differs from desktop: scan form, then
              results, and only then the agent tooling and log — so a phone user
              reaches their findings without scrolling past the console.
            */}
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start xl:grid-cols-[380px_minmax(0,1fr)]">
              <div className="order-1 min-w-0 space-y-5 sm:space-y-6 lg:order-none lg:col-start-1 lg:row-start-1">
                <div id="scan" className="scroll-mt-28">
                  <DomainForm />
                </div>
                <div id="scan-history" className="scroll-mt-28">
                  <ScanHistory />
                </div>
              </div>

              <div className="order-2 min-w-0 space-y-5 sm:space-y-6 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
                {result ? (
                  <>
                    <div id="findings" className="scroll-mt-28">
                      <FindingsTable findings={result.findings} selectedId={selectedId} onSelect={selectFinding} />
                    </div>
                    <FindingDetail finding={selectedFinding} />
                  </>
                ) : (
                  <DashboardEmptyState />
                )}
              </div>

              <div className="order-3 min-w-0 space-y-5 sm:space-y-6 lg:order-none lg:col-start-1 lg:row-start-2">
                <div id="agent-console" className="scroll-mt-28">
                  <AgentConsole />
                </div>
                <div id="audit-log" className="scroll-mt-28">
                  <AuditLog />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
