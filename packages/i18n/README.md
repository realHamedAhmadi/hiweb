# packages/i18n

i18n foundation for Hiweb: locale config, direction (RTL) handling, and
a minimal message-loading pipeline.

## Status: Foundation stage
- ✅ Supported locales defined (`src/locales.ts`): `en`, `fa`, `ar`, `tr`, `fr`
- ✅ RTL handling: `fa` and `ar` marked as RTL via `rtlLocales` +
  `getDirection(locale)` helper — data only, not wired to any page yet
- ✅ `localeMeta` — native (endonym) names + direction per locale, ready
  for a future locale switcher UI (e.g. replacing the placeholder "EN"
  button in Header)
- ✅ Minimal message loader (`src/messages.ts`) — one JSON file per
  locale (`locales/<code>/common.json`), each currently holding a
  single seed key (`app.name`) to prove the pipeline works
- ❌ No real translation content — only the seed key exists
- ❌ No translation library decision (next-intl / i18next / react-intl,
  etc.) — still open
- ❌ Not wired into `apps/web` — no locale routing, no `dir` switching
  on `<html>`, no pages consume this package yet. That's Section 11
  routing work, and will also require adding `@hiweb/i18n` to
  `apps/web`'s `next.config.js` `transpilePackages` list when it is.

## Usage (once wired up)
```ts
import { locales, defaultLocale, getDirection, localeMeta, getMessages } from "@hiweb/i18n";

getDirection("fa"); // "rtl"
localeMeta.ar.nativeLabel; // "العربية"
getMessages("fr")["app.name"]; // "Hiweb"
```

