# Keel Landing Page Design

Status: approved in chat, pending written-spec review  
Date: 3 September 2026

## Goal

Create Keel's first public surface at `/`. A first-time visitor who does not know Stellar, SDEX, AMMs, or oracle terminology should understand within 30 seconds that a quoted price can exist without enough executable liquidity behind it, and should know where to inspect assets, methodology, API material, and the Blend/USTRY case study.

## Audience and register

This is a brand-facing communication surface for Ambassador/SCF reviewers, Stellar ecosystem builders, and prospective technical users. The voice is calm, exact, and accountable. The page is allowed to have a strong point of view, but it must feel like a research instrument rather than a trading terminal or speculative crypto product.

## Visual direction

Use an evidence-led technical-poster composition:

- light research surface with semantic OKLCH tokens;
- deep blue-black or indigo framing for navigation and high-attention panels;
- restrained teal for active evidence and links;
- amber and red reserved for findings that are explicitly labeled;
- borders and typography carry most of the hierarchy, with minimal shadow and no decorative glass or gradients;
- one compact depth-profile visual in the hero and one timeline/evidence composition in the case-study section;
- small technical labels are acceptable for data context, but repeated eyebrow scaffolding and all-caps body copy are not.

The page should feel like a field report translated into a modern web surface: a precise instrument, not a glossy crypto campaign.

## Page structure

### Header

Desktop navigation:

`Keel` · `Product` · `Assets` · `Case Study` · `Methodology` · `Explore assets`

`Product` anchors to the explanatory section on the landing page. The primary CTA points to `/assets`. On mobile, use a native `<details>` menu with a labeled summary button so the route remains a server component and keyboard behavior stays native.

### Hero

Eyebrow: `Liquidity risk intelligence for Stellar`  
Headline: `A price is only as credible as the liquidity behind it.`  
Supporting copy: Keel measures executable market depth, estimates how costly it is to move a market, and surfaces collateral risk before thin liquidity is treated like deep liquidity.

Primary CTA: `Explore assets`  
Secondary CTA: `See the Blend case study`  
Trust line: `Read-only` · `Open methodology` · `No wallet connection`

The right side contains a labeled, static `Market depth profile` visualization. It compares two markets at the same quoted price while showing one with broad executable depth and one with a sharp thin-market drop-off. The visual is illustrative and must be labeled as such, not presented as live data.

### Problem: price versus liquidity

Heading: `Price is not liquidity.`

Use a comparison layout with two columns, not identical feature cards. Both assets show `Quoted price: 10`; the deep example shows `5% depth: 500,000 XLM`; the thin example shows `5% depth: 800 XLM`. A supporting statement makes the implication explicit: the same quoted price can imply very different collateral risk.

### What Keel measures

Use four differentiated modules:

1. `Effective liquidity depth`: quote-asset value available before the market moves ±2%, ±5%, and ±10%.
2. `Manipulation resistance`: notional required to approach defined price targets, paired with whether the target is reachable.
3. `Maximum safe collateral`: a conservative recommendation derived from executable liquidity and manipulation constraints.
4. `Supporting risk signals`: spread, source divergence, genuine activity, and holder concentration where available.

The modules should use varied layouts or icon placement so they do not become a repeated icon-heading-card grid.

### How it works

Show one real sequence with three stages, the only deliberate numbered sequence on the page:

1. `Observe the market`: Stellar market data from SDEX, AMMs, and supporting observations.
2. `Apply the methodology`: depth, manipulation, collateral, and risk flags.
3. `Publish evidence`: dashboard findings, API material, and historical case studies.

Keep the copy understandable without blockchain internals.

### Explainable risk

Heading: `No mystery score. Every flag can be inspected.`

Use a prominent example panel with textual state labels:

- `CRITICAL` with an explicit risk icon and label;
- `Triggered`: `Zero depth within 2%`, `Manipulation is cheap`;
- `Not evaluated`: `Holder concentration`;
- supporting note: `Partial data never means clear data.`

The visual must distinguish triggered, not evaluated, and unavailable states through labels, structure, and color. It must not invent a risk band or imply this is live data.

### Case-study teaser

Heading: `A known incident, replayed as evidence.`

Introduce the February 2026 USTRY/Blend incident as the primary historical test case. Say that the case study asks whether market-depth and manipulation metrics would have exposed structural risk before the quoted price was treated as large collateral value. Do not claim prevention. Use a restrained horizontal timeline with a clearly labeled event marker and a CTA to `/case-study/ustry`.

### Built to be checked

Three proof points:

- `Traceable`: results carry ledger sequence, methodology version, and source.
- `Reproducible`: methodology and evidence are public and reviewable.
- `Read-only`: Keel never signs or submits a Stellar transaction.

Supporting links point to `/methodology`, `/api`, and a GitHub placeholder URL. Links should have standalone names.

### Final CTA and footer

Heading: `See the market behind the price.`  
Actions: `Explore assets`, `Read methodology`

Footer includes Keel's short description, Stellar context, Methodology, API/OpenAPI, GitHub, and the statements `Proof of concept, no production SLA` and `Keel is read-only; it never signs or submits transactions.` Include the disclaimer that Keel should not be the sole basis for a financial decision.

## Component and file boundaries

Keep the first milestone focused:

- `app/page.tsx`: static landing composition and semantic content;
- `app/layout.tsx`: title, description, Open Graph metadata, and selected fonts;
- `app/globals.css`: global reset, OKLCH tokens, typography, responsive layout helpers, and reduced-motion rules;
- optional `components/marketing/` files only if a real component boundary improves readability during implementation;
- no API client, query layer, dashboard route, auth, wallet integration, or external UI kit added for this page.

The page should be a Server Component. Prefer CSS and semantic HTML for layout and motion. Use inline SVG for the two bespoke data illustrations; no raster asset is needed because the brief is evidence-visual rather than image-led.

## Interaction, accessibility, and responsive behavior

- Include a skip link and visible `:focus-visible` treatment.
- Preserve logical `h1` → `h2` → `h3` hierarchy.
- All buttons/links use verb + object labels and meet a 44px minimum target.
- Decorative SVG paths are `aria-hidden`; the adjacent prose carries their meaning.
- Risk state includes text and icon semantics, never color alone.
- Add `prefers-reduced-motion: reduce` to disable hero line motion and timeline reveals.
- Test at 375px, 768px, 1024px, and 1440px; avoid horizontal overflow.
- On narrow screens, stack hero copy/visual, comparison columns, and proof points. Keep the visual reading order as conclusion, reason, evidence, provenance.

## Rendering and SEO

The landing page is static content and should prerender through the App Router. Use metadata in `app/layout.tsx` with a Keel-specific title and description, plus Open Graph and Twitter card fields referencing an OG-image placeholder path that can be supplied later. Do not fetch the API for the landing page or add an availability indicator that could make a static page brittle.

## Verification

Before completion:

1. run the repository's `pnpm lint` script;
2. run `pnpm build` for the structural Next.js change;
3. inspect the rendered page at desktop and 375px mobile widths;
4. verify keyboard focus, native mobile menu behavior, reduced motion, and no horizontal overflow;
5. review the final diff for unrelated changes and confirm there is no speculative, wallet, or production-SLA language.

## Decisions and non-goals

- Use the brief's light-first institutional direction over the UI search's generic vibrant block recommendation.
- Use static illustrative data only; live API-backed landing content is out of scope.
- Do not add a live `/health` indicator until the API contract and failure behavior are ready.
- Do not claim that Keel prevents the USTRY/Blend incident or guarantees financial safety.
