import Link from 'next/link';
import {
  ArrowRight,
  CircleDashed,
  CircleSlash,
  Layers,
  OctagonAlert,
  OctagonX,
  Siren,
} from 'lucide-react';

import type {
  AssetRisk,
  AssetSummary,
  HistoryResponse,
} from '@/lib/keel/api/types';
import { HISTORY_RANGES } from '@/lib/keel/assets/history-range';
import { SEQUENTIAL_RAMP } from '@/lib/keel/design/tokens';
import { compareDecimalStrings } from '@/lib/keel/format/compare';
import { formatDecimal } from '@/lib/keel/format/decimal';
import { flagCopy, bandCopy } from '@/lib/keel/format/glossary';
import { classify, isMeasured } from '@/lib/keel/format/value';
import type { Flag } from '@/lib/keel/format/flags';
import {
  assetHref,
  rangeHref,
  type AssetQuery,
} from '@/lib/keel/url/asset-query';
import { cn } from '@/lib/keel/utils';

import { BandChip } from './band-chip';
import { BandTimeline } from './band-timeline';
import { Notice } from './notice';
import { Term } from './term';
import { TrendChart } from './trend-chart';

/**
 * The top of the page: one asset's depth over time, beside what needs attention across
 * the whole set.
 *
 * This replaced a row of four equal tiles. Four tiles gave every figure the same
 * weight, which is the wrong shape for this page — "thirty-nine assets cannot safely
 * back a position" and "the methodology is version 1.0.8-draft" are not the same kind
 * of fact and should not look like it. The bento puts one large, moving figure beside a
 * short ranked list, so the eye lands on the trend and then reads the counts.
 *
 * WHAT THE BIG NUMBER IS, AND WHAT IT IS NOT. It is one asset's executable depth at the
 * five per cent rung — a figure the engine served, for the asset in focus. It is
 * deliberately NOT a total across the monitored set. Summing depth over sixty-one
 * markets would produce a number that looks like liquidity and is not: those markets
 * cannot be traded against each other, the sum has no counterparty, and nothing in the
 * methodology defines it. A dashboard of this shape usually opens with a portfolio
 * total; Keel has no portfolio, and inventing an aggregate to fill the space would be
 * exactly the false confidence this product exists to prevent.
 *
 * THE CHANGE LINE IS A DIRECTION, NOT A PERCENTAGE. The reference pattern here is
 * "increased by 20%". That would mean subtracting and dividing two decimal strings, and
 * nothing in this codebase computes a financial value — the engine owns arithmetic and
 * this layer renders it. Both endpoints are compared digit by digit through
 * `compareDecimalStrings`, which establishes direction exactly, and both served figures
 * are shown so a reader can do the division themselves if they want it.
 *
 * NO ACTION BUTTONS. The reference has Deposit and Withdraw. Keel is read-only: there is
 * no wallet, no signing, and no write path anywhere in it. The space goes to the links a
 * reader actually needs — the filtered views behind each count.
 */

export interface OverviewHeroProps {
  rows: readonly AssetSummary[];
  /**
   * The asset in focus, as a slot rather than as its data.
   *
   * THE SLOT IS WHAT LETS THE PAGE STREAM. The focus card needs two more requests
   * than the rest of the page does, and the attention card beside it needs none, so
   * taking the card's data here would hold every count on the screen back until the
   * slowest series arrived. The page passes a Suspense boundary instead: the counts
   * and the table render from the first round trip, and the card fills in when its
   * own requests land. `FocusCard` and `FocusCardPending` are the two things the
   * slot is expected to hold.
   */
  focus: React.ReactNode;
  monitored: number | null | undefined;
  query: AssetQuery;
  className?: string;
}

export function OverviewHero({
  rows,
  focus,
  monitored,
  query,
  className,
}: OverviewHeroProps) {
  return (
    <div
      className={cn(
        'grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]',
        className,
      )}
    >
      {focus}
      <AttentionCard rows={rows} monitored={monitored} query={query} />
    </div>
  );
}

/**
 * The focus card while its two requests are in flight.
 *
 * It holds the card's frame and height so nothing beside it moves when the figures
 * land, and it says what it is waiting for in words: a blank box and a spinner say
 * nothing about whether the market is empty or the answer is late, and on this page
 * those are different findings.
 */
export function FocusCardPending({ query }: { query: AssetQuery }) {
  return (
    <section
      aria-busy="true"
      className="flex min-h-[22rem] min-w-0 flex-col rounded-2xl border border-[var(--keel-border)] bg-[var(--keel-surface)] p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[var(--keel-muted)] uppercase">
          <Term name="depth">Tradable depth</Term>
        </div>
        <RangeTabs query={query} />
      </header>
      <p role="status" className="mt-4 text-sm text-[var(--keel-muted)]">
        Reading the deepest market in view and its stored series&hellip;
      </p>
    </section>
  );
}

/* --- left: the asset in focus ------------------------------------------- */

export function FocusCard({
  risk,
  history,
  historyFailure,
  query,
}: {
  risk: AssetRisk | null;
  history: HistoryResponse | null;
  historyFailure: string | null;
  query: AssetQuery;
}) {
  if (risk === null) {
    return (
      <section className="rounded-2xl border border-[var(--keel-border)] bg-[var(--keel-surface)] p-5">
        <p className="text-sm text-[var(--keel-muted)]">
          No asset is in view, so there is no series to draw.
        </p>
      </section>
    );
  }

  const quoteCode = risk.quote.code;
  const points = history?.points ?? [];
  const first = points[0];
  const last = points[points.length - 1];

  // The headline is the five per cent buy-side rung: the same figure the cards, the map
  // and the table all rank on, so the number that opens the page is the one the reader
  // meets everywhere else.
  const headline = classify(
    risk.depth.find((rung) => rung.delta === 0.05)?.buySide,
    quoteCode,
  );

  return (
    <section className="flex min-w-0 flex-col rounded-2xl border border-[var(--keel-border)] bg-[var(--keel-surface)] p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[var(--keel-muted)] uppercase">
            <Term name="depth">Tradable depth</Term>
          </div>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm text-[var(--keel-muted)]">
            <span className="tabular text-base font-semibold text-[var(--keel-ink-strong)]">
              {risk.asset.code}
            </span>
            <span>/ {quoteCode}</span>
            <BandChip band={risk.band} confidence={risk.bandConfidence} />
            <span className="text-xs">deepest market in view</span>
          </p>
        </div>

        <RangeTabs query={query} />
      </header>

      <BigFigure value={headline} />

      <ChangeLine
        from={first?.depth5PctBuySide}
        to={last?.depth5PctBuySide}
        quoteCode={quoteCode}
        rangeLabel={HISTORY_RANGES[query.range].label.toLowerCase()}
      />

      <div className="mt-4 min-w-0 flex-1">
        {historyFailure !== null ? (
          <Notice
            tone="problem"
            title="The stored series could not be read"
            detail={historyFailure}
          />
        ) : points.length === 0 ? (
          <Notice
            tone="empty"
            title="No readings are stored in this window"
            detail="The series is only as old as the deployment, so a window can reach back further than anything that was recorded. It is not empty because the figures were zero."
          />
        ) : first && last ? (
          <>
            <TrendChart
              unit={quoteCode}
              gaps={history?.gaps ?? []}
              fromLabel={first.ledgerClosedAt}
              toLabel={last.ledgerClosedAt}
              series={[
                {
                  key: 'd5',
                  label: 'Buy side, 5% from mid',
                  colour: SEQUENTIAL_RAMP[10],
                  points: points.map((p) => ({
                    at: p.ledgerSeq,
                    value: p.depth5PctBuySide,
                  })),
                },
              ]}
            />

            <div className="mt-4">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[var(--keel-muted)] uppercase">
                <Term name="band">Verdict at each reading</Term>
              </h3>
              <BandTimeline className="mt-2" points={points} />
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

/**
 * The headline figure, with its fraction set back.
 *
 * Two decimals are the house rule for any figure in an overview, and at this size the
 * cents carry almost none of the meaning while taking a fifth of the width. Dimming
 * rather than dropping them keeps the number exact to the precision claimed, and the
 * served value stays on the element for anyone who needs all of it.
 */
function BigFigure({ value }: { value: ReturnType<typeof classify> }) {
  if (!isMeasured(value) || value.exact === null) {
    return (
      <p className="mt-4 flex items-center gap-2 text-2xl text-[var(--unmeasured)] italic">
        <CircleDashed aria-hidden="true" className="size-5" />
        {value.state === 'absent' ? 'not reported' : 'not computed'}
      </p>
    );
  }

  const formatted = formatDecimal(value.exact, { maxFractionDigits: 2 });
  const [whole, fraction] = formatted.display.split('.');

  return (
    <p
      className="tabular mt-4 flex flex-wrap items-baseline gap-x-2 leading-none font-semibold text-[var(--keel-ink-strong)]"
      data-exact={value.exact}
      title={
        formatted.truncated ? `${value.exact} ${value.unit ?? ''}` : undefined
      }
    >
      <span className="text-4xl sm:text-5xl">
        {whole}
        {fraction === undefined ? null : (
          <span className="text-[var(--keel-muted)]">.{fraction}</span>
        )}
      </span>
      {value.unit === null ? null : (
        <span className="text-xl text-[var(--keel-muted)]">{value.unit}</span>
      )}
      {formatted.truncated ? (
        <span className="sr-only">{` (shortened; full value ${value.exact})`}</span>
      ) : null}
    </p>
  );
}

/**
 * Which way the depth moved across the window.
 *
 * A direction, established by comparing the served strings digit by digit, and both
 * endpoints printed. No percentage: see the note at the top of this file.
 */
function ChangeLine({
  from,
  to,
  quoteCode,
  rangeLabel,
}: {
  from: string | null | undefined;
  to: string | null | undefined;
  quoteCode: string;
  rangeLabel: string;
}) {
  const start = classify(from, quoteCode);
  const end = classify(to, quoteCode);

  if (!isMeasured(start) || !isMeasured(end)) {
    return (
      <p className="mt-2 text-sm text-[var(--keel-muted)]">
        No comparable reading at the start of the {rangeLabel}, so there is
        nothing to compare against.
      </p>
    );
  }

  const direction = compareDecimalStrings(
    end.exact as string,
    start.exact as string,
  );
  const word =
    direction > 0 ? 'Deeper' : direction < 0 ? 'Thinner' : 'Unchanged';
  const opened = formatDecimal(start.exact as string, {
    maxFractionDigits: 2,
  }).display;

  return (
    <p className="mt-2 text-sm text-[var(--keel-muted)]">
      <span className="font-medium text-[var(--keel-ink)]">{word}</span>
      {direction === 0 ? ' across ' : ' than at the start of '}
      the {rangeLabel}, which opened at{' '}
      <span className="tabular text-[var(--keel-ink)]">
        {opened} {quoteCode}
      </span>
      .
    </p>
  );
}

/** The trend window, as links, so the chart a reader is looking at is shareable. */
function RangeTabs({ query }: { query: AssetQuery }) {
  return (
    <nav
      aria-label="Trend window"
      className="flex shrink-0 items-center gap-0.5 rounded-lg border border-[var(--keel-border)] bg-[var(--keel-surface-subtle)] p-0.5"
    >
      {(Object.keys(HISTORY_RANGES) as (keyof typeof HISTORY_RANGES)[]).map(
        (key) => {
          const active = query.range === key;
          return (
            <Link
              key={key}
              href={rangeHref(query, key)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]',
                active
                  ? 'bg-[var(--keel-surface)] text-[var(--keel-ink-strong)] shadow-sm'
                  : 'text-[var(--keel-muted)] hover:text-[var(--keel-ink)]',
              )}
            >
              {key}
              <span className="sr-only">
                {`, ${HISTORY_RANGES[key].label}`}
              </span>
            </Link>
          );
        },
      )}
    </nav>
  );
}

/* --- right: what needs attention ---------------------------------------- */

function AttentionCard({
  rows,
  monitored,
  query,
}: {
  rows: readonly AssetSummary[];
  monitored: number | null | undefined;
  query: AssetQuery;
}) {
  const critical = rows.filter((row) => row.band === 'CRITICAL').length;
  const high = rows.filter((row) => row.band === 'HIGH').length;
  const partial = rows.filter((row) => row.bandConfidence === 'partial').length;

  // Counting rows and counting flags. Neither touches a decimal, which is the whole
  // reason these two can be here at all: an average depth or a spread across the set
  // would mean arithmetic on served figures, and nothing on this page does that.
  const noPrice = rows.filter(
    (row) =>
      row.priceSource === 'none' || row.flags.includes('NO_EXECUTABLE_PRICE'),
  ).length;
  const commonest = commonestFlag(rows);

  return (
    <section className="flex min-w-0 flex-col rounded-2xl border border-[var(--keel-border)] bg-[var(--keel-surface)] p-5">
      <h2 className="text-xs font-semibold tracking-wide text-[var(--keel-muted)] uppercase">
        Needs attention
      </h2>

      <ul className="mt-1 flex flex-col divide-y divide-[var(--keel-border)]">
        <StatRow
          icon={OctagonX}
          label="Critical risk"
          value={critical}
          caption={bandCopy('CRITICAL').caption}
          href={assetHref(query, {
            band: query.band === 'CRITICAL' ? null : 'CRITICAL',
          })}
          active={query.band === 'CRITICAL'}
          tint="var(--band-critical-surface)"
          ink="var(--band-critical-ink)"
        />
        <StatRow
          icon={OctagonAlert}
          label="High risk"
          value={high}
          caption={bandCopy('HIGH').caption}
          href={assetHref(query, {
            band: query.band === 'HIGH' ? null : 'HIGH',
          })}
          active={query.band === 'HIGH'}
          tint="var(--band-high-surface)"
          ink="var(--band-high-ink)"
        />
        {/*
          A 200 with no executable price is the most severe thing the engine reports and
          the only finding on this page that nothing else counts. It renders an honest
          zero when the set is clear of it rather than disappearing, because "none
          today" is a reading and an absent row is not.
        */}
        <StatRow
          icon={CircleSlash}
          label="No executable price"
          value={noPrice}
          caption={
            noPrice === 0
              ? 'Every market in view quotes a price'
              : 'The quote has nothing behind it'
          }
          href={assetHref(query, {
            hasFlag:
              query.hasFlag === 'NO_EXECUTABLE_PRICE'
                ? null
                : 'NO_EXECUTABLE_PRICE',
          })}
          active={query.hasFlag === 'NO_EXECUTABLE_PRICE'}
          // A red zero reads as an alarm for something that did not happen. The
          // severity hue is spent only when there is something to be severe about.
          tint={
            noPrice === 0
              ? 'var(--keel-accent-soft)'
              : 'var(--band-critical-surface)'
          }
          ink={
            noPrice === 0 ? 'var(--keel-accent)' : 'var(--band-critical-ink)'
          }
        />
        {/* Which check fires most often is the one line on this card that says WHY the
            set looks the way it does, rather than how much of it is bad. */}
        {commonest ? (
          <StatRow
            icon={Siren}
            label="Most common check"
            value={commonest.count}
            caption={flagCopy(commonest.flag).label}
            href={assetHref(query, {
              hasFlag: query.hasFlag === commonest.flag ? null : commonest.flag,
            })}
            active={query.hasFlag === commonest.flag}
            tint="var(--keel-surface-subtle)"
            ink="var(--keel-ink-strong)"
          />
        ) : null}
        <StatRow
          icon={Layers}
          label={query.band === null ? 'Assets monitored' : 'Assets in view'}
          value={rows.length}
          caption={
            monitored === null || monitored === undefined
              ? 'The engine did not report a set size'
              : query.band === null
                ? 'Stellar markets, scanned every few minutes'
                : `of ${monitored} markets Keel watches`
          }
          href={assetHref(query, { band: null, hasFlag: null, q: '' })}
          active={false}
          // Neutral, not a band hue. Red and amber are a severity scale on this page
          // and spending one on a plain count would leave a reader unable to tell a
          // decorative amber from a MEDIUM one.
          tint="var(--keel-accent-soft)"
          ink="var(--keel-accent)"
        />
      </ul>

      <div className="mt-4 flex flex-col gap-3 border-t border-[var(--keel-border)] pt-4">
        {/* The ledger and its staleness used to sit here. They are on every page
            already, in the app shell's provenance strip, and a second copy of the
            same two figures earned less than the sentence that says what the
            composition chart below is for. */}
        <p className="text-xs text-[var(--keel-muted)]">
          The chart above says how much can be traded. The pies below say what
          that depth is made of — a market whose depth is all pool behaves
          differently under stress from one built on posted offers, because a
          pool quotes at any size while an order book runs out.
        </p>

        {partial > 0 ? (
          <div className="flex items-start gap-2.5 rounded-lg bg-[var(--unmeasured-surface)] p-3">
            <CircleDashed
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-[var(--unmeasured)]"
            />
            <p className="min-w-0 text-xs text-[var(--keel-ink)]">
              <span className="font-medium text-[var(--keel-ink-strong)]">
                {partial === rows.length
                  ? 'Every band here is a floor, not a verdict.'
                  : `${partial} of these bands are floors, not verdicts.`}
              </span>{' '}
              At least one severe check could not be evaluated, so the real risk
              can only be worse than shown, never better.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * The check that fired on more of these markets than any other.
 *
 * Counting occurrences in an array of enum values. A tie is settled by the first flag
 * the engine listed rather than by a severity order: the contract publishes no severity
 * per flag, and inventing one here would be a methodology statement this dashboard has
 * no standing to make.
 */
function commonestFlag(
  rows: readonly AssetSummary[],
): { flag: Flag; count: number } | null {
  const tally = new Map<Flag, number>();
  for (const row of rows) {
    for (const flag of row.flags) {
      tally.set(flag, (tally.get(flag) ?? 0) + 1);
    }
  }

  let best: { flag: Flag; count: number } | null = null;
  for (const [flag, count] of tally) {
    if (best === null || count > best.count) best = { flag, count };
  }
  return best;
}

/**
 * One count, its meaning, and the filtered view behind it.
 *
 * The whole row is the link. A count of thirty-nine critical assets that a reader
 * cannot act on is trivia; this takes them to exactly those rows, which is the first
 * thing anyone who reads the number wants to do.
 */
function StatRow({
  icon: Icon,
  label,
  value,
  caption,
  href,
  active,
  tint,
  ink,
}: {
  icon: typeof OctagonX;
  label: string;
  value: number;
  caption: string;
  href: string;
  active: boolean;
  tint: string;
  ink: string;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? 'true' : undefined}
        className="group flex items-center gap-3 rounded-lg py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
      >
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: tint, color: ink }}
        >
          <Icon className="size-5" strokeWidth={2.25} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-xs text-[var(--keel-muted)]">
            {label}
          </span>
          <span
            className="tabular block text-2xl leading-tight font-semibold"
            style={{ color: ink }}
          >
            {value}
          </span>
          <span className="block text-xs text-[var(--keel-muted)]">
            {active ? `${caption} — showing only these` : caption}
          </span>
        </span>

        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 text-[var(--keel-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--keel-accent)]"
        />
      </Link>
    </li>
  );
}
