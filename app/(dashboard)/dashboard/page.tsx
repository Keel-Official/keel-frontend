import { AssetFilters } from '@/components/dashboard/asset-filters';
import {
  CalibrationNote,
  ConfidenceMeaning,
} from '@/components/dashboard/calibration-note';
import { AssetTable } from '@/components/dashboard/asset-table';
import { FindingSummary } from '@/components/dashboard/finding-summary';
import { KpiStrip, type KpiItem } from '@/components/dashboard/kpi-strip';
import { Notice } from '@/components/dashboard/notice';
import { AppShell, PageHeader } from '@/components/dashboard/layout/app-shell';
import {
  fetchAssets,
  fetchHealth,
  fetchMethodology,
} from '@/lib/keel/api/server';
import { filterByText, sortAssets } from '@/lib/keel/assets/list';
import { classifyCount } from '@/lib/keel/format/value';
import {
  assetHref,
  isFiltered,
  parseAssetQuery,
} from '@/lib/keel/url/asset-query';

/**
 * Never prerendered. A build that cannot reach the API would otherwise bake its error
 * state into static HTML and serve it forever, which no runtime recovery can undo, and
 * a page that did prerender would freeze the ledger and staleness it was built with —
 * the one thing this product exists to report accurately.
 */
export const dynamic = 'force-dynamic';

export default async function AssetsPage({
  searchParams,
}: PageProps<'/dashboard'>) {
  const query = parseAssetQuery(await searchParams);

  const [health, assets, methodology] = await Promise.all([
    fetchHealth(),
    fetchAssets({ band: query.band, hasFlag: query.hasFlag }),
    // Every screen that shows a band shows the engine's own words on calibration.
    fetchMethodology(),
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

  const items: KpiItem[] = [
    {
      key: 'assets',
      label: isFiltered(query) ? 'Assets matching' : 'Assets monitored',
      value: classifyCount(assets.data ? rows.length : undefined),
      note: isFiltered(query) ? `of ${total} in the filtered set` : undefined,
    },
    {
      key: 'ledger',
      label: 'Latest scan ledger',
      value: classifyCount(health.data?.latestScanLedgerSeq),
    },
    {
      key: 'methodology',
      label: 'Methodology',
      text: health.data?.methodologyVersion ?? null,
      note: 'Thresholds are served, never hardcoded here',
    },
    {
      key: 'status',
      label: 'Engine',
      text: health.data?.status ?? null,
      // `degraded` merges three conditions, and one of them is bookkeeping rather than
      // data: a scan whose finish was never recorded, while the ledger is fresh and
      // every asset carries current metrics. Painting that red would report an outage
      // that is not happening, so the word is qualified and freshness is read from the
      // staleness header instead.
      note:
        health.data?.status === 'degraded'
          ? health.data.latestScanAt === null
            ? 'Scan bookkeeping incomplete; the figures themselves are current'
            : 'A scan finished with failures; some assets may be stale'
          : health.data?.historicalAvailable === false
            ? 'Historical replay unavailable; the stored series still works'
            : undefined,
    },
  ];

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
    >
      <PageHeader title="Is this price backed by executable depth?">
        <p>
          An oracle answers what a Stellar asset is worth. Keel answers what
          volume that price can actually support, and what it would cost to move
          it. Every figure here is served by the engine; nothing is recomputed
          in this dashboard.
        </p>
      </PageHeader>

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
                Set <code className="tabular">NEXT_PUBLIC_KEEL_API_URL</code>{' '}
                to the contract mock on{' '}
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
        <>
          <FindingSummary rows={rows} query={query} />
          <KpiStrip items={items} />

          <section className="mt-8">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--keel-ink-strong)]">
              Monitored assets
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-[var(--keel-muted)]">
              Start with the highest-risk bands, then open an asset for the
              depth, collateral, flags, and provenance behind its result.
            </p>

            <CalibrationNote
              className="mt-4 mb-4"
              calibrated={methodology.data?.calibrated}
              note={methodology.data?.calibrationNote}
            />

            <AssetFilters query={query} />

            {partialPage ? (
              <Notice
                className="mb-3"
                tone="problem"
                title="Ordering describes this page, not the whole set"
                detail={`The engine reports ${total} assets and this request returned ${returned.length}. Sorting and searching below apply only to what was returned.`}
              />
            ) : null}

            {rows.length === 0 ? (
              <Notice tone="empty" title="No asset matches these filters">
                <p>
                  <a
                    className="underline underline-offset-2"
                    href={assetHref(query, {
                      band: null,
                      hasFlag: null,
                      q: '',
                    })}
                  >
                    Clear the filters
                  </a>{' '}
                  to see the whole monitored set.
                </p>
              </Notice>
            ) : (
              <>
                <p
                  id="flags-help"
                  className="mb-3 max-w-3xl text-xs text-[var(--keel-muted)]"
                >
                  Triggered flags are checks that fired. The list response does
                  not include checks that could not be evaluated, so a zero is
                  not a clean bill of health; open an asset for that detail.
                </p>
                <AssetTable items={rows} query={query} />
                <ConfidenceMeaning className="mt-3" />
                <p className="mt-2 text-xs text-[var(--keel-muted)]">
                  Figures are denominated in each row&apos;s quote asset.
                </p>
              </>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
