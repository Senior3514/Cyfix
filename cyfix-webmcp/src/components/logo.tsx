import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function Logo({ size = 32, showWordmark = true, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="cyfix-shield-inline" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5eead4" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <path
          d="M20 2.5L34.5 8v10.4c0 9.7-6.2 17.7-14.5 21.1C11.7 36.1 5.5 28.1 5.5 18.4V8L20 2.5z"
          fill="#0d1218"
          stroke="url(#cyfix-shield-inline)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M14 20.2l4.2 4.2 8-8.6"
          stroke="url(#cyfix-shield-inline)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="14" cy="20.2" r="1.4" fill="#2dd4bf" />
        <circle cx="26.2" cy="15.8" r="1.4" fill="#2dd4bf" />
      </svg>
      {showWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          Cy<span className="text-teal-400">fix</span>
        </span>
      )}
    </span>
  );
}
