import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  /** Unique suffix when several marks share a page, so gradient ids don't collide. */
  idSuffix?: string;
}

/**
 * The Cyfix mark.
 *
 * A shield split down the middle by a gate seam. The left half is solid — the
 * human, present and committed. The right half is drawn in dashes — the agent,
 * programmatic and provisional. They meet at a bar with a check on it: the
 * approval that lets anything through.
 *
 * The whole product argument in a form that still reads as a shield at 16px,
 * where the dashes flatten into texture rather than turning to mush.
 */
export function Logo({ size = 32, showWordmark = true, className, idSuffix = "" }: LogoProps) {
  const gid = `cyfix-grad${idSuffix}`;
  const cid = `cyfix-clip${idSuffix}`;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id={gid} x1="6" y1="3" x2="34" y2="37" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5eead4" />
            <stop offset="0.55" stopColor="#2dd4bf" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
          <clipPath id={cid}>
            <path d="M20 3l14 5.2v10.1c0 9.3-5.9 17-14 20.2-8.1-3.2-14-10.9-14-20.2V8.2L20 3z" />
          </clipPath>
        </defs>

        {/* Body of the shield, so the mark holds together on any background */}
        <path
          d="M20 3l14 5.2v10.1c0 9.3-5.9 17-14 20.2-8.1-3.2-14-10.9-14-20.2V8.2L20 3z"
          fill="#0b1117"
        />

        {/* Human half: solid. Agent half: dashed. Split by the gate seam. */}
        <g clipPath={`url(#${cid})`}>
          <path d="M20 1.5v37" stroke={`url(#${gid})`} strokeWidth="1.1" strokeOpacity="0.35" />
          <path d="M20 3v37" stroke="none" />
        </g>

        <path
          d="M20 3L6 8.2v10.1c0 9.3 5.9 17 14 20.2"
          stroke={`url(#${gid})`}
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M20 3l14 5.2v10.1c0 9.3-5.9 17-14 20.2"
          stroke={`url(#${gid})`}
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="3.4 2.6"
          fill="none"
        />

        {/* The gate: a bar, and the approval that opens it */}
        <path
          d="M11.5 21.5h17"
          stroke={`url(#${gid})`}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeOpacity="0.45"
        />
        <path
          d="M14.6 21.2l3.8 3.9 7.2-7.7"
          stroke={`url(#${gid})`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {showWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          Cy<span className="text-teal-400">fix</span>
        </span>
      )}
    </span>
  );
}
