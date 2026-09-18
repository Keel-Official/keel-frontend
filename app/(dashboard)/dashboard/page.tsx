import Link from 'next/link';

import { AssetFilters } from '@/components/dashboard/asset-filters';
import { AssetTable } from '@/components/dashboard/asset-table';
import { DepthComposition } from '@/components/dashboard/depth-composition';
import { Notice } from '@/components/dashboard/notice';
import { OverviewHero } from '@/components/dashboard/overview-hero';
import { Pagination } from '@/components/dashboard/pagination';
import { AppShell } from '@/components/dashboard/layout/app-shell';
import {
  fetchAssets,
  fetchDepth,
  fetchHealth,
  fetchHistory,
} from '@/lib/keel/api/server';
import type { AssetSummary } from '@/lib/keel/api/types';
import { DEFAULT_HISTORY, ledgerWindow } from '@/lib/keel/assets/history-range';
import { assetKey, filterByText, sortAssets } from '@/lib/keel/assets/list';
import { compareValues } from '@/lib/keel/format/compare';
import { classify } from '@/lib/keel/format/value';
import {
  assetHref,
  paginate,
  parseAssetQuery,
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

  // The asset the hero describes. Every row leads to that asset's own page now, so
  // there is nothing on this screen that changes the focus; it is the deepest market in
  // view, which is the one whose series is most likely to hold enough readings to show
  // movement at all.
  const focusId = deepestId(rows);

  const depth = focusId === null ? null : await fetchDepth(focusId);

  // The series needs the latest ledger to size its window, so it follows health. It is
  // a different endpoint from the historical replay that `historicalAvailable` turns
  // off: this one reads the stored series and answers today.
  const latestLedger =
    health.data?.latestScanLedgerSeq ?? depth?.data?.ledgerSeq ?? null;
  const history =
    focusId === null || latestLedger === null
      ? null
      : await fetchHistory(
          focusId,
          // The window is the reader's, from the URL; the resolution and the source
          // stay at their defaults here. One request is one source, and mixing a
          // reconstruction into an overview chart would put a lower bound and a
          // measurement on the same line.
          ledgerWindow(latestLedger, {
            ...DEFAULT_HISTORY,
            range: query.range,
          }),
          DEFAULT_HISTORY.source,
        );

  const failure = assets.failure ?? health.failure;

  return (
    <AppShell
      methodologyVersion={
        assets.data?.methodologyVersion ??
        health.data?.methodologyVersion ??
        assets.provenance.methodologyVersion
      }
      ledgerSeq={health.data?.latestScanLedgerSeq}
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
            risk={depth?.data ?? null}
            history={history?.data ?? null}
            historyFailure={history?.failure?.message ?? null}
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
              {depth?.data ? (
                <section aria-labelledby="focus-title" className="min-w-0">
                  <h2
                    id="focus-title"
                    className="text-lg font-semibold tracking-tight text-[var(--keel-ink-strong)]"
                  >
                    {`Where ${depth.data.asset.code}'s depth comes from`}
                  </h2>
                  <div className="mt-4 rounded-2xl border border-[var(--keel-border)] bg-[var(--keel-surface)] p-4 sm:p-5">
                    <DepthComposition
                      depth={depth.data.depth}
                      quoteCode={depth.data.quote.code}
                    />
                  </div>
                </section>
              ) : null}

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

                <AssetTable items={paged.rows} query={query} />

                <Pagination
                  className="mt-4"
                  query={query}
                  page={paged.page}
                  pageCount={paged.pageCount}
                  from={paged.from}
                  to={paged.to}
                  total={rows.length}
                />

                <p className="mt-2 text-xs text-[var(--keel-muted)]">
                  Figures are denominated in each row&apos;s quote asset and
                  shown to two decimal places. The exact value the engine served
                  is on every figure, and in full on the asset&apos;s own page.
                </p>

                {depth?.failure ? (
                  <Notice
                    className="mt-3"
                    tone="problem"
                    title={
                      depth.failure.kind === 'transport'
                        ? 'The detail behind the chart above could not be loaded'
                        : `The engine reported ${depth.failure.code}`
                    }
                    detail={depth.failure.message}
                  />
                ) : null}
              </section>
            </>
          )}
        </div>
      )}
    </AppShell>
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
