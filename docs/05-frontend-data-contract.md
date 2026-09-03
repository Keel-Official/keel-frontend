# Keel Frontend — Data Contract Rules

This file is not a replacement for `keel-backend/docs/api/keel-openapi.yaml`. It is a frontend checklist for consuming that contract without changing its meaning.

## 1. Generate types; do not duplicate them

Generate frontend types from the backend OpenAPI contract with `openapi-typescript`.

Do not maintain a second manual `AssetRisk`, `HistoryResponse`, `Flag`, or `Band` model unless it is a UI-only derived type.

## 2. Decimal strings are exact data

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

## 3. `null` is never silently converted to zero

`null` means unknown/not available/not applicable according to the field.

UI rule:
- measured `0` → show `0`;
- `null` → show `—` or `Not available`, with context where the distinction matters.

## 4. No executable price is a successful API result

A monitored asset may return:

```text
HTTP 200
priceSource = none
midPrice = null
band = CRITICAL
```

This is not an application error. It is one of the most important findings Keel can display.

## 5. Broken orderbook needs a distinct presentation

When `SPREAD_EXTREME` is triggered, a populated `midPrice` can be misleading.

UI behavior:
- visibly mark the reference price as unreliable;
- show the spread warning;
- do not visually promote the 2/5/10 depth ladder as if it were an ordinary healthy calculation;
- surface stronger/relevant manipulation evidence.

## 6. Triggered, clear, and unevaluated are three different states

Backend semantics:

- `flags` → triggered.
- `unevaluatedFlags` → not assessed because required data was unavailable.
- a flag in neither collection → evaluated and clear.

The frontend must not infer “clear” from absence alone without also checking `unevaluatedFlags`.

## 7. `band` and `bandConfidence` stay together

Examples:

- `LOW + full` is a materially stronger statement than `LOW + partial`.
- `CRITICAL + partial` means enough evidence already exists for CRITICAL, while some checks remain unavailable.

Every compact risk component should have a defined way to surface partial confidence.

## 8. `cost` and `reachable` stay together

For `manipulationCostOrderbookOnly`, do not render a cost as meaningful without its `reachable` state.

Interpretation:

| Cost | Reachable | Meaning |
|---:|---|---|
| 0 | true | target is reachable at zero third-party cost — dangerous |
| 0 | false | target cannot be reached because liquidity is absent |
| >0 | true | target has a measurable cost |
| >0 | false | book is exhausted before target; the shown cost is not “the price of reaching it” |

For `manipulationCostCombined`, an active AMM pool makes every finite target mathematically reachable; do not reuse the orderbook-only interpretation blindly.

## 9. Data source changes the claim

Display source near historical/reconstructed metrics.

Confidence order:

```text
horizon / hubble
      ↓
offers-implied
      ↓
trades-implied
```

`trades-implied` is a lower bound from liquidity that was consumed, not a full measurement of liquidity that was available.

## 10. Never hardcode methodology configuration

Do not hardcode:
- methodology version;
- risk thresholds;
- oracle window;
- critical delta;
- assumptions exposed by `/methodology` or response fields.

The backend contract changed its oracle-window example from 300 to 900 seconds during the sprint specifically because consumers are expected to read configuration rather than memorize it.

## 11. Preserve quote units

Keel values are expressed in the pair's quote asset.

Always display the quote code next to key values:

```text
441,038 XLM
104.88 USDC
```

Do not silently convert all values to USD. If an indicative USD conversion is added later, it must be visually labeled as external/indicative and never substituted for the native Keel result.

## 12. Historical gaps are data

A history response can contain gaps. A chart must not visually connect missing intervals in a way that implies continuous observed data.

Recommended:
- break the line;
- shade/annotate gap interval;
- explain the reason where supplied.

## 13. Surface provenance

Asset detail should expose:
- `ledgerSeq`;
- `ledgerClosedAt` when present;
- `computedAt`;
- `methodologyVersion`;
- `dataSource`;
- API staleness header for live results;
- warnings.

These are not debugging details; they are part of Keel's reproducibility promise.

## 14. API errors vs risk findings

Keep separate UI families:

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

A risk finding should never fall through to a generic “Something went wrong” screen.

