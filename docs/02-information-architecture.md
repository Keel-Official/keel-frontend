# Keel Frontend — Information Architecture

## Product surfaces

Keel has two frontend jobs:

1. **Create immediate product understanding.** A visitor should grasp that quoted price and executable liquidity are different.
2. **Expose inspectable evidence.** A user should be able to move from a risk conclusion into depth, flags, source, methodology, and historical evidence.

The revised direction changes the balance between those jobs on the landing page:

> The landing page should demonstrate the product first, then explain it.

Do not make the homepage feel like a long research article that happens to contain a few UI examples.

## Sitemap

```text
/
├─ /assets
│  └─ /assets/[assetId]
├─ /case-study/ustry
├─ /methodology
└─ /api                optional dedicated API landing/docs entry
```

No login, wallet, portfolio, transaction, or settings area is needed for the current scope.

## Global product hierarchy

Keel should expose information in this order:

```text
Finding
  ↓
Primary metrics
  ↓
Why the finding exists
  ↓
Evidence and uncertainty
  ↓
Methodology / provenance
```

This is more product-like than beginning with methodology and asking the user to derive the conclusion themselves.

## `/` — Landing page

Primary question:

> What does Keel actually do, and can I see it doing that?

The page should answer that visually before asking the visitor to read detailed methodology.

### Required landing surfaces

The homepage should expose recognizable Keel product objects:
- a compact asset-risk result in the hero;
- market snapshot / monitored-asset preview;
- depth and collateral product metrics;
- explainable risk output with triggered and unevaluated states;
- infrastructure flow from Stellar market data to Keel outputs;
- read-only API preview;
- historical Blend/USTRY evidence preview;
- provenance strip.

### Primary actions

- **Explore assets**
- **Read methodology**
- **Open Blend case study**
- **View API**

Do not link prominently to routes that do not exist yet. If a route is not implemented, either implement it before deployment or temporarily remove/downgrade the CTA.

The landing page must still render meaningfully when the live API is unavailable. Use backend-shaped fixtures for product previews when necessary.

## `/assets` — Risk overview

Primary question:

> Which monitored Stellar assets deserve attention, and why?

Core content:
- asset / quote pair;
- risk band + confidence;
- 5% executable depth;
- safe collateral summary;
- key triggered flags;
- visible incomplete-data state;
- search/filter when useful.

Do not make current price the dominant column. Keel is not a price tracker.

The page should feel like a serious risk product, not a crypto token screener.

## `/assets/[assetId]` — Asset detail

Primary question:

> Why is this asset classified this way, and what market evidence supports that result?

Preferred sequence:

1. Asset identity + quote pair.
2. Risk band + confidence.
3. Human-readable key finding.
4. Effective depth at ±2/5/10%, buy and sell separately.
5. Maximum safe collateral.
6. Manipulation cost + reachability.
7. SDEX / AMM contribution and price-source health.
8. Supporting metrics.
9. Triggered / clear / unevaluated interpretation.
10. Warnings.
11. Provenance.
12. Historical trend when available.

A user should never need to visit the methodology page merely to understand what the asset-detail page is claiming.

## `/case-study/ustry` — Blend case study

Primary question:

> What did liquidity evidence show around the known USTRY/Blend incident?

This page is a narrative evidence product, not a generic blog post.

Preferred sequence:
- concise incident context;
- price view versus liquidity view;
- historical chart with event marker;
- depth / manipulation / risk changes over time;
- explicit reconstruction quality and gaps;
- interpretation;
- limitations;
- raw evidence / methodology links.

The visual center of this page should be historical evidence, not a text-only timeline.

## `/methodology` — Explain the model

Primary question:

> What exactly do Keel's measurements and risk labels mean?

This page should translate the backend methodology without duplicating it as a second source of truth.

Include:
- effective depth;
- buy vs sell side;
- SDEX + AMM combination;
- manipulation cost and reachability;
- safe collateral;
- flags and bands;
- full vs partial confidence;
- data-source hierarchy;
- chosen-vs-calibrated threshold disclaimer;
- current methodology version.

Use diagrams and worked product examples where they clarify the model. Avoid turning the page into a wall of prose.

## `/api` — Developer surface

If implemented, this should not be a generic docs placeholder.

Primary question:

> How can a technical consumer retrieve Keel risk evidence?

Show:
- one representative GET request;
- one representative response;
- rate-limit / read-only note;
- OpenAPI link;
- fields that demonstrate provenance;
- no-registration expectation where supported by the backend.

## Global navigation

Preferred desktop direction:

```text
[Keel]        Product   Assets   Case Study   Methodology   API      [Explore Assets]
```

`Product` may scroll to a tangible product-preview section on `/`.

Mobile:
- brand;
- menu;
- one primary CTA;
- no overcrowded navbar.

## Global footer

Include:
- Keel description;
- Assets;
- Blend case study;
- Methodology;
- API/OpenAPI;
- GitHub;
- proof-of-concept / no-SLA note;
- read-only note.

## Page-composition rule

Do not repeat the same marketing composition every section.

Avoid this rhythm:

```text
kicker → large heading → paragraph → generic cards
kicker → large heading → paragraph → generic cards
kicker → large heading → paragraph → generic cards
```

Prefer varied product rhythm:

```text
positioning
→ product object
→ concise explanation
→ dense market preview
→ architecture
→ risk UI
→ developer UI
→ historical evidence
→ provenance
```

Coherence should come from typography, color, spacing, and component semantics — not from making every section structurally identical.
