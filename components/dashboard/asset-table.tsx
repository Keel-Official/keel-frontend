import Link from 'next/link';
import { ArrowDown, ArrowUp } from 'lucide-react';

import { assetKey } from '@/lib/keel/assets/list';
import { dashboardAssetPath } from '@/lib/keel/routes';
import type { AssetSummary } from '@/lib/keel/api/types';
import { truncateIssuer } from '@/lib/keel/format/decimal';
import { classify } from '@/lib/keel/format/value';
import {
  sortHref,
  type AssetQuery,
  type SortKey,
} from '@/lib/keel/url/asset-query';
import { cn } from '@/lib/keel/utils';

import { BandChip } from './band-chip';
import { Value } from './value';

/**
 * The monitored set.
 *
 * Every column heading is a link, so an ordering is shareable like any other part of
 * the view. A desktop table and a mobile card list render the same rows from the same
 * data rather than hiding columns behind a scroll.
 *
 * The flag count is the number of flags that FIRED. The list endpoint does not carry
 * `unevaluatedFlags`, so a zero here cannot be read as a clean bill of health, and the
 * caption below the table says so instead of leaving a reader to assume.
 */

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'asset', label: 'Asset' },
  { key: 'band', label: 'Band' },
  { key: 'depth', label: 'Depth, 5% buy side', numeric: true },
  { key: 'collateral', label: 'Max safe collateral', numeric: true },
  { key: 'flags', label: 'Triggered flags', numeric: true },
];

export interface AssetTableProps {
  items: readonly AssetSummary[];
  query: AssetQuery;
}

export function AssetTable({ items, query }: AssetTableProps) {
  return (
    <>
      {/* Desktop */}
      <div className="relative hidden overflow-x-auto rounded-lg border border-[var(--keel-border)] md:block">
        <table
          className="w-full border-collapse text-sm"
          aria-describedby="flags-help"
        >
          <thead>
            <tr className="border-b border-[var(--keel-border)] bg-[var(--keel-surface-subtle)]">
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    query.sort === column.key
                      ? query.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className={cn(
                    'px-3 py-2 font-medium text-[var(--keel-muted)]',
                    column.numeric ? 'text-right' : 'text-left',
                  )}
                >
                  <SortLink
                    query={query}
                    column={column.key}
                    label={column.label}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={assetKey(item)}
                className="border-b border-[var(--keel-border)] last:border-0 hover:bg-[var(--keel-surface-subtle)]"
              >
                <td className="px-3 py-2">
                  <AssetIdentity asset={item} />
                </td>
                <td className="px-3 py-2">
                  <BandChip band={item.band} confidence={item.bandConfidence} />
                </td>
                <td className="px-3 py-2 text-right">
                  <Value
                    value={classify(item.depth5PctBuySide, item.quote.code)}
                    maxFractionDigits={2}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <Value
                    value={classify(item.maxSafeCollateral, item.quote.code)}
                    maxFractionDigits={2}
                  />
                </td>
                <td className="px-3 py-2 text-right tabular">
                  <span aria-label={`${item.flags.length} triggered flags`}>
                    {item.flags.length}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul
        className="flex flex-col gap-2 md:hidden"
        aria-describedby="flags-help"
      >
        {items.map((item) => (
          <li
            key={assetKey(item)}
            className="rounded-lg border border-[var(--keel-border)] bg-[var(--keel-surface)] p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <AssetIdentity asset={item} />
              <BandChip band={item.band} confidence={item.bandConfidence} />
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <dt className="text-[var(--keel-muted)]">Depth, 5% buy</dt>
              <dd className="text-right">
                <Value
                  value={classify(item.depth5PctBuySide, item.quote.code)}
                  maxFractionDigits={2}
                />
              </dd>
              <dt className="text-[var(--keel-muted)]">Max safe collateral</dt>
              <dd className="text-right">
                <Value
                  value={classify(item.maxSafeCollateral, item.quote.code)}
                  maxFractionDigits={2}
                />
              </dd>
              <dt className="text-[var(--keel-muted)]">Triggered flags</dt>
              <dd
                className="text-right tabular"
                aria-label={`${item.flags.length} triggered flags`}
              >
                {item.flags.length}
              </dd>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

function AssetIdentity({ asset }: { asset: AssetSummary }) {
  const id = assetKey(asset);

  return (
    <div className="min-w-0">
      <Link
        href={dashboardAssetPath(id)}
        className="font-medium text-[var(--keel-brand)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
      >
        {asset.asset.code}
      </Link>
      <span className="text-[var(--keel-muted)]"> / {asset.quote.code}</span>
      {asset.asset.issuer ? (
        <div
          className="tabular text-xs text-[var(--keel-muted)]"
          title={asset.asset.issuer}
        >
          {truncateIssuer(asset.asset.issuer)}
        </div>
      ) : (
        <div className="text-xs text-[var(--keel-muted)]">native</div>
      )}
    </div>
  );
}

function SortLink({
  query,
  column,
  label,
}: {
  query: AssetQuery;
  column: SortKey;
  label: string;
}) {
  const active = query.sort === column;
  const Arrow = query.dir === 'asc' ? ArrowUp : ArrowDown;

  return (
    <Link
      href={sortHref(query, column)}
      className="inline-flex items-center gap-1 rounded hover:text-[var(--keel-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
    >
      {label}
      {active ? <Arrow aria-hidden="true" className="size-3.5" /> : null}
      <span className="sr-only">
        {active
          ? `, sorted ${query.dir === 'asc' ? 'ascending' : 'descending'}; activate to reverse`
          : ', activate to sort by this column'}
      </span>
    </Link>
  );
}
