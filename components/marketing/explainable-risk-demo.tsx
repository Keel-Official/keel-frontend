import { ArrowUpRight, CircleAlert, CircleHelp } from 'lucide-react';
import { brokenBook } from '../../lib/api/fixtures';
import {
  AssetIdentity,
  FlagList,
  ManipulationRungs,
  ProvenanceStrip,
  RiskBadge,
} from '../keel/result';
import { formatAmount } from '../../lib/format/keel';

export function ExplainableRiskDemo() {
  return (
    <section
      className="section risk-section"
      id="risk"
      aria-labelledby="risk-title"
    >
      <div className="container">
        <div className="risk-section-heading">
          <div>
            <h2 id="risk-title">
              Why this market
              <br />
              is marked critical.
            </h2>
          </div>
          <div>
            <p>
              See what triggered a finding and what the available data could not
              establish.
            </p>
            <p className="uncertainty-statement">
              <CircleHelp size={18} />
              Unevaluated checks may conceal additional risk.
            </p>
          </div>
        </div>
        <div className="risk-result panel">
          <div className="risk-result-header">
            <AssetIdentity asset={brokenBook.asset} quote={brokenBook.quote} />
            <div className="risk-header-status">
              <span className="sample-label">Historical sample</span>
              <RiskBadge
                band={brokenBook.band}
                bandConfidence={brokenBook.bandConfidence}
              />
            </div>
          </div>
          <div className="risk-result-main">
            <div>
              <div className="finding-notice">
                <CircleAlert size={18} />
                <p>
                  <strong>The reference price is unreliable.</strong> A{' '}
                  {formatAmount(brokenBook.spreadPct, 2)}% spread separates the
                  bid and ask. Midpoint depth is not meaningful here.
                </p>
              </div>
              <FlagList result={brokenBook} />
            </div>
            <aside className="risk-rungs">
              <h3>Cost + reachability</h3>
              <p>Orderbook only · {brokenBook.quote.code}</p>
              <ManipulationRungs result={brokenBook} />
              <p className="table-note">
                An exhausted book does not make a target expensive to reach. It
                makes the target unreachable.
              </p>
              <a className="text-link" href="/evidence/asset-broken-book.json">
                Raw finding, JSON <ArrowUpRight size={14} />
              </a>
            </aside>
          </div>
          <ProvenanceStrip result={brokenBook} />
        </div>
      </div>
    </section>
  );
}
