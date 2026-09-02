"use client";

import { useEffect, useState } from "react";
import { Plug } from "lucide-react";
import { getRegisteredTools, isUsingPolyfill } from "@/lib/webmcp";

/**
 * "Are the tools actually there?" — answered in the top bar rather than by
 * scrolling to the console.
 *
 * The whole premise of the app is that an agent can drive it through
 * `document.modelContext`, and the first question anyone evaluating it asks is
 * whether that registration really happened in *this* browser. Reading the
 * registry back and showing the count — plus whether it landed on the native
 * API or the polyfill — answers it without a devtools detour.
 */
export function ToolStatusPill() {
  // Registration happens in an effect, so the first paint has nothing to read.
  // Rendering a count on the server would just be a hydration mismatch.
  const [state, setState] = useState<{ count: number; polyfill: boolean } | null>(null);

  useEffect(() => {
    const read = () => setState({ count: getRegisteredTools().length, polyfill: isUsingPolyfill() });
    read();
    // A native implementation may install `document.modelContext` after our
    // first read (extension injection, late agent attach), so check briefly.
    const t = setInterval(read, 1000);
    const stop = setTimeout(() => clearInterval(t), 6000);
    return () => {
      clearInterval(t);
      clearTimeout(stop);
    };
  }, []);

  if (!state || state.count === 0) return null;

  const mode = state.polyfill ? "polyfill" : "native";

  return (
    <span
      title={`${state.count} WebMCP tools registered on document.modelContext (${mode} implementation)`}
      className="hidden items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-medium text-teal-300 md:inline-flex"
    >
      <Plug size={12} />
      <span className="font-mono">{state.count}</span> tools live
      <span className="text-teal-500/70">·</span>
      <span className="text-teal-400/80">{mode}</span>
    </span>
  );
}
