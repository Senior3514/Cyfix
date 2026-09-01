import { Bot, FileDown, Hand, ListFilter, RefreshCw, ShieldCheck, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The tool surface, stated plainly. Judges and agents both want to know exactly
 * what this page exposes, so the names, arguments and the human gate are shown
 * as they actually are in `registerTool` rather than paraphrased in prose.
 */

interface ToolSpec {
  name: string;
  icon: React.ReactNode;
  args: string;
  description: string;
  gated?: boolean;
}

const TOOLS: ToolSpec[] = [
  {
    name: "prepare_scan",
    icon: <Hand size={16} />,
    args: "domain",
    description:
      "Proposes a domain to the human — fills the field, opens the dashboard, and pointedly does not tick the approval box.",
  },
  {
    name: "scan_domain",
    icon: <ShieldCheck size={16} />,
    args: "domain",
    description:
      "Runs the passive scan. Refuses unless a human approved this exact domain.",
    gated: true,
  },
  {
    name: "list_findings",
    icon: <ListFilter size={16} />,
    args: "severity?, onlyFailed?",
    description:
      "Compact findings to triage against, filterable by severity or narrowed to failures.",
  },
  {
    name: "explain_finding",
    icon: <Bot size={16} />,
    args: "findingId",
    description: "What this finding means in the real world, in plain language.",
  },
  {
    name: "generate_fix",
    icon: <Wrench size={16} />,
    args: "findingId",
    description: "The exact header or config line to paste, ready to copy.",
  },
  {
    name: "verify_fix",
    icon: <RefreshCw size={16} />,
    args: "findingId?",
    description:
      "Re-scans the live site and confirms the fix actually landed — instead of assuming it did.",
    gated: true,
  },
  {
    name: "export_report",
    icon: <FileDown size={16} />,
    args: "format",
    description: "A JSON or Markdown report, downloaded for the human.",
  },
];

export function ToolsShowcase() {
  return (
    <section id="tools" className="border-t border-graphite-800/80 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal-400">
            The tool surface
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Seven tools, registered on every page
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-graphite-400">
            Declared with{" "}
            <code className="break-all font-mono text-teal-400">
              document.modelContext.registerTool()
            </code>{" "}
            from the root layout — so an agent arriving anywhere on the site discovers them
            immediately, without knowing to navigate to the dashboard first.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <div
              key={t.name}
              className={cn(
                "group relative flex min-w-0 flex-col gap-2.5 rounded-xl border border-graphite-700 bg-graphite-900/60 p-4 transition-colors hover:border-teal-500/40",
                t.gated && "border-teal-500/25",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-graphite-700 bg-graphite-950 text-teal-400">
                  {t.icon}
                </span>
                {t.gated && (
                  <span className="shrink-0 rounded-full border border-teal-500/40 bg-teal-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-teal-300">
                    human-gated
                  </span>
                )}
              </div>

              <p className="break-all font-mono text-sm text-teal-300">{t.name}</p>
              <p className="font-mono text-[10px] text-graphite-600">({t.args})</p>
              <p className="text-xs leading-relaxed text-graphite-400">{t.description}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-graphite-500">
          No native <code className="font-mono text-graphite-400">document.modelContext</code> in
          your browser yet? Cyfix installs a same-shape polyfill, so the tools are always present
          and callable by hand from the dashboard&apos;s Agent Console.
        </p>
      </div>
    </section>
  );
}
