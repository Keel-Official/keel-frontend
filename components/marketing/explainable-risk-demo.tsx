import { ArrowUpRight, CircleHelp } from 'lucide-react';
import { brokenBook } from '../../lib/api/fixtures';
import {
  AssetIdentity,
  FlagList,
  ManipulationRungs,
  ProvenanceStrip,
  RiskBadge,
} from '../keel/result';
import { formatAmount } from '../../lib/format/keel';
import Link from 'next/link';

export function ExplainableRiskDemo() {
  return (
    <section
      className="section risk-section"
      id="risk"
      aria-labelledby="risk-title"
    >
      <div className="container">
        <h2 id="risk-title">Why this market is marked critical.</h2>
        <p className="intro">
          What triggered a finding, and what the available data could not
          establish.
        </p>
        <p className="uncertainty-statement">
          <CircleHelp size={16} aria-hidden="true" />
          Unevaluated checks may conceal additional risk.
        </p>
        <div className="finding-layout">
          <article className="fcard alert">
            <div className="fhead">
              <AssetIdentity
                asset={brokenBook.asset}
                quote={brokenBook.quote}
                compact
              />
              <span className="sample-label">Historical sample</span>
            </div>
            <div className="fhead">
              <RiskBadge
                band={brokenBook.band}
                bandConfidence={brokenBook.bandConfidence}
              />
            </div>
            <p className="fmsg">
              <strong>The reference price is unreliable.</strong> A{' '}
              {formatAmount(brokenBook.spreadPct, 2)}% spread separates the bid
              and ask. Midpoint depth is not meaningful here.
            </p>
            <FlagList result={brokenBook} />
          </article>
          <article className="fcard">
            <h3 className="flag-label">
              Cost + reachability · orderbook only · {brokenBook.quote.code}
            </h3>
            <ManipulationRungs result={brokenBook} />
            <p className="fnote2">
              An exhausted book does not make a target expensive to reach. It
              makes the target unreachable.
            </p>
            <ProvenanceStrip result={brokenBook} method={false} />
            <Link className="text-link" href="/evidence/asset-broken-book">
              See the full finding <ArrowUpRight size={14} />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
