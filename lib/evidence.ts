import {
  brokenBook,
  healthy,
  historical,
  market,
  methodology,
  noPrice,
  poolOnly,
} from './keel/fixtures/fixtures';

/**
 * The recorded evidence behind the claims on this page, rendered rather than dumped.
 *
 * These links existed so a reviewer could check a claim against what the engine
 * actually returns, and they handed over a JSON file to do it. A file is the right
 * thing to offer — it is the artefact, and nothing about it can be massaged by a
 * layout — but it is a bad first answer to "show me". So each one now has a page that
 * renders it through the same components the product uses, with the file one click
 * away underneath.
 *
 * Every page says, in the page itself, that it is a recorded sample and names the
 * ledger it was taken at. Sample data must never be able to pass for live data.
 */

export type EvidenceKind = 'asset' | 'list' | 'methodology';

export interface EvidenceItem {
  readonly slug: string;
  readonly kind: EvidenceKind;
  /** The page heading, written as what a reader came to find out. */
  readonly title: string;
  /** What this recording demonstrates, and why it is worth looking at. */
  readonly summary: string;
  /** The file this was recorded into, still served verbatim. */
  readonly rawPath: string;
  readonly data: unknown;
}

export const EVIDENCE: readonly EvidenceItem[] = [
  {
    slug: 'asset-healthy',
    kind: 'asset',
    title: 'What a healthy market looks like',
    summary:
      'Both sides of the book are present, the price has depth behind it, and nothing is flagged. This is the shape every other recording here departs from.',
    rawPath: '/evidence/asset-healthy.json',
    data: healthy,
  },
  {
    slug: 'asset-broken-book',
    kind: 'asset',
    title: 'What a broken order book looks like',
    summary:
      'One ask, one bid, far apart. The midpoint between them is arithmetic rather than a price, so every depth rung measured from it is unreliable — and the engine says so rather than quietly publishing the number.',
    rawPath: '/evidence/asset-broken-book.json',
    data: brokenBook,
  },
  {
    slug: 'asset-no-price',
    kind: 'asset',
    title: 'What no executable price looks like',
    summary:
      'The engine answered successfully and found no price that can be traded against. This is a finding about the asset, not a failure of the request, and it is the most dangerous state Keel can report.',
    rawPath: '/evidence/asset-no-price.json',
    data: noPrice,
  },
  {
    slug: 'asset-pool-only',
    kind: 'asset',
    title: 'What a pool-only market looks like',
    summary:
      'No order book, only an AMM. A constant product curve has no highest price, so figures that depend on one are null for a structural reason the engine explains in its own words.',
    rawPath: '/evidence/asset-pool-only.json',
    data: poolOnly,
  },
  {
    slug: 'asset-historical',
    kind: 'asset',
    title: 'What a rebuilt past reading looks like',
    summary:
      'A result at a past ledger, rebuilt from the operation stream rather than read from a live book. Every gap the rebuild knows about removes offers, so its depth is a lower bound and its risk an upper bound, and the result counts its own gaps so a reader can see how large they are.',
    rawPath: '/evidence/asset-historical.json',
    data: historical,
  },
  {
    slug: 'asset-list-mixed',
    kind: 'list',
    title: 'A set of markets, side by side',
    summary:
      'The same summary the monitored set is built from: band, confidence, depth, collateral ceiling and the flags that fired, one row per market.',
    rawPath: '/evidence/asset-list-mixed.json',
    data: market,
  },
  {
    slug: 'methodology',
    kind: 'methodology',
    title: 'The thresholds behind every band',
    summary:
      'Every threshold the engine applies, served by the engine itself. They are chosen rather than calibrated, and the note saying so travels with them.',
    rawPath: '/evidence/methodology.json',
    data: methodology,
  },
];

export function findEvidence(slug: string): EvidenceItem | undefined {
  return EVIDENCE.find((item) => item.slug === slug);
}

/**
 * Evidence the engine filed after the report's sections 5 and 6 were written, linked
 * where it lives rather than copied. Each is a dated record in the engine repository
 * with its own reproduction steps; a copy here would be a second home that drifts.
 */
const ENGINE_EVIDENCE_BASE =
  'https://github.com/Keel-Official/keel-backend/tree/main/docs/evidences';

export interface EngineEvidenceLink {
  readonly title: string;
  readonly summary: string;
  readonly href: string;
}

export const ENGINE_EVIDENCE: readonly EngineEvidenceLink[] = [
  {
    title: 'The daily book rebuild, beyond the USTRY maker',
    summary:
      'Read 17 September 2026. Whether the 00:10 UTC withdrawal-and-repost seen on the USTRY book is something other makers do, measured over the same February window.',
    href: `${ENGINE_EVIDENCE_BASE}/2026-09-17-maker-cadence-generalisation`,
  },
  {
    title: 'The first pass of the trade-derived metrics',
    summary:
      'Read 18 September 2026. What volume-to-supply and time-since-last-genuine-trade cost to compute on public Horizon, and what they answer across the demonstration set.',
    href: `${ENGINE_EVIDENCE_BASE}/2026-09-18-trade-derived-metrics-first-pass`,
  },
];
