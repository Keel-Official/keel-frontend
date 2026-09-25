import Link from 'next/link';
import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react';

import { assetKey } from '@/lib/keel/assets/list';
import type { RowSeries } from '@/lib/keel/assets/row-series';
import { BAND_TOKENS, CONFIDENCE_TOKENS } from '@/lib/keel/design/tokens';
import type { AssetSummary } from '@/lib/keel/api/types';
import { truncateIssuer } from '@/lib/keel/format/decimal';
import { classify } from '@/lib/keel/format/value';
import { dashboardAssetPath } from '@/lib/keel/routes';
import {
  sortHref,
  type AssetQuery,
  type SortKey,
} from '@/lib/keel/url/asset-query';
import { cn } from '@/lib/keel/utils';

import { BandChip } from './band-chip';
import { FlagChip } from './flag-chip';
import { Term } from './term';
import { Value } from './value';
import {
  WindowRangeCell,
  WindowTrendCell,
  WindowVerdictCell,
} from './window-cells';

/**
 * The monitored set, in full, and the way into one asset.
 *
 * Every column heading is a link, so an ordering is shareable like any other part of
 * the view, and every row opens that asset's own page. A desktop table and a mobile
 * card list render the same rows from the same data rather than hiding columns behind a
 * horizontal scroll.
 *
 * FLAGS ARE NAMED, NOT COUNTED. This column used to be the integer `4`, which told a
 * reader that something was wrong and nothing about what. It now shows the two flags
 * that fired with the rest behind a count, in words, because the fourth question this
 * page exists to answer is *why* an asset is risky and a number cannot answer it.
 *
 * The count of triggered flags still cannot be read as a clean bill of health: the list
 * endpoint does not carry `unevaluatedFlags`, so a row with nothing triggered may still
 * have had checks that could not run. That is said above the table and the drill-down
 * is where the distinction is shown in full.
 */

interface Column {
  key: SortKey | 'trend' | 'range' | 'verdict';
  label: string;
  term?: React.ComponentProps<typeof Term>['name'];
  numeric?: boolean;
  /** A column the reader can order by. A window figure is not one: see `columns`. */
  sort?: SortKey;
  /** Present only from `lg` up, where the table is not already a scroll region. */
  windowOnly?: boolean;
}

/**
 * The columns, which depend on whether this table was given a window.
 *
 * NONE OF THE WINDOW COLUMNS IS SORTABLE. Sorting is applied to the whole filtered set
 * before it is paged, and a window figure exists only for the rows on screen — an
 * ordering by it would silently describe a page rather than the set, which is the exact
 * failure the notice above this table exists to report.
 */
function columns(
  trend: AssetTableTrend | undefined,
  bandSort: boolean,
): Column[] {
  const base: Column[] = [
    { key: 'asset', label: 'Asset', sort: 'asset' },
    // In a band section every row carries the same band, so neither the chip nor an
    // ordering by it says anything the heading has not: the column narrows to the one
    // part that still varies, which is whether the band is a floor.
    bandSort
      ? { key: 'band', label: 'Risk', term: 'band', sort: 'band' as const }
      : { key: 'band', label: 'Confidence', term: 'confidence' },
    {
      key: 'depth',
      label: 'Depth, 5% buy',
      term: 'depth',
      numeric: true,
      sort: 'depth',
    },
  ];

  const windowColumns: Column[] = trend
    ? [
        {
          key: 'trend',
          label: `Over the ${trend.label}`,
          term: 'window',
          windowOnly: true,
        },
        { key: 'range', label: 'Low / high', numeric: true, windowOnly: true },
        {
          key: 'verdict',
          label: 'Verdict in window',
          term: 'band',
          windowOnly: true,
        },
      ]
    : [];

  return [
    ...base,
    ...windowColumns,
    {
      key: 'collateral',
      label: 'Max safe collateral',
      term: 'collateral',
      numeric: true,
      sort: 'collateral',
    },
    { key: 'flags', label: 'Why', term: 'flags', sort: 'flags' },
  ];
}

/** More than this and the row is a wall of chips; the rest go behind a count. */
const FLAGS_SHOWN = 2;

/** The stored series behind the rows on screen, when this view asked for them. */
export interface AssetTableTrend {
  /** "last 7 days", for the column heading. */
  readonly label: string;
  /** Keyed by `assetKey`. A missing entry is "not read in this view", not "empty". */
  readonly series: ReadonlyMap<string, RowSeries>;
}

export interface AssetTableProps {
  items: readonly AssetSummary[];
  query: AssetQuery;
  /** Omitted renders exactly the table that existed before the window columns. */
  trend?: AssetTableTrend;
  /** False inside a band section, where every row shares one band. */
  bandSort?: boolean;
  /** Four sections mean four scroll regions, and four identical names help nobody. */
  regionLabel?: string;
}

export function AssetTable({
  items,
  query,
  trend,
  bandSort = true,
  regionLabel = 'Monitored assets, scrollable',
}: AssetTableProps) {
  const shown = columns(trend, bandSort);
  return (
    <>
      {/* Desktop. `overflow-visible` from lg up so a term's panel is not clipped by
          the scroll container; below that the card list takes over. */}
      <div
        tabIndex={0}
        role="region"
        aria-label={regionLabel}
        className="keel-panel relative hidden overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)] md:block lg:overflow-x-visible"
      >
        <table
          className="w-full border-collapse text-sm"
          aria-describedby="flags-help"
        >
          <thead>
            <tr className="border-b border-[var(--keel-border)] bg-[var(--keel-surface-subtle)]">
              {shown.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    column.sort === undefined
                      ? undefined
                      : query.sort === column.sort
                        ? query.dir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                  }
                  className={cn(
                    'keel-marker px-3 py-2.5 align-bottom',
                    column.numeric ? 'text-right' : 'text-left',
                    column.windowOnly && 'hidden lg:table-cell',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5',
                      column.numeric && 'flex-row-reverse',
                    )}
                  >
                    {column.sort === undefined ? (
                      column.label
                    ) : (
                      <SortLink
                        query={query}
                        column={column.sort}
                        label={column.label}
                      />
                    )}
                    {column.term ? (
                      <Term
                        name={column.term}
                        align={column.numeric ? 'end' : 'start'}
                      >
                        <span className="sr-only">{column.label}</span>
                      </Term>
                    ) : null}
                  </span>
                </th>
              ))}
              <th scope="col" className="w-10 px-3 py-2.5">
                <span className="sr-only">Open detail</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const id = assetKey(item);
              const token = BAND_TOKENS[item.band];

              return (
                <tr
                  key={id}
                  className="border-b border-[var(--keel-border)] last:border-0 hover:bg-[var(--keel-surface-subtle)]"
                >
                  <td className="px-3 py-2.5">
                    {/* The band hue as a rule down the row: a second, pre-attentive
                        pass at severity for someone scanning the column of names. */}
                    <span className="flex items-stretch gap-2.5">
                      <span
                        aria-hidden="true"
                        className="w-0.5 shrink-0 rounded-full"
                        style={{ backgroundColor: token.mark }}
                      />
                      <AssetIdentity asset={item} />
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {bandSort ? (
                      <BandChip
                        band={item.band}
                        confidence={item.bandConfidence}
                      />
                    ) : (
                      <span
                        className="text-xs whitespace-nowrap"
                        style={{
                          color: CONFIDENCE_TOKENS[item.bandConfidence].ink,
                        }}
                        title={CONFIDENCE_TOKENS[item.bandConfidence].label}
                      >
                        {item.bandConfidence}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <DepthCell item={item} />
                  </td>
                  {trend ? (
                    <>
                      <td className="hidden px-3 py-2.5 lg:table-cell">
                        <WindowTrendCell series={trend.series.get(id)} />
                      </td>
                      <td className="hidden px-3 py-2.5 text-right lg:table-cell">
                        <WindowRangeCell
                          series={trend.series.get(id)}
                          quoteCode={item.quote.code}
                        />
                      </td>
                      <td className="hidden px-3 py-2.5 lg:table-cell">
                        <WindowVerdictCell series={trend.series.get(id)} />
                      </td>
                    </>
                  ) : null}
                  <td className="px-3 py-2.5 text-right">
                    <Value
                      value={classify(item.maxSafeCollateral, item.quote.code)}
                      maxFractionDigits={2}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <Reasons item={item} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Link
                      href={dashboardAssetPath(id)}
                      aria-label={`Open the full result for ${item.asset.code}`}
                      className="inline-flex size-8 items-center justify-center rounded-md text-[var(--keel-muted)] hover:bg-[var(--keel-surface)] hover:text-[var(--keel-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
                    >
                      <ChevronRight aria-hidden="true" className="size-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul
        className="flex flex-col gap-2 md:hidden"
        aria-describedby="flags-help"
      >
        {items.map((item) => {
          const id = assetKey(item);
          const token = BAND_TOKENS[item.band];

          return (
            <li
              key={id}
              className="keel-panel p-3"
              style={{ borderLeftColor: token.mark, borderLeftWidth: 3 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <AssetIdentity asset={item} />
                <BandChip band={item.band} confidence={item.bandConfidence} />
              </div>
              <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-[var(--keel-muted)]">Depth, 5% buy</dt>
                <dd className="text-right">
                  <DepthCell item={item} />
                </dd>
                <dt className="text-[var(--keel-muted)]">
                  Max safe collateral
                </dt>
                <dd className="text-right">
                  <Value
                    value={classify(item.maxSafeCollateral, item.quote.code)}
                    maxFractionDigits={2}
                  />
                </dd>
              </dl>
              {trend ? (
                <div className="mt-2.5 border-t border-[var(--keel-border)] pt-2.5">
                  {/* A card has the width a row does not, so the series is larger here
                      and the window's figures sit under it rather than beside it. */}
                  <WindowTrendCell series={trend.series.get(id)} />
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                    <dt className="text-[var(--keel-muted)]">
                      {`Low / high, ${trend.label}`}
                    </dt>
                    <dd className="text-right">
                      <WindowRangeCell
                        series={trend.series.get(id)}
                        quoteCode={item.quote.code}
                      />
                    </dd>
                    <dt className="text-[var(--keel-muted)]">
                      Verdict in window
                    </dt>
                    <dd className="text-right">
                      <WindowVerdictCell series={trend.series.get(id)} />
                    </dd>
                  </dl>
                </div>
              ) : null}
              <div className="mt-2.5">
                <Reasons item={item} />
              </div>
              <Link
                href={dashboardAssetPath(id)}
                className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm text-[var(--keel-accent)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
              >
                Open the full result
                <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/**
 * The depth figure, with the one state that has to shout.
 *
 * A computed zero is a measurement and the most severe thing this column can report:
 * nothing at all can be traded before the price moves five per cent. Rendered as
 * `0.00` beside a row of ordinary numbers it reads as a rounding artefact, so it says
 * what it means in words instead.
 */
function DepthCell({ item }: { item: AssetSummary }) {
  const depth = classify(item.depth5PctBuySide, item.quote.code);

  if (depth.state === 'zero') {
    return (
      <span
        className="tabular inline-flex items-baseline gap-1.5 font-medium text-[var(--band-critical-ink)]"
        data-exact={depth.exact}
      >
        0<span className="text-xs font-normal">nothing tradable</span>
      </span>
    );
  }

  return <Value value={depth} maxFractionDigits={2} />;
}

/**
 * Why this asset is where it is: the flags that fired, in words.
 *
 * An empty list is NOT presented as a pass. The list endpoint carries no
 * `unevaluatedFlags`, so the honest statement for a row with nothing triggered is that
 * nothing triggered — not that everything was checked.
 */
function Reasons({ item }: { item: AssetSummary }) {
  if (item.flags.length === 0) {
    return (
      <span className="text-xs text-[var(--keel-muted)]">
        Nothing triggered
      </span>
    );
  }

  const shown = item.flags.slice(0, FLAGS_SHOWN);
  const rest = item.flags.length - shown.length;

  return (
    <span className="flex flex-wrap items-baseline gap-1">
      {shown.map((flag) => (
        <FlagChip key={flag} flag={flag} showCode={false} />
      ))}
      {rest > 0 ? (
        <span className="text-xs whitespace-nowrap text-[var(--keel-muted)]">
          {`+${rest} more`}
        </span>
      ) : null}
    </span>
  );
}

function AssetIdentity({ asset }: { asset: AssetSummary }) {
  const id = assetKey(asset);

  return (
    <span className="block min-w-0">
      <Link
        href={dashboardAssetPath(id)}
        className="font-medium text-[var(--keel-ink-strong)] underline-offset-2 hover:text-[var(--keel-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
      >
        {asset.asset.code}
      </Link>
      <span className="text-[var(--keel-muted)]"> / {asset.quote.code}</span>
      {asset.asset.issuer ? (
        <span
          className="tabular block text-xs text-[var(--keel-muted)]"
          title={asset.asset.issuer}
        >
          {truncateIssuer(asset.asset.issuer)}
        </span>
      ) : (
        <span className="block text-xs text-[var(--keel-muted)]">native</span>
      )}
    </span>
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
