# Keel Frontend — Implementation Roadmap

## Principle

Build a tangible product surface early, then use the landing page to demonstrate that product.

The previous sequence built the communication layer before enough product UI existed, which encouraged an editorial landing page. The revised order intentionally brings product-shaped components and contract fixtures forward.

## Phase 0 — Foundation

Deliver:
- Next.js + TypeScript project;
- Tailwind/CSS semantic tokens;
- actual fonts loaded with `next/font`;
- lint/typecheck/test scripts;
- basic site shell;
- CI;
- valid metadata and OG asset path.

Definition of done:
- preview deployment works;
- fonts actually load;
- mobile/desktop shell is stable;
- no broken metadata/social-image references.

## Phase 1 — Contract + fixture foundation

Do this **before finalizing the landing page**.

Deliver:
- generated OpenAPI types;
- `openapi-fetch` client scaffold;
- decimal formatting utilities;
- backend mock fixtures available locally;
- typed fixture helpers for landing/product previews;
- common risk/source/provenance formatting.

Why this moved earlier:

The landing page now contains real-looking Keel outputs. Building those from backend-shaped fixtures prevents the marketing layer from inventing a parallel product.

Definition of done:
- healthy, no-price, broken-book, pool-only, and historical fixtures can be imported/rendered;
- exact decimal strings remain exact;
- risk confidence and unevaluated semantics are preserved.

## Phase 2 — Core domain components

Build the product language before composing the homepage.

Priority:
1. `RiskBadge`
2. `MetricValue`
3. `DepthLadder`
4. `LiquiditySourceBreakdown`
5. `SafeCollateralCard`
6. `FlagList`
7. `ProvenanceStrip`
8. compact asset row/card

Definition of done:
- components render several backend fixture states;
- no hardcoded methodology assumptions;
- mobile and desktop variants are usable;
- risk is never color-only.

## Phase 3 — Landing page redesign

Build from `04-landing-page-spec.md`.

Priority:
1. Product-led hero.
2. Price-vs-liquidity explainer.
3. Market Snapshot.
4. Asymmetric metric bento.
5. Architecture flow.
6. Explainable-risk demo.
7. API preview.
8. Blend historical preview.
9. Provenance strip.
10. Final CTA/footer.

### Definition of done

The page is not done merely because every section in the spec exists.

It must pass these product tests:
- first viewport shows Keel itself, not only an abstract explanation;
- visitor can identify at least one concrete Keel output without scrolling far;
- section composition varies across the page;
- body/product text remains readable;
- no giant empty areas surrounding tiny product objects;
- no prominent CTA points to a missing route;
- API preview matches current contract;
- case-study teaser contains actual historical visualization/evidence;
- provenance is shown as product data, not generic marketing claims.

## Phase 4 — Asset overview

Build `/assets` from the list endpoint.

Must correctly display:
- risk band;
- confidence;
- flags;
- quote unit;
- zero vs null;
- loading/error/empty states.

Reuse `MarketSnapshot` semantics/components where practical rather than designing a completely different table language.

Definition of done:
- route exists before homepage CTA is promoted;
- desktop table and mobile cards both work;
- LOW/partial is visibly different from LOW/full.

## Phase 5 — Asset detail

Use all supplied mock states as acceptance fixtures:
- healthy;
- pool-only;
- no executable price;
- broken book;
- historical/reconstructed.

Key checks:
- no-price HTTP 200 is a finding, not error;
- broken-book price is visibly unreliable;
- triggered vs unevaluated flags remain separate;
- manipulation cost stays paired with reachability;
- provenance is visible;
- decimal strings remain exact.

The hero/product-preview components should now feel like compact relatives of this page, not a separate mockup style.

## Phase 6 — Blend/USTRY case study

Build the full narrative evidence page.

Needs:
- historical series;
- explicit data gaps;
- reconstruction/source labeling;
- exploit/event marker;
- concise interpretation;
- caveats;
- raw evidence/methodology links.

The landing-page `BlendCasePreview` should reuse the same chart/evidence language in compact form.

## Phase 7 — Methodology page

Build a readable methodology translation driven partly by `/methodology`:
- current version;
- thresholds;
- calibration note;
- effective depth;
- manipulation reachability;
- collateral logic;
- risk flags/bands;
- source hierarchy;
- worked examples.

Avoid a long wall of prose. Reuse product examples and diagrams.

## Phase 8 — API/developer surface

If a dedicated `/api` route is useful, implement it with:
- representative request;
- representative response;
- OpenAPI link;
- read-only behavior;
- rate-limit/availability notes supported by backend docs;
- provenance explanation.

Do not promote `/api` as a primary nav route until it exists.

## Phase 9 — Polish, accessibility, and motion

Only after product hierarchy is working:
- responsive refinement;
- keyboard/focus pass;
- axe/Playwright checks;
- subtle hover/reveal interactions;
- reduced-motion support;
- performance review;
- social preview QA;
- visual regression screenshots if useful.

Do not use animation to rescue weak sections.

## Recommended immediate redesign sequence

For the current repository, where the old landing page already exists:

```text
1. Preserve a screenshot/reference of the old page.
2. Add/load real fonts.
3. Build typed landing fixtures from backend mocks.
4. Build HeroProductPreview.
5. Build MarketSnapshot.
6. Replace equal metric grid with MetricBento.
7. Replace numbered process columns with ArchitectureFlow.
8. Expand ExplainableRiskDemo using real semantics.
9. Add ApiPreview.
10. Replace text-only case-study timeline with historical chart preview.
11. Replace generic proof columns with ProvenanceStrip.
12. Unify CTA/footer color with brand palette.
13. Remove dead/missing-route CTAs or implement routes.
14. Run desktop/mobile visual QA against `03-design-system.md`.
```

## Suggested short sprint

```text
Day 1  contract fixtures + fonts + core preview primitives
Day 2  hero + market snapshot
Day 3  metric bento + architecture flow + risk demo
Day 4  API preview + Blend historical preview + provenance
Day 5  responsive polish + accessibility + build + route/CTA audit
```

## Final acceptance question

Do not ask only:

> “Does the landing page look polished?”

Ask:

> “Does the landing page make Keel feel like a real financial infrastructure product whose findings can be inspected?”

That is the revised standard.
