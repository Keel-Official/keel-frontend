import Link from 'next/link';

import type { AssetSummary } from '@/lib/keel/api/types';
import { BAND_TOKENS } from '@/lib/keel/design/tokens';
import { assetHref, type AssetQuery } from '@/lib/keel/url/asset-query';

/**
 * A compact reading of the current result set. The dashboard should answer what
 * deserves attention before it presents scan metadata, so these counts are derived
 * from the same rows a reviewer can see below rather than from invented health scores.
 */
export function FindingSummary({
  rows,
  query,
}: {
  rows: readonly AssetSummary[];
  query: AssetQuery;
}) {
  const critical = rows.filter((item) => item.band === 'CRITICAL').length;
  const high = rows.filter((item) => item.band === 'HIGH').length;
  const flagged = rows.filter((item) => item.flags.length > 0).length;
  const partial = rows.filter(
    (item) => item.bandConfidence === 'partial',
  ).length;
  const attention = critical + high;

  const lead =
    rows.length === 0
      ? 'No assets are in the current view.'
      : attention > 0
        ? `${attention} ${attention === 1 ? 'asset is' : 'assets are'} in the high or critical bands.`
        : 'No assets in the current view are in the high or critical bands.';

  return (
    <section
      aria-labelledby="finding-summary-title"
      className="mb-6 grid gap-5 keel-panel p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5"
    >
      <div className="min-w-0">
        <p className="keel-marker">Review signal</p>
        <h2
          id="finding-summary-title"
          className="mt-1 text-xl font-semibold tracking-tight text-[var(--keel-ink-strong)]"
        >
          What needs attention first?
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--keel-muted)]">
          {lead} The figures below are the engine&apos;s findings for this view;
          confidence and triggered flags stay visible beside each result.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:min-w-[19rem]">
        <BandSignal band="CRITICAL" count={critical} query={query} />
        <BandSignal band="HIGH" count={high} query={query} />
        <SignalValue value={flagged} label="assets with triggered flags" />
        <SignalValue value={partial} label="partial-confidence results" />
      </div>
    </section>
  );
}

function BandSignal({
  band,
  count,
  query,
}: {
  band: 'CRITICAL' | 'HIGH';
  count: number;
  query: AssetQuery;
}) {
  const token = BAND_TOKENS[band];

  return (
    <Link
      href={assetHref(query, { band })}
      className="group flex min-w-0 items-baseline gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
      aria-label={`Show ${count} ${token.label.toLowerCase()} assets`}
    >
      <span
        className="tabular text-2xl font-semibold leading-none"
        style={{ color: token.ink }}
      >
        {count}
      </span>
      <span className="min-w-0 text-xs text-[var(--keel-muted)] group-hover:underline group-hover:underline-offset-2">
        {token.label} assets
      </span>
    </Link>
  );
}

function SignalValue({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-0 items-baseline gap-2">
      <span className="tabular text-2xl font-semibold leading-none text-[var(--keel-ink-strong)]">
        {value}
      </span>
      <span className="min-w-0 text-xs text-[var(--keel-muted)]">{label}</span>
    </div>
  );
}
