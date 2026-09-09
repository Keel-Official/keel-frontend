# Keel Frontend — Data Contract Rules

This file is not a replacement for `keel-backend/docs/api/keel-openapi.yaml`. It is a frontend checklist for consuming that contract without changing its meaning.

The revised visual direction adds more product-shaped data to the landing page, so these rules apply to **marketing previews too**, not only the dashboard.

## 1. Generate types; do not duplicate them

Generate frontend types from the backend OpenAPI contract with `openapi-typescript`.

Do not maintain a second manual `AssetRisk`, `HistoryResponse`, `Flag`, or `Band` model unless it is a UI-only derived type.

For landing-page fixtures, prefer backend-generated mocks or fixture objects that satisfy generated contract types.

## 2. Product previews must remain semantically honest

A landing-page preview may be static, but it must not invent impossible or misleading combinations merely to look good.

Good:
- use an existing healthy/mock asset response;
- trim a full response into a compact view model while preserving semantics;
- label a clearly illustrative comparison as illustrative.

Bad:
- invent `LOW` while showing critical flags;
- show `full` confidence when required inputs are absent;
- display a safe-collateral value that does not exist in the fixture;
- mix values from unrelated assets and imply they are one backend result.

Marketing UI is still product UI.

## 3. Decimal strings are exact data

Most financial/market numeric fields are JSON strings by contract.

Incorrect:

```ts
const depth = parseFloat(response.depth[0].buySide)
```

Correct principle:

```text
API decimal string → Decimal → formatting / comparison / exact derivation
```

Chart geometry may use a derived JS number, but exact labels/tooltips must retain the source decimal value.

## 4. `null` is never silently converted to zero

- measured `0` → show `0`;
- `null` → show `—` or `Not available`, with context where the distinction matters.

This applies to compact landing cards as well as detailed app screens.

## 5. No executable price is a successful API result

A monitored asset may return:

```text
HTTP 200
priceSource = none
midPrice = null
band = CRITICAL
```

This is a product finding, not an application error.

It can be an excellent landing-page example for explaining why absence of liquidity is meaningful, as long as it is clearly labeled.

## 6. Broken orderbook needs a distinct presentation

When `SPREAD_EXTREME` is triggered, a populated `midPrice` can be misleading.

UI behavior:
- visibly mark the reference price as unreliable;
- show the spread warning;
- do not promote the depth ladder as an ordinary healthy market result;
- surface stronger/relevant manipulation evidence.

## 7. Triggered, clear, and unevaluated are different states

Backend semantics:
- `flags` → triggered;
- `unevaluatedFlags` → not assessed because required data was unavailable;
- a flag in neither collection → evaluated and clear.

The frontend must never infer “clear” solely from absence in `flags`.

## 8. `band` and `bandConfidence` stay together

Examples:
- `LOW + full` is materially stronger than `LOW + partial`.
- `CRITICAL + partial` means enough evidence already exists for CRITICAL while some checks remain unavailable.

Every compact risk component, including hero/marketing previews, needs a defined way to show confidence.

## 9. `cost` and `reachable` stay together

For `manipulationCostOrderbookOnly`, never render cost without reachability context.

| Cost | Reachable | Meaning |
|---:|---|---|
| 0 | true | target reachable at zero third-party cost — dangerous |
| 0 | false | target cannot be reached because liquidity is absent |
| >0 | true | target has measurable cost |
| >0 | false | book is exhausted before the target; shown cost is not the price of reaching it |

For `manipulationCostCombined`, do not blindly reuse orderbook-only semantics.

## 10. Data source changes the claim

Display source near historical/reconstructed metrics.

Confidence order:

```text
horizon / hubble
      ↓
offers-implied
      ↓
trades-implied
```

`trades-implied` is a lower bound from consumed liquidity, not a complete observation of available liquidity.

## 11. Never hardcode methodology configuration

Do not hardcode:
- methodology version;
- risk thresholds;
- oracle window;
- critical delta;
- assumptions exposed by `/methodology` or response fields.

Landing mocks may contain a methodology version because the fixture contains it, but UI copy must not present that version as a permanent constant.

## 12. Preserve quote units

Always display the quote code next to key values:

```text
441,038 XLM
104.88 USDC
```

Do not silently convert all values to USD.

## 13. Source breakdowns must come from real fields

The revised hero/product bento may show SDEX and AMM contribution.

Only show a percentage breakdown when it can be derived correctly from backend-provided source contributions.

Do not invent decorative `72% / 28%` values just because the mockup used those numbers as an example.

If the contract exposes absolute source contributions but not percentages, derive percentages with exact decimal arithmetic and handle zero totals explicitly.

## 14. Market Snapshot rows must be contract-compatible

The landing-page market snapshot should ideally reuse the asset-list endpoint shape or generated mocks.

If several fixture states are combined into a demonstration table:
- keep each row internally consistent;
- do not imply the table is live unless it is live;
- label it as preview/demo data where necessary.

## 15. Historical gaps are data

A history response can contain gaps. A chart must not connect missing intervals in a way that implies observed continuity.

Recommended:
- break the line;
- annotate gap interval;
- explain supplied reason;
- distinguish reconstructed series.

## 16. Event markers do not create causal claims

The Blend case-study preview may mark the incident date on a historical chart.

The marker means “this event happened here in time.” It does not by itself prove that a metric predicted, caused, or would have prevented the incident.

Copy around the chart must preserve that distinction.

## 17. Surface provenance

Asset detail and substantial landing product previews should expose some combination of:
- `ledgerSeq`;
- `ledgerClosedAt` when present;
- `computedAt`;
- `methodologyVersion`;
- `dataSource`;
- live staleness;
- warnings;
- confidence.

The landing page may use a compact provenance strip; full detail belongs on asset detail.

## 18. API preview must match the contract

Do not hand-write a pretty JSON response containing fields that do not exist or use different casing/types.

Preferred approaches:
1. render a trimmed real backend mock;
2. construct a typed subset from generated schema;
3. show ellipses for omitted fields rather than fabricating them.

The request path and parameters shown on the landing/API page must match current OpenAPI.

## 19. API errors vs risk findings

Keep separate UI families.

**Risk/data findings:**
- no executable price;
- extreme spread;
- partial confidence;
- unavailable supporting metric;
- reconstruction/lower bound.

**Application/API errors:**
- network failure;
- 429 rate limit;
- invalid input;
- historical service unavailable;
- asset/ledger not found.

A risk finding must never fall through to a generic error state.

## 20. Product integrity rule

The revised design deliberately makes the landing page look more like the product.

That increases the obligation to keep every visible number and state semantically plausible.

A beautiful preview with incorrect risk semantics is worse than a plain but accurate one.
