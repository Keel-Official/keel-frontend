# Current State

## Purpose and current focus

Keel is a Next.js frontend for a read-only Stellar liquidity-risk engine. Its product question is whether a quoted price is backed by executable volume, and what it would cost to move that market.

The current application has two connected surfaces:

- `/` is the marketing and evidence entry point.
- `/dashboard` is the live monitored-asset overview, with `/dashboard/asset/[assetId]` for an asset result and `/dashboard/methodology` for the engine methodology.

The active work is making the dashboard useful as a review surface: lead with findings, preserve the engine’s confidence and provenance, and keep filters shareable under the mounted `/dashboard` route.

## Workflow and product rules

- The backend is a separate source of truth. Do not modify backend code from this repository.
- Before changing data UI or data-like previews, use `docs/05-frontend-data-contract.md` and the backend OpenAPI semantics.
- Preserve exact decimal strings, `null` versus zero, no executable price, triggered versus unevaluated flags, band plus band confidence, manipulation cost plus reachability, reconstructed or lower-bound sources, quote units, historical gaps, and provenance.
- Keel remains read-only. Do not add authentication, wallet connection, transaction signing, blockchain writes, or a frontend database.
- Risk must be communicated with text and structure as well as color. Keep visible focus, readable product text, reduced-motion behavior, touch-sized controls, and chart text equivalents.
- Follow `docs/03-design-system.md` and `docs/04-landing-page-spec.md`; the product object should appear before generic marketing explanation.

## Repository and runtime

- Stack: Next.js 16.3.4 App Router, React 19.2.8, TypeScript, Tailwind CSS 4.3.3, and pnpm.
- Root route groups are `app/(marketing)/` and `app/(dashboard)/`.
- Dashboard server pages read health, assets, and methodology through `lib/keel/api/server.ts`. `app/(dashboard)/dashboard/page.tsx` is dynamic so scan freshness is not frozen at build time.
- `NEXT_PUBLIC_KEEL_API_URL` selects the API transport. If it is unset or unreachable, the dashboard renders an explicit transport error; the landing page remains useful without live data.
- The frontend has no database and no write path. Deployment and a production preview are not verified in this checkout.
- The numbered docs in `docs/00-README.md` through `docs/07-implementation-roadmap.md` are present. `docs/architecture.md`, `docs/workshop-work-order.md`, and `docs/decisions.md` are absent.

## Current implementation state

- The dashboard overview renders a finding-led summary derived from the visible asset rows, followed by operational metadata and the monitored asset table.
- The overview keeps critical and high counts linked to the existing URL filter state and shows triggered-flag and partial-confidence counts without inventing risk scores.
- The asset filter form submits to `/dashboard`; band links, search, flag filtering, sorting, and clear-filter links use the mounted route helpers.
- Filter controls and band links have larger touch targets. The table calls the count `Triggered flags` so it does not imply that zero means a clean evaluation; the page still explains that unevaluated checks are exposed on the asset detail route.
- The transport-error notice keeps the configuration guidance and now provides a same-view `Try again` action. The triggered-flag explanation sits directly above the table and is referenced by both desktop and mobile results.
- The scan metadata rail gives the monitored-asset count more visual weight than the supporting ledger, methodology, and engine readings so the overview does not read as four equal dashboard tiles.
- The dashboard stylesheet imports Tailwind directly and keeps its small class-name joiner local, so development does not depend on resolving unused `tw-animate-css`, `shadcn/tailwind.css`, or `cn` package entrypoints.
- Existing untracked Impeccable critique artifacts under `.impeccable/` are preserved as review evidence.

## Branch and workspace

- Branch: `feat/dashboard-audit-fixes`.
- Current `HEAD`: `fix: refine dashboard review surface` (the latest commit on this branch).
- Relevant preceding commits include `389e1d4 Say what a link gives you, and send methodology to the dashboard` and the evidence-page merges immediately before the dashboard mount.
- The working tree is clean after committing the dashboard audit fixes, critique evidence, this UI refinement, and the updated handover snapshot.
- No push or merge has been performed.

## Verification and limits

Verified on the current checkout:

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.
- `npm.cmd test` passed: 4 test files and 28 tests.
- `npm.cmd run build` passed; Next compiled the dashboard and generated `/dashboard`, `/dashboard/asset/[assetId]`, and `/dashboard/methodology`.
- A clean `npm.cmd exec -- next dev` run served `/dashboard` with HTTP 200 and the expected API-unavailable notice.
- `pnpm install --frozen-lockfile --force` completed with pnpm 11.25.0 and restored the dependency tree after the package graph change.
- The route helper tests continue to cover the mounted dashboard and asset-detail paths.
- Impeccable's detector returned `[]` for the refined dashboard files.
- A populated local preview at `http://localhost:3000/dashboard` returned HTTP 200 and rendered the finding summary, monitored-assets section, and flags explanation.
- `git diff` review covers the dashboard hierarchy change, filter route fix, touch targets, triggered-flag wording, recovery action, KPI rail refinement, and the handover rewrite.

Blocked or not yet verified:

- The bundled fallback `pnpm` executable in this agent is 11.19.0 while the project declares pnpm 11.25.0; it may attempt a metadata refresh before running scripts. The project’s normal pnpm 11.25.0 install is verified above.
- A mobile screenshot pass and a contract-mock error-state browser pass are not verified in this checkout.
- The repository-wide Prettier check reports 65 existing files outside this change as unformatted; no broad formatting rewrite was applied.

## Open risks and next checks

- Re-run formatting selectively if the repository adopts a formatting baseline, then complete populated desktop/mobile browser checks once the API or contract mock is configured.
- Verify the Apply flow with `q` and `hasFlag` against a live or contract API, including preserved band, sort, and direction parameters.
- Keep the list endpoint’s limitation visible: it exposes triggered flags but not `unevaluatedFlags`; the asset detail remains the source for that distinction.
- Before deployment, audit all prominent links against the actual route tree and verify the API contract, provenance, and historical-gap states with non-happy-path fixtures.
