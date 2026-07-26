import { Card, CardHeader, CardBody, NodeMark } from "@hiweb/ui";
import Link from "next/link";
import { fetchFromApi } from "@/lib/api";

/**
 * Portfolio showcase page — now wired to fetch real data from
 * GET /portfolio-projects, with a fallback to the original placeholder
 * array if the API is unreachable (currently always true — apps/api
 * has never been run anywhere, see its README).
 *
 * Field mapping note: the API's PortfolioProject shape uses
 * `categoryTag` and `summary` (see database-design.md 1.5); mapped
 * here to this page's existing `tag`/`description` display fields.
 * `imageUrl` is fetched but not yet rendered — the placeholder gray
 * block stays even for real data until real image handling is built.
 *
 * Each card now links to /portfolio/[slug]. Fallback slugs are
 * fabricated for placeholder data only — they will 404 today since no
 * matching real record exists, which is the honest outcome.
 *
 * No backend, database, auth, or payment logic performed here — this
 * component only reads public data.
 */

interface PortfolioProject {
  title: string;
  slug: string;
  tag: string;
  summary: string;
}

interface ApiPortfolioProject {
  title: string;
  slug: string;
  summary: string;
  categoryTag: string;
  imageUrl?: string;
  publishStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

// Fallback used only when the API is unreachable or returns nothing.
const fallbackProjects: PortfolioProject[] = [
  { title: "Project name placeholder 1", slug: "placeholder-1", tag: "Category placeholder", summary: "Project summary placeholder text." },
  { title: "Project name placeholder 2", slug: "placeholder-2", tag: "Category placeholder", summary: "Project summary placeholder text." },
  { title: "Project name placeholder 3", slug: "placeholder-3", tag: "Category placeholder", summary: "Project summary placeholder text." },
  { title: "Project name placeholder 4", slug: "placeholder-4", tag: "Category placeholder", summary: "Project summary placeholder text." },
  { title: "Project name placeholder 5", slug: "placeholder-5", tag: "Category placeholder", summary: "Project summary placeholder text." },
  { title: "Project name placeholder 6", slug: "placeholder-6", tag: "Category placeholder", summary: "Project summary placeholder text." },
];

export default async function PortfolioPage() {
  const apiProjects = await fetchFromApi<ApiPortfolioProject[]>("/portfolio-projects");

  const projects: PortfolioProject[] =
    apiProjects && apiProjects.length > 0
      ? apiProjects.map((p) => ({ title: p.title, slug: p.slug, tag: p.categoryTag, summary: p.summary }))
      : fallbackProjects;

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 text-start">
        <NodeMark className="mb-6 h-8 w-8 text-gold-500" />
        <h1 className="max-w-2xl font-display text-3xl font-bold text-ink-900">
          Portfolio
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-700">
          A showcase of work across the Pi Network ecosystem — project
          details are added and managed by the Hiweb team.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 text-start">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.slug} href={`/portfolio/${project.slug}`}>
              <Card>
                <div className="mb-4 h-32 w-full rounded-md bg-slate-200" aria-hidden="true" />
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {project.tag}
                </p>
                <CardHeader className="mt-1">{project.title}</CardHeader>
                <CardBody>{project.summary}</CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
