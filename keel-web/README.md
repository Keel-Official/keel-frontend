# keel-web

The public, read-only dashboard for Keel: a liquidity-depth and manipulation-cost
engine for Stellar order books and AMM pools. It answers one question per asset — is
the reported price backed by executable market depth, and how much capital would it
cost to move that price.

No login, no user data, no CRUD. Every visitor sees the same page.

This app lives beside the marketing site in the same repository. The marketing site is
the Next.js app at the repository root; `keel-web/` is a separate Next.js app with its
own `package.json`, lockfile, and toolchain. The root `tsconfig.json` and
`eslint.config.mjs` exclude this directory so the two do not lint or typecheck each
other.

## Running locally

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

**The dev server must run on port 5173.** This is not a preference. The Keel API uses
an exact-match CORS origin allowlist with no wildcard, and `http://localhost:5173` is
the only localhost origin on it. Port 3000 is rejected, and it is also the API's own
port. Verified 16 September 2026:

```bash
curl -sI -H 'Origin: http://localhost:5173' \
  'https://api.keels.app/v1/assets?limit=1' | grep -i access-control-allow-origin
# access-control-allow-origin: http://localhost:5173

curl -sI -H 'Origin: http://localhost:3000' \
  'https://api.keels.app/v1/assets?limit=1' | grep -i access-control-allow-origin
# (no output — origin not allowed)
```

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | dev server on port 5173 |
| `pnpm build` | production build |
| `pnpm check` | typecheck, lint, contract drift, and the float/storage guard |
| `pnpm generate:api` | regenerate `lib/api/schema.d.ts` from the vendored contract |
| `pnpm check:contract` | fail if the committed types are not what the contract generates |
| `pnpm check:contract-upstream` | fail if the vendored contract differs from the backend's copy (local only) |
| `pnpm check:no-float-math` | fail on `parseFloat`, `Number(`, or browser storage outside the geometry allowlist |
| `pnpm smoke:api` | send one request per endpoint through the typed client and print what came back |

`pnpm check` is what CI runs, plus the build. See `.github/workflows/keel-web.yml`.

## Open blocker: CORS origin for the deployed dashboard

Before this app is deployed anywhere, the deployment origin must be added to
`KEEL_CORS_ORIGINS` in the Keel API production environment. That is a production change
on the backend and is not made from this repository.

As of 16 September 2026 no public origin is allowed, including `https://keels.app`. A
wildcard is refused at startup by design, so "allow `*`" is not available.

**The deployment domain has not been decided yet.** Raise this with the operator before
deploy day, not on it.

## The API

Base URL `https://api.keels.app/v1`. No key, no auth, read only.

| Endpoint | Purpose |
|---|---|
| `GET /health` | engine liveness and how stale the numbers are |
| `GET /methodology` | the version and every threshold that produced the numbers |
| `GET /assets` | the monitored set, one risk summary per asset |
| `GET /asset/{assetId}/depth` | the full risk result for one asset |
| `GET /asset/{assetId}/history` | the same metrics over a ledger range |

`assetId` is `CODE:ISSUER`, or the bare string `XLM`. Never match an asset on its code
alone: 97 distinct assets share the AQUA ticker.

`GET /asset/{id}/depth?ledger=` returns **503 `HISTORICAL_UNAVAILABLE`** on this
deployment, always. Do not build UI around that parameter.

Two response headers are CORS-exposed and carry provenance:

| Header | Present on |
|---|---|
| `X-Keel-Methodology-Version` | every endpoint |
| `X-Keel-Staleness-Seconds` | `/assets` and `/asset/{id}/depth` only |

Measured 16 September 2026: `/health` and `/methodology` do **not** carry the
staleness header. A screen built on those two sources gets its staleness from
`/health.latestScanAt` instead. `readProvenance()` in `lib/api/client.ts` returns
`null` for an absent header rather than inventing a zero.

## Contract

Types are generated from `../../keel-backend/docs/api/keel-openapi.yaml`, which is
version **1.6.1 (16 September 2026)**.

Note that this is *not* the document published at
`https://keels.app/evidence/keel-openapi.yaml`, which is still **1.5.0 (5 September
2026)**. The two differ, and 1.6.1 carries corrections a consumer can act on — most
importantly `manipulationRatioLowPct`, which reads `0.1` and not `1.0`.

The generated types are committed, and two separate drifts are checked:

- `pnpm check:contract` — do the committed types still match the vendored contract?
  Runs in CI, no network, build-failing.
- `pnpm check:contract-upstream` — does the vendored contract still match the copy in
  `keel-backend/docs/api/`? Local only, because the backend is not checked out in CI,
  and a difference is a decision for a person rather than for a build step.

The vendored copy is kept byte-identical to the backend's so that comparison means
something. Do not edit it in place — including its `servers:` block, which still lists
the placeholder `https://api.keel.example/v1` rather than the real base URL.

## Rules this codebase enforces

1. **Zero arithmetic on monetary values.** No addition, division, percentage
   derivation, or unit conversion. Every displayed number already exists as a field in
   the API response. A missing field is a contract gap to report, not a value to
   compute here.
2. **Never `parseFloat`, `Number()`, or `+` a monetary value.** They arrive as decimal
   strings and are rendered as strings. `"271091.75404722689504149709"` does not
   survive `Number()`. The only numeric fields are `delta` and integer counts such as
   `ledgerSeq`.
3. **Chart geometry is the single exception.** Pixel positions need numbers. Conversion
   happens only inside one named geometry module. Every label, tooltip, axis tick, and
   table cell the reader sees comes from the original string.
4. **Every view carries `ledgerSeq` and `methodologyVersion` on screen.** A screenshot
   of any page must be enough to re-verify the number it shows.
5. **`cost` is never shown without `reachable`.** `cost: "0"` with `reachable: true`
   means the target is free to reach; with `reachable: false` it means there is no
   liquidity at all. Opposite findings, never the same visual treatment.
6. **`null` is unknown, never zero.** `maxSafeCollateral: "0"` is a computed finding;
   `null` means it could not be computed. These must not look alike.
7. **Never interpolate across `gaps`.** They render as holes in the line.
8. **No browser storage.** No `localStorage`, `sessionStorage`, or cookies. Filter
   state lives in the URL.
9. **`manipulationCostOrderbookOnly` <= `manipulationCostCombined`.**
10. **SDEX and AMM depth are never two numbers to be added.** They are combined by the
    engine through one shared marginal-price bound. A split is a decomposition of the
    combined figure, never two summands.
11. **An empty `flags` array is not a pass.** Check `unevaluatedFlags`. On 16 September
    2026 XLM reported band `LOW` with `flags: []` and six unevaluated flags.

## Measured facts, 16 September 2026

Re-verify rather than trusting this table; the commands are above and in the backend
kickoff document.

| Fact | Figure |
|---|---|
| Assets monitored | 61 |
| Methodology version | `1.0.8-draft` |
| Band distribution | CRITICAL 38, HIGH 12, MEDIUM 9, LOW 2 |
| `bandConfidence` | `partial` on 61 of 61. Not one is `full` |
| Historical replay | unavailable; `historicalAvailable: false` |

The `bandConfidence: full` state does not occur in live data at all. It is reachable
only from the contract mock, so it must not be treated as the design default.

## Scope

Three routes, which is what the Statement of Work is scored against:

| Route | Content |
|---|---|
| `/` | the monitored set: KPI strip, the asset table, filters in the URL |
| `/asset/[assetId]` | band, max safe collateral, depth, manipulation cost, flags, holders, history, provenance |
| `/methodology` | rendered live from `GET /methodology`; never hardcode a threshold |

## Licence

MIT. See `LICENSE`. The copyright holder is recorded as "Keel" — correct it if the
project uses a different legal name.
