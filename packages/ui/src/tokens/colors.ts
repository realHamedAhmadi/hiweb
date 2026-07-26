/**
 * Hiweb color tokens — single source of truth.
 * Imported by apps/web/tailwind.config.ts so design tokens are defined
 * once and shared across the monorepo.
 *
 * Rationale (see /docs/architecture/design-system.md for full brief):
 * - "ink" / "paper" replace flat black/white — warm, professional neutrals.
 * - "gold" is drawn from the Pi Network coin mark — the one deliberate
 *   Web3-ecosystem signal, used sparingly as an accent, never as a
 *   background flood.
 * - "navy" carries trust/professionalism — the dominant brand color for
 *   primary actions, since Hiweb positions itself as an enterprise-grade
 *   services platform, not a speculative crypto product.
 * - "signal" colors are muted, not neon — status meaning without
 *   looking like a trading dashboard.
 */

export const colors = {
  ink: {
    900: "#17140F",
    700: "#2B2620",
    500: "#4A4438",
  },
  paper: {
    50: "#FBFAF6",
    100: "#F2EEE5",
  },
  gold: {
    50: "#FCF3DC",
    300: "#E8C468",
    500: "#D9A62E",
    600: "#B5860F",
    700: "#8C6708",
  },
  navy: {
    800: "#141C29",
    700: "#1E2A3C",
    500: "#33465F",
  },
  slate: {
    200: "#DBD7CC",
    400: "#8B8577",
  },
  signal: {
    emerald: "#2F7D5E",
    rust: "#B5482F",
  },
} as const;

export type ColorToken = typeof colors;
