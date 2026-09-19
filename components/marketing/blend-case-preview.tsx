import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { BACKTEST, BACKTEST_DAYS, BACKTEST_SUMMARY } from '../../lib/backtest';
import { februaryPoints } from '../../lib/format/history';
import { formatAmount, movePercent, percent } from '../../lib/format/keel';
import { flagCopy } from '../../lib/keel/format/glossary';
import { FebruaryChart } from './february-chart';

/**
 * The February reading: the chart across the sheet, then the two things the backtest
 * actually produced, one per column.
 *
 * The section used to be a chart in a card and three buttons. Everything the month came
 * to — twenty-eight days with their bounds and findings, and the four readings that
 * summarise them — sat behind those buttons, so the page asserted that a record existed
 * without showing a line of it. Each column now opens with the object itself.
 *
 * BOTH COLUMNS ARE PREVIEWS AND SAY SO. The left shows five of twenty-eight days and
 * five of nine columns; the right shows four readings with three of them stacked behind
 * the first. Neither crop changes a figure, and the link under each says where the whole
 * thing is.
 */

/** Days shown in the preview. The head of the table, in order, not a chosen window. */
const PREVIEW_DAYS = 5;

export function BlendCasePreview() {
  const quote = BACKTEST.pair.quote.code;
  const summary = BACKTEST_SUMMARY;
  const days = BACKTEST_DAYS.slice(0, PREVIEW_DAYS);

  return (
    <section
      className="section case-section"
      id="case-study"
      aria-labelledby="case-title"
    >
      <div className="container case-frame">
        <div className="case-head">
          <h2 id="case-title">The February USTRY incident.</h2>
          <p className="case-lede">
            Twenty-eight UTC days of trading, read from Horizon, and what the
            trade stream can and cannot prove about depth.
          </p>
        </div>

        <div className="case-chart">
          <div className="chart-head">
            <div>
              <h3>Movement within a trade leg</h3>
              <p>
                Largest observed daily price span · {BACKTEST.pair.base.code} /{' '}
                {quote}
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
              Incident · Feb 22
            </span>
          </div>
          {/* The chart's text equivalent. It stays a disclosure rather than a link,
              because a reader who cannot use the drawing should not have to leave the
              page to get the same twenty-eight numbers. */}
          <details className="chart-values">
            <summary>Inspect exact observations</summary>
            <div className="observation-table">
              <table>
                <caption>
                  Historical trade observations. This is not an executable-depth
                  series.
                </caption>
                <thead>
                  <tr>
                    <th>Date (UTC)</th>
                    <th>Maximum within-leg move (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {februaryPoints.map((point) => (
                    <tr key={point.day}>
                      <td>{point.day}</td>
                      <td>{formatAmount(point.movement)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>

        <div className="split">
          <article className="split-pane">
            <div className="split-visual">
              <p className="case-caption">
                First {PREVIEW_DAYS} of {summary.days} UTC days
              </p>
              {/* Its own table rather than the backtest page's: that one holds nine
                  columns at a minimum of 1040px and would put a sideways scrollbar
                  inside half a column. Same language, fewer columns, same rules about
                  what a missing observation looks like. */}
              <div className="case-daily">
                <table>
                  <caption className="sr-only">
                    The first {PREVIEW_DAYS} days of the daily record. The full
                    table carries every day and every bound.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Day</th>
                      <th scope="col">Trades</th>
                      <th scope="col">Volume · {quote}</th>
                      <th scope="col">Largest move, one leg</th>
                      <th scope="col">Findings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day) => (
                      <tr key={day.day}>
                        <th scope="row">{day.day}</th>
                        <td className="numeric">{formatAmount(day.trades)}</td>
                        <td className="numeric" title={day.volumeQuote}>
                          {formatAmount(day.volumeQuote, 2)}
                        </td>
                        <td
                          className="numeric"
                          title={day.maxWithinLeg ?? undefined}
                        >
                          {day.maxWithinLeg === null ? (
                            <>
                              <span aria-hidden="true">—</span>
                              <span className="sr-only">
                                No within-leg observation
                              </span>
                            </>
                          ) : (
                            movePercent(day.maxWithinLeg)
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
                                <span>
                                  {flagCopy('MANIPULATION_CHEAP').label}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="backtest-none">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <h3 className="split-title">Every day, as it was recorded.</h3>
            <p className="split-copy">
              One row per UTC day: how many trades cleared, what they moved the
              price by, and which checks that movement was enough to fire. A day
              with nothing to report says so rather than showing a zero.
            </p>
            <Link className="split-more" href="/backtest#daily">
              Inspect every day <ChevronRight size={16} />
            </Link>
          </article>

          <article className="split-pane split-pane-divided">
            <div className="split-visual">
              <p className="case-caption">Four readings for the month</p>
              {/* Stacked rather than tiled: the front card is the reading, the three
                  behind it say there are more. Depth is offset and z-order only — no
                  card is dimmed, so every glyph that is visible is fully legible, and
                  all four stay in reading order for a screen reader. */}
              <dl className="case-deck">
                <div>
                  <dd>{formatAmount(summary.trades)}</dd>
                  <dt>trades in {summary.days} UTC days</dt>
                  <dd className="case-deck-note">
                    {formatAmount(summary.volumeQuote, 2)} {quote} traded, no
                    genuine-trade rule applied
                  </dd>
                </div>
                <div>
                  <dd>
                    {summary.largestWithinLeg
                      ? movePercent(summary.largestWithinLeg)
                      : 'None'}
                  </dd>
                  <dt>largest move by one leg</dt>
                </div>
                <div>
                  <dd>{summary.causalBoundDays}</dd>
                  <dt>days with a causal bound</dt>
                </div>
                <div>
                  <dd>{summary.assumingBoundDays.length}</dd>
                  <dt>days with an assuming bound</dt>
                </div>
              </dl>
            </div>

            <h3 className="split-title">What the month came to.</h3>
            <p className="split-copy">
              The smallest rung Keel measures is{' '}
              {percent(Number(summary.smallestRung))}%, and nothing one leg did
              in February reached it. The bounds that do exist hold only if the
              book did not change between two trades, which is a weaker claim
              and is labelled as one.
            </p>
            <Link className="split-more" href="/backtest">
              Open the backtest <ChevronRight size={16} />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
