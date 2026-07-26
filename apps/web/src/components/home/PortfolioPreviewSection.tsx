import { Card, CardHeader, CardBody, Button } from "@hiweb/ui";

/**
 * Portfolio preview — heading/label copy updated to real brand voice.
 * Individual project entries remain placeholder: the approved Master
 * Specification does not contain actual case studies or project
 * names (Portfolio Management is an MVP admin feature that will
 * populate this later, not spec content to pull from) — layout/
 * structure unchanged from the foundation pass.
 */
const placeholderProjects = [
  { title: "Project name placeholder 1", tag: "Category placeholder" },
  { title: "Project name placeholder 2", tag: "Category placeholder" },
  { title: "Project name placeholder 3", tag: "Category placeholder" },
];

export function PortfolioPreviewSection() {
  return (
    <section className="bg-paper-100 py-16">
      <div className="mx-auto max-w-6xl px-4 text-start">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            Portfolio
          </h2>
          <Button variant="ghost" size="sm">
            View Full Portfolio
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {placeholderProjects.map((project) => (
            <Card key={project.title}>
              <div className="mb-4 h-32 w-full rounded-md bg-slate-200" aria-hidden="true" />
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {project.tag}
              </p>
              <CardHeader className="mt-1">{project.title}</CardHeader>
              <CardBody>Project summary placeholder text.</CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
