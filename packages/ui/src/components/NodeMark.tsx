import type { SVGProps } from "react";

/**
 * NodeMark — Hiweb's signature element.
 *
 * Three connected points, referencing the "node" concept at the heart
 * of the Pi Network ecosystem (peer connection) without resorting to
 * literal blockchain clichés (no hex strings, no glowing chains, no
 * generic circuit-board texture). Rendered in `currentColor`, so it
 * inherits whatever text color it's placed in — used sparingly as a
 * corner accent on cards, a section divider, or a loading indicator.
 * It is the one deliberately "designed" shape in the system; everything
 * else stays quiet so this doesn't compete with itself.
 */
export function NodeMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="8" y1="24" x2="16" y2="8" />
      <line x1="16" y1="8" x2="24" y2="24" />
      <line x1="8" y1="24" x2="24" y2="24" />
      <circle cx="16" cy="8" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="8" cy="24" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="24" cy="24" r="2.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
