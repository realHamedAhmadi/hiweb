import { Button } from "@hiweb/ui";

/**
 * Final CTA — real copy, reflecting the approved MVP flow (Section 1,
 * Item 6): quotation/inquiry-based requests, no online payment yet.
 * The actual destination (the request/inquiry form, once built) is
 * still not wired up — layout/structure unchanged from the foundation
 * pass.
 */
export function CTASection() {
  return (
    <section className="bg-navy-800 py-16">
      <div className="mx-auto max-w-6xl px-4 text-start">
        <h2 className="max-w-xl font-display text-2xl font-semibold text-paper-50">
          Ready to start your project?
        </h2>
        <p className="mt-3 max-w-lg text-paper-100/80">
          Submit your request and our team will follow up with a
          tailored quotation — no payment required to get started.
        </p>
        <div className="mt-6">
          <Button variant="accent" size="lg">
            Request a Quote
          </Button>
        </div>
      </div>
    </section>
  );
}
