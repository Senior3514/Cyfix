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

  return (
    <div className="min-h-screen bg-graphite-950">
      <header className="sticky top-0 z-30 border-b border-graphite-800/80 bg-graphite-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-graphite-500 hover:text-white">
              <ArrowLeft size={18} />
            </Link>
            <Logo size={26} />
          </div>
          <div className="flex items-center gap-3">
            {!result && (
              <Button variant="secondary" size="sm" onClick={() => loadDemo()}>
                <Sparkles size={14} /> Load Demo Data
              </Button>
            )}
            <Button size="sm" disabled={!result} onClick={() => setReportOpen(true)}>
              <FileDown size={14} /> Export Report
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {result && <ScoreSummary result={result} />}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-6">
            <DomainForm />
            <AgentConsole />
          </div>

          <div className="space-y-6">
            {result ? (
              <>
                <FindingsTable findings={result.findings} selectedId={selectedId} onSelect={setSelectedId} />
                <FindingDetail finding={selectedFinding} />
              </>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-graphite-700 text-sm text-graphite-500">
                Run a scan or load demo data to see findings here.
              </div>
            )}
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
