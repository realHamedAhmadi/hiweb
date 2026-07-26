import { NodeMark } from "@hiweb/ui";

/**
 * About page — real content, sourced from the approved Master
 * Specification (Section 1, Items 1, 3 & 4). Shows the 6 value-prop
 * points NOT already used on the Home page's Trust section (which
 * shows only 4 of the 10 decided points to fit its grid) — this page
 * is exactly the place flagged back when Trust was built as somewhere
 * the other 6 could go without new copy work.
 */
const remainingValueProps = [
  "Production-quality software development",
  "Professional UI/UX",
  "Admin-managed dynamic content",
  "Long-term scalability",
  "Multi-language support",
  "Mobile-first experience",
];

const personas = [
  "Individual Pi users",
  "Entrepreneurs",
  "Small and medium businesses",
  "Startups",
  "Pi ecosystem projects",
  "Enterprise clients",
];

export default function AboutPage() {
  return (
    <div className="text-start">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <NodeMark className="mb-6 h-8 w-8 text-gold-500" />
        <h1 className="max-w-2xl font-display text-3xl font-bold text-ink-900">
          About Hiweb
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-700">
          Hiweb solves the lack of a professional, secure, and
          trustworthy digital services platform dedicated to the Pi
          Network ecosystem — connecting Pi users and businesses with
          high-quality software and digital solutions.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-6 font-display text-2xl font-semibold text-ink-900">
          Who Hiweb is built for
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <li
              key={persona}
              className="rounded-md border border-slate-200 bg-paper-50 px-4 py-3 text-sm text-ink-700"
            >
              {persona}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-paper-100 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 font-display text-2xl font-semibold text-ink-900">
            What sets Hiweb apart
          </h2>
          <p className="mb-6 max-w-2xl text-ink-700">
            Hiweb is designed to be a trusted, professional digital
            services platform — not a freelance marketplace.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {remainingValueProps.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <NodeMark className="mt-1 h-5 w-5 shrink-0 text-navy-700" />
                <span className="text-base text-ink-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
