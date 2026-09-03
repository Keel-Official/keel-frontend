# Keel Frontend — Recommended Tech Stack

## Decision summary

Use a conventional, contract-first React stack:

| Area | Choice | Why it fits Keel |
|---|---|---|
| Framework | **Next.js App Router** | One codebase for an SEO-friendly landing page and an interactive dashboard. Good static rendering for marketing pages, server rendering when useful, mature deployment path. |
| Language | **TypeScript** | The backend already exposes an OpenAPI contract. TypeScript lets the frontend derive types rather than manually retype financial/risk payloads. |
| Package manager | **pnpm** | Fast, deterministic, disk-efficient, good CI ergonomics. |
| Styling | **Tailwind CSS** | Fast iteration while keeping design decisions centralized as theme variables/tokens. |
| Accessible primitives | **shadcn/ui + Radix primitives** | Gives accessible behavior without forcing a visual identity. Components can be owned and styled by Keel. |
| API types | **openapi-typescript** | Generate TypeScript types directly from `keel-openapi.yaml`; avoids frontend/backend type drift. |
| API client | **openapi-fetch** | Lightweight typed wrapper around `fetch`; request paths, params, responses, and errors stay aligned with OpenAPI. |
| Server-state | **TanStack Query** | Useful once the dashboard is live: caching, background refresh, retries, request state, pagination/filter queries. Do not use it for static landing content. |
| Decimal arithmetic | **decimal.js** | Keel sends decimal amounts as strings on purpose. Never use `parseFloat`/`Number` for exact financial arithmetic. |
| Charts | **Recharts** | Enough for depth curves, manipulation-cost charts, and historical trends without building a visualization system from scratch. |
| Icons | **Lucide React** | Small, consistent icon language for status, warnings, navigation, and explanations. |
| Unit/component tests | **Vitest + Testing Library** | Fast tests for formatters, state rendering, and component behavior. |
| E2E | **Playwright** | Test the real critical paths across Chromium/WebKit/Firefox and verify responsive behavior. |
| Accessibility checks | **axe-core / @axe-core/playwright** | Risk bands cannot depend on color alone; automated checks catch basic regressions. |
| Deployment | **Vercel for the MVP** | Lowest-friction deployment for Next.js and reviewer-facing previews. Can move later; avoid Vercel-specific product logic. |

## Why Next.js instead of plain Vite

Vite + React would also work technically. Next.js is preferred because Keel has two different surfaces:

1. **Public communication:** landing page, methodology explanation, case study — benefits from static/SEO-friendly rendering.
2. **Data application:** asset list, asset detail, historical charts — benefits from React's client interactivity and server rendering where appropriate.

Next.js lets both live in one application without creating separate marketing and app projects.

Do not overuse framework features. The landing page should mostly be static. The dashboard should fetch Keel data through a small API layer. No frontend server/database is needed for this sprint.

## API architecture

Recommended flow:

```text
keel-openapi.yaml
        │
        ▼
openapi-typescript
        │
        ▼
src/lib/api/schema.d.ts
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
UI components
```

This matters because the backend is explicitly contract-first and already ships generated mocks. Avoid creating a parallel hand-written interface such as `type AssetRisk = ...` in the frontend.

## State management

Do **not** add Redux or Zustand initially.

Keel currently needs three kinds of state:

- **Server state:** asset data, methodology, history → TanStack Query.
- **URL state:** filters, selected band, asset search, history range → search params.
- **Local UI state:** dropdown open/closed, tabs, mobile nav → React state.

A global state library should only be introduced if a real cross-page client-state problem appears.

## Exact numbers vs chart geometry

The API intentionally sends decimals as strings.

Rules:

- Exact display, comparisons, derived values, and formatting logic use `decimal.js`.
- Never use `parseFloat`, unary `+`, or `Number(value)` for Keel financial values.
- A charting library ultimately needs JavaScript numbers for pixel geometry. It is acceptable to convert a **copy** solely for visualization after the exact value has been preserved. Tooltips, labels, tables, and calculations must use the original decimal representation.

## Styling architecture

Use three layers:

```text
Design tokens       CSS variables / Tailwind theme
        ↓
Primitives          Button, Badge, Card, Tooltip, Table
        ↓
Domain components   RiskBadge, DepthTable, DataSourceBadge, MetricCard
```

Avoid putting raw brand/risk colors directly into page JSX. Pages should consume semantic tokens such as `--risk-critical` and `--surface-elevated`.

## Dependency restraint

For the first milestone, avoid:

- Redux/Zustand;
- Framer Motion unless a real interaction needs it;
- Three.js/WebGL;
- wallet libraries;
- Stellar SDK in the frontend;
- authentication libraries;
- a frontend database;
- a CMS;
- Storybook before reusable components actually exist.

Keel is read-only. The frontend does not need wallet connection, transaction signing, or blockchain SDK access. The backend is the interface to the methodology and Stellar-derived data.

## Suggested repository shape

```text
keel-frontend/
├─ app/
│  ├─ (marketing)/
│  │  ├─ page.tsx
│  │  └─ methodology/page.tsx
│  ├─ (app)/
│  │  ├─ assets/page.tsx
│  │  ├─ assets/[assetId]/page.tsx
│  │  └─ case-study/ustry/page.tsx
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
├─ styles/
│  └─ globals.css
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

Add shadcn/Radix primitives only as components are needed, rather than bulk-installing a large UI kit.

