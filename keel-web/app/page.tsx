import { AssetFilters } from '@/components/keel/asset-filters';
import { AssetTable } from '@/components/keel/asset-table';
import { KpiStrip, type KpiItem } from '@/components/keel/kpi-strip';
import { Notice } from '@/components/keel/notice';
import { AppShell, PageHeader } from '@/components/layout/app-shell';
import { fetchAssets, fetchHealth } from '@/lib/api/server';
import { filterByText, sortAssets } from '@/lib/assets/list';
import { classifyCount } from '@/lib/format/value';
import { assetHref, isFiltered, parseAssetQuery } from '@/lib/url/asset-query';

/**
 * Never prerendered. A build that cannot reach the API would otherwise bake its error
 * state into static HTML and serve it forever, which no runtime recovery can undo, and
 * a page that did prerender would freeze the ledger and staleness it was built with —
 * the one thing this product exists to report accurately.
 */
export const dynamic = 'force-dynamic';

export default async function AssetsPage({ searchParams }: PageProps<'/'>) {
  const query = parseAssetQuery(await searchParams);

  const [health, assets] = await Promise.all([
    fetchHealth(),
    fetchAssets({ band: query.band, hasFlag: query.hasFlag }),
  ]);

  const returned = assets.data?.items ?? [];
  const rows = sortAssets(filterByText(returned, query.q), query.sort, query.dir);

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
      note:
        health.data?.historicalAvailable === false
          ? 'Historical replay unavailable on this deployment'
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
          An oracle answers what a Stellar asset is worth. Keel answers what volume that
          price can actually support, and what it would cost to move it. Every figure
          here is served by the engine; nothing is recomputed in this dashboard.
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
            <p>
              Set <code className="tabular">NEXT_PUBLIC_KEEL_API_URL</code> to the
              contract mock on <code className="tabular">http://localhost:4010</code> or
              to the live API, then reload.
            </p>
          ) : null}
        </Notice>
      ) : (
        <>
          <KpiStrip items={items} />

          <section className="mt-8">
            <h2 className="sr-only">The monitored set</h2>
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
                    href={assetHref(query, { band: null, hasFlag: null, q: '' })}
                  >
                    Clear the filters
                  </a>{' '}
                  to see the whole monitored set.
                </p>
              </Notice>
            ) : (
              <>
                <AssetTable items={rows} query={query} />
                <p className="mt-3 text-xs text-[var(--keel-muted)]">
                  Figures are denominated in each row&apos;s quote asset. &ldquo;Flags
                  fired&rdquo; counts triggered flags only: the list endpoint does not
                  report which checks could not be evaluated, so a zero here is not a
                  clean bill of health. Open an asset to see its unevaluated flags.
                </p>
              </>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
