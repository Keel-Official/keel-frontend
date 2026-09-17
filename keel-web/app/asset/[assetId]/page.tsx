import Link from 'next/link';

import { BandSegments } from '@/components/keel/band-segments';
import {
  CalibrationNote,
  ConfidenceMeaning,
} from '@/components/keel/calibration-note';
import { CollateralCeilingPanel } from '@/components/keel/collateral-ceiling';
import { DepthLadder } from '@/components/keel/depth-ladder';
import { EngineWarnings } from '@/components/keel/engine-warnings';
import { FigureList, type FigureRow } from '@/components/keel/figure-list';
import { FlagGroups } from '@/components/keel/flag-groups';
import { ManipulationTable } from '@/components/keel/manipulation-table';
import { MethodologyBlock } from '@/components/keel/methodology-block';
import { Notice } from '@/components/keel/notice';
import { AppShell, PageHeader, Section } from '@/components/layout/app-shell';
import {
  isKeelExampleName,
  mockSelectionAllowed,
  type KeelExampleName,
} from '@/lib/api/client';
import { BandTimeline } from '@/components/keel/band-timeline';
import { TrendChart } from '@/components/keel/trend-chart';
import {
  fetchDepth,
  fetchHealth,
  fetchHistory,
  fetchMethodology,
} from '@/lib/api/server';
import type { HistoryResponse } from '@/lib/api/types';
import { SEQUENTIAL_RAMP } from '@/lib/design/tokens';
import {
  HISTORY_RANGES,
  HISTORY_RESOLUTIONS,
  HISTORY_SOURCES,
  historyHref,
  isLowerBoundSource,
  ledgerWindow,
  parseHistoryQuery,
  type HistoryQuery,
} from '@/lib/assets/history-range';
import { FlagTimeline } from '@/components/keel/flag-timeline';
import type { AssetRisk } from '@/lib/api/types';
import { readCollateralCeiling } from '@/lib/format/collateral';
import { truncateIssuer } from '@/lib/format/decimal';
import { isLowerBound } from '@/lib/format/flags';
import { classify, classifyCount } from '@/lib/format/value';

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
}: PageProps<'/asset/[assetId]'>) {
  // Route params arrive decoded, and the client percent-encodes the path segment again
  // on the way out. Decoding here a second time would corrupt any id that ever carried
  // a literal `%`, so the value is passed through as the router gives it.
  const { assetId } = await params;
  const example = readMockExample(await searchParams);

  const historyQuery = parseHistoryQuery(await searchParams);

  const [health, depth, methodology] = await Promise.all([
    fetchHealth(),
    fetchDepth(assetId, example),
    // A band is shown on this page, so the calibration caveat travels with it.
    fetchMethodology(),
  ]);

  // The series is a separate endpoint from the replay path that health turns off, and
  // it needs the latest ledger to size its window, so it is fetched after health.
  const latestLedger = health.data?.latestScanLedgerSeq ?? depth.data?.ledgerSeq ?? null;
  const history =
    latestLedger === null
      ? null
      : await fetchHistory(assetId, ledgerWindow(latestLedger, historyQuery), historyQuery.source);
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
    >
      {example ? (
        <Notice
          className="mb-6"
          tone="problem"
          title={`Showing the contract mock example "${example}", not live data`}
          detail="Every figure below was served by the mock. Drop the mock parameter from the URL to read the engine."
        />
      ) : null}

      <PageHeader title="What depth stands behind this price?">
        {risk ? (
          <p>
            <span className="tabular font-medium text-[var(--keel-ink-strong)]">
              {risk.asset.code}
            </span>{' '}
            against{' '}
            <span className="tabular">{risk.quote.code}</span>
            {risk.asset.issuer ? (
              <>
                {' · '}
                <span className="tabular" title={risk.asset.issuer}>
                  {truncateIssuer(risk.asset.issuer, 6)}
                </span>
              </>
            ) : (
              ' · native'
            )}
          </p>
        ) : (
          <p className="tabular break-all">{assetId}</p>
        )}
      </PageHeader>

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
              Set <code className="tabular">NEXT_PUBLIC_KEEL_API_URL</code> to the
              contract mock on <code className="tabular">http://localhost:4010</code> or
              to the live API, then reload.
            </p>
          ) : (
            <p>
              <Link className="underline underline-offset-2" href="/">
                Back to the monitored set
              </Link>
            </p>
          )}
        </Notice>
      ) : risk === null ? (
        <Notice tone="empty" title="The engine returned no result for this asset" />
      ) : (
        <AssetRiskView
          risk={risk}
          calibrated={methodology.data?.calibrated}
          calibrationNote={methodology.data?.calibrationNote}
          history={history?.data ?? null}
          historyFailed={history?.failure?.message ?? null}
          historyQuery={historyQuery}
          assetId={assetId}
        />
      )}
    </AppShell>
  );
}

function AssetRiskView({
  risk,
  calibrated,
  calibrationNote,
  history,
  historyFailed,
  historyQuery,
  assetId,
}: {
  risk: AssetRisk;
  calibrated: boolean | undefined;
  calibrationNote: string | undefined;
  history: HistoryResponse | null;
  historyFailed: string | null;
  historyQuery: HistoryQuery;
  assetId: string;
}) {
  const quoteCode = risk.quote.code;
  const ceiling = readCollateralCeiling(risk, quoteCode);

  // The engine's own answer, not a threshold applied here. Above the extreme-spread
  // threshold the contract says `midPrice` and everything derived from it — the whole
  // 2/5/10 per cent ladder — lose their meaning, so the ladder has to say so.
  const spreadExtreme = risk.flags.includes('SPREAD_EXTREME');
  const priceConflict = risk.flags.includes('PRICE_SOURCE_CONFLICT');

  return (
    <div className="flex flex-col gap-10">
      <Section
        title="How much can this asset safely back?"
        standfirst="The ceiling is the lower of two independent limits. Which one binds is the part a lender acts on, so both are shown."
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <div>
            <BandSegments band={risk.band} confidence={risk.bandConfidence} />
            <ConfidenceMeaning className="mt-2" />
            {risk.priceSource === 'none' ? (
              <p className="mt-3 text-sm text-[var(--band-critical-ink)]">
                This asset has no executable price at all. The band is a result the
                engine computed, not an error, and every figure derived from a price is
                unmeasured below.
              </p>
            ) : null}
          </div>

          <CollateralCeilingPanel ceiling={ceiling} />
        </div>

        {/* Full width, below the two columns. Inside the left one it stretched that
            column and left the right half of the section empty. */}
        <CalibrationNote
          className="mt-6"
          calibrated={calibrated}
          note={calibrationNote}
        />

        <MethodologyBlock source="GET /asset/{assetId}/depth → maxSafeCollateral, maxSafeCollateralLiquidation, maxSafeCollateralManipulation" />
      </Section>

      <EngineWarnings warnings={risk.warnings} />

      <Section
        title="Where does the price come from?"
        standfirst="Two venues can disagree. Both readings are shown, not only the one that won."
      >
        <FigureList rows={priceRows(risk, quoteCode, priceConflict)} />
        <MethodologyBlock source="GET /asset/{assetId}/depth → midPrice, priceSource, spreadPct, poolSpotPrice, priceDivergencePct" />
      </Section>

      <Section
        title="What volume can it absorb before the price moves?"
        standfirst="Three rungs at 2, 5 and 10 per cent, in each direction. The buy side matters for oracle manipulation and the sell side for liquidation."
      >
        {spreadExtreme ? (
          <Notice
            className="mb-4"
            tone="problem"
            title="SPREAD_EXTREME is triggered, so this ladder is not meaningful"
            detail="The spread is past the threshold at which the engine says the mid price, and every figure derived from it including these rungs, stops describing an executable market."
          />
        ) : null}

        {risk.depth.length === 0 ? (
          <Notice tone="empty" title="No depth rungs were returned for this asset" />
        ) : (
          <DepthLadder depth={risk.depth} quoteCode={quoteCode} />
        )}

        <MethodologyBlock source="GET /asset/{assetId}/depth → depth[]" />
      </Section>

      <Section
        title="What would it cost to move the price?"
        standfirst="Read cost together with reachability: a figure on an unreachable rung says how far the book goes, not what the move costs."
      >
        {spreadExtreme ? (
          <Notice
            className="mb-4"
            tone="problem"
            title="Every target price below is measured from the same unreliable mid"
            detail="SPREAD_EXTREME is triggered. A target price is the mid price moved by the delta, so when the mid sits between quotes that are far apart, the targets describe a market that is not there. Reachability and the furthest price the book reaches are the readings that still mean something here."
          />
        ) : null}

        <ManipulationTable
          combined={risk.manipulationCostCombined}
          orderbookOnly={risk.manipulationCostOrderbookOnly}
          quoteCode={quoteCode}
        />

        <p className="mt-3 text-xs text-[var(--keel-muted)]">
          Reachability on the all-venues ladder is unconditionally true whenever an
          active pool exists, because a constant product curve has no upper price bound.
          The order-book-only column is the one that answers whether a target is
          attainable, and it is the one Keel itself uses.
        </p>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-[var(--keel-ink-strong)]">
            How far the book actually goes
          </h3>
          {/*
            The ceiling of the ladder above. When the order book runs out before any of
            the four deltas is reached, these two say where it ran out and what getting
            there costs — which is the only figure on the page that describes the end of
            the book rather than a target.
          */}
          <FigureList className="mt-3" rows={reachRows(risk, quoteCode)} />
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-[var(--keel-ink-strong)]">
            Against genuine volume
          </h3>
          {risk.oracleResistance ? (
            <FigureList
              className="mt-3"
              rows={oracleRows(risk.oracleResistance, quoteCode)}
            />
          ) : (
            <p className="mt-2 text-sm text-[var(--keel-muted)]">
              Not reported for this asset. Without it there is no comparison between the
              cost of an attack and the genuine trading it would have to hide inside.
            </p>
          )}
        </div>

        <MethodologyBlock source="GET /asset/{assetId}/depth → manipulationCostCombined[], manipulationCostOrderbookOnly[], oracleResistance" />
      </Section>

      <Section
        title="Which checks fired, and which could not run?"
        standfirst="An unevaluated check is not a check that came back clear. The two never share a treatment."
      >
        <FlagGroups triggered={risk.flags} unevaluated={risk.unevaluatedFlags} />
        <MethodologyBlock source="GET /asset/{assetId}/depth → flags[], unevaluatedFlags[], bandConfidence" />
      </Section>

      <Section
        title="Who holds it, and is it genuinely traded?"
        standfirst="Concentration and wash trading bound how much of the depth above is real."
      >
        <FigureList rows={supplyRows(risk)} />
        <MethodologyBlock source="GET /asset/{assetId}/depth → holderTop1Pct, holderTop10Pct, holderHhi, volumeToSupply, lastGenuineTrade, tradesExcludedPct" />
      </Section>

      <Section
        id="history"
        title="How has this moved over time?"
        standfirst="A single reading cannot separate a thin asset from one that just got thin. This is a stored series, not the historical replay that health reports as unavailable — those are different endpoints."
      >
        <HistoryView
          assetId={assetId}
          history={history}
          failed={historyFailed}
          quoteCode={risk.quote.code}
          historyQuery={historyQuery}
        />
        <MethodologyBlock source="GET /asset/{assetId}/history → points[], gaps[], dataSource" />
      </Section>

      <Section title="What was this computed from?">
        <FigureList rows={provenanceRows(risk)} />
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

  const axis = first && last
    ? { fromLabel: first.ledgerClosedAt, toLabel: last.ledgerClosedAt }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Picker
          label="Window"
          options={Object.entries(HISTORY_RANGES).map(([key, v]) => ({
            key,
            label: v.label,
          }))}
          active={historyQuery.range}
          href={(key) =>
            historyHref(assetId, historyQuery, { range: key as HistoryQuery['range'] })
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
            historyHref(assetId, historyQuery, { source: key as HistoryQuery['source'] })
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
        <Notice tone="problem" title="The series could not be read" detail={failed} />
      ) : points.length === 0 ? (
        <Notice
          tone="empty"
          title="No readings were stored in this range from this source"
          detail={`The engine accepted the request and returned nothing for ${HISTORY_SOURCES[historyQuery.source].label}. The series is as old as the deployment, and the reconstruction sources are not populated in production, so a window can reach back further than anything that was recorded. It is not empty because the figures were zero.`}
        />
      ) : axis === null ? null : (
        <>
          <p className="text-xs text-[var(--keel-muted)]">
            {`${points.length} ${points.length === 1 ? 'reading' : 'readings'} from `}
            <span className="tabular">{history?.dataSource}</span>
            {gaps.length > 0
              ? `, with ${gaps.length} ${gaps.length === 1 ? 'gap' : 'gaps'} drawn as breaks in the line`
              : ', with no gaps reported'}
            . One source per chart.
          </p>

          <div>
            <h3 className="text-sm font-medium text-[var(--keel-ink-strong)]">
              Band at each reading
            </h3>
            <BandTimeline className="mt-2" points={points} />
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--keel-ink-strong)]">
              Which checks were firing
            </h3>
            <p className="mt-1 text-xs text-[var(--keel-muted)]">
              Whether a finding has been there all along or started recently. Only checks
              that fired at least once appear.
            </p>
            <FlagTimeline className="mt-3" points={points} />
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--keel-ink-strong)]">Price</h3>
            <TrendChart
              className="mt-3"
              unit={quoteCode}
              gaps={gaps}
              {...axis}
              // A price moves in the digits a money amount rounds away.
              maxFractionDigits={8}
              series={[
                {
                  key: 'mid',
                  label: 'Mid price',
                  colour: SEQUENTIAL_RAMP[10],
                  points: points.map((p) => ({ at: p.ledgerSeq, value: p.midPrice })),
                },
              ]}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--keel-ink-strong)]">
              Buy-side depth
            </h3>
            {/* Buy side answers oracle manipulation risk. It is never "the depth". */}
            <p className="mt-1 text-xs text-[var(--keel-muted)]">
              What an order can absorb before the price moves against a buyer. The rungs
              are nested, so one scale covers all three, and the lines darken as the rung
              widens.
            </p>
            <TrendChart
              className="mt-3"
              unit={quoteCode}
              gaps={gaps}
              {...axis}
              series={[
                {
                  key: 'd2',
                  label: '2% from mid',
                  colour: SEQUENTIAL_RAMP[4],
                  points: points.map((p) => ({ at: p.ledgerSeq, value: p.depth2PctBuySide })),
                },
                {
                  key: 'd5',
                  label: '5% from mid',
                  colour: SEQUENTIAL_RAMP[8],
                  points: points.map((p) => ({ at: p.ledgerSeq, value: p.depth5PctBuySide })),
                },
                {
                  key: 'd10',
                  label: '10% from mid',
                  colour: SEQUENTIAL_RAMP[12],
                  points: points.map((p) => ({ at: p.ledgerSeq, value: p.depth10PctBuySide })),
                },
              ]}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--keel-ink-strong)]">
              Cost to move the price by half
            </h3>
            <p className="mt-1 text-xs text-[var(--keel-muted)]">
              The series carries one manipulation rung, at the half per cent delta the
              engine treats as critical. A reading the engine could not produce breaks
              the line rather than sitting at zero.
            </p>
            <TrendChart
              className="mt-3"
              unit={quoteCode}
              gaps={gaps}
              {...axis}
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
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--keel-ink-strong)]">
              Collateral ceiling
            </h3>
            <TrendChart
              className="mt-3"
              unit={quoteCode}
              gaps={gaps}
              {...axis}
              series={[
                {
                  key: 'ceiling',
                  label: 'Max safe collateral',
                  colour: SEQUENTIAL_RAMP[9],
                  points: points.map((p) => ({ at: p.ledgerSeq, value: p.maxSafeCollateral })),
                },
              ]}
            />
          </div>
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

const PRICE_SOURCE_WORDS: Readonly<Record<AssetRisk['priceSource'], string>> = {
  book: 'order book mid',
  pool: 'AMM pool spot',
  none: 'no executable price',
};

function priceRows(
  risk: AssetRisk,
  quoteCode: string,
  priceConflict: boolean,
): FigureRow[] {
  return [
    {
      key: 'mid',
      label: 'Mid price',
      value: classify(risk.midPrice, quoteCode),
      maxFractionDigits: 8,
      note: `Source: ${PRICE_SOURCE_WORDS[risk.priceSource]}`,
    },
    {
      key: 'spread',
      label: 'Spread',
      // Percent is the unit the API serves for every field ending in `Pct`, so the
      // figure is shown as served rather than rescaled into a fraction.
      value: classify(risk.spreadPct, '%'),
      maxFractionDigits: 4,
      note: 'Undefined unless the price came from a two-sided book',
    },
    {
      key: 'pool',
      label: 'Pool spot price',
      value: classify(risk.poolSpotPrice, quoteCode),
      maxFractionDigits: 8,
      note: 'Reported whenever an active pool exists, whichever source won',
    },
    {
      key: 'divergence',
      label: 'Divergence between the two',
      value: classify(risk.priceDivergencePct, '%'),
      maxFractionDigits: 4,
      note: priceConflict
        ? 'PRICE_SOURCE_CONFLICT is triggered: the two sources disagree past the threshold and the pool was taken'
        : 'Null means there is no pool to diverge from, not that the sources agree',
    },
  ];
}

/**
 * The furthest the order book reaches, and what reaching it costs.
 *
 * Both are null for a structural reason whenever an active pool exists: under a
 * constant product curve the price tends to infinity as the base reserve tends to
 * zero, so every target is reachable and a highest price has no meaning. The engine
 * says exactly that in `warnings`, which is rendered above. That null is therefore not
 * a gap in the measurement, and the note says so rather than leaving "not computed" to
 * be read as a failure.
 *
 * They carry real figures in the case they were built for: a book with one ask and one
 * bid far apart, where the deltas are unreachable and the only honest answer to "how
 * far can this be pushed" is the top of the book.
 */
function reachRows(risk: AssetRisk, quoteCode: string): FigureRow[] {
  const pooled = risk.poolSpotPrice !== null && risk.poolSpotPrice !== undefined;

  const structuralNote = pooled
    ? 'Null by structure, not by failure: an active pool means every target is reachable and a highest price has no meaning'
    : 'The highest price the order book can be walked to';

  return [
    {
      key: 'maxReachablePrice',
      label: 'Furthest price the book reaches',
      value: classify(risk.maxReachablePrice, quoteCode),
      maxFractionDigits: 8,
      note: structuralNote,
    },
    {
      key: 'costToMaxReachablePrice',
      label: 'Cost to walk it that far',
      value: classify(risk.costToMaxReachablePrice, quoteCode),
      maxFractionDigits: 2,
      note: pooled
        ? 'Null for the same reason as the price above'
        : 'What it costs to consume the book up to that price',
    },
  ];
}

function oracleRows(
  resistance: NonNullable<AssetRisk['oracleResistance']>,
  quoteCode: string,
): FigureRow[] {
  return [
    {
      key: 'cost',
      label: `Cost at the critical delta (${resistance.criticalDelta})`,
      value: classify(resistance.manipulationCost, quoteCode),
      maxFractionDigits: 2,
      note: resistance.reachable
        ? 'Order-book-only, at the delta the engine treats as critical'
        : 'The target is not reachable, so this is not the cost of reaching it',
    },
    {
      key: 'volume',
      label: 'Genuine volume in the window',
      value: classify(resistance.genuineVolume, quoteCode),
      maxFractionDigits: 2,
      note: `Over ${resistance.windowSeconds}s, after the genuine trade filter`,
    },
    {
      key: 'ratio',
      label: 'Cost as a share of that volume',
      value: classify(resistance.ratio),
      maxFractionDigits: 4,
      note: 'Below 1 means moving the price costs less than all the genuine trading it hides in',
    },
    {
      key: 'total',
      label: 'Total capital an attack needs',
      value: classify(resistance.totalAttackCost, quoteCode),
      maxFractionDigits: 2,
      note: 'A lower bound: the book has to be paid and the genuine volume outweighed',
    },
  ];
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
    lastTrade === undefined ? undefined : lastTrade === null ? null : lastTrade.at;

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

function provenanceRows(risk: AssetRisk): FigureRow[] {
  return [
    {
      key: 'ledger',
      label: 'Ledger',
      value: classifyCount(risk.ledgerSeq),
      note: `Closed at ${risk.ledgerClosedAt}`,
    },
    { key: 'computed', label: 'Computed at', text: risk.computedAt },
    {
      key: 'source',
      label: 'Data source',
      text: risk.dataSource,
      note: isLowerBound(risk.dataSource)
        ? 'Reconstructed from trades, so every figure here is a lower bound rather than a measurement'
        : undefined,
    },
    {
      key: 'methodology',
      label: 'Methodology',
      text: risk.methodologyVersion,
      note: 'The version that produced these figures, not the one this page was built against',
    },
  ];
}
