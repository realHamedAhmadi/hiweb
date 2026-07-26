import { notFound } from "next/navigation";
import { NodeMark, Button } from "@hiweb/ui";
import { fetchFromApi } from "@/lib/api";

/**
 * Individual Service Page — real page, fetches a single
 * ServiceCategory by slug via the newly-added
 * GET /service-categories/:slug endpoint (apps/api).
 *
 * Since apps/api has never actually been run/deployed anywhere, this
 * will call notFound() in practice today — there's no fallback
 * placeholder here (unlike the list pages), because a single detail
 * page has no sensible generic placeholder to fall back to; showing a
 * real 404 is more honest than inventing fake content for an unknown slug.
 */

interface ApiServiceCategory {
  title: string;
  slug: string;
  description: string;
  publishStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export default async function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await fetchFromApi<ApiServiceCategory>(
    `/service-categories/${params.slug}`
  );

  if (!category) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-start">
      <NodeMark className="mb-6 h-8 w-8 text-gold-500" />
      <h1 className="font-display text-3xl font-bold text-ink-900">{category.title}</h1>
      <p className="mt-4 text-lg text-ink-700">{category.description}</p>
      <div className="mt-8">
        <Button variant="accent" size="lg">
          Request a Quote
        </Button>
      </div>
    </section>
  );
}
