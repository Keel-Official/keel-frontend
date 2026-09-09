# Keel Frontend — Landing Page Specification

## Goal

A first-time visitor should understand Keel in under 30 seconds **because they can see what the product outputs**, not because they have read several explanatory sections.

The page should communicate:

1. A quoted price does not tell you how much the market can actually absorb.
2. Keel measures executable depth, manipulation resistance, collateral capacity, and explainable risk.
3. Keel is a real product surface: assets, API, methodology, and historical evidence are inspectable.
4. Keel is permanently read-only.
5. Every important conclusion can be traced to source, ledger, methodology, and confidence.

## Primary audience

Optimize for:
- Ambassador/Instawards reviewer;
- SCF reviewer;
- Stellar ecosystem builder;
- protocol/vault/RWA technical evaluator.

The page must remain understandable to non-Web3 visitors, but do not simplify it into a generic educational landing page.

## Art-direction rule

The page should feel like **modern fintech infrastructure with analytical outputs**.

Do not build the page as a sequence of oversized headings plus explanatory text and generic cards.

The intended rhythm is:

```text
Position
→ Show product
→ Explain one concept
→ Show market snapshot
→ Show core product metrics
→ Show engine flow
→ Show explainable risk
→ Show API
→ Show historical evidence
→ Show provenance
→ CTA
```

## Section 1 — Hero

### Eyebrow

`Liquidity risk intelligence for Stellar`

### Primary headline

**Know how much a price can actually support.**

Alternative line may remain available for secondary usage:

**A price is only as credible as the liquidity behind it.**

### Supporting copy

Keel measures executable market depth, manipulation resistance, and collateral risk for Stellar assets — then exposes the evidence behind each finding.

### CTAs

Primary: **Explore assets**  
Secondary: **Read methodology**

Optional tertiary text link: **See the Blend case study**

Trust line:

`Read-only · Open methodology · No wallet connection`

### Hero visual — required

The hero visual must be a **product result**, not an educational chart.

Preferred example:

```text
┌────────────────────────────────────────────┐
│ USDC / XLM                         LOW     │
│                              FULL CONF.    │
├────────────────────────────────────────────┤
│ Executable depth                           │
│ ±2%                 82,430 XLM             │
│ ±5%                194,820 XLM             │
│ ±10%               421,090 XLM             │
│                                            │
│ Liquidity sources                          │
│ SDEX  ████████████ 72%                     │
│ AMM   █████        28%                     │
│                                            │
│ Safe collateral          120,400 XLM       │
├────────────────────────────────────────────┤
│ Ledger 57938192 · Method v1.x · Horizon    │
└────────────────────────────────────────────┘
```

Use contract-compatible fixture data. If data is illustrative, label it clearly without making the visual feel fake.

### Do not

- use the old deep-market/thin-market line chart as the main hero object;
- use blockchain/coin/globe decoration;
- use a generic laptop mockup containing the same page;
- fill the hero with empty space around a small visual.

## Section 2 — Price is not liquidity

Heading:

**Price is not liquidity.**

Purpose: explain exactly one conceptual gap.

Move the deep-market vs thin-market comparison here.

Preferred visual:

```text
Same quoted price: 10 XLM

DEEP MARKET
████████████████████████████   500,000 XLM at ±5%

THIN MARKET
█                                  800 XLM at ±5%

Same quoted price. Very different collateral risk.
```

The old two-curve illustration may be reused here if it is redesigned to be clearer and larger.

Avoid generic `Asset A` / `Asset B` cards as the final visual unless they are clearly part of an intentionally abstract explainer.

## Section 3 — Market Snapshot

This section is required in the revised direction.

Heading example:

**Risk across monitored Stellar markets.**

Show a compact dashboard preview:

```text
Asset           Risk        5% Depth        Safe collateral    Flags
USDC / XLM      LOW         194.8K XLM      120.4K XLM         —
EURC / XLM      MEDIUM       82.4K XLM       41.1K XLM         1
AQUA / XLM      HIGH         12.1K XLM        7.2K XLM         2
USTRY / XLM     CRITICAL        800 XLM       —                 4
```

CTA: **Explore all assets →**

Use backend mock fixtures or a contract-compatible static fixture until live data is stable.

This should look like a real product table, not a decorative screenshot.

## Section 4 — What Keel measures

Do not use four equal explanatory cards.

Use an **asymmetric product bento** where depth is visually dominant.

Example composition:

```text
┌──────────────────────────────────────┐ ┌───────────────────┐
│ EXECUTABLE DEPTH                     │ │ RISK              │
│                                      │ │ LOW               │
│ ±2%   █████                          │ │ Full confidence   │
│ ±5%   █████████                      │ │ 0 flags           │
│ ±10%  ███████████████                │ │                   │
│                                      │ │                   │
│ 194,820 XLM at ±5%                   │ │                   │
└──────────────────────────────────────┘ └───────────────────┘

┌──────────────────────┐ ┌───────────────────────────────────┐
│ MANIPULATION         │ │ SAFE COLLATERAL                   │
│ +50% target          │ │ 120,400 XLM                       │
│ 41,200 XLM cost      │ │ conservative recommendation      │
│ Reachable            │ │                                   │
└──────────────────────┘ └───────────────────────────────────┘
```

Supporting risk signals can appear as a smaller strip/module instead of an equally weighted primary card.

## Section 5 — How Keel works

Heading direction:

**Market data in. Inspectable risk out.**

Use an infrastructure diagram, not three generic process cards.

```text
SDEX ──────────┐
               │
AMM ───────────┼────→  KEEL ENGINE  ───→ Effective depth
               │                      ├─→ Manipulation cost
Market data ───┘                      ├─→ Safe collateral
                                      └─→ Risk flags
                                               │
                              ┌────────────────┼───────────────┐
                              ↓                ↓               ↓
                          Dashboard           API          Backtest
```

Keep labels understandable without requiring knowledge of Stellar internals.

## Section 6 — Explainable risk

Heading:

**No mystery score. Every flag can be inspected.**

This section should be led by a large, believable Keel risk result.

Preferred UI:

```text
USTRY / XLM                    CRITICAL
                         PARTIAL CONFIDENCE

Triggered
● ZERO_DEPTH_2PCT
  No executable depth within ±2% on one side.

● MANIPULATION_CHEAP
  A defined target is reachable at low cost.

Not evaluated
○ HOLDER_CONCENTRATION_EXTREME

Horizon · Ledger 57938192 · Method v1.x
```

Important copy:

`Partial data never means clear data.`

The product card should take more visual weight than the explanatory paragraph.

## Section 7 — API / developer product

This section is required.

Heading direction:

**Liquidity risk through one read-only API.**

Supporting points:
- no wallet;
- no transaction signing;
- contract-first;
- public/read-only where supported by backend deployment.

Show one representative request and one representative response:

```text
GET /v1/asset/USDC:G.../depth

{
  "band": "LOW",
  "bandConfidence": "full",
  "depth": [...],
  "ledgerSeq": 57938192,
  "methodologyVersion": "...",
  "dataSource": "horizon"
}
```

CTA: **View API contract →**

A dark technical surface is appropriate here and helps vary page rhythm.

## Section 8 — Blend/USTRY case study

Heading:

**A known incident, replayed as evidence.**

The section must show historical evidence, not a text-only timeline.

Preferred visual:
- manipulation-cost or risk-related historical series;
- explicit 22 February 2026 incident marker;
- visible gaps/reconstruction status where relevant;
- concise interpretation.

Example:

```text
Manipulation cost
80k │ ●
60k │   ●
40k │      ●
20k │           ●
 0  └──────────────│───────── date
                   ↑
              22 Feb incident
```

CTA: **Open case study →**

Do not claim Keel would have prevented the exploit unless the completed report supports that exact statement.

## Section 9 — Provenance / built to be checked

Do not use three generic columns that merely say Traceable / Reproducible / Read-only.

Show provenance as product data:

```text
LEDGER         METHOD        SOURCE        CONFIDENCE
57938192       v1.x.x        Horizon       Full
```

Then use one concise supporting sentence:

> Every Keel result carries the context needed to inspect and reproduce the claim.

Secondary links:
- Methodology;
- GitHub;
- API/OpenAPI.

## Section 10 — Final CTA

Heading:

**See the market behind the price.**

Buttons:
- Explore assets;
- Read methodology.

Use a brand-coherent surface. Do not introduce a large unrelated purple block unless purple has become an established brand color elsewhere.

Footer disclaimer:

`Keel is a proof of concept. It has no production mainnet SLA and should not be the sole basis for a financial decision.`

## Revised wireframe

```text
┌──────────────────────────────────────────────────────────────────┐
│ KEEL   Product  Assets  Case Study  Methodology  API   [Explore]│
├──────────────────────────────────────────────────────────────────┤
│ HERO COPY                              [REAL KEEL RISK PREVIEW]  │
│ Know how much a price can actually support.                     │
│ [Explore assets] [Read methodology]                             │
├──────────────────────────────────────────────────────────────────┤
│ PRICE IS NOT LIQUIDITY      [DEEP vs THIN VISUAL]               │
├──────────────────────────────────────────────────────────────────┤
│ MARKET SNAPSHOT — compact real product table                    │
├──────────────────────────────────────────────────────────────────┤
│ WHAT KEEL MEASURES — asymmetric product bento                   │
├──────────────────────────────────────────────────────────────────┤
│ SDEX / AMM / DATA → KEEL ENGINE → DEPTH / RISK / COLLATERAL    │
├──────────────────────────────────────────────────────────────────┤
│ NO MYSTERY SCORE               [LARGE REAL RISK RESULT]         │
├──────────────────────────────────────────────────────────────────┤
│ API / DEVELOPER                [REQUEST + RESPONSE]              │
├──────────────────────────────────────────────────────────────────┤
│ BLEND CASE STUDY               [HISTORICAL CHART + MARKER]      │
├──────────────────────────────────────────────────────────────────┤
│ LEDGER | METHOD | SOURCE | CONFIDENCE                            │
├──────────────────────────────────────────────────────────────────┤
│ SEE THE MARKET BEHIND THE PRICE.                    [Explore]    │
├──────────────────────────────────────────────────────────────────┤
│ Footer                                                           │
└──────────────────────────────────────────────────────────────────┘
```

## Responsive behavior

### Desktop

- hero product preview should be large enough to read;
- major product sections may use 35/65 or 40/60 layouts;
- market snapshot is a real table;
- bento remains asymmetric;
- API and case-study visuals get significant width.

### Mobile

- hero product preview stacks below copy and remains readable;
- market snapshot becomes asset cards;
- infrastructure flow becomes vertical;
- bento becomes stacked while preserving metric hierarchy;
- code block scrolls horizontally if needed;
- historical chart retains event marker and textual summary.

Do not simply shrink desktop typography and leave giant empty sections.

## Landing-page implementation scope

### Must

- responsive navigation;
- product-led hero;
- price-vs-liquidity explainer;
- market snapshot;
- asymmetric metric bento;
- infrastructure flow;
- explainable-risk result;
- API showcase;
- historical case-study preview;
- provenance strip;
- final CTA/footer;
- actual loaded fonts;
- SEO metadata and valid social image.

### Should

- reuse backend mock fixtures;
- reuse Keel domain components between landing and app routes;
- subtle interaction/hover polish;
- one or two dark sections to vary density and technical tone.

### Do not block launch on

- advanced animation;
- WebGL;
- wallet integration;
- CMS;
- live homepage data if fixtures communicate the product reliably.

### Do block launch on

- prominent CTAs pointing to missing routes;
- broken OG image references;
- unreadably small body text;
- hero that does not show Keel itself;
- repeated generic card sections that make the page feel like a template.

## Acceptance test

Before accepting the landing page, ask a reviewer to view only the first 2–3 screens and answer:

1. What does Keel measure?
2. What does one Keel result look like?
3. Why is this different from a price tracker or oracle?
4. Can the result be inspected or reproduced?

If the answers depend on reading most of the page, the landing page has failed its job.
