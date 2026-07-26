# packages/ui

Hiweb design system and shared component library.

## Status: Foundation stage
- ✅ Color tokens (`src/tokens/colors.ts`)
- ✅ Typography tokens (`src/tokens/typography.ts`) — unified Vazirmatn
  variable font for Latin + Arabic + Persian
- ✅ Radius scale (`src/tokens/radius.ts`)
- ✅ `Button` — 5 variants (primary, accent, outline, ghost, destructive), 3 sizes
- ✅ `Card` / `CardHeader` / `CardBody` / `CardFooter`
- ✅ `StatusBadge` — all 8 request/quotation statuses (Submitted →
  Cancelled), semantic color grouping, no transition logic
- ✅ `NodeMark` — signature brand element
- ✅ RTL-ready: all components use logical CSS properties (`text-start`,
  `ps-`/`pe-`, `start-*`), not hardcoded left/right
- ❌ Form inputs, selects, modals, nav, tables — not built yet (Contact
  page in `apps/web` currently uses raw styled HTML form elements
  instead — a candidate for extraction here once a second form exists)
- ❌ Dark mode variant — not decided

Full design rationale: `/docs/architecture/design-system.md`.

## Usage
```tsx
import { Button, Card, CardHeader, CardBody, StatusBadge } from "@hiweb/ui";

<Card accent>
  <CardHeader>
    Service name <StatusBadge status="quotation_sent" size="sm" />
  </CardHeader>
  <CardBody>Description text.</CardBody>
</Card>
```

