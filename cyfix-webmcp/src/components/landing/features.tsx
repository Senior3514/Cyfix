import {
  Bot,
  FileDown,
  ListChecks,
  Lock,
  ScrollText,
  ShieldAlert,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Lock,
    title: "Passive scan, authorized only",
    body: "Checks HTTPS, security headers, cookie flags, and basic public exposure — every scan requires an explicit authorization confirmation first.",
  },
  {
    icon: ListChecks,
    title: "Clear findings, real severity",
    body: "Every check is scored critical → info with plain-language impact, so you know what actually matters before you fix anything.",
  },
  {
    icon: Bot,
    title: "Agent-native via WebMCP",
    body: "Cyfix registers scan_domain, explain_finding, generate_fix, and export_report with document.modelContext so an AI agent can act on the page directly.",
  },
  {
    icon: ShieldAlert,
    title: "AI explanations & remediations",
    body: "Every finding comes with a human-readable explanation and a copy-paste config or header snippet to fix it.",
  },
  {
    icon: ScrollText,
    title: "Full audit log",
    body: "Every tool call — human or agent — is logged with a timestamp, actor, and outcome, so nothing happens silently.",
  },
  {
    icon: FileDown,
    title: "One-click report export",
    body: "Export a polished JSON or Markdown report of the scan, ready to hand to a team or a judge.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white">
          Everything a human + agent team needs
        </h2>
        <p className="mt-4 text-graphite-500">
          One shared surface for authorized scanning, explanation, remediation, and reporting.
        </p>
      </div>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="transition-colors hover:border-teal-500/40">
            <CardBody>
              <div className="mb-4 inline-flex rounded-lg bg-teal-500/10 p-2.5 text-teal-400">
                <Icon size={20} />
              </div>
              <h3 className="font-display text-sm font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite-500">{body}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
