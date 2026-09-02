"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Gauge,
  History,
  ListChecks,
  Radar,
  Terminal,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface DashboardSection {
  id: string;
  /** Full label, used in the sidebar where there is room for it. */
  label: string;
  /** Cropped label for the mobile pill rail. */
  short: string;
  icon: LucideIcon;
}

/**
 * The dashboard's parts, in the order they appear on the page.
 *
 * One registry rather than two: the sidebar and the mobile pill rail describe
 * the same page, and letting them drift is how a nav ends up pointing at a
 * section that no longer exists.
 */
export const DASHBOARD_SECTIONS: DashboardSection[] = [
  { id: "overview", label: "Overview", short: "Overview", icon: Gauge },
  { id: "scan", label: "New Scan", short: "Scan", icon: Radar },
  { id: "findings", label: "Findings", short: "Findings", icon: ListChecks },
  { id: "finding-detail", label: "Fix & Verify", short: "Fix", icon: Wrench },
  { id: "agent-console", label: "Agent Console", short: "Agent", icon: Terminal },
  { id: "scan-history", label: "Scan History", short: "History", icon: History },
  { id: "audit-log", label: "Audit Log", short: "Log", icon: Activity },
];

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Tracks which sections exist on the page and which one the reader is looking
 * at. Which sections exist depends on whether a scan has run, so callers pass
 * the current result as the reset key — a dependency-free effect that writes
 * state would re-trigger itself forever.
 */
export function useActiveSection(resetKey: unknown) {
  const [active, setActive] = useState(DASHBOARD_SECTIONS[0].id);
  const [present, setPresent] = useState<string[]>([]);

  useEffect(() => {
    const found = DASHBOARD_SECTIONS.filter((s) => document.getElementById(s.id)).map((s) => s.id);
    // Same ids, same array: skip the update rather than hand React a new
    // reference that would re-render for nothing.
    setPresent((prev) => (prev.join() === found.join() ? prev : found));

    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-88px 0px -55% 0px", threshold: 0 },
    );

    found.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [resetKey]);

  return { active, present };
}
