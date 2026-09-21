import Link from 'next/link';

import { BandCard } from '@/components/dashboard/band-card';
import { CollateralCeilingPanel } from '@/components/dashboard/collateral-ceiling';
import { DepthLadder } from '@/components/dashboard/depth-ladder';
import { FigureList, type FigureRow } from '@/components/dashboard/figure-list';
import { ManipulationTable } from '@/components/dashboard/manipulation-table';
import { Notice } from '@/components/dashboard/notice';
import { AppShell, Section } from '@/components/dashboard/layout/app-shell';
import {
  isKeelExampleName,
  mockSelectionAllowed,
  type KeelExampleName,
} from '@/lib/keel/api/client';
import { ChartCard } from '@/components/dashboard/chart-card';
import { EngineWarnings } from '@/components/dashboard/engine-warnings';
import { LedgerPicker } from '@/components/dashboard/ledger-picker';
import {
  oracleRows,
  priceRows,
  reachRows,
} from '@/components/dashboard/reading-rows';
import { ReconstructionPanel } from '@/components/dashboard/reconstruction-panel';
import { fetchDepth, fetchHealth, fetchHistory } from '@/lib/keel/api/server';
import type { HistoryResponse } from '@/lib/keel/api/types';
import {
  DASHBOARD_BASE,
  dashboardAssetPath,
  decodeAssetId,
} from '@/lib/keel/routes';
import { parseLedger } from '@/lib/keel/url/ledger';
import { SEQUENTIAL_RAMP } from '@/lib/keel/design/tokens';
import {
  HISTORY_RANGES,
  HISTORY_RESOLUTIONS,
  HISTORY_SOURCES,
  historyHref,
  isLowerBoundSource,
  ledgerWindow,
  parseHistoryQuery,
  type HistoryQuery,
} from '@/lib/keel/assets/history-range';
import { FlagTimeline } from '@/components/dashboard/flag-timeline';
import type { AssetRisk } from '@/lib/keel/api/types';
import { readCollateralCeiling } from '@/lib/keel/format/collateral';
import { classify } from '@/lib/keel/format/value';

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
  const history =
    latestLedger === null || atLedger !== null
      ? null
      : await fetchHistory(
          assetId,
          ledgerWindow(latestLedger, historyQuery),
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
  const quoteCode = risk.quote.code;
  const ceiling = readCollateralCeiling(risk, quoteCode);
  const oracle = oracleRows(risk);

  return (
    <div className="flex flex-col gap-10">
      {atLedger !== null ? (
        <ReconstructionPanel
          risk={risk}
          liveHref={dashboardAssetPath(assetId)}
        />
      ) : (
        <Section id="history" hideHeading title="How has this moved over time?">
          <HistoryView
            assetId={assetId}
            history={history}
            failed={historyFailed}
            quoteCode={risk.quote.code}
            historyQuery={historyQuery}
          />
        </Section>
      )}

      {/* Offered only when the engine says its historical path is on. When it is off,
          every ledger would be refused, and a control that can only fail is noise. */}
      {historicalAvailable === true ? (
        <Section
          title="What did this look like at a past ledger?"
          standfirst="The engine answers only for ledgers a replay has stored, and says so when it has not. A stored past reading is rebuilt from the operation stream, so it carries its own gaps."
        >
          <LedgerPicker assetId={assetId} current={atLedger} />
        </Section>
      ) : null}

      <Section
        title="How much can this asset safely back?"
        standfirst="The ceiling is the lower of two independent limits. Which one binds is the part a lender acts on, so both are shown."
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <div>
            <BandCard band={risk.band} confidence={risk.bandConfidence} />
            {risk.priceSource === 'none' ? (
              <p className="mt-3 text-sm text-[var(--band-critical-ink)]">
                This asset has no executable price at all. The band is a result
                the engine computed, not an error, and every figure derived from
                a price is unmeasured below.
              </p>
            ) : null}
          </div>

          <CollateralCeilingPanel ceiling={ceiling} />
        </div>
      </Section>

      <Section
        title="What does the engine say about this reading?"
        standfirst="The engine's own notes on the limits of this computation, verbatim and in the order served."
      >
        <EngineWarnings warnings={risk.warnings} />
      </Section>

      <Section
        title="Where does the price come from?"
        standfirst="Both price sources are shown, not only the one that won, and the pair that set the band is named."
      >
        <FigureList rows={priceRows(risk)} />
      </Section>

      <Section
        title="What volume can it absorb before the price moves?"
        standfirst="Three rungs at 2, 5 and 10 per cent, in each direction. The buy side matters for oracle manipulation and the sell side for liquidation."
      >
        {risk.depth.length === 0 ? (
          <Notice
            tone="empty"
            title="No depth rungs were returned for this asset"
          />
        ) : (
          <DepthLadder depth={risk.depth} quoteCode={quoteCode} />
        )}
      </Section>

      <Section
        title="What would it cost to move the price?"
        standfirst="Read cost together with reachability: a figure on an unreachable rung says how far the book goes, not what the move costs."
      >
        <ManipulationTable
          combined={risk.manipulationCostCombined}
          orderbookOnly={risk.manipulationCostOrderbookOnly}
          quoteCode={quoteCode}
        />

        <p className="mt-3 text-xs text-[var(--keel-muted)]">
          Reachability on the all-venues ladder is unconditionally true whenever
          an active pool exists, because a constant product curve has no upper
          price bound. The order-book-only column is the one that answers
          whether a target is attainable, and it is the one Keel itself uses.
        </p>

        <FigureList className="mt-6" rows={reachRows(risk)} />
      </Section>

      <Section
        title="What does the oracle window add?"
        standfirst="An averaging oracle makes an attacker outweigh genuine trading as well as move the book. A market with no genuine volume has no such defence."
      >
        {oracle === null ? (
          // The contract reserves null for "no executable price". The engine can also
          // send null beside a price it did compute, so the reason is stated only when
          // the response itself carries it, and otherwise the absence is just said.
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
      </Section>

      <Section
        title="Who holds it, and is it genuinely traded?"
        standfirst="Concentration and wash trading bound how much of the depth above is real."
      >
        <FigureList rows={supplyRows(risk)} />
      </Section>
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
 * Everything the reader chooses — window, resolution, source — is in the URL, so the
 * exact chart in front of them is a link they can send.
 *
 * The chart labels itself from the first and last point that CAME BACK, never from the
 * range that was asked for. Coverage is as old as the deployment, so a window of seven
 * days may hold five, and an axis implying more than the data covers reads as broken
 * data rather than as young data.
 *
 * One request is one source. Selecting another reloads every chart together rather than
 * overlaying two, because `horizon` is a direct reading and the rest are
 * reconstructions — and `trades-implied` is a lower bound, so a line from it is a floor
 * and not a measurement.
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

  const axis =
    first && last
      ? { fromLabel: first.ledgerClosedAt, toLabel: last.ledgerClosedAt }
      : null;

  return (
    <div className="flex flex-col gap-6">
      {/* One wrapping row, not three stacked ones. This is the only thing between the
          top of the page and the charts, so it earns as little height as it can. */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
        <Picker
          label="Window"
          options={Object.entries(HISTORY_RANGES).map(([key, v]) => ({
            key,
            label: v.label,
          }))}
          active={historyQuery.range}
          href={(key) =>
            historyHref(assetId, historyQuery, {
              range: key as HistoryQuery['range'],
            })
          }
        />
        <Picker
          label="Resolution"
          options={Object.entries(HISTORY_RESOLUTIONS).map(([key, label]) => ({
            key,
            label,
          }))}
          active={historyQuery.resolution}
          href={(key) =>
            historyHref(assetId, historyQuery, {
              resolution: key as HistoryQuery['resolution'],
            })
          }
        />
        <Picker
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
          detail={`The engine accepted the request and returned nothing for ${HISTORY_SOURCES[historyQuery.source].label}. The series is as old as the deployment, and the reconstruction sources are not populated in production, so a window can reach back further than anything that was recorded. It is not empty because the figures were zero.`}
        />
      ) : axis === null ? null : (
        <>
          {/*
            Four measures, one frame, one date range.
            Stacked full width these were read one at a time, and the moment worth
            catching is when two of them move together — depth falling and the
            collateral ceiling following it. Side by side that comparison is free. The
            charts are the same `TrendChart` on the same served points; only the height
            and the repeated axis labels are gone, and the range they all share is
            stated once, below.
          */}
          <div className="rounded-xl border border-[var(--keel-border)] bg-[var(--keel-surface-subtle)] p-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ChartCard
                title="Price"
                series={[
                  {
                    key: 'mid',
                    label: 'Mid price',
                    colour: SEQUENTIAL_RAMP[10],
                    points: points.map((p) => ({
                      at: p.ledgerSeq,
                      value: p.midPrice,
                    })),
                  },
                ]}
                gaps={gaps}
                unit={quoteCode}
                {...axis}
                // A price moves in the digits a money amount rounds away.
                maxFractionDigits={8}
              />

              <ChartCard
                title="Buy-side depth"
                // Buy side answers oracle manipulation risk. It is never "the depth".
                note="What an order can absorb before the price moves against a buyer. The rungs are nested, so one scale covers all three."
                series={[
                  {
                    key: 'd2',
                    label: '2% from mid',
                    colour: SEQUENTIAL_RAMP[4],
                    points: points.map((p) => ({
                      at: p.ledgerSeq,
                      value: p.depth2PctBuySide,
                    })),
                  },
                  {
                    key: 'd5',
                    label: '5% from mid',
                    colour: SEQUENTIAL_RAMP[8],
                    points: points.map((p) => ({
                      at: p.ledgerSeq,
                      value: p.depth5PctBuySide,
                    })),
                  },
                  {
                    key: 'd10',
                    label: '10% from mid',
                    colour: SEQUENTIAL_RAMP[12],
                    points: points.map((p) => ({
                      at: p.ledgerSeq,
                      value: p.depth10PctBuySide,
                    })),
                  },
                ]}
                gaps={gaps}
                unit={quoteCode}
                {...axis}
              />

              <ChartCard
                title="Cost to move the price by half"
                note="One manipulation rung, at the delta the engine treats as critical. A reading it could not produce breaks the line rather than sitting at zero."
                series={[
                  {
                    key: 'manip50',
                    label: 'Manipulation cost, 0.5%',
                    colour: SEQUENTIAL_RAMP[6],
                    points: points.map((p) => ({
                      at: p.ledgerSeq,
                      value: p.manipulationCost50Pct,
                    })),
                  },
                ]}
                gaps={gaps}
                unit={quoteCode}
                {...axis}
              />

              <ChartCard
                title="Collateral ceiling"
                series={[
                  {
                    key: 'ceiling',
                    label: 'Max safe collateral',
                    colour: SEQUENTIAL_RAMP[9],
                    points: points.map((p) => ({
                      at: p.ledgerSeq,
                      value: p.maxSafeCollateral,
                    })),
                  },
                ]}
                gaps={gaps}
                unit={quoteCode}
                {...axis}
              />
            </div>

            {/* Said once for the frame rather than four times inside it. Every card
                covers exactly this range, and it is read from the points that came
                back rather than from the window that was asked for. */}
            <p className="tabular mt-3 text-xs text-[var(--keel-muted)]">
              {axis.fromLabel} — {axis.toLabel}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--keel-ink-strong)]">
              Which checks were firing
            </h3>
            <p className="mt-1 text-xs text-[var(--keel-muted)]">
              Whether a finding has been there all along or started recently.
              Only checks that fired at least once appear.
            </p>
            <FlagTimeline className="mt-3" points={points} />
          </div>

          <p className="text-xs text-[var(--keel-muted)]">
            {`${points.length} ${points.length === 1 ? 'reading' : 'readings'} from `}
            <span className="tabular">{history?.dataSource}</span>
            {gaps.length > 0
              ? `, with ${gaps.length} ${gaps.length === 1 ? 'gap' : 'gaps'} drawn as breaks in the line`
              : ', with no gaps reported'}
            . One source per chart.
          </p>
        </>
      )}
    </div>
  );
}

/** One row of view choices, each a real link so the view stays shareable. */
function Picker({
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
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-xs font-medium tracking-wide text-[var(--keel-muted)] uppercase">
        {label}
      </span>
      {options.map((option) => (
        <Link
          key={option.key}
          href={href(option.key)}
          aria-current={option.key === active ? 'true' : undefined}
          title={option.note}
          className={
            option.key === active
              ? 'rounded-md border border-[var(--keel-brand)] bg-[var(--keel-brand)] px-2.5 py-1 text-sm text-white'
              : 'rounded-md border border-[var(--keel-border-strong)] px-2.5 py-1 text-sm text-[var(--keel-ink)] hover:bg-[var(--keel-surface-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]'
          }
        >
          {option.label}
        </Link>
      ))}
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
