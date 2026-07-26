# apps/web

Frontend application — Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## Status
See `/docs/architecture/project-status.md` for the authoritative,
regularly-updated summary. Snapshot as of this file's last edit:
- ✅ Next.js + TypeScript project structure
- ✅ Tailwind CSS configured with Hiweb design tokens (colors, type, radius)
- ✅ Header — nav, active-route highlighting, mobile menu, language
  switcher placeholder; real Pi Login wired to AuthContext (backend verification still stubbed — see apps/api README)
- ✅ Footer — brand area, nav links, legal/social placeholders
- ✅ Home page — Hero, Services preview, Portfolio preview,
  Trust/Security, CTA — real copy from the approved spec where decided
- ✅ Services page — fetches `GET /service-categories` from `apps/api`, falls back to 3 placeholder cards if the API is unreachable (currently always, since apps/api has never been run — see its README)
- ✅ Portfolio page — fetches `GET /portfolio-projects` the same way, falls back to 6 placeholder cards
- ✅ Contact page — form UI (name, email, service interest, project
  details) — **not wired to any backend**
- 🟡 `/about` — route stub only, no content
- ❌ No i18n/RTL routing (en/fa/ar/tr/fr) — Section 11 work
- 🟡 Services & Portfolio pages call `apps/api` server-side, but that API has never been run/deployed anywhere — falls back to placeholders in practice
- 🟡 Contact form still not wired — Pi Login now works client-side, but backend verification is stubbed, so no real session can complete end-to-end yet

## Setup (once dependencies can be installed)
```
npm install
npm run dev
```

## Structure
```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx        — root layout (Header + Footer + page content)
│   │   ├── page.tsx          — Home page (composes 5 section components)
│   │   ├── about/page.tsx    — route stub (no content yet)
│   │   ├── services/page.tsx — Services overview page
│   │   ├── portfolio/page.tsx — Portfolio showcase page
│   │   └── contact/page.tsx  — Contact page (form UI, no backend)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx    — full nav, real Pi Login via useAuth() (locale still placeholder)
│   │   │   ├── Footer.tsx    — brand, nav, legal/social placeholders
│   │   │   └── navLinks.ts   — shared nav list (Header + Footer)
│   │   └── home/
│   │       ├── HeroSection.tsx
│   │       ├── ServicesPreviewSection.tsx
│   │       ├── PortfolioPreviewSection.tsx
│   │       ├── TrustSection.tsx
│   │       └── CTASection.tsx      — also reused by /services
│   ├── context/
│   │   └── AuthContext.tsx   — Pi Login session state (real, backend verification stubbed)
│   ├── lib/
│   │   ├── api.ts             — server-side fetch helper (Services/Portfolio pages)
│   │   ├── authApi.ts         — client-side auth API calls (cookie-aware)
│   │   └── piSdk.ts           — Pi SDK wrapper (real authenticate() call)
│   ├── types/
│   │   └── pi-sdk.d.ts        — ambient Pi SDK type (window.Pi)
│   └── styles/globals.css    — Tailwind directives + design token base styles
├── public/                    — empty
├── .env.example                — NEXT_PUBLIC_API_URL, NEXT_PUBLIC_PI_SANDBOX
├── next.config.js             — transpilePackages: ["@hiweb/ui"]
├── tailwind.config.ts         — extended with @hiweb/ui tokens
├── postcss.config.js
├── tsconfig.json
└── package.json                — includes lucide-react (Header/Footer icons)
```
