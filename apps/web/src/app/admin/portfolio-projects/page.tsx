"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card, CardHeader, CardBody, Button } from "@hiweb/ui";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/adminApi";

interface PortfolioProjectRow {
  id: string;
  title: string;
  slug: string;
  summary: string;
  categoryTag: string;
  publishStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

const inputClass =
  "rounded-md border border-slate-200 bg-paper-50 px-3 py-2 text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500";

export default function AdminPortfolioProjectsPage() {
  const { accessToken } = useAuth();
  const [projects, setProjects] = useState<PortfolioProjectRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", summary: "", categoryTag: "" });
  const [creating, setCreating] = useState(false);

  function load() {
    if (!accessToken) return;
    adminApi
      .listPortfolioProjects(accessToken)
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }

  useEffect(load, [accessToken]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setCreating(true);
    setError(null);
    try {
      await adminApi.createPortfolioProject(accessToken, form);
      setForm({ title: "", slug: "", summary: "", categoryTag: "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  async function handlePublishStatusChange(
    id: string,
    publishStatus: PortfolioProjectRow["publishStatus"]
  ) {
    if (!accessToken) return;
    try {
      await adminApi.updatePortfolioProject(accessToken, id, { publishStatus });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>New Portfolio Project</CardHeader>
        <CardBody>
          <form onSubmit={handleCreate} className="mt-2 flex flex-col gap-3">
            <input
              className={inputClass}
              placeholder="Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="slug-in-lowercase-and-hyphens"
              required
              pattern="[a-z0-9-]+"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Category tag"
              required
              value={form.categoryTag}
              onChange={(e) => setForm({ ...form, categoryTag: e.target.value })}
            />
            <textarea
              className={inputClass}
              placeholder="Summary"
              required
              rows={3}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
            <Button type="submit" variant="accent" size="sm" disabled={creating} className="self-start">
              {creating ? "Creating…" : "Create (as Draft)"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {error && <p className="text-sm text-signal-rust">{error}</p>}

      {!projects ? (
        <p className="text-sm text-ink-700">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-ink-700">No portfolio projects yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink-900">{project.title}</p>
                  <p className="text-xs text-slate-400">
                    /{project.slug} — {project.categoryTag}
                  </p>
                </div>
                <select
                  value={project.publishStatus}
                  onChange={(e) =>
                    handlePublishStatusChange(
                      project.id,
                      e.target.value as PortfolioProjectRow["publishStatus"]
                    )
                  }
                  className={inputClass}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
