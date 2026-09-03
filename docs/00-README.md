# Keel Frontend — Initial Product & Design Docs

Status: initial working draft  
Prepared: 3 September 2026  
Target repository: `Keel-Official/keel-frontend`  

These files are an initial product/design/engineering baseline for Keel's frontend. They are intentionally small enough to change as the product becomes clearer, while being strict about the parts already defined by the backend contract.

## Backend sources of truth

When these docs disagree with the backend, use this order:

1. `keel-backend/docs/api/keel-openapi.yaml` — frontend-facing API contract.
2. `keel-backend/docs/methodology/09-flags-and-bands.md` — risk flags, bands, and confidence semantics.
3. `keel-backend/docs/methodology/*` — metric meaning and methodology.
4. `keel-backend/docs/api/Keel_PRD.md` — product goals and required dashboard capabilities.
5. `keel-backend/docs/api/mocks/*.json` — concrete render fixtures generated from the API contract.

Do not hardcode methodology thresholds, methodology version numbers, oracle-window values, risk-flag lists, or assumptions that can be read from the API. The backend contract has already changed during the sprint, and the frontend should be designed to absorb those changes safely.

## Product sentence

> An oracle answers “what is the price?” Keel answers “what volume can that price actually support?”

The frontend should make that difference understandable within seconds, even to someone who has never used Stellar or a DeFi lending protocol.

## Documents

- `01-tech-stack.md` — recommended frontend stack and why.
- `02-information-architecture.md` — page map and navigation model.
- `03-design-system.md` — visual direction, tokens, typography, states, accessibility.
- `04-landing-page-spec.md` — landing-page content, hierarchy, copy direction, wireframe.
- `05-frontend-data-contract.md` — rules for consuming Keel API data safely.
- `06-component-inventory.md` — initial reusable component set.
- `07-implementation-roadmap.md` — practical build order from landing page to dashboard.

## Design principle

Keel should look like a **risk/research product**, not a speculative crypto app.

Prefer:
- evidence over hype;
- readable explanations over jargon;
- exact units over decorative dollar conversions;
- visible uncertainty over false confidence;
- restrained motion over flashy animation;
- traceability over visual density.

