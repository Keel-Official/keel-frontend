# AGENTS.md

## Mission

This is the Keel frontend: a Next.js interface for a Stellar liquidity-risk engine.

Core product idea:

> An oracle answers “what is the price?” Keel answers “what volume can that price actually support?”

Build Keel like **modern financial infrastructure with inspectable risk output**.

Do not turn it into:
- a speculative crypto app;
- a research report converted to HTML;
- a pitch deck;
- a generic SaaS landing page;
- a trading terminal centered on price speculation.

## Use the docs as the map

Read the docs relevant to the task.

- `docs/00-README.md` — source-of-truth hierarchy and revised product/design direction.
- `docs/01-tech-stack.md` — stack, dependency restraint, repository shape.
- `docs/02-information-architecture.md` — routes, product surfaces, page responsibilities.
- `docs/03-design-system.md` — visual system and product-first art direction.
- `docs/04-landing-page-spec.md` — **primary brief for landing-page work**.
- `docs/05-frontend-data-contract.md` — **required before any data UI or data-like marketing preview**.
- `docs/06-component-inventory.md` — preferred component boundaries.
- `docs/07-implementation-roadmap.md` — recommended build order.

If docs conflict or are ambiguous, report the conflict instead of silently inventing a rule.

## Backend boundary

The backend is a separate source of truth. Do not modify backend code unless the user explicitly asks.

Frontend data semantics must follow backend OpenAPI and methodology. Never invent new risk classifications or collapse states that the backend intentionally distinguishes.

Do not hardcode methodology configuration such as version, thresholds, oracle window, critical delta, or flag assumptions when those values are available from the API.

## Stack

Follow `docs/01-tech-stack.md`.

Primary stack:
- Next.js App Router + React + TypeScript;
- Tailwind CSS / semantic CSS variables;
- `next/font` for actual font loading;
- Radix/shadcn primitives only as needed;
- `openapi-typescript` + `openapi-fetch`;
- TanStack Query for live dashboard server state;
- `decimal.js` for exact financial arithmetic;
- Recharts only when chart complexity justifies it;
- Lucide React for icons;
- Vitest + Testing Library;
- Playwright.

Avoid unnecessary dependencies and visual-effect libraries.

## Next.js conventions

Prefer Server Components by default. Use Client Components only for real client-side needs: interaction, effects, browser APIs, or client query hooks.

The landing page should remain useful if the Keel API is unavailable, but product previews should use backend-shaped fixtures rather than invented arbitrary data.

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
docs/                   product/design/engineering guidance
tests/                   unit/component tests
e2e/                     Playwright tests
```

Do not create a giant normalized frontend Keel model.

## Non-negotiable data rules

Before building data-driven UI **or data-like landing previews**, read `docs/05-frontend-data-contract.md`.

At minimum preserve:
- decimals as exact strings / `Decimal` for arithmetic;
- `null` vs zero;
- no-price HTTP 200 as a finding;
- triggered vs unevaluated;
- band + bandConfidence together;
- manipulation cost + reachability together;
- reconstructed/lower-bound source semantics;
- quote units;
- discontinuous historical gaps;
- provenance;
- contract-compatible API examples.

Do not invent pretty fixture numbers that create impossible risk combinations.

## Design direction

Follow `docs/03-design-system.md`.

### The core rule

**Show Keel before explaining Keel.**

Major pages — especially the landing page — should use recognizably Keel-specific product objects:
- asset risk results;
- depth ±2/5/10%;
- safe collateral;
- manipulation cost/reachability;
- source contribution;
- market snapshot;
- flags and confidence;
- API response;
- historical evidence;
- provenance.

Do not use a generic educational chart as the hero's main object.

### Avoid repetitive marketing composition

Do not build the whole landing page as repeated:

```text
small kicker
large headline
paragraph
generic cards
```

Vary density and section structure deliberately.

Prefer the rhythm defined in `docs/04-landing-page-spec.md`:

```text
position → product → concept → market → metrics → engine
→ risk → API → historical evidence → provenance → CTA
```

### Whitespace

Whitespace should create focus. Do not surround a small product preview with large empty areas just to make the page feel premium.

### Typography

Do not let oversized headings make body/product text unreadably small. Product evidence must remain visually important.

Load the actual selected fonts rather than relying on unrelated system fallbacks under misleading CSS variable names.

### Color

Keep a coherent light/navy/teal system with semantic risk colors.

Do not introduce unrelated large purple sections unless purple is intentionally established as part of the brand system.

Risk colors are semantic, not decorative.

### Shape

Prefer thin borders, 12–20px product radii where appropriate, and subtle diffuse elevation.

Do not use hard-offset poster shadows as the default card language.

## Landing-page work

For landing tasks, `docs/04-landing-page-spec.md` is the primary brief.

Required direction includes:
- `HeroProductPreview` rather than `HeroDepthVisual` as the main hero object;
- `MarketSnapshot`;
- asymmetric `MetricBento`;
- infrastructure `ArchitectureFlow`;
- substantial explainable-risk result;
- `ApiPreview`;
- historical `BlendCasePreview` with chart/event marker;
- `ProvenanceStrip`;
- coherent final CTA/footer.

Do not preserve old sections merely because they already exist if they conflict with the revised brief.

However, preserve useful concepts where they fit:
- the old deep/thin illustration can move to “Price is not liquidity”;
- triggered/unevaluated risk semantics should remain;
- existing correct copy may be reused where appropriate.

## Route integrity

Never ship a prominent CTA or navigation item to a route that does not exist.

Before finalizing landing navigation, verify actual routes under `app/`.

If a target surface is not implemented:
- implement it if in scope; or
- remove/downgrade the link temporarily.

## Components

Build abstractions from real screens, not speculative reuse.

Marketing should compose Keel domain components where practical.

Prefer:

```tsx
<RiskBadge band={band} bandConfidence={bandConfidence} />
```

over lossy booleans such as `safe` or `dangerous`.

Centralize decimal formatting, units, asset identity, flags, null states, provenance, and source labels.

## Accessibility

Risk must never be communicated by color alone.

Keep:
- WCAG 2.2 AA target;
- visible focus;
- readable product/body text;
- chart text equivalents;
- reduced motion;
- practical touch targets;
- semantic heading hierarchy.

## Verification

Before finishing a change:

1. inspect `package.json` and use actual scripts;
2. run lint/format checks;
3. run typecheck if configured;
4. run relevant tests;
5. run production build for structural Next.js changes;
6. run relevant Playwright flows when available;
7. audit routes/CTAs;
8. review desktop and mobile screenshots against `03-design-system.md` and `04-landing-page-spec.md`;
9. review final diff for unrelated changes.

For data UI, test more than the happy path: no executable price, broken/extreme-spread market, partial confidence, unevaluated flags, reconstructed source, null vs zero, and API failures.

Do not weaken tests merely to make a patch green.

## Visual acceptance questions

For major frontend work, explicitly check:

1. Can a visitor see a Keel product object above the fold?
2. Does the page contain enough Keel-specific visual information to avoid feeling generic?
3. Are sections visually varied rather than repeated templates?
4. Is product data readable relative to headings?
5. Does whitespace help focus rather than create emptiness?
6. Does the case study show evidence rather than only text?
7. Do API examples match the current contract?
8. Are all prominent links real?

## Change discipline

Keep work scoped to the user's request. Inspect nearby patterns before editing and avoid unrelated rewrites.

Documentation edits should represent intentional product/design decisions. Do not change docs merely to excuse an implementation shortcut.

When finishing, state what changed, what was validated, and unresolved contract/design questions.

## Default judgment

When two UI choices are plausible, prefer the one that:

1. makes Keel feel more tangible as a product;
2. preserves provenance and uncertainty;
3. avoids generic fintech/crypto tropes.

For Keel, false confidence is a product bug — and a landing page that never visibly shows the product is a communication bug.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
