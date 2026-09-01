"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, FileDown, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { DomainForm } from "@/components/dashboard/domain-form";
import { FindingsTable } from "@/components/dashboard/findings-table";
import { FindingDetail } from "@/components/dashboard/finding-detail";
import { AgentConsole } from "@/components/dashboard/agent-console";
import { AuditLog } from "@/components/dashboard/audit-log";
import { ScanHistory } from "@/components/dashboard/scan-history";
import { ReportModal } from "@/components/dashboard/report-modal";
import { ScoreSummary } from "@/components/dashboard/score-summary";
import { useScanStore } from "@/lib/stores";
import { registerCyfixTools } from "@/lib/webmcp";

function DashboardContent() {
  const searchParams = useSearchParams();
  const { result, loadDemo } = useScanStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    registerCyfixTools();
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
      <header className="sticky top-0 z-30 border-b border-graphite-800/80 bg-graphite-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
            <Link
              href="/"
              aria-label="Back to home"
              className="-m-1.5 shrink-0 rounded-md p-1.5 text-graphite-500 hover:text-white"
            >
              <ArrowLeft size={18} />
            </Link>
            <Logo size={26} />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8">
        {result && <ScoreSummary result={result} />}

        {/*
          minmax(0, 1fr) rather than 1fr: a grid track defaults to min-width
          auto, so one wide child (a code block, a long header value) would
          otherwise stretch the track and scroll the whole page sideways.

          Mobile order deliberately differs from desktop: scan form, then
          results, and only then the agent tooling and log — so a phone user
          reaches their findings without scrolling past the console.
        */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
          <div className="order-1 min-w-0 space-y-5 sm:space-y-6 lg:order-none lg:col-start-1 lg:row-start-1">
            <DomainForm />
            <ScanHistory />
          </div>

          <div className="order-2 min-w-0 space-y-5 sm:space-y-6 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
            {result ? (
              <>
                <FindingsTable findings={result.findings} selectedId={selectedId} onSelect={selectFinding} />
                <FindingDetail finding={selectedFinding} />
              </>
            ) : (
              <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-dashed border-graphite-700 px-6 text-center text-sm text-graphite-500">
                Run a scan or load demo data to see findings here.
              </div>
            )}
          </div>

          <div className="order-3 min-w-0 space-y-5 sm:space-y-6 lg:order-none lg:col-start-1 lg:row-start-2">
            <AgentConsole />
            <AuditLog />
          </div>
        </div>
      </main>

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
