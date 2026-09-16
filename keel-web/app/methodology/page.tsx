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

export default async function MethodologyPage() {
  const health = await fetchHealth();

  return (
    <AppShell
      methodologyVersion={
        health.data?.methodologyVersion ?? health.provenance.methodologyVersion
      }
      ledgerSeq={health.data?.latestScanLedgerSeq}
      stalenessSeconds={health.provenance.stalenessSeconds}
    >
      <PageHeader title="Which thresholds produced these numbers?">
        <p>
          Rendered from the engine&apos;s own <code className="tabular">/methodology</code>{' '}
          response, so the thresholds on screen are the thresholds that were applied. No
          threshold is written into this dashboard.
        </p>
      </PageHeader>

      <Notice tone="empty" title="Not built yet">
        <p>
          This page will render the served thresholds, the effective methodology version,
          and the calibration note.
        </p>
      </Notice>
    </AppShell>
  );
}
