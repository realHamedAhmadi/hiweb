import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

/**
 * Button — base interactive component.
 *
 * RTL note: uses logical spacing (gap, ps-/pe- via padding-inline
 * utilities) rather than left/right so it mirrors automatically when
 * a parent sets dir="rtl" (Persian/Arabic locales) — no separate RTL
 * variant needed.
 *
 * Variants map directly to token roles, not one-off colors:
 * - primary   → navy (default action color — trust, not hype)
 * - accent    → gold (the one Web3-ecosystem signal; used for the
 *               single most important action on a screen, e.g.
 *               "Connect Pi Wallet" — not for routine buttons)
 * - outline   → bordered, transparent background
 * - ghost     → text-only, lowest emphasis
 * - destructive → signal.rust, for reject/cancel actions
 */

type Variant = "primary" | "accent" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-navy-700 text-paper-50 hover:bg-navy-800 focus-visible:ring-navy-500",
  accent: "bg-gold-500 text-ink-900 hover:bg-gold-600 focus-visible:ring-gold-300",
  outline: "border border-slate-400 text-ink-900 hover:bg-paper-100 focus-visible:ring-navy-500",
  ghost: "text-ink-700 hover:bg-paper-100 focus-visible:ring-navy-500",
  destructive: "bg-signal-rust text-paper-50 hover:opacity-90 focus-visible:ring-signal-rust",
};

const sizeStyles: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-base px-4 py-2.5 gap-2",
  lg: "text-lg px-6 py-3 gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
