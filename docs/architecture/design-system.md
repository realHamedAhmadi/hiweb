# Hiweb — Design System Foundation

This document explains the rationale behind the design tokens and
signature element. For current build status (which components and
pages exist), see `project-status.md` in this same folder.

## Design brief interpretation

Hiweb positions itself as a **professional, enterprise-grade services
platform for the Pi Network ecosystem** — not a speculative crypto
product and not a freelance marketplace (Section 1, Item 4). The design
system needed to signal trust and production quality first, with a
single deliberate nod to its Web3/Pi Network context — not a generic
"crypto site" look (neon gradients, glassmorphism, glowing chains).

## Color tokens

| Token | Hex | Role |
|---|---|---|
| `ink.900` | `#17140F` | Primary text |
| `paper.50` | `#FBFAF6` | Primary background |
| `gold.500` | `#D9A62E` | The one Web3-ecosystem signal — drawn from the Pi coin mark. Reserved for the single most important action per screen (e.g. "Connect Pi Wallet"), never used as a background flood. |
| `navy.700` | `#1E2A3C` | Primary action color — carries the "trust/enterprise" weight, used far more often than gold |
| `slate.400` | `#8B8577` | Muted text, borders |
| `signal.emerald` / `signal.rust` | `#2F7D5E` / `#B5482F` | Muted status colors (success/error) — deliberately not neon, to avoid a "trading dashboard" feel |

Full source: `packages/ui/src/tokens/colors.ts`.

## Typography

**One unified variable typeface — Vazirmatn — for both display and body
text**, differentiated by weight rather than by using two separate font
families.

This is a direct consequence of the brief, not a shortcut: Hiweb ships
in English, Persian, Arabic, Turkish, and French (Section 11), with
Persian and Arabic requiring RTL rendering. A Latin-only display face
paired with a separate body face works for single-script products, but
under a multi-script requirement it forces Arabic/Persian text onto a
mismatched fallback font — producing visibly inconsistent weight and
rhythm between locales. Vazirmatn supports Latin, Arabic, and Persian
glyphs in one variable font file, so the same type scale holds across
every supported language.

A monospace face (JetBrains Mono) is layered in separately for
data-dense contexts — request IDs, timestamps, KPI figures — where
fixed-width numerals help regardless of locale.

Full source: `packages/ui/src/tokens/typography.ts`.

## Signature element — NodeMark

Three connected points, referencing the "node" at the heart of a
peer-to-peer network — without literal blockchain clichés (no hex
strings, no glowing chains, no circuit-board texture). Rendered in
`currentColor` so it adapts to context. Used sparingly: as a small
corner accent on a featured `Card`, and reserved for future use as a
loading indicator or section divider. It is the one intentionally
"designed" shape in the system — everything else stays quiet so it
doesn't compete with itself.

Full source: `packages/ui/src/components/NodeMark.tsx`.

## RTL readiness

Components use **logical CSS properties** throughout (`text-start`,
`ps-`/`pe-` padding, `start-4` positioning, `gap-*` instead of
directional margins) rather than hardcoded `left`/`right` values. This
means components mirror automatically once a parent element sets
`dir="rtl"` — no separate RTL variant of each component is needed.

**Not yet implemented:** the actual per-locale `dir` switching in
`app/layout.tsx` (still hardcoded to `lang="en"`) — that's Section 11
routing work, flagged there intentionally so it's designed deliberately
rather than bolted on now.

## What exists vs. what doesn't

| Exists | Does not exist yet |
|---|---|
| Color tokens | Locale-based font loading/switching |
| Typography tokens | Dark mode variant (not yet decided — Section 7) |
| Radius scale | Form inputs, selects, modals, nav, tables as `@hiweb/ui` components (Contact page currently uses raw styled HTML elements) |
| `Button` (5 variants, 3 sizes) | Icon library beyond `NodeMark` |
| `Card` (+ Header/Body/Footer) | |
| `StatusBadge` (all 8 request/quotation statuses) | |
| `NodeMark` signature element | |
| Home, Services, Portfolio, Contact pages built using these tokens | About page content |

## Next candidates
Extract the Contact page's form fields (text input, select, textarea)
into real `@hiweb/ui` components — currently they're raw HTML elements
styled inline, which will drift from the design system the moment a
second form exists.
