# Keel Frontend — Product, Design & Engineering Docs

Status: active working baseline  
Updated: 9 September 2026  
Target repository: `Keel-Official/keel-frontend`

These docs define how Keel should be presented and implemented on the frontend. The previous direction produced a page that was clean but too editorial, too explanatory, and too light on visible product. This revision changes the design target deliberately.

## Backend sources of truth

When frontend docs disagree with the backend, use this order:

1. `keel-backend/docs/api/keel-openapi.yaml` — frontend-facing API contract.
2. `keel-backend/docs/methodology/09-flags-and-bands.md` — risk flags, bands, and confidence semantics.
3. `keel-backend/docs/methodology/*` — metric meaning and methodology.
4. `keel-backend/docs/api/Keel_PRD.md` — product goals and required dashboard capabilities.
5. `keel-backend/docs/api/mocks/*.json` — concrete render fixtures generated from the API contract.

Do not hardcode methodology thresholds, methodology version numbers, oracle-window values, risk-flag lists, or assumptions that can be read from the API.

## Product sentence

> An oracle answers “what is the price?” Keel answers “what volume can that price actually support?”

The frontend must make that distinction obvious within seconds.

## Revised product-design direction

Keel should feel like **modern financial infrastructure with inspectable risk output**.

The product should not primarily look like:
- a research paper;
- a pitch deck;
- a documentation site;
- a speculative crypto dashboard;
- a generic SaaS landing page made from repeated headline + paragraph + card sections.

It should feel closer to a serious fintech infrastructure product whose outputs happen to be analytical and evidence-driven.

### Core shift

The previous page mostly followed this pattern:

```text
Explain → explain → explain → show a little → explain
```

The new direction is:

```text
Position → show the product → explain one concept → show market data
→ show the engine → show risk output → show API → show historical evidence
→ prove provenance
```

The visitor should see Keel before being asked to understand Keel.

## Reference roles

References are not templates to copy. Each is useful for a different reason:

- **Paycrest** — infrastructure storytelling and system-level product framing.
- **Mural Pay** — developer/API presentation and tangible product surfaces.
- **BlindPay** — clean fintech infrastructure language and compact technical storytelling.
- **Partna** — embedding real-looking product/API UI directly into marketing pages.
- **SpherePay** — verification, trust, and multiple product surfaces under one infrastructure story.
- **Meld** — decision-output and ranking patterns relevant to risk findings.
- **Swapped** — dashboard preview and data-product presentation.
- **Conduit** — architecture/network storytelling.

Do not imitate brand colors, logos, or exact layouts from these references.

## Documents

- `01-tech-stack.md` — frontend stack, dependency policy, implementation constraints.
- `02-information-architecture.md` — page map, page responsibilities, and product-surface hierarchy.
- `03-design-system.md` — revised visual direction, density, typography, product-object rules, states, accessibility.
- `04-landing-page-spec.md` — product-first landing page brief and wireframe.
- `05-frontend-data-contract.md` — rules for consuming Keel API data safely.
- `06-component-inventory.md` — reusable component boundaries for product and marketing surfaces.
- `07-implementation-roadmap.md` — build order that prioritizes tangible product surfaces before explanatory polish.

## Product-design principles

### Demonstration before explanation

Do not spend a full viewport explaining a metric if the page can first show the metric in a believable product surface.

### Product objects over decorative illustrations

Hero visuals, major sections, and case-study sections should use recognizable Keel artifacts: asset findings, depth ladders, source breakdowns, provenance, API responses, historical charts. Generic abstract crypto graphics and purely educational diagrams should never be the main hero object.

### Evidence remains first-class

`ledgerSeq`, methodology version, source, confidence, warnings, and reconstruction status are part of the product — not debug metadata.

### Clarity without emptiness

Whitespace is useful, but large empty areas must not substitute for visual hierarchy. Important product sections should contain enough information to feel tangible and alive.

### Preserve semantic precision

Exact units, null vs zero, triggered vs unevaluated, and full vs partial confidence remain non-negotiable.

### One visual language, varied rhythm

The site should be coherent but not repetitive. Alternate between spacious positioning, dense product UI, architecture flow, dark technical sections, charts, and concise proof strips.

## Final test

A good Keel page should make a visitor think:

> “This is a real risk infrastructure product, and I can inspect how it reached its conclusions.”

Not merely:

> “This is a nicely designed explanation of liquidity risk.”
