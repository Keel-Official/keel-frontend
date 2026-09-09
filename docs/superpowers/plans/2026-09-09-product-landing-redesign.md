# Product landing redesign implementation plan

**Goal:** Implement the revised landing brief with inspectable, contract-backed Keel output.

**Architecture:** Keep the page server rendered and independent of API availability. Local copies of backend mocks satisfy generated OpenAPI types; small domain components preserve amounts, confidence, sources, and reachability. Client code is limited to mobile navigation, copy controls, and progressive motion.

**Tech stack:** Next.js App Router, React, semantic CSS, next/font/local, decimal.js, openapi-typescript/openapi-fetch, Lucide, Vitest, Testing Library, Playwright.

**Spec:** `docs/04-landing-page-spec.md`, with `03-design-system.md` and `05-frontend-data-contract.md`.

## Constraints and decisions

- Work in the existing checkout; preserve the pre-existing conflicted Git index for AGENTS.md and untracked current-state snapshot. Do not commit or change backend files.
- User authorized independent routine decisions and implementation. The revised docs replace the older editorial design.
- Follow Keel's navy/teal palette, Manrope/JetBrains typography, restrained motion, and Lucide icons where generic landing skill rules differ.
- Primary action: Explore assets, targeting the on-page market snapshot. Methodology/API/history links target implemented sections or locally served source documents. No speculative application routes.
- Backend history mock dates are in May 2026, outside the February incident. The actual February daily trade CSV was located during implementation; use its observed within-leg movements for the case chart, with missing observations disconnected and the incident marked on 22 February. Do not treat observed movements as executable depth or advance warning. Keep the May mock unchanged for contract tests.
- Public previews are explicitly samples, never live measurements. No invented risk bands, sources, or fixture values.

## Tasks

- [ ] Contract foundation: copy unchanged OpenAPI and generated JSON mocks to public evidence assets; generate `lib/api/schema.d.ts`; add typed fixture exports and API client factory.
- [ ] Tests first: cover exact decimal formatting beyond Number precision, null versus zero, source contribution with zero totals, all four cost/reachability states, and gap-aware chart segmentation.
- [ ] Domain UI: add RiskBadge, MetricValue, AssetIdentity, DepthLadder, source breakdown, FlagList, and ProvenanceStrip. Render healthy, pool-only, no-price, broken-book, and historical examples in component tests.
- [ ] Hero and concept: replace the old hero with the selected headline and large USDC/XLM result. Use the explicitly illustrative deep/thin bars only in the concept section.
- [ ] Product sections: implement MarketSnapshot, asymmetric MetricBento, ArchitectureFlow, and a substantial broken-book risk result.
- [ ] Evidence sections: implement contract-compatible API excerpt, gap-aware history preview with separate incident context, compact provenance, and contextual FAQ.
- [ ] Shell: responsive navigation with real section destinations, coherent final CTA/footer, actual local fonts, generated social image, branded icon and 404.
- [ ] Verification: run unit/component tests, lint, typecheck and production build; verify all prominent links; run desktop/mobile Playwright and axe; inspect screenshots and final diff.

## Acceptance checks

`pnpm test` exercises semantics and rendered components; `pnpm lint`, `pnpm typecheck`, and `pnpm build` check source and framework integration. `pnpm test:e2e` checks navigation, responsive overflow, font loading, accessibility, sample labeling, raw evidence routes, and social image availability. Screenshots at desktop and mobile widths must show readable product objects, varied composition, and no clipped evidence.
