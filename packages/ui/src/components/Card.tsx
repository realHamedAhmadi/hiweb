import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";
import { NodeMark } from "./NodeMark";

/**
 * Card — base container component.
 *
 * RTL note: uses `text-start` (logical) instead of `text-left`, and
 * padding via `p-*` (already logical/uniform) so no directional
 * override is needed when dir="rtl".
 *
 * `accent` prop places a small NodeMark in the top-inline-start corner
 * (start, not "left" — flips correctly under RTL) for cards that should
 * carry the brand signature (e.g. a featured service or an active
 * request). Used sparingly — most cards should NOT set this.
 */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
}

export function Card({ accent = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-slate-200 bg-paper-50",
        "p-6 text-start text-ink-900",
        className
      )}
      {...props}
    >
      {accent && (
        <NodeMark className="absolute start-4 top-4 h-4 w-4 text-gold-500" />
      )}
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-3 font-display text-xl font-semibold text-ink-900", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-base font-normal text-ink-700", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-4 flex items-center gap-3 border-t border-slate-200 pt-4", className)} {...props}>
      {children}
    </div>
  );
}
