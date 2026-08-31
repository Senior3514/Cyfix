"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Copy-to-clipboard control. Selecting text by hand is painful on a phone —
 * especially inside a scrollable code block — so every snippet, tool result
 * and report gets a one-tap copy instead.
 */
export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard API needs a secure context and can be blocked outright;
      // fall back to a selection the human can copy with the OS gesture.
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } catch {
        /* nothing else to try — leave the button in its idle state */
      }
      document.body.removeChild(ta);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border border-graphite-600 bg-graphite-800/80 px-2.5 py-1.5 text-[11px] font-medium text-graphite-300 transition-colors active:bg-graphite-700 hover:border-teal-500/60 hover:text-white",
        copied && "border-teal-500/60 text-teal-300",
        className,
      )}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : label}
    </button>
  );
}
