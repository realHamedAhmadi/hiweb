import { NodeMark } from "@hiweb/ui";

/**
 * Trust/security section — real content, sourced from the approved
 * Master Specification (Section 1, Item 4: value proposition). 4 of
 * the 10 decided value-proposition points are shown here to fit the
 * existing grid layout; the rest remain available for other pages
 * (e.g. an About page) without needing new copy work. Layout/structure
 * unchanged from the foundation pass.
 */
const trustPoints = [
  "Native Pi Network integration",
  "Enterprise-level security",
  "Transparent service process",
  "Reliable customer support",
];

export function TrustSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-start">
      <h2 className="mb-8 font-display text-2xl font-semibold text-ink-900">
        Trust & Security
      </h2>
      <ul className="grid gap-6 sm:grid-cols-2">
        {trustPoints.map((point) => (
          <li key={point} className="flex items-start gap-3">
            <NodeMark className="mt-1 h-5 w-5 shrink-0 text-navy-700" />
            <span className="text-base text-ink-700">{point}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
