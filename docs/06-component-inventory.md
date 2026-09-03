# Keel Frontend — Initial Component Inventory

Build only what the first pages require. Reuse should emerge from real screens, not from trying to invent a complete design system before implementation.

## 1. UI primitives

Likely from shadcn/Radix or small custom components:

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
- `Dialog` only if needed for explanations/copyable raw details

## 2. Layout / marketing

- `SiteHeader`
- `MobileNav`
- `PageContainer`
- `Section`
- `SectionEyebrow`
- `SiteFooter`
- `Hero`
- `MetricExplainerCard`
- `HowItWorksFlow`
- `CaseStudyTeaser`
- `ProofPoint`

## 3. Keel domain components

### `AssetIdentity`

Displays:
- code;
- issuer (truncated visually);
- quote pair;
- copy affordance for full ID.

### `RiskBadge`

Input:
- `band`;
- `bandConfidence`.

Must support:
- LOW/MEDIUM/HIGH/CRITICAL;
- full/partial;
- text + semantic icon, not color-only.

### `FlagList`

Separate groups:
- Triggered;
- Not evaluated.

Do not show unevaluated items as cleared.

### `DataSourceBadge`

Input:
- horizon;
- hubble;
- offers-implied;
- trades-implied.

`trades-implied` should trigger visible lower-bound language.

### `MetricValue`

Responsibilities:
- exact decimal formatting;
- unit;
- null handling;
- optional source/status hint.

Avoid ad hoc number formatting across pages.

### `DepthLadder`

Rows:
- ±2%;
- ±5%;
- ±10%.

Columns:
- buy side;
- sell side;
- optional SDEX/AMM breakdown.

### `DepthChart`

Visualizes depth without replacing the exact table.

### `ManipulationRungs`

Renders target delta, target price, cost, and reachability together.

### `SafeCollateralCard`

Displays maximum safe collateral prominently with quote unit and a short explanation.

### `PriceHealth`

Displays:
- reference price/source;
- pool spot price if present;
- spread;
- divergence;
- conflict/extreme state.

Must support a “price is not reliable” presentation.

### `SupportingMetrics`

Displays:
- holder top 1%;
- holder top 10%;
- HHI;
- volume-to-supply;
- last genuine trade;
- excluded trade percentage.

Must gracefully handle `null` and not-yet-evaluated values.

### `ProvenancePanel`

Displays:
- ledger;
- timestamps;
- methodology version;
- data source;
- live staleness;
- warnings.

### `RiskFindingCallout`

Human-readable summary such as:

```text
Critical: the market has zero executable depth within 2% on one side.
```

This is a UI interpretation layer, not a new methodology layer. Copy must derive from existing flags and never invent a new risk classification.

## 4. Page-level components

### Landing

- `HeroDepthVisual`
- `PriceVsLiquidityComparison`
- `MetricExplainerGrid`
- `ExplainableRiskDemo`
- `CaseStudyPreview`

### Asset overview

- `AssetRiskTable`
- `AssetRiskCard` (mobile)
- `RiskFilters`
- `AssetSearch`

### Asset detail

- `AssetSummaryHeader`
- `RiskSummary`
- `DepthSection`
- `ManipulationSection`
- `SupportingMetricsSection`
- `HistorySection`

### Case study

- `IncidentTimeline`
- `EventMarker`
- `HistoricalRiskChart`
- `EvidenceCallout`
- `MethodologyLimitations`

## 5. Component API rule

Components should receive backend-shaped data or small explicit derived view models.

Avoid creating a giant “normalized frontend Keel model” that silently changes backend semantics.

Good:

```text
RiskBadge({ band, bandConfidence })
```

Bad:

```text
RiskBadge({ safe: boolean })
```

The latter throws away the exact meaning Keel worked to preserve.

