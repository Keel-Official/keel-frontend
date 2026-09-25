import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { CollateralCeilingPanel } from '@/components/dashboard/collateral-ceiling';
import { DepthLadder } from '@/components/dashboard/depth-ladder';
import { FigureList, type FigureRow } from '@/components/dashboard/figure-list';
import { ManipulationTable } from '@/components/dashboard/manipulation-table';
import { Notice } from '@/components/dashboard/notice';
import { CurrentChecks } from '@/components/dashboard/current-checks';
import { VerdictStrip } from '@/components/dashboard/verdict-strip';
import { AppShell, Panel } from '@/components/dashboard/layout/app-shell';
import {
  isKeelExampleName,
  mockSelectionAllowed,
  type KeelExampleName,
} from '@/lib/keel/api/client';
import {
  MetricPanel,
  type MetricDefinition,
} from '@/components/dashboard/metric-panel';
import { EngineWarnings } from '@/components/dashboard/engine-warnings';
import { LedgerPicker } from '@/components/dashboard/ledger-picker';
import {
  oracleRows,
  priceRows,
  reachRows,
} from '@/components/dashboard/reading-rows';
import { ReconstructionPanel } from '@/components/dashboard/reconstruction-panel';
import { fetchDepth, fetchHealth, fetchHistory } from '@/lib/keel/api/server';
import type { HistoryPoint, HistoryResponse } from '@/lib/keel/api/types';
import {
  DASHBOARD_BASE,
  dashboardAssetPath,
  decodeAssetId,
} from '@/lib/keel/routes';
import { parseLedger } from '@/lib/keel/url/ledger';
import { SEQUENTIAL_RAMP } from '@/lib/keel/design/tokens';
import {
  ASSET_DETAILS,
  HISTORY_RANGES,
  HISTORY_RESOLUTIONS,
  HISTORY_SOURCES,
  historyHref,
  isLowerBoundSource,
  isStoredRangeSource,
  ledgerWindow,
  parseHistoryQuery,
  type AssetDetail,
  type HistoryQuery,
} from '@/lib/keel/assets/history-range';
import { FlagTimeline } from '@/components/dashboard/flag-timeline';
import type { AssetRisk } from '@/lib/keel/api/types';
import { readCollateralCeiling } from '@/lib/keel/format/collateral';
import { truncateIssuer } from '@/lib/keel/format/decimal';
import { classify } from '@/lib/keel/format/value';
import { cn } from '@/lib/keel/utils';

/**
 * Never prerendered. A build that cannot reach the API would otherwise bake its error
 * state into static HTML and serve it forever, which no runtime recovery can undo, and
 * a page that did prerender would freeze the ledger and staleness it was built with —
 * the one thing this product exists to report accurately.
 */
export const dynamic = 'force-dynamic';

export default async function AssetDetailPage({
  params,
  searchParams,
}: PageProps<'/dashboard/asset/[assetId]'>) {
  // The router hands this segment over still percent-encoded, so `ACT:GAHH…` arrives
  // as `ACT%3AGAHH…`. It is decoded once, here, and every use below — the two fetches
  // and every link the page builds — starts from the engine's own `CODE:ISSUER`.
  // Passing the raw segment on instead made each navigation add a layer of encoding,
  // and the engine refused the second one as INVALID_ASSET_ID.
  const assetId = decodeAssetId((await params).assetId);
  const example = readMockExample(await searchParams);

  const historyQuery = parseHistoryQuery(await searchParams);
  // A past ledger turns the page into one reading of the engine's historical path.
  // The stored series is not fetched then: its window is sized from today's ledger and
  // would sit beside a reading from months earlier as though they were one view.
  const atLedger = parseLedger((await searchParams).ledger);

  const [health, depth] = await Promise.all([
    fetchHealth(),
    fetchDepth(assetId, example, atLedger ?? undefined),
  ]);

  // The series is a separate endpoint from the replay path that health turns off, and
  // it needs the latest ledger to size its window, so it is fetched after health.
  const latestLedger =
    health.data?.latestScanLedgerSeq ?? depth.data?.ledgerSeq ?? null;
  // A reconstruction is stored where a replay ran, not where the scan is, so it is
  // asked for WITHOUT a window: contract 1.8.0, and see isStoredRangeSource. Every
  // window this page can offer sits inside the engine's 90 day cap and none of them
  // contains February 2026, which is why that source used to come back empty.
  const storedRange = isStoredRangeSource(historyQuery.source);
  const history =
    atLedger !== null || (latestLedger === null && !storedRange)
      ? null
      : await fetchHistory(
          assetId,
          storedRange ? null : ledgerWindow(latestLedger!, historyQuery),
          historyQuery.source,
        );
  const risk = depth.data;

  return (
    <AppShell
      methodologyVersion={
        risk?.methodologyVersion ??
        health.data?.methodologyVersion ??
        depth.provenance.methodologyVersion
      }
      ledgerSeq={risk?.ledgerSeq ?? health.data?.latestScanLedgerSeq}
      stalenessSeconds={depth.provenance.stalenessSeconds}
      buildRevision={health.data?.buildRevision}
    >
      {example ? (
        <Notice
          className="mb-6"
          tone="problem"
          title={`Showing the contract mock example "${example}", not live data`}
          detail="Every figure below was served by the mock. Drop the mock parameter from the URL to read the engine."
        />
      ) : null}

      {/*
        The page opens on the figures. The heading stays in the document and out of the
        layout: it is the only h1, and a page without one leaves anyone navigating by
        heading with no top-level landmark — and it is the only place the asset names
        itself, which a reader arriving from a table of sixty-one of them needs.
      */}
      <h1 className="sr-only">
        {risk
          ? `${risk.asset.code} against ${risk.quote.code} — what depth stands behind this price?`
          : assetId}
      </h1>

      {depth.failure ? (
        <Notice
          tone="problem"
          title={
            depth.failure.kind === 'transport'
              ? 'The Keel API could not be reached'
              : `The engine reported ${depth.failure.code}`
          }
          // Shown as served: `ASSET_NOT_MONITORED` covers both "not in the monitored
          // set" and "monitored but not computed yet", and the message is the only
          // thing that separates them.
          detail={depth.failure.message}
        >
          {depth.failure.kind === 'transport' ? (
            <p>
              Set <code className="tabular">NEXT_PUBLIC_KEEL_API_URL</code> to
              the contract mock on{' '}
              <code className="tabular">http://localhost:4010</code> or to the
              live API, then reload.
            </p>
          ) : atLedger !== null ? (
            // The historical path answers only for ledgers a replay has stored, so a
            // refusal here is usually "not stored", and the way on is the live reading.
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <Link
                className="underline underline-offset-2"
                href={dashboardAssetPath(assetId)}
              >
                Read this asset live instead
              </Link>
              <Link
                className="underline underline-offset-2"
                href={DASHBOARD_BASE}
              >
                Back to the monitored set
              </Link>
            </p>
          ) : (
            <p>
              <Link
                className="underline underline-offset-2"
                href={DASHBOARD_BASE}
              >
                Back to the monitored set
              </Link>
            </p>
          )}
        </Notice>
      ) : risk === null ? (
        <Notice
          tone="empty"
          title="The engine returned no result for this asset"
        />
      ) : (
        <AssetRiskView
          risk={risk}
          history={history?.data ?? null}
          historyFailed={history?.failure?.message ?? null}
          historyQuery={historyQuery}
          assetId={assetId}
          atLedger={atLedger}
          historicalAvailable={health.data?.historicalAvailable ?? null}
        />
      )}
    </AppShell>
  );
}

function AssetRiskView({
  risk,
  history,
  historyFailed,
  historyQuery,
  assetId,
  atLedger,
  historicalAvailable,
}: {
  risk: AssetRisk;
  history: HistoryResponse | null;
  historyFailed: string | null;
  historyQuery: HistoryQuery;
  assetId: string;
  atLedger: number | null;
  historicalAvailable: boolean | null;
}) {
  const points = history?.points ?? [];

  // Three layers, in the order a reader asks: what is the verdict now, how did it get
  // here, and what is the evidence. The first is always on screen; the evidence is one
  // tab at a time, because seven sections of it stacked made a page nobody reached the
  // end of.
  return (
    <div className="flex flex-col gap-6">
      <AssetHeader risk={risk} />

      <VerdictStrip risk={risk} />

      {atLedger !== null ? (
        <ReconstructionPanel
          risk={risk}
          liveHref={dashboardAssetPath(assetId)}
        />
      ) : (
        <section id="history" className="min-w-0 scroll-mt-20">
          <HistoryView
            assetId={assetId}
            history={history}
            failed={historyFailed}
            quoteCode={risk.quote.code}
            historyQuery={historyQuery}
          />
        </section>
      )}

      <Panel
        title="Checks"
        standfirst="What fires now, how long it has been firing across the window above, and what could not run."
      >
        {points.length > 0 ? (
          <>
            <FlagTimeline points={points} current={risk.flags} />
            <CurrentChecks
              className="mt-5 border-t border-[var(--keel-border)] pt-5"
              triggered={risk.flags}
              unevaluated={risk.unevaluatedFlags}
              showTriggered={false}
            />
          </>
        ) : (
          // No window to draw — a past ledger, or a series that did not load — so the
          // current reading's two lists are the whole answer.
          <CurrentChecks
            triggered={risk.flags}
            unevaluated={risk.unevaluatedFlags}
          />
        )}
      </Panel>

      <EvidencePanel
        risk={risk}
        assetId={assetId}
        historyQuery={historyQuery}
        atLedger={atLedger}
        historicalAvailable={historicalAvailable}
      />
    </div>
  );
}

/**
 * The evidence behind the verdict, one tab at a time.
 *
 * Each tab is a link, so an open tab is part of the URL like every other choice on this
 * page, and a past-ledger reading stays on its ledger while a reader moves between them.
 */
function EvidencePanel({
  risk,
  assetId,
  historyQuery,
  atLedger,
  historicalAvailable,
}: {
  risk: AssetRisk;
  assetId: string;
  historyQuery: HistoryQuery;
  atLedger: number | null;
  historicalAvailable: boolean | null;
}) {
  const quoteCode = risk.quote.code;
  // The past-ledger tab is offered only when the engine says its historical path is on.
  // When it is off every ledger would be refused, and a control that can only fail is
  // noise.
  const tabs = (Object.keys(ASSET_DETAILS) as AssetDetail[]).filter(
    (key) => key !== 'ledger' || historicalAvailable === true,
  );
  // A reconstructed reading opens on the engine's notes: they are where it says what
  // the rebuild could not see, and that has to be read before any figure from it.
  const fallback: AssetDetail = atLedger !== null ? 'notes' : 'depth';
  const open =
    historyQuery.detail !== null && tabs.includes(historyQuery.detail)
      ? historyQuery.detail
      : fallback;

  return (
    <section
      id="detail"
      aria-labelledby="detail-title"
      className="keel-panel min-w-0 scroll-mt-20"
    >
      <header className="px-4 pt-4 sm:px-5 sm:pt-5">
        <h2
          id="detail-title"
          className="text-base font-semibold tracking-[-0.01em] text-[var(--keel-ink-strong)]"
        >
          Evidence
        </h2>
        <p className="mt-0.5 text-sm text-[var(--keel-muted)]">
          The figures behind the verdict, as the engine served them.
        </p>
      </header>

      <nav
        aria-label="Evidence"
        className="mt-3 overflow-x-auto border-b border-[var(--keel-border)] px-2 sm:px-3"
      >
        <ul className="flex min-w-max">
          {tabs.map((key) => {
            const on = key === open;
            const count =
              key === 'notes' && risk.warnings.length > 0
                ? risk.warnings.length
                : null;
            return (
              <li key={key}>
                <Link
                  href={historyHref(
                    assetId,
                    historyQuery,
                    { detail: key },
                    { ledger: atLedger, hash: 'detail' },
                  )}
                  scroll={false}
                  aria-current={on ? 'true' : undefined}
                  className={cn(
                    '-mb-px inline-flex min-h-11 items-center gap-1.5 border-b-2 px-3 text-sm transition-colors',
                    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--keel-accent)]',
                    on
                      ? 'border-[var(--keel-accent)] font-semibold text-[var(--keel-ink-strong)]'
                      : 'border-transparent text-[var(--keel-muted)] hover:text-[var(--keel-ink-strong)]',
                  )}
                >
                  {ASSET_DETAILS[key]}
                  {count === null ? null : (
                    <span className="tabular rounded-sm bg-[var(--keel-surface-subtle)] px-1.5 text-xs text-[var(--keel-ink-strong)]">
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 sm:p-5">
        <EvidenceBody
          detail={open}
          risk={risk}
          assetId={assetId}
          atLedger={atLedger}
          quoteCode={quoteCode}
        />
      </div>
    </section>
  );
}

function EvidenceBody({
  detail,
  risk,
  assetId,
  atLedger,
  quoteCode,
}: {
  detail: AssetDetail;
  risk: AssetRisk;
  assetId: string;
  atLedger: number | null;
  quoteCode: string;
}) {
  switch (detail) {
    case 'depth':
      return (
        <>
          <Lead>
            Volume each side can absorb before the price moves 2, 5 or 10 per
            cent. Buy side bears on oracle manipulation, sell side on
            liquidation.
          </Lead>
          {risk.depth.length === 0 ? (
            <Notice
              tone="empty"
              title="No depth rungs were returned for this asset"
            />
          ) : (
            <DepthLadder depth={risk.depth} quoteCode={quoteCode} />
          )}
        </>
      );

    case 'cost':
      return (
        <>
          <Lead>
            Read cost together with reachability: a figure on an unreachable
            rung says how far the book goes, not what the move costs.
          </Lead>
          <ManipulationTable
            combined={risk.manipulationCostCombined}
            orderbookOnly={risk.manipulationCostOrderbookOnly}
            quoteCode={quoteCode}
          />
          <p className="mt-3 text-xs text-[var(--keel-muted)]">
            Reachability on the all-venues ladder is unconditionally true
            whenever an active pool exists, because a constant product curve has
            no upper price bound. The order-book-only column is the one that
            answers whether a target is attainable, and it is the one Keel
            itself uses.
          </p>
          <FigureList
            className="mt-5 border-t border-[var(--keel-border)] pt-5"
            rows={reachRows(risk)}
          />
        </>
      );

    case 'collateral':
      return (
        <>
          <Lead>
            The ceiling is the lower of two independent limits. Which one binds
            is the part a lender acts on, so both are shown.
          </Lead>
          <CollateralCeilingPanel
            ceiling={readCollateralCeiling(risk, quoteCode)}
          />
        </>
      );

    case 'price':
      return (
        <>
          <Lead>
            Both price sources, not only the one that won, and the pair that set
            the band.
          </Lead>
          <FigureList rows={priceRows(risk)} />
        </>
      );

    case 'oracle': {
      const oracle = oracleRows(risk);
      return (
        <>
          <Lead>
            An averaging oracle makes an attacker outweigh genuine trading as
            well as move the book. A market with no genuine volume has no such
            defence.
          </Lead>
          {oracle === null ? (
            // The contract reserves null for "no executable price". The engine can
            // also send null beside a price it did compute, so the reason is stated
            // only when the response itself carries it.
            <Notice
              tone="empty"
              title={
                risk.priceSource === 'none'
                  ? 'Not computed: there is no executable price to move'
                  : 'The engine sent no oracle-window figures for this reading'
              }
            />
          ) : (
            <FigureList rows={oracle} />
          )}
        </>
      );
    }

    case 'holders':
      return (
        <>
          <Lead>
            Concentration and wash trading bound how much of the depth is real.
          </Lead>
          <FigureList rows={supplyRows(risk)} />
        </>
      );

    case 'notes':
      return (
        <>
          <Lead>
            The engine&apos;s own notes on the limits of this computation,
            verbatim and in the order served.
          </Lead>
          <EngineWarnings warnings={risk.warnings} />
        </>
      );

    case 'ledger':
      return (
        <>
          <Lead>
            The engine answers only for ledgers a replay has stored, and says so
            when it has not. A stored past reading is rebuilt from the operation
            stream, so it carries its own gaps.
          </Lead>
          <LedgerPicker assetId={assetId} current={atLedger} />
        </>
      );
  }
}

/** The one sentence that opens an evidence tab. */
function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 max-w-3xl text-sm text-[var(--keel-muted)]">
      {children}
    </p>
  );
}

/**
 * Which market this page is about, in one line above everything else.
 *
 * The h1 stays the question the page answers; this is the label a reader arriving from
 * a table of sixty-one rows looks for first — the pair, and the issuer that tells two
 * assets with one code apart — with the way back to the set beside it. The band is in
 * the verdict directly beneath, so it is not said twice.
 */
function AssetHeader({ risk }: { risk: AssetRisk }) {
  const issuer = risk.asset.issuer;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
      <Link
        href={DASHBOARD_BASE}
        className="inline-flex min-h-9 items-center gap-1 rounded-sm text-sm text-[var(--keel-muted)] hover:text-[var(--keel-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        All assets
      </Link>
      <span aria-hidden="true" className="h-5 w-px bg-[var(--keel-border)]" />
      <p className="text-xl leading-none font-bold tracking-[-0.02em] text-[var(--keel-ink-strong)]">
        {risk.asset.code}
        <span className="font-normal text-[var(--keel-muted)]">
          {' '}
          / {risk.quote.code}
        </span>
      </p>
      <span
        className="tabular text-xs text-[var(--keel-muted)]"
        title={issuer ?? undefined}
      >
        {issuer ? truncateIssuer(issuer) : 'native'}
      </span>
    </div>
  );
}

/**
 * Reads the mock selector off the URL.
 *
 * Gated twice on purpose. `mockSelectionAllowed` keeps it out of a production build,
 * where a query string that changed what a reader is shown would be a way to make this
 * dashboard lie; and an unrecognised value is dropped rather than corrected, so a
 * hand-edited URL degrades to the live reading instead of to a guess. The page also
 * says on screen when an example is in force — a mock figure that looks like a
 * measurement is the one failure this product cannot afford.
 */
function readMockExample(
  searchParams: Record<string, string | string[] | undefined>,
): KeelExampleName | undefined {
  if (!mockSelectionAllowed()) return undefined;
  const raw = searchParams.mock;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return isKeelExampleName(value) ? value : undefined;
}

/**
 * The stored series, and the controls that drive it.
 *
 * Everything the reader chooses — window, resolution, source, and which measure is
 * drawn — is in the URL, so the exact chart in front of them is a link they can send.
 *
 * The chart labels itself from the first and last point that CAME BACK, never from the
 * range that was asked for. Coverage is as old as the deployment, so a window of seven
 * days may hold five, and an axis implying more than the data covers reads as broken
 * data rather than as young data.
 *
 * One request is one source. Selecting another reloads the chart rather than overlaying
 * two, because `horizon` is a direct reading and the rest are reconstructions — and
 * `trades-implied` is a lower bound, so a line from it is a floor and not a measurement.
 */
function HistoryView({
  assetId,
  history,
  failed,
  quoteCode,
  historyQuery,
}: {
  assetId: string;
  history: HistoryResponse | null;
  failed: string | null;
  quoteCode: string;
  historyQuery: HistoryQuery;
}) {
  const points = history?.points ?? [];
  const gaps = history?.gaps ?? [];
  const first = points[0];
  const last = points[points.length - 1];
  const lowerBound = isLowerBoundSource(historyQuery.source);
  const storedRange = isStoredRangeSource(historyQuery.source);

  const axis =
    first && last
      ? { fromLabel: first.ledgerClosedAt, toLabel: last.ledgerClosedAt }
      : null;

  return (
    <div className="flex flex-col gap-4">
      {/* A section label on the left and the controls that drive the chart on the
          right, so it is plain which part of the page the controls change. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h2 className="text-base font-semibold tracking-[-0.01em] text-[var(--keel-ink-strong)]">
          History
        </h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Neither window control applies to a stored range: the engine is asked
              which readings it holds, and it answers with all of them. Showing them
              anyway would offer two choices that change nothing on the screen. */}
          {storedRange ? null : (
            <>
              <Segmented
                label="Window"
                options={Object.entries(HISTORY_RANGES).map(([key, v]) => ({
                  key,
                  label: key,
                  note: v.label,
                }))}
                active={historyQuery.range}
                href={(key) =>
                  historyHref(assetId, historyQuery, {
                    range: key as HistoryQuery['range'],
                  })
                }
              />
              <Segmented
                label="Resolution"
                options={Object.entries(HISTORY_RESOLUTIONS).map(
                  ([key, label]) => ({ key, label }),
                )}
                active={historyQuery.resolution}
                href={(key) =>
                  historyHref(assetId, historyQuery, {
                    resolution: key as HistoryQuery['resolution'],
                  })
                }
              />
            </>
          )}
          <Segmented
            label="Source"
            options={Object.entries(HISTORY_SOURCES).map(([key, v]) => ({
              key,
              label: v.label,
              note: v.note,
            }))}
            active={historyQuery.source}
            href={(key) =>
              historyHref(assetId, historyQuery, {
                source: key as HistoryQuery['source'],
              })
            }
          />
        </div>
      </div>

      {storedRange ? (
        <Notice
          tone="empty"
          title="Every stored reading from this source, whenever it was taken"
          detail="A reconstruction is written where a replay ran rather than on the scan's cadence, so there is no window to choose: the engine returns the readings it holds and the axis below is labelled from them."
        />
      ) : null}

      {lowerBound ? (
        <Notice
          tone="problem"
          title="This source is a lower bound, not a measurement"
          detail="Trades-implied rebuilds the book from trades that happened, so every figure below is a floor: the real value is at least this, and may be more. It is not comparable with a direct reading."
        />
      ) : null}

      {failed !== null ? (
        <Notice
          tone="problem"
          title="The series could not be read"
          detail={failed}
        />
      ) : points.length === 0 ? (
        <Notice
          tone="empty"
          title="No readings were stored in this range from this source"
          detail={
            storedRange
              ? `The engine holds no stored reading for ${HISTORY_SOURCES[historyQuery.source].label} on this asset. A reconstruction exists only where keel replay has been run, and it has been run on one pair.`
              : `The engine accepted the request and returned nothing for ${HISTORY_SOURCES[historyQuery.source].label}. The series is as old as the deployment, so a window can reach back further than anything that was recorded. It is not empty because the figures were zero.`
          }
        />
      ) : axis === null ? null : (
        <>
          <MetricPanel
            metrics={metricDefinitions(points)}
            active={historyQuery.metric}
            href={(metric) => historyHref(assetId, historyQuery, { metric })}
            points={points}
            gaps={gaps}
            unit={quoteCode}
            {...axis}
            footer={
              <>
                {`${points.length} ${points.length === 1 ? 'reading' : 'readings'} from `}
                <span className="tabular">{history?.dataSource}</span>
                {gaps.length > 0
                  ? `, with ${gaps.length} ${gaps.length === 1 ? 'gap' : 'gaps'} drawn as breaks in the line`
                  : ', with no gaps reported'}
                . One source per chart.
              </>
            }
          />
        </>
      )}
    </div>
  );
}

/**
 * The four measures the chart can draw, from the same served points.
 *
 * The tab reports the rung a measure ranks on — five per cent for depth, the critical
 * delta for cost — and the chart draws every rung that belongs with it.
 */
function metricDefinitions(
  points: readonly HistoryPoint[],
): MetricDefinition[] {
  const line = (pick: (p: HistoryPoint) => string | null | undefined) =>
    points.map((p) => ({ at: p.ledgerSeq, value: pick(p) }));

  return [
    {
      key: 'depth',
      label: 'Depth, 5% buy',
      title: 'Buy-side depth',
      // Buy side answers oracle manipulation risk. It is never "the depth".
      note: 'What an order can absorb before the price moves against a buyer. The rungs are nested, so one scale covers all three.',
      pick: (p) => p.depth5PctBuySide,
      series: [
        {
          key: 'd2',
          label: '2% from mid',
          colour: SEQUENTIAL_RAMP[4],
          points: line((p) => p.depth2PctBuySide),
        },
        {
          key: 'd5',
          label: '5% from mid',
          colour: SEQUENTIAL_RAMP[8],
          points: line((p) => p.depth5PctBuySide),
        },
        {
          key: 'd10',
          label: '10% from mid',
          colour: SEQUENTIAL_RAMP[12],
          points: line((p) => p.depth10PctBuySide),
        },
      ],
    },
    {
      key: 'price',
      label: 'Mid price',
      title: 'Price',
      note: 'The midpoint the engine read at each scan. It says what the market quotes, not what it can absorb.',
      pick: (p) => p.midPrice,
      // A price moves in the digits a money amount rounds away.
      maxFractionDigits: 8,
      series: [
        {
          key: 'mid',
          label: 'Mid price',
          colour: SEQUENTIAL_RAMP[10],
          points: line((p) => p.midPrice),
        },
      ],
    },
    {
      key: 'cost',
      label: 'Cost to move +50%',
      title: 'Cost to move the price 50%',
      note: 'The stored series carries one manipulation rung, the +50% move. A reading the engine could not produce breaks the line rather than sitting at zero.',
      pick: (p) => p.manipulationCost50Pct,
      series: [
        {
          key: 'manip50',
          label: 'Cost to move +50%',
          colour: SEQUENTIAL_RAMP[6],
          points: line((p) => p.manipulationCost50Pct),
        },
      ],
    },
    {
      key: 'ceiling',
      label: 'Max safe collateral',
      title: 'Collateral ceiling',
      note: 'The most this asset could back at each reading: the lower of the liquidation and manipulation limits.',
      pick: (p) => p.maxSafeCollateral,
      series: [
        {
          key: 'ceiling',
          label: 'Max safe collateral',
          colour: SEQUENTIAL_RAMP[9],
          points: line((p) => p.maxSafeCollateral),
        },
      ],
    },
  ];
}

/** One view choice as a segmented control of real links, so the view stays shareable. */
function Segmented({
  label,
  options,
  active,
  href,
}: {
  label: string;
  options: { key: string; label: string; note?: string }[];
  active: string;
  href: (key: string) => string;
}) {
  const id = `segmented-${label.toLowerCase()}`;

  return (
    <div className="flex items-center gap-2">
      <span id={id} className="keel-marker">
        {label}
      </span>
      <ul
        aria-labelledby={id}
        className="flex flex-wrap items-center gap-0.5 rounded-md border border-[var(--keel-border)] bg-[var(--keel-surface)] p-0.5"
      >
        {options.map((option) => (
          <li key={option.key}>
            <Link
              href={href(option.key)}
              scroll={false}
              aria-current={option.key === active ? 'true' : undefined}
              title={option.note}
              className={cn(
                'inline-flex min-h-8 items-center rounded-sm px-2.5 text-xs transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]',
                option.key === active
                  ? 'bg-[var(--keel-accent-soft)] font-bold text-[var(--keel-accent)]'
                  : 'font-medium text-[var(--keel-muted)] hover:text-[var(--keel-ink-strong)]',
              )}
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function supplyRows(risk: AssetRisk): FigureRow[] {
  // Optional chaining would turn a served `null` into `undefined` and collapse two
  // findings this whole layer exists to keep apart: a key the response did not carry
  // against one the engine sent because it could not compute the figure.
  const volume = risk.volumeToSupply;
  const volumeToSupply30 =
    volume === undefined ? undefined : volume === null ? null : volume.d30;

  const lastTrade = risk.lastGenuineTrade;
  const lastTradeAt =
    lastTrade === undefined
      ? undefined
      : lastTrade === null
        ? null
        : lastTrade.at;

  return [
    {
      key: 'top1',
      label: 'Largest holder',
      value: classify(risk.holderTop1Pct, '%'),
      maxFractionDigits: 4,
    },
    {
      key: 'top10',
      label: 'Top ten holders',
      value: classify(risk.holderTop10Pct, '%'),
      maxFractionDigits: 4,
    },
    {
      key: 'hhi',
      label: 'Concentration index',
      value: classify(risk.holderHhi),
      maxFractionDigits: 2,
      note: 'Herfindahl–Hirschman, over the holder distribution',
    },
    {
      key: 'excluded',
      label: 'Volume excluded as not genuine',
      value: classify(risk.tradesExcludedPct, '%'),
      maxFractionDigits: 4,
      note: 'Of 30 day volume. A high share indicates suspected wash trading',
    },
    {
      key: 'v30',
      label: 'Volume to supply, 30 day',
      value: classify(volumeToSupply30),
      maxFractionDigits: 6,
      note: volume ? `1 day ${volume.d1} · 7 day ${volume.d7}` : undefined,
    },
    {
      key: 'lastTrade',
      label: 'Last genuine trade',
      text: lastTradeAt,
      note: lastTrade
        ? `Ledger ${lastTrade.ledgerSeq}`
        : 'No genuine trade was found in the window',
    },
  ];
}
