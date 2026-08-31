"use client";

import { useState } from "react";
import { FileJson, FileText, Printer } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { buildJsonReport, buildMarkdownReport, downloadFile } from "@/lib/report";
import { useAuditStore, useScanStore } from "@/lib/stores";
import { formatDate } from "@/lib/utils";

export function ReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const result = useScanStore((s) => s.result);
  const log = useAuditStore((s) => s.log);
  const [tab, setTab] = useState<"markdown" | "json">("markdown");

  if (!result) return null;

  const content = tab === "markdown" ? buildMarkdownReport(result) : buildJsonReport(result);

  function handleDownload() {
    if (!result) return;
    const filename = `cyfix-report-${result.domain}.${tab === "json" ? "json" : "md"}`;
    downloadFile(filename, content, tab === "json" ? "application/json" : "text/markdown");
    log({
      actor: "human",
      tool: "export_report",
      input: { format: tab },
      summary: `Exported ${filename}`,
      ok: true,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Export Report" className="max-w-3xl print:max-w-none">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("markdown")}
            className={`min-h-[36px] rounded-md px-3.5 py-1.5 text-xs font-medium ${tab === "markdown" ? "bg-teal-500 text-graphite-950" : "bg-graphite-800 text-graphite-400"}`}
          >
            Markdown
          </button>
          <button
            onClick={() => setTab("json")}
            className={`min-h-[36px] rounded-md px-3.5 py-1.5 text-xs font-medium ${tab === "json" ? "bg-teal-500 text-graphite-950" : "bg-graphite-800 text-graphite-400"}`}
          >
            JSON
          </button>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton value={content} label={`Copy ${tab}`} />
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-graphite-500">Generated {formatDate(new Date().toISOString())}</p>
      </div>

      <pre className="max-h-[45vh] max-w-full overflow-auto whitespace-pre-wrap break-words rounded-lg border border-graphite-700 bg-graphite-950 p-3.5 text-[12px] leading-relaxed text-graphite-300 sm:max-h-[50vh] sm:p-4">
        {content}
      </pre>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button onClick={handleDownload} className="w-full sm:w-auto">
          {tab === "json" ? <FileJson size={16} /> : <FileText size={16} />} Download {tab}
        </Button>
        <Button variant="secondary" onClick={() => window.print()} className="w-full sm:w-auto">
          <Printer size={16} /> Print / Save as PDF
        </Button>
      </div>
    </Modal>
  );
}
