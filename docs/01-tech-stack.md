# Keel Frontend — Recommended Tech Stack

## Decision summary

Use a conventional, contract-first React stack, but keep the landing-page implementation intentionally lightweight and product-driven.

| Area | Choice | Why it fits Keel |
|---|---|---|
| Framework | **Next.js App Router** | One codebase for SEO-friendly marketing pages and an interactive risk dashboard. |
| Language | **TypeScript** | The backend exposes an OpenAPI contract; frontend types should derive from it. |
| Package manager | **pnpm** | Fast, deterministic, good CI ergonomics. |
| Styling | **Tailwind CSS + CSS variables** | Fast iteration while preserving a controlled visual system and semantic tokens. |
| Fonts | **next/font** | Load the actual chosen typefaces rather than naming fallback stacks as if the intended fonts were present. |
| Accessible primitives | **Radix/shadcn only when needed** | Useful for behavior, but do not let a component kit define Keel's visual identity. |
| API types | **openapi-typescript** | Prevents frontend/backend type drift. |
| API client | **openapi-fetch** | Lightweight typed fetch layer aligned with OpenAPI. |
| Server-state | **TanStack Query** | Use for live dashboard data, not for static marketing sections. |
| Decimal arithmetic | **decimal.js** | Keel sends decimal strings intentionally; never use floating-point parsing for exact financial logic. |
| Charts | **Recharts when dashboard complexity requires it** | Good for depth/history charts, but do not introduce it merely to draw one decorative landing graphic. Simple landing visuals may use SVG/CSS. |
| Icons | **Lucide React** | Small, coherent icon language for status and navigation. |
| Unit/component tests | **Vitest + Testing Library** | Good fit for state rendering and formatter behavior. |
| E2E | **Playwright** | Validate real routes and responsive behavior. |
| Accessibility checks | **axe-core / @axe-core/playwright** | Helps protect risk-state accessibility. |
| Deployment | **Vercel for MVP** | Lowest-friction Next.js deployment; avoid vendor-specific product logic. |

## Product-first implementation rule

Do not add dependencies to compensate for weak composition.

The revised landing page should get most of its impact from:
- layout;
- typography;
- product-like Keel UI;
- real backend-shaped mock data;
- CSS/SVG architecture diagrams;
- API response previews;
- historical evidence charts.

Do **not** reach first for:
- Framer Motion;
- Three.js/WebGL;
- large animation packages;
- decorative charting libraries;
- carousel libraries;
- giant UI kits.

If a section is visually weak, fix the information hierarchy before adding effects.

## Why Next.js instead of plain Vite

Keel has two surfaces:

1. **Communication:** landing, methodology, case study.
2. **Product:** asset overview, asset detail, historical evidence.

Next.js lets both live in one app with shared primitives and routing.

The landing page should remain largely static and resilient when the API is unavailable, but it should still render realistic product objects from contract-compatible local fixtures.

## API architecture

```text
keel-openapi.yaml
        │
        ▼
openapi-typescript
        │
        ▼
lib/api/schema.d.ts
        │
        ▼
openapi-fetch client
        │
        ▼
query functions
        │
        ▼
TanStack Query
        │
        ▼
Keel product components
```

Do not create a parallel hand-written domain contract.

## State management

Do **not** add Redux or Zustand initially.

- **Server state:** asset data, methodology, history → TanStack Query.
- **URL state:** filters, selected band, asset search, history range → search params.
- **Local UI state:** tabs, disclosure, mobile nav → React state.

## Exact numbers vs chart geometry

Rules:

- Exact display, comparisons, and derived calculations use `decimal.js`.
- Never use `parseFloat`, unary `+`, or `Number(value)` for Keel financial arithmetic.
- A chart may convert a copy to JS number only for pixel geometry.
- Labels/tooltips/tables must preserve exact decimal values and quote units.

## Styling architecture

Use three layers:

```text
Design tokens
    ↓
UI primitives
    ↓
Keel product components
```

The revised direction also adds a fourth concern:

```text
Marketing composition
```

Marketing composition should arrange **real product components** where possible instead of inventing a separate visual language made of generic marketing cards.

Examples:
- landing hero uses a compact `AssetRiskPreview` built from the same concepts as asset detail;
- market snapshot uses a compact form of the asset table;
- explainable-risk section uses the same flag semantics as product screens;
- evidence strip uses the same provenance concepts as asset detail.

## Typography loading

The previous implementation named tokens like `--font-manrope` and `--font-jetbrains` while actually falling back to Aptos/Segoe UI and Cascadia/Consolas.

Do not do that.

Choose and load the actual fonts using `next/font`.

Preferred current direction:
- **Manrope** for product/marketing UI;
- **JetBrains Mono** for ledgers, issuer fragments, API paths, methodology versions, and exact metric labels.

Geist + Geist Mono is an acceptable fallback direction if product testing shows better readability.

## Dependency restraint

Avoid initially:
- Redux/Zustand;
- Three.js/WebGL;
- wallet libraries;
- Stellar SDK in the frontend;
- authentication libraries;
- a frontend database;
- CMS;
- Storybook before component reuse is real.

Keel is permanently read-only. The frontend does not need wallet connection, transaction signing, or blockchain SDK access.

## Suggested repository shape

```text
keel-frontend/
├─ app/
│  ├─ page.tsx
│  ├─ assets/page.tsx
│  ├─ assets/[assetId]/page.tsx
│  ├─ case-study/ustry/page.tsx
│  ├─ methodology/page.tsx
│  └─ layout.tsx
├─ components/
│  ├─ ui/
│  ├─ marketing/
│  └─ keel/
├─ lib/
│  ├─ api/
│  ├─ decimal/
│  ├─ format/
│  └─ risk/
├─ tests/
├─ e2e/
└─ docs/
```

## Initial package set

Keep the first install small:

```text
next
react
react-dom
tailwindcss
lucide-react
decimal.js
openapi-fetch
@tanstack/react-query

Add when needed:
recharts

Dev:
typescript
openapi-typescript
vitest
@testing-library/react
@testing-library/jest-dom
@playwright/test
@axe-core/playwright
eslint
prettier
```

The stack should support the design, not become the design.
