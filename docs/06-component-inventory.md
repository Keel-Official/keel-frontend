# Keel Frontend — Component Inventory

Build abstractions from real screens. The revised landing page should reuse Keel domain semantics instead of inventing a separate marketing-only visual language.

## 1. UI primitives

Likely small custom components or Radix/shadcn primitives as needed:

- `Button`
- `LinkButton`
- `Badge`
- `Card`
- `Tooltip`
- `Popover`
- `Tabs`
- `Table`
- `Skeleton`
- `Separator`
- `Alert`
- `CodeBlock`
- `Dialog` only if a real explanation/raw-data interaction requires it

Do not bulk-install a UI kit.

## 2. Layout / site components

- `SiteHeader`
- `MobileNav`
- `PageContainer`
- `Section`
- `SectionEyebrow`
- `SiteFooter`
- `DarkTechnicalSection`
- `ResponsiveProductFrame`

The purpose of layout components is consistency, not forcing every section into the same structure.

## 3. Core Keel domain components

### `AssetIdentity`

Displays:
- asset code;
- issuer;
- quote pair;
- copy affordance for full ID.

### `RiskBadge`

Input:
- `band`;
- `bandConfidence`.

Must support:
- LOW / MEDIUM / HIGH / CRITICAL;
- full / partial;
- text + semantic indication, never color only.

### `FlagList`

Groups:
- Triggered;
- Not evaluated;
- optional evaluated/clear summary when useful.

### `DataSourceBadge`

Supports:
- horizon;
- hubble;
- offers-implied;
- trades-implied.

### `MetricValue`

Responsibilities:
- exact decimal formatting;
- quote unit;
- null handling;
- optional source/status hint;
- tabular numeric treatment.

### `DepthLadder`

Rows:
- ±2%;
- ±5%;
- ±10%.

Columns/modes:
- buy side;
- sell side;
- compact headline value;
- optional SDEX/AMM breakdown.

Must support a compact marketing-preview variant without changing semantics.

### `LiquiditySourceBreakdown`

Displays SDEX and AMM contribution when derivable from backend values.

Possible representations:
- horizontal stacked bar;
- paired bars;
- exact amount + percentage.

Never invent percentages.

### `DepthChart`

Visual depth evidence. Must not replace exact values/table.

### `ManipulationRungs`

Renders:
- target delta;
- target price when relevant;
- cost;
- reachability.

### `SafeCollateralCard`

Displays max safe collateral prominently with quote unit and concise explanation.

### `PriceHealth`

Displays:
- reference price/source;
- pool spot price when present;
- spread;
- source divergence;
- conflict/extreme state.

### `SupportingMetrics`

Displays:
- holder top 1%;
- holder top 10%;
- HHI;
- volume-to-supply;
- last genuine trade;
- excluded-trade percentage.

### `ProvenanceStrip`

Compact presentation of:
- ledger;
- methodology version;
- source;
- confidence;
- computed time where useful.

This should be reusable on landing previews and detailed pages.

### `ProvenancePanel`

Expanded version for asset detail:
- ledger;
- timestamps;
- methodology version;
- source;
- staleness;
- warnings;
- reconstruction note.

### `RiskFindingCallout`

Human-readable explanation derived from backend flags.

Do not create a new frontend risk model.

## 4. Landing-page components

The previous inventory was too generic and produced an explanatory/editorial page. Replace it with product-led sections.

### `HeroProductPreview`

Purpose:
- show a believable Keel result above the fold.

Uses/reuses:
- `AssetIdentity`;
- `RiskBadge`;
- compact `DepthLadder`;
- `LiquiditySourceBreakdown`;
- `SafeCollateralCard` or compact equivalent;
- `ProvenanceStrip`.

Do not rebuild these semantics as arbitrary decorative markup if shared domain components already exist.

### `PriceLiquidityComparison`

Purpose:
- explain same price / different depth.

May use:
- simple horizontal bars;
- redesigned deep/thin curve visualization.

This is an explainer, not the main product preview.

### `MarketSnapshot`

Purpose:
- preview the monitored-asset dashboard.

Desktop:
- compact table.

Mobile:
- `AssetRiskCard` stack.

Fields:
- asset/quote;
- risk + confidence;
- 5% depth;
- safe collateral;
- key flags/count.

### `MetricBento` — removed

Not built. Depth and collateral are read in `HeroProductPreview` and `MarketSnapshot`;
manipulation cost and reachability are read in `ExplainableRiskDemo`. A second
explanatory grid of the same four numbers repeated the page rather than adding to it.
See `08-instrument-design-kit.md`.

### `ArchitectureFlow`

Purpose:
- show market data → Keel engine → outputs/surfaces.

Should use CSS/SVG connectors and semantic labels, not generic numbered process cards.

### `ExplainableRiskDemo`

Purpose:
- show triggered and unevaluated states as real product UI.

Should be visually substantial, not a tiny supporting card.

### `ApiPreview` — removed

Taken off the landing page in `086b593`, along with methodology and the depth
comparison. The contract is still reachable: the footer links `keel-openapi.yaml`, and
every product object on the page links the recorded response it was rendered from.

### `BlendCasePreview`

Purpose:
- show historical evidence with an event marker.

Contains:
- historical chart;
- source/reconstruction note;
- incident marker;
- concise interpretation;
- case-study CTA.

### `EvidenceStrip`

Purpose:
- show provenance as actual data rather than generic “Traceable / Reproducible / Read-only” marketing claims.

### `FinalCta`

Brand-coherent CTA surface.

### `SiteFooter`

Footer links + PoC/no-SLA/read-only disclaimer.

## 5. Product-page components

### Asset overview

- `AssetRiskTable`
- `AssetRiskCard`
- `RiskFilters`
- `AssetSearch`
- `MarketSummaryBar` when useful

### Asset detail

- `AssetSummaryHeader`
- `RiskSummary`
- `DepthSection`
- `ManipulationSection`
- `PriceHealthSection`
- `SupportingMetricsSection`
- `HistorySection`
- `ProvenancePanel`

### Case study

- `HistoricalRiskChart`
- `IncidentMarker`
- `EvidenceCallout`
- `ReconstructionNotice`
- `MethodologyLimitations`
- `EvidenceLinks`

### Methodology

- `MethodologyMetricExplainer`
- `WorkedMetricExample`
- `RiskBandExplanation`
- `DataSourceHierarchy`

## 6. Component hierarchy rule

Marketing pages should compose domain components where practical.

Good:

```text
HeroProductPreview
  ├─ RiskBadge
  ├─ DepthLadder
  ├─ LiquiditySourceBreakdown
  └─ ProvenanceStrip
```

Less desirable:

```text
HeroProductPreview
  └─ 150 lines of one-off spans that imitate the product
```

The goal is for the landing page and dashboard to feel like one product, not two unrelated sites.

## 7. Component API rule

Prefer exact backend semantics:

```text
RiskBadge({ band, bandConfidence })
```

Avoid lossy abstractions:

```text
RiskBadge({ safe: boolean })
```

Prefer small explicit view models only when they preserve meaning and simplify composition.

## 8. Visual uniqueness rule

Before creating a new marketing component, ask:

> Does this component contain something recognizably Keel-specific?

Strong answers:
- depth;
- risk finding;
- collateral;
- market source;
- API data;
- provenance;
- historical evidence.

Weak answers:
- generic feature card;
- generic icon + heading;
- generic three-step card;
- decorative gradient box.

Prefer strong answers.
