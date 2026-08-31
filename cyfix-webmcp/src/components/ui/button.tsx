import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-teal-500 text-graphite-950 hover:bg-teal-400 shadow-glow disabled:hover:bg-teal-500",
  secondary:
    "bg-graphite-800 text-white border border-graphite-600 hover:border-teal-500/60 hover:bg-graphite-700",
  ghost: "bg-transparent text-graphite-500 hover:text-white hover:bg-graphite-800",
  danger: "bg-severity-critical/10 text-severity-critical border border-severity-critical/40 hover:bg-severity-critical/20",
};

// Minimum heights keep every control inside a comfortable touch target
// rather than the ~28px a text-sized button would otherwise collapse to.
const sizes: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5 min-h-[36px]",
  md: "text-sm px-4 py-2.5 gap-2 min-h-[44px]",
  lg: "text-base px-6 py-3.5 gap-2.5 min-h-[52px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
