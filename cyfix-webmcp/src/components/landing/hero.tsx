import Link from "next/link";
import { ArrowRight, Bot, FileCheck2, Lock, Sparkles } from "lucide-react";
import { LiveScan } from "@/components/landing/live-scan";

/** Short, checkable claims — no adjectives a visitor would have to take on trust. */
const PROOF = [
  { icon: <Bot size={13} />, text: "7 WebMCP tools" },
  { icon: <Lock size={13} />, text: "Passive-only, human-approved" },
  { icon: <FileCheck2 size={13} />, text: "100/100 on its own scan" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid-pattern">
      {/* On a phone the scanner sits directly under the headline — the product
          before the pitch. On desktop it takes the right column and the
          supporting claims drop below the copy. */}
      <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_minmax(0,29rem)] lg:gap-x-16 lg:gap-y-8 lg:py-24">
        <div className="order-1 min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
            <Sparkles size={13} />
            Built for the OpenAI WebMCP Challenge
          </div>

          <h1 className="font-display text-[2.1rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            Fix web security with <span className="text-teal-400">humans and agents</span> together
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-graphite-400 sm:text-lg">
            Cyfix runs a passive security scan of a domain you&apos;re authorized to test, scores
            what it finds, and hands you the exact fix. An AI agent can drive the whole thing
            through WebMCP — <span className="text-graphite-200">but only you can authorize a scan.</span>
          </p>

        </div>

        {/* The product itself, not a picture of it. */}
        <div className="order-2 min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <LiveScan />
        </div>

        <div className="order-3 min-w-0 lg:col-start-1 lg:row-start-2">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {PROOF.map((p) => (
              <li key={p.text} className="flex items-center gap-1.5 text-xs text-graphite-500">
                <span className="text-teal-400">{p.icon}</span>
                {p.text}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <Link
              href="/app"
              className="inline-flex min-h-[44px] items-center gap-1.5 font-medium text-teal-300 hover:text-teal-200"
            >
              Open the full dashboard <ArrowRight size={15} />
            </Link>
            <Link
              href="/app?demo=1"
              className="inline-flex min-h-[44px] items-center text-graphite-500 hover:text-white"
            >
              Demo for judges
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
