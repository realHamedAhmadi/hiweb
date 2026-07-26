import { Card, CardHeader, CardBody } from "@hiweb/ui";
import Link from "next/link";

/**
 * Admin overview — simple landing page linking to each admin section.
 * No data fetching here; each section page fetches its own data.
 */
const sections = [
  { href: "/admin/service-requests", title: "Service Requests", description: "Review requests, send quotations, and change status." },
  { href: "/admin/service-categories", title: "Service Categories", description: "Manage the public Services page content." },
  { href: "/admin/portfolio-projects", title: "Portfolio Projects", description: "Manage the public Portfolio page content." },
  { href: "/admin/settings", title: "Settings", description: "Platform-wide key/value configuration." },
  { href: "/admin/audit-logs", title: "Audit Log", description: "Read-only record of admin actions." },
];

export default function AdminOverviewPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sections.map((section) => (
        <Link key={section.href} href={section.href}>
          <Card>
            <CardHeader>{section.title}</CardHeader>
            <CardBody>{section.description}</CardBody>
          </Card>
        </Link>
      ))}
    </div>
  );
}
