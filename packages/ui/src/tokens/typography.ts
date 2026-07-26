/**
 * Hiweb typography tokens.
 *
 * Deliberate choice: ONE unified variable typeface (Vazirmatn) for both
 * display and body text, differentiated by weight — not two separate
 * Latin display/body families.
 *
 * Reason this is a constraint of the brief, not a shortcut: Hiweb ships
 * in English, Persian, Arabic, Turkish, and French (Section 11). Persian
 * and Arabic require RTL script support. Pairing a Latin-only display
 * face with a separate body face works for single-script sites, but
 * breaks down across scripts — Arabic/Persian text would have to fall
 * back to a mismatched font, producing visibly inconsistent type weight
 * and rhythm between locales. Vazirmatn is a variable font with unified
 * Latin + Arabic + Persian glyph support, so the SAME type scale and
 * weight system holds across every supported language. Weight (not
 * family) carries the display/body distinction instead.
 *
 * A monospace utility face is layered in separately for data-dense
 * contexts (KPIs, request IDs, timestamps) where numerals benefit from
 * fixed width regardless of locale.
 */

export const typography = {
  fontFamily: {
    display: ["Vazirmatn", "ui-sans-serif", "system-ui", "sans-serif"],
    body: ["Vazirmatn", "ui-sans-serif", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "ui-monospace", "monospace"],
  },
  fontWeight: {
    display: "700",
    subhead: "600",
    body: "400",
    emphasis: "500",
  },
  scale: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.375rem",
    "2xl": "1.75rem",
    "3xl": "2.25rem",
    "4xl": "3rem",
  },
} as const;

export type TypographyToken = typeof typography;
