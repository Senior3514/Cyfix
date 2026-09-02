"use client";

import { DASHBOARD_SECTIONS, scrollToSection, useActiveSection } from "@/lib/sections";
import { useScanStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

/**
 * The mobile counterpart to the sidebar.
 *
 * From `lg` up the left rail already carries section navigation, so this rail
 * hides rather than duplicating it. Below that there is no room for a rail, and
 * scrolling blind through six sections was the main way to lose your place.
 */
export function SectionNav() {
  const result = useScanStore((s) => s.result);
  const { active, present } = useActiveSection(result);

  if (present.length < 2) return null;

  return (
    <nav
      aria-label="Dashboard sections"
      className="sticky top-[57px] z-20 -mx-4 border-b border-graphite-800/80 bg-graphite-950/90 backdrop-blur-md sm:top-[65px] sm:-mx-6 lg:hidden"
    >
      <div className="flex gap-1.5 overflow-x-auto px-4 py-2 sm:px-6">
        {DASHBOARD_SECTIONS.filter((s) => present.includes(s.id)).map((s) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            aria-current={active === s.id}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
              active === s.id
                ? "bg-teal-500 text-graphite-950"
                : "bg-graphite-800/70 text-graphite-400 hover:text-white",
            )}
          >
            <s.icon size={13} />
            {s.short}
          </button>
        ))}
      </div>
    </nav>
  );
}
