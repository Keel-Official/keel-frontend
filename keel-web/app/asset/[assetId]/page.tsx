import { Notice } from '@/components/keel/notice';
import { AppShell, PageHeader } from '@/components/layout/app-shell';
import { fetchHealth } from '@/lib/api/server';

/**
 * Never prerendered. A build that cannot reach the API would otherwise bake its error
 * state into static HTML and serve it forever, which no runtime recovery can undo, and
 * a page that did prerender would freeze the ledger and staleness it was built with —
 * the one thing this product exists to report accurately.
 */
export const dynamic = 'force-dynamic';

export default async function AssetDetailPage({ params }: PageProps<'/asset/[assetId]'>) {
  const { assetId } = await params;
  const health = await fetchHealth();

  return (
    <AppShell
      methodologyVersion={
        health.data?.methodologyVersion ?? health.provenance.methodologyVersion
      }
      ledgerSeq={health.data?.latestScanLedgerSeq}
      stalenessSeconds={health.provenance.stalenessSeconds}
    >
      <PageHeader title="What depth stands behind this price?">
        <p className="tabular break-all">{decodeURIComponent(assetId)}</p>
      </PageHeader>

      <Notice tone="empty" title="Not built yet">
        <p>
          This page will carry the band, the collateral ceiling and the two terms behind
          it, the depth rungs split by venue, the manipulation rungs with reachability,
          the triggered and unevaluated flags, and the historical series.
        </p>
      </Notice>
    </AppShell>
  );
}
