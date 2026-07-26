import en from "../locales/en/common.json";
import fa from "../locales/fa/common.json";
import ar from "../locales/ar/common.json";
import tr from "../locales/tr/common.json";
import fr from "../locales/fr/common.json";
import { defaultLocale, type Locale } from "./locales";

/**
 * Minimal message loader — proves the locale → messages pipeline works
 * end to end (JSON file per locale, imported and keyed by Locale type).
 *
 * NOT a translation framework: no interpolation, no pluralization, no
 * namespace splitting beyond a single "common" file per locale, and no
 * decision yet on a library (e.g. next-intl, i18next, react-intl) —
 * that's still open. Each `common.json` currently holds one seed key
 * ("app.name") only — real translation content is future work, not
 * this foundation pass.
 */

export type Messages = Record<string, string>;

export const messagesByLocale: Record<Locale, Messages> = {
  en,
  fa,
  ar,
  tr,
  fr,
};

export function getMessages(locale: Locale): Messages {
  return messagesByLocale[locale] ?? messagesByLocale[defaultLocale];
}
