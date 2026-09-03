# Keel Frontend — Information Architecture

## Product surfaces

Keel has two jobs on the frontend:

1. **Explain the idea.** A reviewer or first-time visitor should understand why quoted price is not enough.
2. **Expose evidence.** A technical user should be able to inspect assets, depth, risk flags, data source, methodology, and historical evidence.

Those jobs should not be mixed into one overloaded dashboard.

## Proposed sitemap

```text
/
├─ /assets
│  └─ /assets/[assetId]
├─ /case-study/ustry
└─ /methodology
```

Future, only if needed:

```text
/api          API documentation redirect/landing
/about        Team/project context
```

No login, account, wallet, portfolio, transaction, or settings area is needed for the current scope.

## Page responsibilities

### `/` — Landing page

Primary question answered:

> Why does Keel exist, and why should I care?

Audience:
- Ambassador/SCF reviewer;
- Stellar ecosystem builder;
- protocol/vault/RWA technical evaluator.

Primary actions:
- **Explore assets**
- **View the Blend case study**
- secondary: Read methodology / API contract

The page should work even if the Keel API is temporarily unavailable.

### `/assets` — Risk overview

Primary question answered:

> Which monitored assets deserve attention?

Core content:
- monitored asset table;
- risk band;
- band confidence;
- triggered flags;
- 5% depth summary;
- safe-collateral summary;
- quote asset;
- search/filter when implemented.

Do not make price the primary column. Keel is not a price tracker.

### `/assets/[assetId]` — Asset detail

Primary question answered:

> Why is this asset classified this way?

Suggested content order:

1. Identity + quote pair.
2. Risk band + confidence.
3. Key finding/explanation.
4. Effective depth at 2/5/10% (buy and sell separately).
5. Maximum safe collateral.
6. Manipulation resistance/cost.
7. Price-source health (book/pool/divergence/spread).
8. Supporting metrics.
9. Triggered vs unevaluated flags.
10. Warnings.
11. Provenance: ledger, source, methodology version, computed time.
12. Historical trend when available.

### `/case-study/ustry` — Blend case study

Primary question answered:

> Would Keel's liquidity view have exposed the structural risk around the known incident?

This should be a narrative page, not just another dashboard screen.

Suggested sequence:
- incident context;
- what a price feed saw;
- what market depth showed;
- timeline of risk metrics;
- exploit marker (22 February 2026 per the corrected backend record);
- interpretation and methodology limitations;
- links to raw/reproducible evidence.

### `/methodology` — Explain the model

Primary question answered:

> What exactly do these numbers and risk labels mean?

This page should translate backend methodology into human language, while linking to the full technical methodology rather than duplicating it.

Include:
- what effective depth means;
- buy vs sell side;
- manipulation cost;
- max safe collateral;
- risk bands and flags;
- full vs partial confidence;
- data-source hierarchy;
- disclaimer that thresholds are chosen, not empirically calibrated;
- active methodology version read from the API.

## Global navigation

Desktop:

```text
[Keel]     Product  Assets  Case Study  Methodology          [Explore Assets]
```

For the first implementation, `Product` may simply scroll to the explanation section on the landing page rather than becoming a separate page.

Mobile:
- logo;
- menu button;
- single primary CTA.

## Global footer

Include:
- short Keel description;
- Stellar ecosystem context;
- Methodology;
- API/OpenAPI;
- GitHub;
- “Proof of concept — no production SLA”;
- “Keel is read-only; it never signs or submits transactions.”

## Content hierarchy rule

For every risk/data page, use this hierarchy:

```text
Conclusion
   ↓
Reason
   ↓
Evidence
   ↓
Methodology/provenance
```

A non-technical reviewer should get value from the first two levels. A technical reviewer should be able to keep drilling down without changing products.

