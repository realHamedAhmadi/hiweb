/**
 * Supported locales — single source of truth.
 *
 * Order matches the approved Master Specification (Section 1, Item 2):
 * English is primary, followed by Persian, Arabic, Turkish, French.
 *
 * This file defines WHICH locales exist and their text direction. It
 * does NOT decide how locale switching/routing works in apps/web
 * (e.g. /en/... path segments vs. a cookie) — that's still Section 11
 * routing work, intentionally left undecided here.
 */

export const locales = ["en", "fa", "ar", "tr", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export type Direction = "ltr" | "rtl";

/**
 * RTL locales — Persian and Arabic. Used to derive `dir` for whatever
 * component eventually sets it (e.g. the root <html> tag) — not wired
 * to any page yet, per instruction.
 */
export const rtlLocales: ReadonlySet<Locale> = new Set(["fa", "ar"]);

export function getDirection(locale: Locale): Direction {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Display metadata per locale — native (endonym) name, English label,
 * and direction combined in one place. Intended for a future locale
 * switcher UI (e.g. replacing the placeholder "EN" button in Header),
 * not wired to any component yet.
 */
export interface LocaleMeta {
  label: string;
  nativeLabel: string;
  direction: Direction;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: { label: "English", nativeLabel: "English", direction: "ltr" },
  fa: { label: "Persian", nativeLabel: "فارسی", direction: "rtl" },
  ar: { label: "Arabic", nativeLabel: "العربية", direction: "rtl" },
  tr: { label: "Turkish", nativeLabel: "Türkçe", direction: "ltr" },
  fr: { label: "French", nativeLabel: "Français", direction: "ltr" },
};
