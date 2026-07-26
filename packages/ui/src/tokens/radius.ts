/**
 * Border radius scale.
 * Deliberately NOT zero-radius (avoids the generic "broadsheet" look)
 * and NOT heavily rounded/"friendly-startup" either — a restrained
 * 8px default reads as professional software, not a marketing site.
 */
export const radius = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  full: "9999px",
} as const;
