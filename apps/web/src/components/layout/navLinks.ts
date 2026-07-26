/**
 * Shared primary navigation list — used by both Header and Footer so
 * the two never drift out of sync. Points only at routes that already
 * exist as stubs (Section 1 MVP scope); no links to unbuilt pages.
 */
export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
] as const;
