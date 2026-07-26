import { Card, CardHeader, CardBody, CardFooter, Button } from "@hiweb/ui";

/**
 * Services preview — real content, sourced from the approved Master
 * Specification (Section 1, Item 5: monetization/service categories).
 * Layout/structure unchanged from the foundation pass. Card count (3)
 * remains a placeholder layout choice, not a commitment to exactly 3
 * services — the individual Service Pages (MVP scope) will hold the
 * full catalog.
 */
const services = [
  {
    title: "Custom Software & Digital Solutions",
    description:
      "Fixed-price packages and custom project quotations for production-quality software built for the Pi ecosystem.",
  },
  {
    title: "Domain & Hosting Services",
    description:
      "Reliable domain registration and hosting, managed with the same security standards as the rest of the platform.",
  },
  {
    title: "Maintenance & Support Plans",
    description:
      "Ongoing maintenance and support plans to keep your project running smoothly after launch.",
  },
];

export function ServicesPreviewSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-start">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-display text-2xl font-semibold text-ink-900">
          Services
        </h2>
        <Button variant="ghost" size="sm">
          View All Services
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.title}>
            <CardHeader>{service.title}</CardHeader>
            <CardBody>{service.description}</CardBody>
            <CardFooter>
              <Button variant="ghost" size="sm">
                Learn More
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
