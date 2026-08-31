import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid-pattern">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
            <Sparkles size={13} />
            Built for the OpenAI WebMCP Challenge
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Fix web security with <span className="text-teal-400">humans and agents</span>{" "}
            together
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-graphite-500">
            Cyfix runs a safe, passive scan of an authorized domain, explains every finding in
            plain language, and exposes real tools an AI agent can call directly from the page —
            no exploits, no brute force, no port scanning. Just clear findings and fast fixes.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/app">
              <Button size="lg">
                Launch App <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/app?demo=1">
              <Button variant="secondary" size="lg">
                Try Demo for Judges
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-graphite-500">
            <ShieldCheck size={14} className="text-teal-400" />
            Passive checks only — authorization required before every scan.
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-teal-500/10 blur-3xl" />
          <div className="rounded-2xl border border-graphite-700 bg-graphite-900/90 shadow-2xl">
            <div className="flex items-center justify-between border-b border-graphite-700 px-5 py-3.5">
              <span className="text-xs font-medium text-graphite-500">Scan · demo.cyfix.app</span>
              <span className="rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-semibold text-teal-300">
                Score 61/100
              </span>
            </div>
            <div className="space-y-3 p-5">
              {[
                { title: "Content-Security-Policy header", severity: "high" as const, passed: false },
                { title: "HTTPS enforced for all traffic", severity: "critical" as const, passed: true },
                { title: "Cookies use the HttpOnly flag", severity: "high" as const, passed: false },
                { title: "security.txt disclosure policy", severity: "info" as const, passed: false },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex items-center justify-between rounded-lg border border-graphite-700 bg-graphite-850 px-3.5 py-3"
                >
                  <span className="text-sm text-graphite-300">{f.title}</span>
                  <SeverityBadge severity={f.severity} passed={f.passed} />
                </div>
              ))}
            </div>
            <div className="border-t border-graphite-700 px-5 py-3.5 font-mono text-[11px] text-teal-400/80">
              agent → explain_finding(&quot;csp-header&quot;) · human approved
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
