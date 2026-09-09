# Product

## Users

Ambassador and SCF reviewers, Stellar ecosystem builders, and prospective technical users. They arrive with varying levels of Web3 familiarity and need to understand why a quoted price can exist without enough executable liquidity behind it, then inspect the product output, evidence, methodology, API, and historical case study.

## Product Purpose

Keel is a read-only liquidity-risk engine for Stellar.

An oracle answers **“what is the price?”** Keel answers **“how much can actually transact near that price, and what does it cost to move it?”**

Keel measures executable market depth, manipulation cost and reachability, conservative collateral capacity, and explainable risk findings from Stellar market evidence.

The frontend succeeds when a first-time visitor can quickly answer:

- What does Keel measure?
- What does a Keel result look like?
- Why is Keel different from a price tracker/oracle?
- What evidence caused the risk finding?
- What is unknown or unevaluated?
- Can the result be inspected and reproduced?

The landing page should demonstrate the product before explaining the methodology in depth.

## Core Product Model

Keel treats two related risks as separate questions rather than collapsing them into one composite number.

### Liquidation capacity

Primary market side: **bids**.

Question:

> If collateral has to be sold, how much can the market absorb before price moves materially?

This is expressed through executable depth on the sell/liquidation side at defined price moves such as ±2%, ±5%, and ±10%.

### Oracle-manipulation resistance

Primary market side: **asks**.

Question:

> How much does it cost to push the market price upward toward a target, and is that target actually reachable?

Manipulation cost must always be interpreted together with reachability. A numeric cost alone is not enough to describe the result.

An asset may be strong on one dimension and weak on the other. The interface must preserve that distinction.

## Risk Model

Keel does **not** publish a weighted 0–100 risk score.

Risk is represented through:

- individual rule-based flags;
- `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL` bands;
- `full` or `partial` band confidence.

Each flag has three semantic states:

- `triggered` — the condition was evaluated and is present;
- `clear` — the condition was evaluated and is not present;
- `unevaluated` — required data was unavailable, so the condition could not be checked.

`unevaluated` is not equivalent to `clear`.

The band is derived from the highest tier among triggered flags. Confidence is determined separately from whether required high/critical checks could be evaluated. A `LOW` band with `partial` confidence is materially weaker than `LOW` with `full` confidence and must not be presented as equivalent.

## Quote and Pair Model

Under the current methodology, **USDC is the global primary quote** for headline Keel measurements and threshold comparisons. The response still carries its quote explicitly; the frontend must display the response unit rather than assuming a quote forever.

Keel also evaluates **native XLM as a secondary candidate quote** where applicable. The asset-level risk band is the worst band across evaluated pairs.

This creates an important presentation rule:

- headline depth, manipulation cost, and `maxSafeCollateral` remain tied to the primary pair;
- the asset-level band may be driven by a secondary pair;
- `bandDrivenBy` identifies which quote pair determined the asset band;
- `pairsEvaluated` exposes the band and confidence of evaluated pairs;
- `xlmUsdcRate` records the same-ledger conversion used before an XLM-quoted pair is judged against USDC-denominated thresholds.

Never visually imply that the displayed primary-pair metrics necessarily caused the displayed asset band when `bandDrivenBy` points to another pair.

If a secondary pair cannot be converted reliably, that uncertainty must remain visible rather than being treated as clear evidence.

## Product Presentation

Keel should feel like **modern financial infrastructure with inspectable risk output**.

The strongest visual objects should be recognizably Keel-specific:

- executable depth by side and price move;
- risk band + confidence;
- triggered, clear, and unevaluated states;
- manipulation target, cost, and reachability;
- `maxSafeCollateral` as a conservative recommendation, not a guarantee;
- SDEX/AMM liquidity contribution;
- primary and secondary pair context;
- asset market snapshot;
- API response;
- historical evidence;
- provenance;
- supporting market-quality signals where available, including genuine trading activity, holder concentration, and volume-to-supply context.

A generic educational chart may explain a concept, but it should not substitute for showing the product itself.

Supporting metrics must preserve missing/unevaluated states. Do not fabricate a complete-looking result when the underlying evidence is unavailable.

## Brand Personality

Personality:

- calm;
- exact;
- technically confident;
- contemporary;
- accountable;
- product-led;
- transparent about uncertainty.

Keel should not feel primarily like a research report, pitch deck, documentation site, crypto trading terminal, or generic SaaS landing page.

## Historical Validation Case

Keel's primary historical validation case is the **YieldBlox DAO pool incident on Blend V2 on 22 February 2026**.

The primary backtest pair is **USTRY/USDC** because that is the market relevant to the oracle used in the incident.

**USTRY/XLM is a separate published control series.** It may be compared with the primary case but must not be merged into the headline historical claim.

Historical views must preserve methodology version, data source, reconstruction quality, gaps, and event markers. A historical result stamped with an older methodology version is not automatically stale; it records the methodology used to produce that result and is part of reproducibility.

Do not claim the case study proves Keel would have prevented the incident unless the evidence and methodology explicitly support that claim.

## Product Boundaries

Keel is intentionally conservative and its output has defined limits.

- Resting liquidity can be withdrawn; a measurement is evidence at a ledger/time, not a guarantee of future execution.
- Path-payment liquidity through arbitrary intermediate assets is not counted in the current methodology.
- Centralized-exchange liquidity is invisible to Keel.
- Manipulation cost is an upper-bound style estimate because future order ownership cannot be known in advance.
- Methodology thresholds are chosen parameters, not empirically calibrated universal safety boundaries.
- Missing evidence must lower certainty, not silently improve the apparent result.

Keel is read-only. It never signs or submits Stellar transactions and should not be presented as sufficient on its own for a financial decision.

## Anti-references

Avoid:

- speculative crypto aesthetics;
- casino/meme-coin energy;
- neon cyberpunk treatment;
- decorative blockchain/coin/globe visuals;
- hype language;
- wallet/transaction patterns;
- unexplained scores;
- production-SLA claims;
- false certainty;
- giant empty sections with tiny product objects;
- repeated kicker + huge headline + paragraph + generic-card layouts;
- hard-offset poster shadows as a default motif.

Do not imply Keel guarantees exploit prevention or is sufficient on its own for a financial decision.

## Design Principles

- **Show the product before explaining it.**
- **Use Keel-native product objects as the primary visual language.**
- **Vary page rhythm:** spacious positioning, dense product UI, architecture, API, charts, provenance.
- **Keep liquidation and manipulation evidence distinct.**
- **Keep uncertainty and source quality visible.**
- **Use precise quote units and exact semantics.**
- **Treat provenance as product information, not debug detail.**
- **Do not visually merge asset-level band semantics with primary-pair metric semantics when another pair drives the band.**
- **Keep the visual system restrained but not lifeless.**
- **Do not use whitespace as a substitute for composition.**
- **Make the landing page and dashboard feel like one product.**

## Reference Roles

Use references for principles, not cloning:

- Paycrest — infrastructure storytelling;
- Mural Pay / Partna — API and product demonstration;
- BlindPay — clean technical fintech composition;
- SpherePay — verification and trust framing;
- Meld — decision-output patterns;
- Swapped — dashboard preview patterns;
- Conduit — architecture storytelling.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Risk states must be communicated with text and structure, never color alone. Maintain visible keyboard focus, logical heading hierarchy, readable contrast, practical 44px touch targets, and reduced-motion alternatives.

Supporting text and product data must remain legible; do not create a page where oversized marketing headings make evidence unreadably small.

Keep explanations accessible to visitors who do not know Stellar, SDEX, AMMs, or oracle terminology, but do not remove technical credibility from the interface.

## Sources of Truth

This file records stable product and presentation knowledge. It is not the authority for changing methodology or API semantics.

Use this order when details conflict:

1. backend methodology documents for metric definitions, pair decisions, risk semantics, and limitations;
2. backend OpenAPI contract for current response fields and interface shape;
3. backend-generated mocks for concrete frontend render fixtures;
4. this `PRODUCT.md` for frontend product framing and presentation principles;
5. implementation/roadmap documents for current build status.

Do not hardcode methodology version strings, thresholds, quote assumptions, risk-flag lists, or other configuration into UI logic when the backend response or methodology endpoint provides them.

Historical results should display the methodology version they were computed with rather than being relabeled to the newest version.