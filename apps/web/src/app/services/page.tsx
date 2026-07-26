import { Card, CardHeader, CardBody, CardFooter, Button, NodeMark } from "@hiweb/ui";
import Link from "next/link";
import { CTASection } from "@/components/home/CTASection";
import { fetchFromApi } from "@/lib/api";

/**
 * Services overview page — now wired to fetch real data from
 * GET /service-categories, with a fallback to the original placeholder
 * array if the API is unreachable (which, honestly, it currently
 * always will be — apps/api has never been run anywhere yet, see its
 * README). This isn't a cosmetic wrapper: if a real API ever starts
 * responding at the configured API_URL, this page will render its
 * actual data with zero further changes needed here.
 *
 * Field mapping note: the API returns Prisma's raw shape (title, slug,
 * description, publishStatus, etc. — see database-design.md); only
 * `title` and `description` are used here, matching what this page's
 * cards display. `slug` is fetched but unused until individual Service
 * Pages exist (a separate MVP item, not yet built).
 *
 * No backend, database, auth, or payment logic performed here — this
 * component only reads public data; quotation-based CTA text stays
 * consistent with the MVP flow (Section 1, Item 6: no online payment
 * at MVP).
 */

interface ServiceCategory {
  title: string;
  slug: string;
  description: string;
}

interface ApiServiceCategory {
  title: string;
  slug: string;
  description: string;
  publishStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

// Fallback used only when the API is unreachable or returns nothing —
// same three categories that were already here, pulled from the
// approved Master Specification (Section 1, Item 5). Slugs here are
// fabricated for the fallback only (never real content) so "Learn
// More" has somewhere to point even before any real category exists —
// these routes will 404 today since no matching real record exists,
// which is the honest outcome for placeholder data.
const fallbackServiceCategories: ServiceCategory[] = [
  {
    title: "Custom Software & Digital Solutions",
    slug: "custom-software-digital-solutions",
    description:
      "Fixed-price packages and custom project quotations for production-quality software built for the Pi ecosystem.",
  },
  {
    title: "Domain & Hosting Services",
    slug: "domain-hosting-services",
    description:
      "Domain registration and hosting, managed with the same security standards as the rest of the platform.",
  },
  {
    title: "Maintenance & Support Plans",
    slug: "maintenance-support-plans",
    description:
      "Ongoing maintenance and support plans to keep your project running smoothly after launch.",
  },
];

export default async function ServicesPage() {
  const apiCategories = await fetchFromApi<ApiServiceCategory[]>("/service-categories");

  const serviceCategories: ServiceCategory[] =
    apiCategories && apiCategories.length > 0
      ? apiCategories.map((c) => ({ title: c.title, slug: c.slug, description: c.description }))
      : fallbackServiceCategories;

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 text-start">
        <NodeMark className="mb-6 h-8 w-8 text-gold-500" />
        <h1 className="max-w-2xl font-display text-3xl font-bold text-ink-900">
          Services
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-700">
          Every engagement starts with a quotation, not a checkout —
          submit a request and our team will follow up with a tailored
          proposal.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 text-start">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((service) => (
            <Card key={service.slug}>
              <CardHeader>{service.title}</CardHeader>
              <CardBody>{service.description}</CardBody>
              <CardFooter>
                <Link href={`/services/${service.slug}`}>
                  <Button variant="ghost" size="sm">
                    Learn More
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
}
