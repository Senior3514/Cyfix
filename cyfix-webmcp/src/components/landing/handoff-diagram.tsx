"use client";

import { useEffect, useState } from "react";
import { Bot, Check, Lock, ShieldCheck, User2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The authorization handoff, animated.
 *
 * Cyfix's whole argument is a boundary: an agent can ask, only a human can
 * approve. That is hard to convey in a paragraph and obvious in three frames,
 * so this cycles through the actual sequence the tools implement — refusal,
 * proposal, approval — using the real tool names.
 */

interface Step {
  key: string;
  call: string;
  caption: string;
  gate: "blocked" | "pending" | "open";
  agentActive: boolean;
  humanActive: boolean;
  scanActive: boolean;
  verdict: string;
}

const STEPS: Step[] = [
  {
    key: "refused",
    call: "scan_domain(\"acme.com\")",
    caption: "The agent asks to scan. Nothing has been authorized, so the tool refuses.",
    gate: "blocked",
    agentActive: true,
    humanActive: false,
    scanActive: false,
    verdict: "Refused — human authorization required",
  },
  {
    key: "proposed",
    call: "prepare_scan(\"acme.com\")",
    caption: "So it asks instead: the domain is filled in, the approval box left untouched.",
    gate: "pending",
    agentActive: true,
    humanActive: true,
    scanActive: false,
    verdict: "Waiting for a human",
  },
  {
    key: "approved",
    call: "scan_domain(\"acme.com\")",
    caption: "A human approves. Only now does the same call run.",
    gate: "open",
    agentActive: true,
    humanActive: true,
    scanActive: true,
    verdict: "Approved — passive scan running",
  },
];

const GATE_STYLES = {
  blocked: {
    ring: "border-severity-critical/60 bg-severity-critical/10",
    icon: "text-severity-critical",
    label: "text-severity-critical",
  },
  pending: {
    ring: "border-severity-medium/60 bg-severity-medium/10",
    icon: "text-severity-medium",
    label: "text-severity-medium",
  },
  open: {
    ring: "border-teal-500/60 bg-teal-500/10",
    icon: "text-teal-400",
    label: "text-teal-400",
  },
} as const;

function Node({
  active,
  icon,
  label,
  sublabel,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="flex w-24 shrink-0 flex-col items-center gap-2 text-center sm:w-28">
      <div className="relative">
        {active && (
          <span className="absolute inset-0 rounded-2xl border border-teal-400/40 animate-pulse-ring" />
        )}
        <div
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors duration-500 sm:h-16 sm:w-16",
            active
              ? "border-teal-500/60 bg-teal-500/10 text-teal-300"
              : "border-graphite-700 bg-graphite-900 text-graphite-600",
          )}
        >
          {icon}
        </div>
      </div>
      <div>
        <p
          className={cn(
            "font-display text-xs font-semibold transition-colors duration-500",
            active ? "text-white" : "text-graphite-500",
          )}
        >
          {label}
        </p>
        <p className="mt-0.5 text-[10px] leading-tight text-graphite-600">{sublabel}</p>
      </div>
    </div>
  );
}

/** Animated connector. Dashes flow only while the link is live. */
function Wire({ live, blocked }: { live: boolean; blocked?: boolean }) {
  return (
    <div className="relative flex min-w-0 flex-1 items-center justify-center px-1">
      <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="h-3 w-full" aria-hidden="true">
        <line
          x1="0"
          y1="6"
          x2="100"
          y2="6"
          stroke={live ? "#2dd4bf" : blocked ? "#f43f5e" : "#1c2733"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="6 6"
          className={cn("transition-[stroke] duration-500", live && "animate-dash-flow")}
        />
      </svg>
      {blocked && (
        <span className="absolute flex h-5 w-5 items-center justify-center rounded-full border border-severity-critical/60 bg-graphite-950 text-severity-critical">
          <X size={11} strokeWidth={3} />
        </span>
      )}
    </div>
  );
}

export function HandoffDiagram() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const step = STEPS[i];
  const gate = GATE_STYLES[step.gate];

  useEffect(() => {
    if (paused) return;
    // Someone who asked for reduced motion gets the steps as buttons, not as a
    // carousel that moves on its own.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % STEPS.length), 2900);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section className="border-t border-graphite-800/80 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal-400">
            The boundary
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            An agent can ask. Only a human can approve.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-graphite-400">
            This isn&apos;t a prompt the agent could argue its way past. It is a precondition the
            tool evaluates before it does anything.
          </p>
        </div>

        <div
          className="mt-10 rounded-2xl border border-graphite-700 bg-graphite-900/60 p-5 backdrop-blur-sm sm:p-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="flex items-start justify-between gap-1 sm:gap-3">
            <Node
              active={step.agentActive}
              icon={<Bot size={24} />}
              label="AI agent"
              sublabel="in the browser"
            />

            <div className="mt-6 flex min-w-0 flex-1 sm:mt-7">
              <Wire live={step.agentActive} blocked={step.gate === "blocked"} />
            </div>

            {/* The gate — the only node that changes colour, because it is the
                only thing in the diagram that decides anything. */}
            <div className="flex w-24 shrink-0 flex-col items-center gap-2 text-center sm:w-28">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors duration-500 sm:h-16 sm:w-16",
                  gate.ring,
                )}
              >
                <span className={cn("transition-colors duration-500", gate.icon)}>
                  {step.gate === "open" ? <Check size={24} strokeWidth={2.5} /> : <Lock size={22} />}
                </span>
              </div>
              <div>
                <p className="font-display text-xs font-semibold text-white">Authorization</p>
                <p
                  className={cn(
                    "mt-0.5 flex items-center justify-center gap-1 text-[10px] leading-tight transition-colors duration-500",
                    step.humanActive ? "text-graphite-300" : "text-graphite-600",
                  )}
                >
                  <User2 size={9} /> human only
                </p>
              </div>
            </div>

            <div className="mt-6 flex min-w-0 flex-1 sm:mt-7">
              <Wire live={step.scanActive} />
            </div>

            <Node
              active={step.scanActive}
              icon={<ShieldCheck size={24} />}
              label="Passive scan"
              sublabel="14 checks"
            />
          </div>

          <div className="mt-8 rounded-xl border border-graphite-700 bg-graphite-950 p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-[11px] text-graphite-600">agent →</span>
              <code className="font-mono text-xs text-teal-300">{step.call}</code>
            </div>
            <p className={cn("mt-2 font-mono text-[11px] transition-colors duration-500", gate.label)}>
              ← {step.verdict}
            </p>
            <p key={step.key} className="mt-3 animate-fade-up text-sm leading-relaxed text-graphite-300">
              {step.caption}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2" role="tablist">
            {STEPS.map((s, idx) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={idx === i}
                aria-label={`Step ${idx + 1}: ${s.verdict}`}
                onClick={() => setI(idx)}
                // The dot is 6px; the button around it is not.
                className="group/dot flex h-9 items-center px-1.5"
              >
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === i
                      ? "w-8 bg-teal-400"
                      : "w-1.5 bg-graphite-600 group-hover/dot:bg-graphite-500",
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-graphite-500">
          Approval is scoped to one domain. The moment an agent retargets, it is revoked —
          permission for <span className="text-graphite-300">acme.com</span> can never be reused
          against <span className="text-graphite-300">example.com</span>.
        </p>
      </div>
    </section>
  );
}
