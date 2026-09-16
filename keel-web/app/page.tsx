import { KpiStrip, type KpiItem } from '@/components/keel/kpi-strip';
import { Notice } from '@/components/keel/notice';
import { AppShell, PageHeader } from '@/components/layout/app-shell';
import { fetchHealth } from '@/lib/api/server';
import { classifyCount } from '@/lib/format/value';

/**
 * Never prerendered. A build that cannot reach the API would otherwise bake its error
 * state into static HTML and serve it forever, which no runtime recovery can undo, and
 * a page that did prerender would freeze the ledger and staleness it was built with —
 * the one thing this product exists to report accurately.
 */
export const dynamic = 'force-dynamic';

export default async function AssetsPage() {
  const health = await fetchHealth();

  const items: KpiItem[] = [
    {
      key: 'assets',
      label: 'Assets monitored',
      value: classifyCount(health.data?.assetsMonitored),
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

  return (
    <AppShell
      methodologyVersion={health.data?.methodologyVersion ?? health.provenance.methodologyVersion}
      ledgerSeq={health.data?.latestScanLedgerSeq}
      stalenessSeconds={health.provenance.stalenessSeconds}
    >
      <PageHeader title="Is this price backed by executable depth?">
        <p>
          An oracle answers what a Stellar asset is worth. Keel answers what volume that
          price can actually support, and what it would cost to move it. Every figure on
          this site is served by the engine; nothing is recomputed here.
        </p>
      </PageHeader>

      {health.failure ? (
        <Notice
          tone="problem"
          title={
            health.failure.kind === 'transport'
              ? 'The Keel API could not be reached'
              : `The engine reported ${health.failure.code}`
          }
          detail={health.failure.message}
        >
          {health.failure.kind === 'transport' ? (
            <p>
              Set <code className="tabular">NEXT_PUBLIC_KEEL_API_URL</code> to the
              contract mock on <code className="tabular">http://localhost:4010</code> or
              to the live API, then reload.
            </p>
          ) : null}
        </Notice>
      ) : (
        <KpiStrip items={items} />
      )}

      <section className="mt-8">
        <h2 className="text-lg font-medium text-[var(--keel-ink-strong)]">
          The monitored set
        </h2>
        <p className="mt-1 text-sm text-[var(--keel-muted)]">
          The asset table, its filters, and the drill-down into each asset are not built
          yet.
        </p>
      </section>
    </AppShell>
  );
}
