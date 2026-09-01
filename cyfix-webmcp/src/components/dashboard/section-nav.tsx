"use client";

import { useEffect, useState } from "react";
import { Activity, Gauge, History, ListChecks, Terminal, Wrench } from "lucide-react";
import { useScanStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: <Gauge size={13} /> },
  { id: "findings", label: "Findings", icon: <ListChecks size={13} /> },
  { id: "finding-detail", label: "Fix", icon: <Wrench size={13} /> },
  { id: "agent-console", label: "Agent", icon: <Terminal size={13} /> },
  { id: "scan-history", label: "History", icon: <History size={13} /> },
  { id: "audit-log", label: "Log", icon: <Activity size={13} /> },
];

/**
 * Section rail for the dashboard.
 *
 * The dashboard grew past one screen — overview, findings, remediation, agent
 * console, history, audit log — and scrolling blind through it on a phone was
 * the main way to lose your place. This tracks which section is in view and
 * jumps between them, so the page reads as an application with parts rather
 * than one long document.
 */
export function SectionNav() {
  const [active, setActive] = useState("overview");
  const [visible, setVisible] = useState<string[]>([]);
  // Which sections exist depends on whether a scan has run, so the effect keys
  // off the result rather than re-running on every render — writing state from
  // a dependency-free effect would re-trigger itself forever.
  const result = useScanStore((s) => s.result);

  useEffect(() => {
    const present = SECTIONS.filter((s) => document.getElementById(s.id)).map((s) => s.id);
    // Same ids, same array: skip the update rather than hand React a new
    // reference that would re-render for nothing.
    setVisible((prev) => (prev.join() === present.join() ? prev : present));

    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: 0 },
    );

    present.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [result]);

  if (visible.length < 2) return null;

  return (
    <nav
      aria-label="Dashboard sections"
      className="sticky top-[57px] z-20 -mx-4 border-b border-graphite-800/80 bg-graphite-950/90 backdrop-blur-md sm:top-[65px] sm:-mx-6"
    >
      <div className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-4 py-2 sm:px-6">
        {SECTIONS.filter((s) => visible.includes(s.id)).map((s) => (
          <button
            key={s.id}
            onClick={() =>
              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            aria-current={active === s.id}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
              active === s.id
                ? "bg-teal-500 text-graphite-950"
                : "bg-graphite-800/70 text-graphite-400 hover:text-white",
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
