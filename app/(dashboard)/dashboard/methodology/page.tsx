import { TriangleAlert } from 'lucide-react';

import { FigureList, type FigureRow } from '@/components/dashboard/figure-list';
import { Notice } from '@/components/dashboard/notice';
import { ThresholdTable } from '@/components/dashboard/threshold-table';
import {
  AppShell,
  PageHeader,
  Section,
} from '@/components/dashboard/layout/app-shell';
import { fetchHealth, fetchMethodology } from '@/lib/keel/api/server';
import {
  calibrationStatement,
  readThresholds,
} from '@/lib/keel/format/methodology';

/**
 * Never prerendered. A build that cannot reach the API would otherwise bake its error
 * state into static HTML and serve it forever, and a page that did prerender would
 * freeze the thresholds it was built with — which is the one thing this page must not
 * do, since its whole purpose is to show the thresholds that were actually applied.
 */
export const dynamic = 'force-dynamic';

export default async function MethodologyPage() {
  const [health, methodology] = await Promise.all([
    fetchHealth(),
    fetchMethodology(),
  ]);
  const served = methodology.data;

  return (
    <AppShell
      methodologyVersion={
        served?.version ??
        health.data?.methodologyVersion ??
        methodology.provenance.methodologyVersion
      }
      ledgerSeq={health.data?.latestScanLedgerSeq}
      buildRevision={health.data?.buildRevision}
      stalenessSeconds={methodology.provenance.stalenessSeconds}
    >
      <PageHeader title="Which thresholds produced these numbers?">
        <p>
          Rendered from the engine&apos;s own{' '}
          <code className="tabular">/methodology</code> response, so what is on
          screen is what was applied. No threshold is written into this
          dashboard, and the list below is whatever the engine served rather
          than a set of keys this page knows about.
        </p>
      </PageHeader>

      {methodology.failure ? (
        <Notice
          tone="problem"
          title={
            methodology.failure.kind === 'transport'
              ? 'The Keel API could not be reached'
              : `The engine reported ${methodology.failure.code}`
          }
          detail={methodology.failure.message}
        />
      ) : served === null ? (
        <Notice
          tone="empty"
          title="The engine returned no methodology document"
        />
      ) : (
        <MethodologyView served={served} />
      )}
    </AppShell>
  );
}

function MethodologyView({
  served,
}: {
  served: NonNullable<Awaited<ReturnType<typeof fetchMethodology>>['data']>;
}) {
  const calibration = calibrationStatement(
    served.calibrated,
    served.calibrationNote,
  );
  const groups = readThresholds(served.thresholds);

  const identity: FigureRow[] = [
    {
      key: 'version',
      label: 'Version in force',
      text: served.version,
      note: 'The version the engine reports, not the one this page was built against',
    },
    {
      key: 'count',
      label: 'Thresholds served',
      // The map is open ended, so the count is a fact about this response.
      text: String(groups.length),
      note: 'Read by key name; new keys can appear without a major version bump',
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/*
        Surfaced, not buried. The contract says `calibrated` is always false in v1, and
        a dashboard that hides that is overclaiming about how much the thresholds mean.
      */}
      <section
        className={
          served.calibrated
            ? 'rounded-lg border border-[var(--keel-border)] bg-[var(--keel-surface-subtle)] p-4'
            : 'rounded-lg border border-[var(--band-medium)]/40 bg-[var(--band-medium-surface)] p-4'
        }
      >
        <h2 className="flex items-start gap-2 font-semibold text-[var(--band-medium-ink)]">
          {served.calibrated ? null : (
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0"
            />
          )}
          {calibration.heading}
        </h2>
        {calibration.note === null ? (
          <p className="mt-1 text-sm italic text-[var(--unmeasured)]">
            The engine sent no calibration note with this response.
          </p>
        ) : (
          <p className="mt-1 max-w-3xl text-sm text-[var(--keel-ink)]">
            {calibration.note}
          </p>
        )}
      </section>

      <Section
        title="What is this document?"
        standfirst="Enough to check that the figures elsewhere on this site came from the version named here."
      >
        <FigureList rows={identity} />
        <p className="mt-3 text-sm">
          <a
            className="underline underline-offset-2"
            href={served.documentUrl}
            rel="noreferrer"
            target="_blank"
          >
            The full methodology document
          </a>
        </p>
      </Section>

      <Section
        title="Every threshold, as served"
        standfirst={
          <>
            Keys are shown verbatim, because the key name is what a consumer
            looks up in the contract. Every key ending in{' '}
            <code className="tabular">Pct</code> is a percentage rather than a
            fraction — that is the one unit convention the contract states, and
            it is the only one applied here.
          </>
        }
      >
        {groups.length === 0 ? (
          <Notice
            tone="empty"
            title="The engine served no thresholds in this response"
          />
        ) : (
          <ThresholdTable groups={groups} />
        )}
        <p className="mt-3 text-xs text-[var(--keel-muted)]">
          A threshold denominated in an asset is shown with its full code and
          issuer. A bare ticker would name nothing: ninety-seven distinct assets
          share the AQUA ticker alone.
        </p>
      </Section>
    </div>
  );
}
