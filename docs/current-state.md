# Current State

## Purpose and current focus

Keel is a Next.js frontend for a Stellar liquidity-risk engine. Its core product question is: a quoted price can exist without enough executable liquidity behind it. The current focus is the Phase 1 public landing page at `/`, which explains that distinction and points visitors toward evidence surfaces.

The landing-page design and implementation decisions are recorded in:

- `docs/superpowers/specs/2026-09-03-keel-landing-page-design.md`
- `docs/superpowers/plans/2026-09-03-keel-landing-page.md`
- `PRODUCT.md`

## Workflow and business rules

- Keel is read-only. Do not add authentication, wallet connection, transaction signing, blockchain write flows, or frontend database behavior.
- The landing page is intentionally mostly static and remains useful when the Keel API is unavailable.
- Product communication favors evidence, exact units, visible uncertainty, provenance, accessible text states, and restrained motion. Avoid speculative-crypto styling, hype, production-SLA claims, or guaranteed-prevention claims.
- The backend is a separate source of truth. Before building data UI, read `docs/05-frontend-data-contract.md` and use the backend OpenAPI/methodology semantics. Preserve decimal strings, null versus zero, triggered versus unevaluated flags, partial confidence, reachability, source labels, historical gaps, and provenance.

## Repository, runtime, and deployment boundaries

- Stack: Next.js 16.3.4 App Router, React 19.2.8, TypeScript, Tailwind CSS 4.3.3, and pnpm 11.25.0.
- Current landing implementation lives in `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, and `components/marketing/`.
- The route tree currently contains only the static `/` page and Next's `/_not-found` route. No API client, live dashboard, frontend database, or backend code is present in this repository.
- `/assets`, `/case-study/ustry`, and `/methodology` are planned destinations linked from the landing page but are not implemented yet.
- No `.openai/hosting.json` is present; deployment configuration and a public preview have not been verified.

## Branch and workspace

- Current branch: `master`.
- `HEAD`: `625fde0 Add skills directory to gitignore`.
- Landing-page implementation is in `4d9b4b9 Implement Keel design system and landing page`, with supporting product/docs work in the preceding commits.
- The application tree was clean before this handover edit; `docs/current-state.md` is now the only uncommitted file. No uncommitted application changes are pending.
- The handover-specific files `docs/architecture.md`, `docs/workshop-work-order.md`, and `docs/decisions.md` are absent; the numbered Keel docs are the available project context.

## Verification

Verified on the current checkout:

- `pnpm lint` — passed.
- `node --test tests/landing-page-content.test.mjs` — 4 tests passed.
- `pnpm build` — passed; Next generated static `/` and `/_not-found` routes with no TypeScript or build errors.
- Earlier in-app browser QA at a narrow viewport verified readable hero/content/footer, no visible horizontal overflow, working native mobile navigation, keyboard focus movement, and readable chart/comparison/CTA states.

Not yet verified: Playwright/axe coverage, a wide desktop browser pass, deployment, and the planned destination routes. The browser console showed expected 404s for those not-yet-implemented links during the landing-page QA.

## Open risks and next checks

- Add the planned `/assets`, `/case-study/ustry`, and `/methodology` routes, then replace the currently expected 404s with real evidence flows.
- `app/layout.tsx` references `/og-image.png` for social metadata, but no matching public asset is currently present.
- Before API/data UI work, reconcile the frontend with the backend OpenAPI contract and methodology documents; do not hand-author or simplify risk semantics.
- Add a normal test script and Playwright/axe coverage when interactive/data surfaces are introduced. Re-run wide responsive QA and verify all landing links before public deployment.

No active blocker is known for the static landing page. Deployment and the evidence routes remain future work.
