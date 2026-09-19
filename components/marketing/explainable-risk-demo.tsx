import { ChevronRight, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { brokenBook } from '../../lib/api/fixtures';
import { MetricValue } from '../keel/result';
import {
  formatAmount,
  manipulationLabel,
  percent,
} from '../../lib/format/keel';

/**
 * One finding, read in two columns: what the engine concluded on the left, and the
 * cost of moving the price that stands behind it on the right.
 *
 * NEITHER COLUMN IS A CARD. The product object sits on the page, the heading under it
 * says what it means, and a hairline is all that divides one column from the next —
 * the same frame the rest of the page is drawn on. A bordered, shadowed, gradient-
 * filled card around each one added a second frame inside the first and made two
 * readings of the same market look like two separate products.
 *
 * Triggered and unevaluated checks share one bar but never one fill, because a check
 * that could not run is not a check that passed.
 */
export function ExplainableRiskDemo() {
  const result = brokenBook;
  const triggered = result.flags.length;
  const unevaluated = result.unevaluatedFlags.length;

  return (
    <section className="risk-section" id="risk" aria-labelledby="risk-title">
      <div className="container risk-frame">
        <div className="risk-head">
          <h2 id="risk-title">Why this market is marked critical.</h2>
          <p className="risk-lede">
            What triggered a finding, and what the available data could not
            establish.
          </p>
        </div>

        <div className="risk-split">
          <article className="risk-pane">
            <div className="risk-visual">
              <p className="risk-banner">
                <TriangleAlert size={15} aria-hidden="true" />
                {result.band} ·{' '}
                {result.bandConfidence === 'partial' ? 'Partial' : 'Full'}{' '}
                confidence
              </p>
              <p className="risk-figure">
                <strong>{formatAmount(result.spreadPct, 2)}%</strong>
                <span>between bid and ask</span>
              </p>
              <div className="risk-bar">
                <div
                  className="risk-progress"
                  aria-hidden="true"
                  style={{
                    gridTemplateColumns: `${triggered}fr ${unevaluated}fr`,
                  }}
                >
                  <span className="is-triggered" />
                  <span className="is-unevaluated" />
                </div>
                <p className="risk-count">
                  <strong>{triggered}</strong> triggered ·{' '}
                  <strong>{unevaluated}</strong> not evaluated
                </p>
              </div>
            </div>

            <h3 className="risk-title">The reference price is unreliable.</h3>
            <p className="risk-copy">
              The best bid and the best ask sit almost two hundred per cent
              apart, so the midpoint between them is a number no one can trade
              at. Six more checks could not be evaluated at all, which is why
              this band is a floor rather than a verdict.
            </p>
            <Link className="risk-more" href="/evidence/asset-broken-book">
              See the full finding <ChevronRight size={16} />
            </Link>
          </article>

          <article className="risk-pane risk-pane-quiet">
            <div className="risk-visual">
              <p className="risk-rungs-head">
                <span>Cost to move the price</span>
                <span>Order book · {result.quote.code}</span>
              </p>
              <dl className="risk-rungs">
                {result.manipulationCostOrderbookOnly.map((rung) => (
                  <div key={rung.delta}>
                    <dt>+{percent(rung.delta)}%</dt>
                    <dd>
                      <MetricValue
                        value={rung.cost}
                        unit={result.quote.code}
                        places={2}
                      />
                      <span
                        className={`risk-rung-status ${rung.reachable ? '' : 'is-blocked'}`}
                      >
                        {manipulationLabel(rung.cost, rung.reachable)}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <h3 className="risk-title">And moving it costs nothing.</h3>
            <p className="risk-copy">
              Lifting this price by half takes no capital at all. Past that the
              book is exhausted, so the figures beside those rungs are where the
              market ran out — not the price of getting there.
            </p>
            <Link className="risk-more" href="/evidence/asset-broken-book">
              See every rung <ChevronRight size={16} />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
