import { Suspense, cache } from 'react';
import Link from 'next/link';

import { AssetFilters } from '@/components/dashboard/asset-filters';
import type { AssetTableTrend } from '@/components/dashboard/asset-table';
import { BandSection } from '@/components/dashboard/band-section';
import { DepthComposition } from '@/components/dashboard/depth-composition';
import { Notice } from '@/components/dashboard/notice';
import {
  FocusCard,
  FocusCardPending,
  OverviewHero,
} from '@/components/dashboard/overview-hero';
import { Pagination } from '@/components/dashboard/pagination';
import { AppShell } from '@/components/dashboard/layout/app-shell';
import {
  fetchAssets,
  fetchDepth,
  fetchHealth,
  fetchHistory,
} from '@/lib/keel/api/server';
import type { AssetSummary } from '@/lib/keel/api/types';
import {
  DEFAULT_HISTORY,
  HISTORY_RANGES,
  ledgerWindow,
  rowResolution,
} from '@/lib/keel/assets/history-range';
import { groupByBand, type BandGroup } from '@/lib/keel/assets/band-groups';
import { readRowSeries, type RowSeries } from '@/lib/keel/assets/row-series';
import { assetKey, filterByText, sortAssets } from '@/lib/keel/assets/list';
import { compareValues } from '@/lib/keel/format/compare';
import { classify } from '@/lib/keel/format/value';
import {
  assetHref,
  paginate,
  parseAssetQuery,
  type AssetQuery,
} from '@/lib/keel/url/asset-query';

/**
 * The monitored set.
 *
 * The page is built around the four questions a reader actually arrives with, in the
 * order they ask them, and each band of the layout answers exactly one:
 *
 *   what needs attention right now   the KPI cards
 *   what does the whole market look like   the risk map
 *   how has this one moved, and what is its depth made of   the focus panel
 *   which assets, with which figures, and why   the table
 *   why this one specifically   the drill-down
 *
 * Everything a reader chooses is in the URL — band, flag, search, ordering, and which
 * asset is open — so any view is a link they can send to someone. There is no client
 * state store and no fetch-on-open anywhere on this page.
 *
 * Never prerendered. A build that could not reach the API would otherwise bake its
 * error state into static HTML and serve it forever, and a page that did prerender
 * would freeze the ledger and the staleness it was built with — the one thing this
 * product exists to report accurately.
 */
export const dynamic = 'force-dynamic';

export default async function AssetsPage({
  searchParams,
}: PageProps<'/dashboard'>) {
  const query = parseAssetQuery(await searchParams);

  // The methodology is no longer read here. This page used to carry the engine's own
  // words on calibration beside the table, and dropping that display drops the request
  // with it rather than leaving a fetch whose result nothing renders. The caveat still
  // travels with every band on the asset result, which is where a reader acts on one.
  const [health, assets] = await Promise.all([
    fetchHealth(),
    fetchAssets({ band: query.band, hasFlag: query.hasFlag }),
  ]);

  const returned = assets.data?.items ?? [];
  const rows = sortAssets(
    filterByText(returned, query.q),
    query.sort,
    query.dir,
  );

  // The contract caps a page at 200 and sixty-one assets are monitored, so one request
  // holds the set and ordering across it is exact. If that stops being true, ordering
  // would silently describe a page rather than the set, so it is stated rather than
  // assumed.
  const total = assets.data?.total ?? 0;
  const partialPage = total > returned.length;

  // The table shows one page; everything else on the screen describes the whole
  // filtered set. The counts in the hero and the asset in focus are deliberately
  // computed from `rows` rather than from `paged.rows` — "39 critical" is a statement
  // about the market, not about which eight rows happen to be on screen.
  const paged = paginate(rows, query.page);

  // Four sections when nothing is selected; one, paged, when a band is. `rows` is
  // already the filtered set, so a selected band leaves three empty groups that are
  // never rendered.
  const groups = groupByBand(rows, query);
  const selectedGroup: BandGroup =
    query.band === null
      ? groups[0]
      : {
          band: query.band,
          rows,
          preview: paged.rows,
          // Nothing is held back behind a link here: the pagination below is how the
          // rest of this band is reached.
          hidden: 0,
          partial: rows.filter((row) => row.bandConfidence === 'partial')
            .length,
        };

  const pagination = (
    <Pagination
      className="mt-4"
      query={query}
      page={paged.page}
      pageCount={paged.pageCount}
      from={paged.from}
      to={paged.to}
      total={rows.length}
    />
  );

  // The asset the hero describes. Every row leads to that asset's own page now, so
  // there is nothing on this screen that changes the focus; it is the deepest market in
  // view, which is the one whose series is most likely to hold enough readings to show
  // movement at all.
  const focusId = deepestId(rows);

  // THE FOCUS IS NOT AWAITED HERE. Its two requests used to run in sequence before
  // anything rendered, which put four round trips in front of the first byte. They
  // now run in parallel inside the two Suspense boundaries below, and everything
  // else on the page, the counts and the whole table, renders from health and
  // assets alone. See `loadFocus`.
  const latestLedger = health.data?.latestScanLedgerSeq ?? null;

  const failure = assets.failure ?? health.failure;

  return (
    <AppShell
      methodologyVersion={
        assets.data?.methodologyVersion ??
        health.data?.methodologyVersion ??
        assets.provenance.methodologyVersion
      }
      ledgerSeq={health.data?.latestScanLedgerSeq}
      buildRevision={health.data?.buildRevision}
      stalenessSeconds={assets.provenance.stalenessSeconds}
      search={query}
    >
      {/*
        The page opens on the figures rather than on a paragraph explaining them. The
        heading stays in the document because the hierarchy below it is h2s and a page
        without an h1 leaves a screen-reader user with no top-level landmark to jump
        to — it is simply not given any of the layout.
      */}
      <h1 className="sr-only">
        Monitored Stellar markets, ranked by how much can actually be traded
      </h1>

      {failure ? (
        <Notice
          tone="problem"
          title={
            failure.kind === 'transport'
              ? 'The Keel API could not be reached'
              : `The engine reported ${failure.code}`
          }
          detail={failure.message}
        >
          {failure.kind === 'transport' ? (
            <>
              <p>
                Set <code className="tabular">NEXT_PUBLIC_KEEL_API_URL</code> to
                the contract mock on{' '}
                <code className="tabular">http://localhost:4010</code> or to the
                live API, then reload.
              </p>
              <a
                href={assetHref(query)}
                className="mt-3 inline-flex min-h-11 items-center rounded-md border border-[var(--keel-border-strong)] bg-[var(--keel-surface)] px-3 py-2 font-medium text-[var(--keel-ink-strong)] underline-offset-2 hover:border-[var(--keel-accent)] hover:text-[var(--keel-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
              >
                Try again
              </a>
            </>
          ) : null}
        </Notice>
      ) : (
        <div className="flex flex-col gap-8">
          <OverviewHero
            rows={rows}
            focus={
              focusId === null ? (
                <FocusCard
                  risk={null}
                  history={null}
                  historyFailure={null}
                  query={query}
                />
              ) : (
                <Suspense
                  key={`focus-${focusId}-${query.range}`}
                  fallback={<FocusCardPending query={query} />}
                >
                  <FocusSection
                    focusId={focusId}
                    latestLedger={latestLedger}
                    query={query}
                  />
                </Suspense>
              )
            }
            monitored={health.data?.assetsMonitored ?? total}
            query={query}
          />

          {rows.length === 0 ? (
            <Notice tone="empty" title="No asset matches these filters">
              <p>
                <Link
                  className="underline underline-offset-2"
                  href={assetHref(query, { band: null, hasFlag: null, q: '' })}
                >
                  Clear the filters
                </Link>{' '}
                to see the whole monitored set.
              </p>
            </Notice>
          ) : (
            <>
              {focusId === null ? null : (
                // No fallback: the composition sits between the hero and the table,
                // and a placeholder there would push the table down and then pull it
                // back up. It appears when it is ready, and the table never moves
                // because of it until then.
                <Suspense key={`composition-${focusId}-${query.range}`}>
                  <CompositionSection
                    focusId={focusId}
                    latestLedger={latestLedger}
                    range={query.range}
                  />
                </Suspense>
              )}

              <section aria-labelledby="table-title" className="min-w-0">
                {/*
                  The heading is kept in the document and out of the layout. The section
                  is named for anyone navigating by landmark or heading, and the table
                  below introduces itself perfectly well to anyone looking at it.
                */}
                <h2 id="table-title" className="sr-only">
                  Every monitored asset, with the figures behind it
                </h2>

                <AssetFilters query={query} />

                {partialPage ? (
                  <Notice
                    className="mb-3"
                    tone="problem"
                    title="Ordering describes this page, not the whole set"
                    detail={`The engine reports ${total} assets and this request returned ${returned.length}. Sorting and searching below apply only to what was returned.`}
                  />
                ) : null}

                <p
                  id="flags-help"
                  className="mb-3 max-w-3xl text-xs text-[var(--keel-muted)]"
                >
                  The reasons column lists checks that FIRED. The list response
                  does not carry the checks that could not be evaluated, so
                  &ldquo;nothing triggered&rdquo; is not a clean bill of health
                  — open a row to see which checks ran and which could not.
                </p>

                {query.band === null ? (
                  /*
                    The whole set, cut into its bands. No window is read here: one
                    series is one request per row, the audience shares sixty a minute
                    because every read is made from the server, and four previews would
                    spend sixteen of them before the reader has asked for anything. Each
                    section's link says where the window is.
                  */
                  <div className="flex flex-col gap-10">
                    {groups.map((group) => (
                      <BandSection
                        key={group.band}
                        group={group}
                        query={query}
                      />
                    ))}
                  </div>
                ) : (
                  /*
                    One band, paged, with the window. The fallback is the SAME table
                    with the same three columns in their pending state, so the snapshot
                    figures are final in the first chunk and nothing moves when the
                    series land.
                  */
                  <Suspense
                    key={`${query.band}-${query.range}-${query.page}`}
                    fallback={
                      <BandSection
                        group={selectedGroup}
                        query={query}
                        trend={pendingTrend(selectedGroup, query.range)}
                      >
                        {pagination}
                      </BandSection>
                    }
                  >
                    <WindowedBandSection
                      group={selectedGroup}
                      query={query}
                      latestLedger={latestLedger}
                    >
                      {pagination}
                    </WindowedBandSection>
                  </Suspense>
                )}

                <p className="mt-2 text-xs text-[var(--keel-muted)]">
                  Figures are denominated in each row&apos;s quote asset and
                  shown to two decimal places. The exact value the engine served
                  is on every figure, and in full on the asset&apos;s own page.
                </p>
              </section>
            </>
          )}
        </div>
      )}
    </AppShell>
  );
}

/**
 * The asset in focus, read once per request however many boundaries ask for it.
 *
 * `cache` dedupes on the arguments for the length of one server render, so the focus
 * card and the composition section share a single depth request and a single series
 * request rather than issuing two of each against a budget the whole audience shares.
 *
 * The two requests run in PARALLEL when health supplied the latest ledger, which is
 * the ordinary case. Without it the series window has nothing to be sized from until
 * the depth answer names a ledger, so that path stays sequential, as it always was.
 */
const loadFocus = cache(
  async (
    focusId: string,
    latestLedger: number | null,
    range: AssetQuery['range'],
  ) => {
    // The window is the reader's, from the URL; the resolution and the source stay
    // at their defaults here. One request is one source, and mixing a reconstruction
    // into an overview chart would put a lower bound and a measurement on one line.
    const window = (ledger: number) =>
      ledgerWindow(ledger, { ...DEFAULT_HISTORY, range });

    if (latestLedger !== null) {
      const [depth, history] = await Promise.all([
        fetchDepth(focusId),
        fetchHistory(focusId, window(latestLedger), DEFAULT_HISTORY.source),
      ]);
      return { depth, history };
    }

    const depth = await fetchDepth(focusId);
    const ledger = depth.data?.ledgerSeq ?? null;
    const history =
      ledger === null
        ? null
        : await fetchHistory(focusId, window(ledger), DEFAULT_HISTORY.source);
    return { depth, history };
  },
);

async function FocusSection({
  focusId,
  latestLedger,
  query,
}: {
  focusId: string;
  latestLedger: number | null;
  query: AssetQuery;
}) {
  const { depth, history } = await loadFocus(
    focusId,
    latestLedger,
    query.range,
  );
  return (
    <FocusCard
      risk={depth.data ?? null}
      history={history?.data ?? null}
      historyFailure={history?.failure?.message ?? null}
      query={query}
    />
  );
}

async function CompositionSection({
  focusId,
  latestLedger,
  range,
}: {
  focusId: string;
  latestLedger: number | null;
  range: AssetQuery['range'];
}) {
  const { depth } = await loadFocus(focusId, latestLedger, range);

  if (depth.failure) {
    return (
      <Notice
        tone="problem"
        title={
          depth.failure.kind === 'transport'
            ? 'The detail behind the chart above could not be loaded'
            : `The engine reported ${depth.failure.code}`
        }
        detail={depth.failure.message}
      />
    );
  }
  if (!depth.data) return null;

  return (
    <section aria-labelledby="focus-title" className="keel-panel min-w-0">
      <h2
        id="focus-title"
        className="rounded-t-[var(--radius)] border-b border-[var(--keel-border)] bg-[var(--keel-surface-subtle)] px-4 py-3 text-base font-bold tracking-[-0.01em] text-[var(--keel-ink-strong)] sm:px-5"
      >
        {`Where ${depth.data.asset.code}'s depth comes from`}
      </h2>
      <div className="p-4 sm:p-5">
        <DepthComposition
          depth={depth.data.depth}
          quoteCode={depth.data.quote.code}
        />
      </div>
    </section>
  );
}

/**
 * Every row on screen in its pending state, which is what the Suspense fallback shows.
 *
 * The fallback is the real table, not a skeleton: every snapshot figure is final in the
 * first chunk and only the three window cells are waiting, so the columns already hold
 * their width and nothing reflows when the series arrive.
 */
function pendingTrend(
  group: BandGroup,
  range: AssetQuery['range'],
): AssetTableTrend {
  return {
    label: HISTORY_RANGES[range].label.toLowerCase(),
    series: new Map(
      group.preview.map((row) => [
        assetKey(row),
        { state: 'pending' } as const,
      ]),
    ),
  };
}

/**
 * The band's own view, with each row's stored series.
 *
 * ONE REQUEST PER ROW, AND THE PAGE IS THE BOUND. Eight rows is eight requests against
 * a budget of sixty a minute that the whole audience shares, and the resolution follows
 * the range so a week is eight daily readings rather than a hundred and sixty-eight
 * hourly ones.
 *
 * `fetchHistory` returns a failure rather than throwing, so `Promise.all` cannot reject
 * and a row whose series failed is a rendered state rather than a lost page.
 */
async function WindowedBandSection({
  group,
  query,
  latestLedger,
  children,
}: {
  group: BandGroup;
  query: AssetQuery;
  latestLedger: number | null;
  children?: React.ReactNode;
}) {
  if (latestLedger === null) {
    // No ledger, no window to ask for. The snapshot table is still the whole answer to
    // every other question on the row.
    return (
      <BandSection group={group} query={query}>
        {children}
      </BandSection>
    );
  }

  const window = ledgerWindow(latestLedger, {
    range: query.range,
    resolution: rowResolution(query.range),
    source: DEFAULT_HISTORY.source,
  });

  const fetched = await Promise.all(
    group.preview.map((row) =>
      fetchHistory(assetKey(row), window, DEFAULT_HISTORY.source),
    ),
  );

  const series = new Map<string, RowSeries>(
    group.preview.map((row, index) => [
      assetKey(row),
      readRowSeries(fetched[index], query.range),
    ]),
  );

  return (
    <BandSection
      group={group}
      query={query}
      trend={{
        label: HISTORY_RANGES[query.range].label.toLowerCase(),
        series,
      }}
    >
      {children}
    </BandSection>
  );
}

/**
 * The deepest market in view, used as the trend section's subject until a reader picks
 * one. Deepest rather than worst: the section is about movement over time, and the
 * asset with the most liquidity behind it is the one whose series is most likely to
 * hold enough readings to show any.
 */
function deepestId(rows: readonly AssetSummary[]): string | null {
  const best = [...rows].sort((a, b) =>
    compareValues(classify(b.depth5PctBuySide), classify(a.depth5PctBuySide)),
  )[0];
  return best ? assetKey(best) : null;
}
