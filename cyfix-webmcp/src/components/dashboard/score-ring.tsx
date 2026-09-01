"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The score as a ring rather than a number. The arc animates from zero on every
 * new result, which makes a re-scan after a fix visibly move — the number alone
 * changed too quietly to notice.
 */
export function ScoreRing({ score, size = 104 }: { score: number; size?: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    const t = setTimeout(() => setShown(score), 60);
    return () => clearTimeout(t);
  }, [score]);

  const stroke = size > 90 ? 8 : 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (shown / 100) * circumference;

  const tone =
    score >= 80
      ? { stroke: "#2dd4bf", text: "text-teal-400", glow: "rgba(45,212,191,0.35)" }
      : score >= 50
        ? { stroke: "#facc15", text: "text-severity-medium", glow: "rgba(250,204,21,0.3)" }
        : { stroke: "#f43f5e", text: "text-severity-critical", glow: "rgba(244,63,94,0.3)" };

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1c2733" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)",
            filter: `drop-shadow(0 0 6px ${tone.glow})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display text-3xl font-bold leading-none", tone.text)}>
          {score}
        </span>
        <span className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-graphite-600">
          / 100
        </span>
      </div>
      <span className="sr-only">Security score {score} out of 100</span>
    </div>
  );
}
