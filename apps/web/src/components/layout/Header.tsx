"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button, NodeMark } from "@hiweb/ui";
import { navLinks } from "./navLinks";
import { useAuth } from "@/context/AuthContext";

/**
 * Header — real navigation structure, real Pi Login wiring, still-
 * placeholder locale control.
 *
 * - Language switcher: renders "EN" + chevron only. Not wired to any
 *   locale-switching logic — that's Section 11 (i18n) work, including
 *   the actual language list (en/fa/ar/tr/fr) and RTL handling. Kept
 *   as a plain, non-functional button rather than a real dropdown so
 *   it isn't mistaken for working.
 * - Pi Login: wired to the real AuthContext (`useAuth`). The Pi SDK
 *   authentication step is genuinely real; the backend verification
 *   step it depends on is a known, documented stub (see
 *   apps/api/src/lib/piNetwork.ts) — so clicking this button today
 *   will call the real Pi SDK popup, then fail at the backend step,
 *   and surface that failure as `error` below rather than silently.
 * - Mobile menu uses local component state (useState) only — this is
 *   frontend UI state, not application/backend logic. Closes on
 *   Escape for keyboard users, and on navigation (link click).
 * - Active route is highlighted via usePathname() — exact match for
 *   "/", prefix match for other routes, so nested routes (e.g. a
 *   future /services/[slug]) still highlight "Services".
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { status, user, error, login, logout, devLogin } = useAuth();

  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href) ?? false;
  }

  function renderAuthControl(fullWidth = false) {
    if (status === "loading") {
      return (
        <Button variant="ghost" size="sm" disabled className={fullWidth ? "w-full" : undefined}>
          Checking session…
        </Button>
      );
    }
    if (status === "authenticated" && user) {
      return (
        <div className={fullWidth ? "flex w-full flex-col gap-2" : "flex items-center gap-3"}>
          <span className="text-sm font-medium text-ink-700">{user.displayName}</span>
          <Button
            variant="outline"
            size="sm"
            className={fullWidth ? "w-full" : undefined}
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      );
    }
    return (
      <div className={fullWidth ? "flex w-full flex-col gap-1" : "flex flex-col items-end gap-1"}>
        <Button
          variant="accent"
          size="sm"
          className={fullWidth ? "w-full" : undefined}
          onClick={login}
        >
          Login with Pi
        </Button>
        {error && <span className="text-xs text-signal-rust">{error}</span>}
        {process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true" && (
          <div className={fullWidth ? "flex w-full gap-2" : "flex gap-2"}>
            <Button
              variant="outline"
              size="sm"
              className={fullWidth ? "flex-1 border-signal-rust text-signal-rust" : "border-signal-rust text-signal-rust"}
              onClick={() => devLogin("USER")}
            >
              ⚠ Dev: User
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={fullWidth ? "flex-1 border-signal-rust text-signal-rust" : "border-signal-rust text-signal-rust"}
              onClick={() => devLogin("ADMIN")}
            >
              ⚠ Dev: Admin
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <header className="w-full border-b border-slate-200 bg-paper-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900"
          >
            <NodeMark className="h-6 w-6 text-gold-500" />
            Hiweb
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={
                  isActive(link.href)
                    ? "text-sm font-medium text-ink-900"
                    : "text-sm font-medium text-ink-700 hover:text-ink-900"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right-side controls */}
          <div className="hidden items-center gap-4 md:flex">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-medium text-ink-700 hover:text-ink-900"
              aria-label="Change language — not yet functional"
            >
              EN
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            {renderAuthControl()}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-ink-900 md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile nav panel */}
        {mobileMenuOpen && (
          <div id="mobile-nav" className="border-t border-slate-200 py-4 md:hidden">
            <nav className="flex flex-col gap-3" aria-label="Primary mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={
                    isActive(link.href)
                      ? "text-sm font-medium text-ink-900"
                      : "text-sm font-medium text-ink-700 hover:text-ink-900"
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                className="inline-flex items-center gap-1 self-start text-sm font-medium text-ink-700"
                aria-label="Change language — not yet functional"
              >
                EN
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
              {renderAuthControl(true)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
