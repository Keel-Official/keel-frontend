import {
  ArrowUpRight,
  Check,
  Layers,
  MoveUpRight,
  ShieldCheck,
} from 'lucide-react';
import { healthy } from '../../lib/api/fixtures';
import { DepthLadder, MetricValue, RiskBadge } from '../keel/result';
import { percent } from '../../lib/format/keel';
import { dashboardLinks } from '../../lib/dashboard';

export function MetricBento() {
  const rung = healthy.manipulationCostCombined[0];
  return (
    <section
      className="section metrics-section"
      id="metrics"
      aria-labelledby="metrics-title"
    >
      <div className="container">
        <div className="compact-section-heading">
          <h2 id="metrics-title">
            Depth, collateral,
            <br />
            and price movement.
          </h2>
          <p>Read the calculations behind a USDC/XLM result.</p>
        </div>
        <div className="metric-bento">
          <article className="bento-depth panel">
            <div className="module-title">
              <Layers size={20} />
              <h3>Executable depth</h3>
              <span>USDC / XLM · sample</span>
            </div>
            <p>
              How much can trade before the price moves? Measure both directions
              at each range.
            </p>
            <DepthLadder result={healthy} />
            <div className="bento-foot">
              <span>
                <i className="legend-dot" />
                Buy: price moves up
              </span>
              <span>
                <i className="legend-dot sell-dot" />
                Sell: price moves down
              </span>
            </div>
          </article>
          <article className="bento-risk panel">
            <ShieldCheck size={24} />
            <h3>Risk assessment</h3>
            <RiskBadge
              band={healthy.band}
              bandConfidence={healthy.bandConfidence}
            />
            <p>
              <Check size={14} /> No flags triggered
            </p>
            <span className="muted">
              Full confidence: all required checks evaluated.
            </span>
          </article>
          <article className="bento-manipulation panel">
            <div className="module-title">
              <MoveUpRight size={20} />
              <h3>Manipulation resistance</h3>
            </div>
            <div className="target-pill">
              +{percent(rung.delta)}% price target<span>Combined venues</span>
            </div>
            <MetricValue
              value={rung.cost}
              unit={healthy.quote.code}
              places={2}
            />
            <span className="reachable">
              <Check size={14} />
              {rung.reachable ? 'Reachable' : 'Not reachable'}
            </span>
            <p>
              The cost only makes sense together with whether the target can be
              reached.
            </p>
          </article>
          <article className="bento-collateral panel">
            <div className="module-title">
              <ShieldCheck size={20} />
              <h3>Max safe collateral</h3>
            </div>
            <MetricValue
              value={healthy.maxSafeCollateral}
              unit={healthy.quote.code}
              places={2}
            />
            <p>
              A conservative recommendation constrained by liquidation depth and
              manipulation resistance.
            </p>
            <a className="text-link" href={dashboardLinks.methodology}>
              Inspect the methodology <ArrowUpRight size={16} />
            </a>
          </article>
        </div>
        <p className="section-footnote">
          USDC/XLM sample throughout. Amounts rounded to 2 decimals; exact
          values in the{' '}
          <a href="/evidence/asset-healthy.json">source response</a>.
        </p>
      </div>
    </section>
  );
}
