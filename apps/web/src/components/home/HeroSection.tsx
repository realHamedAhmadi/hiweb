import { Button, NodeMark } from "@hiweb/ui";

/**
 * Hero — real brand copy, sourced from the approved Master Specification
 * (Section 1, Items 1 & 4: core problem statement, value proposition).
 * Layout/structure unchanged from the foundation pass.
 */
export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-start">
      <NodeMark className="mb-6 h-8 w-8 text-gold-500" />
      <h1 className="max-w-2xl font-display text-4xl font-bold text-ink-900">
        The trusted digital services platform for the Pi Network ecosystem.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink-700">
        Hiweb connects Pi users and businesses with professional, secure
        software and digital solutions — built on transparent process,
        enterprise-level security, and native Pi Network integration.
      </p>
      <div className="mt-8 flex gap-3">
        <Button variant="accent" size="lg">
          Request a Quote
        </Button>
        <Button variant="outline" size="lg">
          Explore Services
        </Button>
      </div>
    </section>
  );
}
