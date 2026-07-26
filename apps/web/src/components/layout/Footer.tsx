import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";
import { NodeMark } from "@hiweb/ui";
import { navLinks } from "./navLinks";

/**
 * Footer — brand area, primary navigation (reused from Header via the
 * shared navLinks list, so the two never drift out of sync), and
 * placeholder areas for social and legal links.
 *
 * Scope boundaries, deliberately respected:
 * - No real external links anywhere in this file — social icons and
 *   legal items are non-interactive placeholders (plain <span>/<button
 *   disabled>), not <a href="..."> pointing anywhere real. Wiring real
 *   social profile URLs or legal document routes is future content
 *   work, not this pass.
 * - No i18n: no language switcher here (Header already has the one
 *   placeholder for that); no translated strings — Section 11 work.
 * - No authentication: no Pi Login reference — that belongs in Header.
 * - No backend: purely static markup, no data fetching.
 */
export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-paper-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Brand area */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
              <NodeMark className="h-6 w-6 text-gold-500" />
              Hiweb
            </div>
            <p className="mt-3 text-sm text-ink-700">
              Brand description placeholder — short platform summary
              goes here.
            </p>
          </div>

          {/* Navigation links */}
          <nav aria-label="Footer" className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Navigation
            </span>
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-ink-700 hover:text-ink-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal placeholders — no routes exist yet, so these are
              intentionally non-links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Legal
            </span>
            <ul className="flex flex-col gap-2">
              <li>
                <span className="text-sm text-slate-400">
                  Terms of Service (placeholder)
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-400">
                  Privacy Policy (placeholder)
                </span>
              </li>
            </ul>
          </div>

          {/* Social placeholders — icons only, not linked anywhere */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Social
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                disabled
                aria-label="Twitter/X — not yet linked"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400"
              >
                <Twitter className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled
                aria-label="LinkedIn — not yet linked"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled
                aria-label="GitHub — not yet linked"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Hiweb. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
