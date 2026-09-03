# Keel Frontend — Implementation Roadmap

## Principle

Build the communication layer first, then progressively connect the evidence layer.

Do not wait for every backend methodology item to be complete before building the frontend. The API contract and mocks are explicitly intended to support parallel work.

## Phase 0 — Project foundation

Deliver:
- Next.js + TypeScript project;
- Tailwind theme variables;
- fonts;
- lint/typecheck/test commands;
- route groups `(marketing)` and `(app)`;
- basic `SiteHeader`, `PageContainer`, `Button`, `Badge`;
- CI that runs typecheck + lint + unit tests.

Definition of done:
- preview deployment works;
- mobile and desktop shell render cleanly;
- no Keel backend integration required yet.

## Phase 1 — Landing page

Build from `04-landing-page-spec.md`.

Priority:
1. Hero.
2. Price-vs-liquidity explanation.
3. Keel metrics.
4. How it works.
5. Explainable risk / three-state uncertainty.
6. Case-study teaser.
7. Methodology/read-only/reproducibility proof points.
8. Footer/disclaimer.

Definition of done:
- first-time non-Web3 user can describe Keel after reading the page;
- Lighthouse/accessibility basics are healthy;
- no wallet/connect/sign language appears;
- product does not claim production SLA or guaranteed prevention.

## Phase 2 — Contract integration foundation

Deliver:
- generated OpenAPI types;
- `openapi-fetch` client;
- environment variable for API base URL;
- decimal formatting utilities;
- common API error mapping;
- mock fixtures wired into local development/tests.

Add a CI check that regenerates OpenAPI types and fails on an unexpected diff when the backend contract changes.

Important: the backend OpenAPI contract is currently evolving. Treat changes as expected and visible, not as a reason to copy types by hand.

## Phase 3 — Asset overview

Build `/assets` from the list endpoint.

Must correctly display:
- risk band;
- partial confidence;
- flags;
- quote unit;
- zero vs null;
- loading/error/empty states.

Do not optimize filters/search before the basic table is understandable.

## Phase 4 — Asset detail

Use all supplied mock states as acceptance fixtures:
- healthy;
- pool-only;
- no executable price;
- broken book;
- historical/reconstructed.

The screen is not done until every state can render without patching the fixture.

Key acceptance checks:
- no-price HTTP 200 is shown as a finding;
- broken-book price is not shown as trustworthy;
- triggered vs unevaluated flags are separate;
- partial confidence is visible;
- manipulation cost is always paired with reachability;
- provenance is visible;
- decimal strings remain exact for displayed/derived values.

## Phase 5 — Blend/USTRY case study

Build the narrative after the asset-detail semantics are stable, because it reuses many of the same concepts.

Needs:
- historical series;
- explicit data gaps;
- data-source/reconstruction labeling;
- exploit/event marker;
- caveats/limitations;
- links to evidence/methodology.

Do not hardcode the historical date/range from an old mock if the backend's current corrected evidence says otherwise.

## Phase 6 — Methodology page

Build a readable summary driven partly by `/methodology`:
- current version;
- current thresholds;
- calibration note;
- links to full methodology.

Human explanations can be static copy, but active numeric thresholds should come from the API.

## Suggested first-week frontend outcome

If starting today, aim for:

```text
Day 1   project setup + tokens + header/footer
Day 2   landing hero + problem section
Day 3   metrics + how-it-works + risk explanation
Day 4   case-study teaser + methodology/evidence + responsive polish
Day 5   accessibility pass + deployment + OpenAPI client scaffold
```

The objective is a credible public URL quickly, while creating primitives that carry directly into the dashboard.

