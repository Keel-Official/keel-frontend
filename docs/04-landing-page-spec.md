# Keel Frontend — Landing Page Specification

## Goal

A first-time visitor should understand Keel in under 30 seconds without knowing what an oracle, SDEX, AMM, or trustline is.

The page should communicate:

1. A quoted price does not tell you how much the market can actually absorb.
2. Keel measures executable liquidity depth and related collateral risk.
3. Keel is built for Stellar and is permanently read-only.
4. The product is evidence-driven and reproducible.
5. Visitors can inspect assets, the Blend/USTRY case study, and the methodology.

## Primary audience

For the current sprint, optimize clarity for:
- Ambassador/Instawards reviewer;
- SCF reviewer;
- prospective technical user.

The eventual commercial audience (lending protocols, vault curators, RWA issuers) can appear in positioning, but should not make the page sound like a mature production service with an SLA.

## Proposed hero

### Eyebrow

`Liquidity risk intelligence for Stellar`

### Headline option A

**A price is only as credible as the liquidity behind it.**

### Headline option B

**Know how much volume a quoted price can actually support.**

### Supporting copy

Keel measures executable market depth for Stellar assets, estimates the cost of moving their price, and surfaces collateral risk before a thin market is treated like deep liquidity.

### CTAs

Primary: **Explore assets**  
Secondary: **See the Blend case study**

Small trust line beneath CTAs:

`Read-only · Open methodology · No wallet connection`

## Section 2 — The problem

Heading:

**Price is not liquidity.**

Simple visual comparison:

```text
Asset A                 Asset B
Quoted price: 10        Quoted price: 10
5% depth: 500,000       5% depth: 800

Same quoted price. Very different collateral risk.
```

Copy:

A market can print a price with very little executable depth behind it. For lending and collateral decisions, the important question is not only “what is the price?” but “how much can actually trade near that price?”

## Section 3 — What Keel measures

Use 3–4 cards, not a giant feature grid.

### Effective liquidity depth

How much quote-asset value can trade before the market moves ±2%, ±5%, and ±10%.

### Manipulation resistance

How much notional is required to move the market toward defined price targets — together with whether those targets are actually reachable.

### Maximum safe collateral

A conservative recommendation derived from executable liquidity and manipulation constraints.

### Supporting risk signals

Market spread, source divergence, genuine trading activity, and holder concentration where data is available.

## Section 4 — How it works

Use a simple 3-step flow:

```text
Stellar market data
SDEX + AMM + supporting observations
        ↓
Keel methodology
Depth + manipulation + collateral + flags
        ↓
Risk evidence
Dashboard + API + historical case study
```

Avoid explaining blockchain internals here.

## Section 5 — Risk is explainable

Heading:

**No mystery score. Every flag can be inspected.**

Explain that Keel uses rule-based bands rather than an unexplained weighted 0–100 score.

Example UI:

```text
CRITICAL
Triggered:
• Zero depth within 2%
• Manipulation is cheap

Not evaluated:
• Holder concentration
```

Important copy:

`Partial data never means clear data.`

## Section 6 — Case study

Heading:

**A known incident, replayed as evidence.**

Short copy:

The February 2026 USTRY/Blend incident is the primary historical test case for Keel. The case study asks whether market-depth and manipulation metrics would have exposed structural risk around the asset before its quoted price was treated as large collateral value.

CTA: **Open case study**

Do not claim the backtest proves Keel “would have prevented” the incident unless the completed methodology/report supports that exact claim.

## Section 7 — Built to be checked

Three points:

- **Traceable:** every result carries ledger sequence, methodology version, and data source.
- **Reproducible:** the methodology and evidence are public/reviewable.
- **Read-only:** Keel never signs or submits a Stellar transaction.

Secondary links:
- Read methodology
- View API contract
- View GitHub

## Section 8 — Final CTA

Heading:

**See the market behind the price.**

Buttons:
- Explore assets
- Read methodology

Footer disclaimer:

`Keel is a proof of concept. It has no production mainnet SLA and should not be the sole basis for a financial decision.`

## Initial wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ KEEL        Product  Assets  Case Study  Methodology    CTA │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Liquidity risk intelligence for Stellar                     │
│                                                              │
│ A price is only as credible                                 │
│ as the liquidity behind it.                                │
│                                                              │
│ [Explore assets]  [See case study]                          │
│ Read-only · Open methodology · No wallet                    │
│                                             [depth visual]   │
├──────────────────────────────────────────────────────────────┤
│ Price is not liquidity                                      │
│ [Asset A deep]                         [Asset B thin]        │
├──────────────────────────────────────────────────────────────┤
│ What Keel measures                                          │
│ [Depth] [Manipulation] [Safe collateral] [Signals]          │
├──────────────────────────────────────────────────────────────┤
│ How it works                                                 │
│ Stellar data → Keel methodology → Explainable risk          │
├──────────────────────────────────────────────────────────────┤
│ No mystery score                                             │
│ [example risk card + triggered/unevaluated states]          │
├──────────────────────────────────────────────────────────────┤
│ USTRY / Blend case study                                    │
│ [short narrative]                         [timeline visual]  │
├──────────────────────────────────────────────────────────────┤
│ Built to be checked: Traceable / Reproducible / Read-only   │
├──────────────────────────────────────────────────────────────┤
│ See the market behind the price.        [Explore assets]    │
├──────────────────────────────────────────────────────────────┤
│ Footer + PoC/no-SLA disclaimer                              │
└──────────────────────────────────────────────────────────────┘
```

## Landing-page implementation scope

Milestone 1 should be mostly static.

Must:
- responsive header/navigation;
- hero;
- problem explanation;
- 3–4 metric cards;
- how-it-works flow;
- risk explanation;
- case-study teaser;
- methodology/evidence section;
- footer/disclaimer;
- SEO metadata and social share image placeholder.

Should:
- subtle reusable data-depth illustration;
- live `/health` indicator only if it can fail gracefully.

Do not block launch on:
- live asset table inside the landing page;
- animated blockchain graphics;
- wallet integration;
- CMS;
- complex motion.

