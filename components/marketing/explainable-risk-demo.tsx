import { ChevronRight, CircleHelp, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { brokenBook } from '../../lib/api/fixtures';
import { MetricValue } from '../keel/result';
import {
  formatAmount,
  manipulationLabel,
  percent,
  sourceLabels,
} from '../../lib/format/keel';

/**
 * One finding, read in two panes: what the engine concluded on the left, and the
 * cost of moving the price that stands behind it on the right. Triggered and
 * unevaluated checks share one bar but never one colour, because a check that could
 * not run is not a check that passed.
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
          <Link className="risk-button" href="/evidence/asset-broken-book">
            See the full finding <ChevronRight size={16} />
          </Link>
        </div>

        <div className="risk-split">
          <div className="risk-pane">
            <article className="risk-card">
              <div className="risk-card-media">
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
              </div>
              <h3>The reference price is unreliable.</h3>
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
            </article>
          </div>

          <div className="risk-pane risk-pane-quiet">
            <div className="risk-rungs">
              <p className="risk-rungs-head">
                <span>Cost to move the price</span>
                <span>Order book · {result.quote.code}</span>
              </p>
              <dl>
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
            <div className="risk-byline">
              <span className="hero-avatar" aria-hidden="true">
                {result.asset.code.slice(0, 1)}
              </span>
              <div>
                <h3>
                  {result.asset.code} / {result.quote.code}
                </h3>
                <p>
                  Ledger {result.ledgerSeq} · {sourceLabels[result.dataSource]}
                </p>
                <p className="risk-caveat">
                  <CircleHelp size={14} aria-hidden="true" />
                  Unevaluated checks may conceal additional risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
