"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  Github,
  Home,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { DASHBOARD_SECTIONS, scrollToSection, useActiveSection } from "@/lib/sections";
import { useAuditStore, useScanStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

/** Links that leave the dashboard, pinned to the bottom of the rail. */
const AWAY_LINKS = [
  { href: "/#tools", label: "The 7 tools", icon: BookOpen },
  { href: "/#security", label: "What it never does", icon: ShieldAlert },
  { href: "https://github.com/webmachinelearning/webmcp", label: "WebMCP spec", icon: Github, external: true },
];

interface AppSidebarProps {
  /** Desktop: collapsed to an icon rail. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Mobile: the drawer is open. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

/**
 * The dashboard's permanent left rail.
 *
 * Cyfix is an application, not a document: the score, the findings, the agent
 * console and the log are all one workspace, and a rail that stays put is what
 * makes that legible. The mark at the top is the way back out to the landing
 * page — the convention every product uses, and the first thing anyone tries.
 *
 * One component serves both breakpoints: a fixed rail from `lg` up, and a
 * slide-in drawer below it. Rendering it twice would mean two sources of truth
 * for which section is active.
 */
export function AppSidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: AppSidebarProps) {
  const result = useScanStore((s) => s.result);
  const isScanning = useScanStore((s) => s.isScanning);
  const auditCount = useAuditStore((s) => s.entries.length);
  const { active, present } = useActiveSection(result);

  // A drawer that survives Escape is a trap on a phone.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobile();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen, onCloseMobile]);

  const sections = DASHBOARD_SECTIONS.filter((s) => present.includes(s.id));
  const showLabels = !collapsed;

  function go(id: string) {
    scrollToSection(id);
    onCloseMobile();
  }

  return (
    <>
      {/* Scrim. Only ever painted on mobile, where the drawer overlays content. */}
      <div
        onClick={onCloseMobile}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-graphite-950/80 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-label="Cyfix navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-graphite-800 bg-graphite-900/95 backdrop-blur-xl transition-[width,transform] duration-200 ease-out",
          collapsed ? "lg:w-[72px]" : "lg:w-[248px]",
          // Mobile keeps the full width regardless of the desktop collapse state.
          "w-[264px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand. The link out to the landing page. */}
        <div className="flex h-[61px] shrink-0 items-center justify-between gap-2 border-b border-graphite-800 px-4 sm:h-[69px]">
          <Link
            href="/"
            title="Cyfix home"
            aria-label="Cyfix — back to home page"
            className="-m-1 flex min-w-0 items-center rounded-lg p-1 transition-opacity hover:opacity-80"
          >
            <Logo size={28} showWordmark={showLabels} idSuffix="-rail" />
          </Link>
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="-m-1.5 rounded-md p-1.5 text-graphite-500 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          <RailLabel show={showLabels}>Workspace</RailLabel>
          <ul className="space-y-0.5">
            {sections.map((s) => (
              <li key={s.id}>
                <RailButton
                  icon={<s.icon size={17} />}
                  label={s.label}
                  showLabel={showLabels}
                  active={active === s.id}
                  onClick={() => go(s.id)}
                  badge={s.id === "audit-log" && auditCount > 0 ? String(auditCount) : undefined}
                  pulse={s.id === "scan" && isScanning}
                />
              </li>
            ))}
            {sections.length === 0 && showLabels && (
              <li className="px-3 py-2 text-xs leading-relaxed text-graphite-600">
                Run a scan or load demo data — the workspace sections appear here.
              </li>
            )}
          </ul>

          <div className="mt-6">
            <RailLabel show={showLabels}>Cyfix</RailLabel>
            <ul className="space-y-0.5">
              <li>
                <RailLink href="/" icon={<Home size={17} />} label="Landing page" showLabel={showLabels} />
              </li>
              <li>
                <RailLink
                  href="/app?demo=1"
                  icon={<Sparkles size={17} />}
                  label="Demo scan"
                  showLabel={showLabels}
                />
              </li>
              {AWAY_LINKS.map((l) => (
                <li key={l.href}>
                  <RailLink
                    href={l.href}
                    icon={<l.icon size={17} />}
                    label={l.label}
                    showLabel={showLabels}
                    external={l.external}
                  />
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="shrink-0 border-t border-graphite-800 p-3">
          {showLabels && (
            <div className="mb-3 rounded-lg border border-graphite-800 bg-graphite-850/60 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-graphite-600">
                Current target
              </p>
              <p className="mt-1 truncate text-xs text-white">
                {result ? result.domain : "No scan yet"}
              </p>
              {result && (
                <p className="mt-0.5 text-[11px] text-graphite-500">
                  Score {result.score}/100
                  {result.isDemo && " · demo"}
                </p>
              )}
            </div>
          )}
          <button
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-graphite-500 transition-colors hover:bg-graphite-800 hover:text-white lg:flex"
          >
            {collapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
            {showLabels && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function RailLabel({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return <div className="mb-2 h-px bg-graphite-800" />;
  return (
    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-graphite-600">
      {children}
    </p>
  );
}

const RAIL_ITEM =
  "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors min-h-[38px]";

function RailButton({
  icon,
  label,
  showLabel,
  active,
  onClick,
  badge,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  showLabel: boolean;
  active: boolean;
  onClick: () => void;
  badge?: string;
  pulse?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={showLabel ? undefined : label}
      aria-current={active ? "true" : undefined}
      className={cn(
        RAIL_ITEM,
        active
          ? "bg-teal-500/10 text-white"
          : "text-graphite-400 hover:bg-graphite-800 hover:text-white",
        !showLabel && "justify-center px-0",
      )}
    >
      {/* The active marker: a bar on the rail edge, not a whole filled block. */}
      <span
        className={cn(
          "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-teal-400 transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <span className={cn("shrink-0", active && "text-teal-400")}>{icon}</span>
      {showLabel && <span className="min-w-0 flex-1 truncate text-left">{label}</span>}
      {pulse && (
        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-teal-400" aria-hidden="true" />
      )}
      {badge && showLabel && (
        <span className="shrink-0 rounded-full bg-graphite-800 px-1.5 py-0.5 font-mono text-[10px] text-graphite-400">
          {badge}
        </span>
      )}
    </button>
  );
}

function RailLink({
  href,
  icon,
  label,
  showLabel,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  showLabel: boolean;
  external?: boolean;
}) {
  const className = cn(
    RAIL_ITEM,
    "text-graphite-400 hover:bg-graphite-800 hover:text-white",
    !showLabel && "justify-center px-0",
  );
  const inner = (
    <>
      <span className="shrink-0">{icon}</span>
      {showLabel && <span className="min-w-0 flex-1 truncate text-left">{label}</span>}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={showLabel ? undefined : label}
        className={className}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} title={showLabel ? undefined : label} className={className}>
      {inner}
    </Link>
  );
}
