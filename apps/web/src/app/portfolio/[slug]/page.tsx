import { notFound } from "next/navigation";
import { NodeMark } from "@hiweb/ui";
import { fetchFromApi } from "@/lib/api";

/**
 * Individual Portfolio Project page — same pattern as the Service
 * detail page: fetches by slug via GET /portfolio-projects/:slug
 * (apps/api), calls notFound() on any miss rather than showing fake
 * placeholder content for an unknown slug.
 */

interface ApiPortfolioProject {
  title: string;
  slug: string;
  summary: string;
  categoryTag: string;
  imageUrl?: string;
  publishStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await fetchFromApi<ApiPortfolioProject>(
    `/portfolio-projects/${params.slug}`
  );

  if (!project) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-start">
      <NodeMark className="mb-6 h-8 w-8 text-gold-500" />
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {project.categoryTag}
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink-900">{project.title}</h1>
      <div className="mt-6 h-64 w-full rounded-md bg-slate-200" aria-hidden="true" />
      <p className="mt-6 text-lg text-ink-700">{project.summary}</p>
    </section>
  );
}
