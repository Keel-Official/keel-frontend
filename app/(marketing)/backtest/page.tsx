import type { Metadata } from 'next';
import Link from 'next/link';
import Decimal from 'decimal.js';
import { ArrowLeft, ArrowUpRight, Download, FileText } from 'lucide-react';

import {
  BACKTEST,
  BACKTEST_DAYS,
  BACKTEST_SUMMARY,
  RECONSTRUCTED_LEDGERS,
  type BacktestDay,
} from '@/lib/backtest';
import { formatAmount, movePercent, percent } from '@/lib/format/keel';
import { BACKTEST_REPORT_URL } from '@/lib/report';
import { assetAtLedgerPath } from '@/lib/keel/url/ledger';
import { ENGINE_EVIDENCE } from '@/lib/evidence';
import { flagCopy } from '@/lib/keel/format/glossary';
import { SiteHeader } from '@/components/marketing/site-header';
import { FebruaryChart } from '@/components/marketing/february-chart';

export const metadata: Metadata = {
  title: 'The February USTRY backtest — Keel',
  description:
    'Every UTC day of USTRY/USDC trading in February 2026, read from Horizon: what the trade stream can show about depth, and what it cannot.',
};

/** Four decimals for display; the exact value rides along in the title. */
function Price({ value }: { value: string }) {
  return <span title={value}>{formatAmount(value, 4)}</span>;
}

function longDay(day: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${day}T00:00:00Z`));
}

const short = (issuer: string) => `${issuer.slice(0, 6)}…${issuer.slice(-4)}`;

export default function BacktestPage() {
  const summary = BACKTEST_SUMMARY;
  const { base, quote } = BACKTEST.pair;
  const largestBound = summary.assumingBoundDays.reduce<string | null>(
    (max, day) =>
      max === null || new Decimal(day.betweenLegsBound!.delta).gt(max)
        ? day.betweenLegsBound!.delta
        : max,
    null,
  );

  return (
    <>
      <SiteHeader sectionBase="/" />
      <main className="backtest-main" id="main-content">
        <section className="backtest-head" aria-labelledby="backtest-title">
          <div className="container">
            <Link className="evidence-back" href="/#case-study">
              <ArrowLeft size={16} /> Back to Keel
            </Link>
            <span className="market-pill">
              <span>Historical reading · not live</span>
            </span>
            <h1 id="backtest-title">The February USTRY backtest.</h1>
            <p className="backtest-lede">
              Every UTC day of {base.code}/{quote.code} trading in February
              2026, read from {BACKTEST.source}: what the trade stream can show
              about depth, and what it cannot.
            </p>
            <div className="market-actions">
              <a className="hero-button" href={BACKTEST.csvPath} download>
                <Download size={17} aria-hidden="true" /> Download daily CSV
              </a>
              <a
                className="hero-button hero-button-quiet"
                href={BACKTEST_REPORT_URL}
                target="_blank"
                rel="noreferrer"
              >
                Full report <ArrowUpRight size={16} />
              </a>
              <a
                className="hero-button hero-button-quiet"
                href={BACKTEST.notesPath}
              >
                <FileText size={16} aria-hidden="true" /> Evidence notes
              </a>
            </div>
            <dl className="backtest-meta">
              <div>
                <dt>Pair</dt>
                <dd>
                  <span title={base.issuer}>
                    {base.code} {short(base.issuer)}
                  </span>{' '}
                  /{' '}
                  <span title={quote.issuer}>
                    {quote.code} {short(quote.issuer)}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Window (UTC)</dt>
                <dd>
                  {BACKTEST.windowFrom.slice(0, 10)} →{' '}
                  {BACKTEST.windowTo.slice(0, 10)}, right edge exclusive
                </dd>
              </div>
              <div>
                <dt>Read</dt>
                <dd>
                  {BACKTEST.readOn} · {BACKTEST.source}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="backtest-band" aria-labelledby="backtest-summary">
          <div className="container">
            <h2 id="backtest-summary" className="sr-only">
              The month in four numbers
            </h2>
            <p className="backtest-verdict">
              {summary.causalBoundDays === 0 ? (
                <>
                  <strong>Verdict for the month: unevaluated.</strong> Not safe
                  and not unsafe. No single trade leg crossed even the smallest
                  rung, so the stream never measured the depth it would take.
                </>
              ) : (
                <>
                  <strong>
                    {summary.causalBoundDays} days carry a causal bound.
                  </strong>{' '}
                  Read them in the table below.
                </>
              )}
            </p>
            <dl className="backtest-stats">
              <div>
                <dt>trades in {summary.days} UTC days</dt>
                <dd>{formatAmount(summary.trades)}</dd>
                <dd className="backtest-stat-note">
                  {formatAmount(summary.volumeQuote, 2)} {quote.code} traded, no
                  genuine-trade rule applied
                </dd>
              </div>
              <div>
                <dt>largest move by one leg</dt>
                <dd>
                  {summary.largestWithinLeg
                    ? movePercent(summary.largestWithinLeg)
                    : 'None'}
                </dd>
                <dd className="backtest-stat-note">
                  {summary.largestWithinLegDay
                    ? `On ${longDay(summary.largestWithinLegDay)}. `
                    : ''}
                  The smallest rung Keel measures is{' '}
                  {percent(Number(summary.smallestRung))}%.
                </dd>
              </div>
              <div>
                <dt>days with a causal bound</dt>
                <dd>{summary.causalBoundDays}</dd>
                <dd className="backtest-stat-note">
                  A bound one leg is known to have crossed, at any rung.
                </dd>
              </div>
              <div>
                <dt>days with an assuming bound</dt>
                <dd>{summary.assumingBoundDays.length}</dd>
                <dd className="backtest-stat-note">
                  Holds only if the book did not change between trades
                  {largestBound
                    ? `; the largest is ${formatAmount(largestBound)} ${quote.code}`
                    : ''}
                  .
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="backtest-section" aria-labelledby="backtest-chart">
          <div className="container">
            <div className="chart-card">
              <div className="chart-head">
                <div>
                  <h2 id="backtest-chart">Movement within a trade leg</h2>
                  <p>
                    Largest observed daily price span · {base.code} /{' '}
                    {quote.code}
                  </p>
                </div>
                <span className="sample-label">Historical observations</span>
              </div>
              <FebruaryChart />
              <div className="chart-legend">
                <span>
                  <i className="legend-line" />
                  Observed movement
                </span>
                <span>
                  <i className="legend-dot event-dot" />
                  Incident · {longDay(BACKTEST.incidentDay)}
                </span>
                <span>× No within-leg observation</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="backtest-section"
          id="daily"
          aria-labelledby="backtest-daily"
        >
          <div className="container">
            <div className="backtest-section-head">
              <h2 id="backtest-daily">Day by day.</h2>
              <p>
                One row per UTC day, as the CSV carries it. Prices in{' '}
                {quote.code} per {base.code} to four decimals; hover a figure
                for its exact value.
              </p>
            </div>
            <DailyTable days={BACKTEST_DAYS} quote={quote.code} />
            <ul className="backtest-keys">
              <li>
                <strong>—</strong> no leg with more than one fill that day. It
                is an absent observation, not a zero move.
              </li>
              <li>
                <strong>None</strong> no qualifying move that day. A bound is
                never carried forward from an earlier day.
              </li>
              <li>
                <strong>Assuming bound</strong> the most that could have been
                traded at that rung, if nothing was posted or cancelled in the
                gap between two trades.
              </li>
            </ul>
          </div>
        </section>

        <section
          className="backtest-section"
          id="ledgers"
          aria-labelledby="backtest-ledgers"
        >
          <div className="container">
            <div className="backtest-section-head">
              <h2 id="backtest-ledgers">Three ledgers, read by the engine.</h2>
              <p>
                The daily rows above come from the trade stream. These three are
                full risk results the engine rebuilt from the operation stream
                at single ledgers on the incident morning. Each opens the
                engine&rsquo;s own answer, gaps included: a rebuilt book is too
                thin, never too deep, so its depth is a lower bound.
              </p>
            </div>
            <div className="backtest-kinds backtest-ledgers">
              {RECONSTRUCTED_LEDGERS.map((item) => (
                <article key={item.ledger}>
                  <h3>
                    Ledger <span className="tabular">{item.ledger}</span>
                  </h3>
                  <p>
                    <span className="tabular">{item.closedAt}</span>
                    <br />
                    {item.note}
                  </p>
                  <Link
                    className="backtest-ledger-link"
                    href={assetAtLedgerPath(
                      `${base.code}:${base.issuer}`,
                      item.ledger,
                    )}
                  >
                    Open the engine&rsquo;s reading{' '}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="backtest-band" aria-labelledby="backtest-read">
          <div className="container">
            <div className="backtest-section-head">
              <h2 id="backtest-read">How to read a bound.</h2>
            </div>
            <div className="backtest-kinds">
              <article>
                <h3>Within one leg</h3>
                <p>
                  One taker, one direction, filling from the best price outward.
                  The span between the first and last fill was crossed by that
                  leg, so the bound assumes nothing.
                </p>
                <span>
                  {summary.causalBoundDays} of {summary.days} days
                </span>
              </article>
              <article>
                <h3>Between two legs</h3>
                <p>
                  From one leg&rsquo;s last fill to the next leg&rsquo;s first.
                  Offers can be posted and cancelled in that gap, and a trade
                  stream records none of it, so the bound holds only if the book
                  stood still.
                </p>
                <span>
                  {summary.assumingBoundDays.length} of {summary.days} days
                </span>
              </article>
            </div>
            <div className="backtest-reproduce">
              <h3>Reproduce the rows</h3>
              <pre tabIndex={0} aria-label="Command that reproduces the rows">
                <code>{BACKTEST.command}</code>
              </pre>
              <p>
                Run from the engine repository. The CSV and the evidence notes
                linked above are the files this produced.
              </p>
            </div>
            <div className="backtest-reproduce">
              <h3>Evidence filed since</h3>
              <ul className="backtest-keys">
                {ENGINE_EVIDENCE.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} target="_blank" rel="noreferrer">
                      <strong>{item.title}</strong>
                    </a>
                    {item.summary}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function DailyTable({
  days,
  quote,
}: {
  days: readonly BacktestDay[];
  quote: string;
}) {
  return (
    <div
      className="backtest-table-wrap"
      tabIndex={0}
      role="region"
      aria-label="Daily observations, scrolls sideways"
    >
      <table className="backtest-table">
        <caption className="sr-only">
          Daily USTRY/USDC trading in February 2026. Historical observations,
          not an executable-depth series.
        </caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Trades</th>
            <th scope="col">Volume · {quote}</th>
            <th scope="col">Low</th>
            <th scope="col">High</th>
            <th scope="col">Largest move, one leg</th>
            <th scope="col">Largest move, between legs</th>
            <th scope="col">Assuming bound · {quote}</th>
            <th scope="col">Findings on that bound</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => {
            const incident = day.day === BACKTEST.incidentDay;
            const bound = day.betweenLegsBound;
            return (
              <tr key={day.day} className={incident ? 'is-incident' : ''}>
                <th scope="row">
                  {day.day}
                  {incident && <span className="backtest-tag">Incident</span>}
                </th>
                <td className="numeric">{formatAmount(day.trades)}</td>
                <td className="numeric" title={day.volumeQuote}>
                  {formatAmount(day.volumeQuote, 2)}
                </td>
                <td className="numeric">
                  <Price value={day.priceLow} />
                </td>
                <td className="numeric">
                  <Price value={day.priceHigh} />
                </td>
                <td className="numeric" title={day.maxWithinLeg ?? undefined}>
                  {day.maxWithinLeg === null ? (
                    <>
                      <span aria-hidden="true">—</span>
                      <span className="sr-only">No within-leg observation</span>
                    </>
                  ) : (
                    movePercent(day.maxWithinLeg)
                  )}
                </td>
                <td className="numeric" title={day.maxBetweenLegs ?? undefined}>
                  {day.maxBetweenLegs === null ? (
                    <>
                      <span aria-hidden="true">—</span>
                      <span className="sr-only">No observation</span>
                    </>
                  ) : (
                    movePercent(day.maxBetweenLegs)
                  )}
                </td>
                <td className="numeric">
                  {bound ? (
                    <span
                      title={`Source trade ${bound.source}, ${bound.gapSeconds} s after the previous one`}
                    >
                      ≤ {formatAmount(bound.delta)}
                      <small>
                        for a {percent(Number(bound.rung))}% move ·{' '}
                        {bound.gapSeconds} s gap
                      </small>
                    </span>
                  ) : (
                    <span className="backtest-none">None</span>
                  )}
                </td>
                <td>
                  {day.thinDepthBetweenLegs ||
                  day.manipulationCheapBetweenLegs ? (
                    <span className="backtest-findings">
                      {day.thinDepthBetweenLegs && (
                        <span>{flagCopy('THIN_DEPTH_5PCT').label}</span>
                      )}
                      {day.manipulationCheapBetweenLegs && (
                        <span>{flagCopy('MANIPULATION_CHEAP').label}</span>
                      )}
                    </span>
                  ) : (
                    <span className="backtest-none">None</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
