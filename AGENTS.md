# AGENTS.md

## Mission

This is the Keel frontend: a Next.js interface for a Stellar liquidity-risk engine.

Core product idea:

> An oracle answers “what is the price?” Keel answers “what volume can that price actually support?”

Build Keel like an institutional risk/research product, not a speculative crypto app.

## Use the docs as the map

Read only the docs relevant to the task. Do not turn this file into a second product manual.

- `docs/00-README.md` — source-of-truth hierarchy and product principles.
- `docs/01-tech-stack.md` — stack, dependency policy, repository shape.
- `docs/02-information-architecture.md` — routes and page responsibilities.
- `docs/03-design-system.md` — visual system, semantic tokens, accessibility.
- `docs/04-landing-page-spec.md` — landing-page structure and copy direction.
- `docs/05-frontend-data-contract.md` — **required before any API/data UI work**.
- `docs/06-component-inventory.md` — preferred component boundaries.
- `docs/07-implementation-roadmap.md` — recommended build order.

If docs conflict or are ambiguous, report the conflict instead of silently inventing a rule.

## Backend boundary

The backend is a separate source of truth. Do not modify backend code unless the user explicitly asks.

Frontend data semantics must follow the backend OpenAPI contract and methodology. Never invent new risk classifications or “clean up” states that the backend intentionally distinguishes.

Do not hardcode methodology configuration such as version, thresholds, oracle window, critical delta, or flag assumptions when those values are available from the API.

## Stack

Follow `docs/01-tech-stack.md`:

- Next.js App Router + React + TypeScript
- Tailwind CSS
- shadcn/ui / Radix primitives only as needed
- `openapi-typescript` + `openapi-fetch`
- TanStack Query for live dashboard server state
- `decimal.js` for exact financial arithmetic
- Recharts for charts
- Lucide React for icons
- Vitest + Testing Library
- Playwright for E2E

Use the existing lockfile/package manager. If none exists, prefer pnpm.

Avoid unnecessary dependencies and abstractions.

## Next.js conventions

Prefer Server Components by default. Use Client Components only for real client-side needs: interaction, effects, browser APIs, or client query hooks.

The landing page should be mostly static and must remain useful when the Keel API is unavailable.

Do not add auth, wallet connection, Stellar SDK, transaction signing, a frontend database, or blockchain write flows. Keel is read-only.

## Preferred structure

```text
app/                    routes + page composition
components/ui/          generic primitives
components/marketing/   landing sections
components/keel/        Keel domain components
lib/api/                generated schema, client, queries
lib/decimal/            exact decimal helpers
lib/format/             display formatting
lib/risk/               presentation-only risk helpers
styles/                 global styles/tokens
docs/                   product/design/engineering guidance
tests/                   unit/component tests
e2e/                     Playwright tests
```

Do not create a giant normalized frontend Keel model. Prefer backend-shaped data or small explicit view models that preserve meaning.

## Non-negotiable data rules

Before building data-driven UI, read `docs/05-frontend-data-contract.md`.

At minimum preserve these rules:

- Decimal amounts arrive as strings. Never use `parseFloat`, unary `+`, or `Number()` for exact Keel arithmetic.
- `null` is unknown/unavailable; zero is a real measurement. Never conflate them.
- HTTP 200 + `priceSource: "none"` is a CRITICAL finding, not an application error.
- `flags` and `unevaluatedFlags` are different states.
- `bandConfidence: "partial"` must be visible; LOW/partial is not equivalent to LOW/full.
- Manipulation `cost` must be interpreted together with `reachable`.
- `trades-implied` is a lower bound, not equivalent to direct Horizon/Hubble data.
- Preserve quote units; do not silently convert results to USD.
- Historical gaps must stay visually discontinuous.
- Surface provenance where relevant: ledger, methodology version, source, timestamps, warnings, staleness.

If a backend mock cannot be rendered without editing its shape, raise a contract question instead of patching the fixture locally.

## Design rules

Follow `docs/03-design-system.md`.

Prefer evidence, clarity, restrained motion, visible uncertainty, precise units, and semantic tokens.

Avoid neon crypto aesthetics, hype copy, price-speculation framing, wallet patterns, or claims of guaranteed exploit prevention / production SLA / financial certainty.

Risk must never be communicated by color alone.

## Components

Build abstractions from real screens, not speculative reuse.

Preserve domain semantics in component APIs. Prefer:

```tsx
<RiskBadge band={band} bandConfidence={bandConfidence} />
```

over lossy booleans such as `safe` or `dangerous`.

Centralize decimal formatting, units, asset identity, flags, null states, provenance, and source labels instead of formatting them ad hoc per page.

## Current landing-page work

For landing-page tasks, use `docs/04-landing-page-spec.md` as the primary brief.

The first-time visitor should understand within seconds that a quoted price can exist without enough executable liquidity behind it.

Keep the primary calls to action oriented toward evidence: assets, case study, methodology, and API material.

## Verification

Before finishing a change:

1. inspect `package.json` and use the repository's actual scripts;
2. run relevant lint/format checks;
3. run typecheck if configured;
4. run relevant unit/component tests;
5. run a production build for structural Next.js changes;
6. run relevant Playwright flows when available;
7. review the final diff for unrelated changes.

For data UI, test more than the happy path: no executable price, broken/extreme-spread market, partial confidence, unevaluated flags, reconstructed source, null vs zero, and API failures.

Do not weaken tests merely to make a patch green.

## Change discipline

Keep work scoped to the user's request. Inspect nearby patterns before editing and avoid unrelated rewrites.

Do not change `docs/` just to make implementation match the code. Documentation edits should represent an intentional product/design decision.

When finishing, state what changed, what was validated, and any unresolved contract/design questions.

## Default judgment

When two UI choices are plausible, prefer the one that preserves provenance and uncertainty.

For Keel, false confidence is a product bug.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
