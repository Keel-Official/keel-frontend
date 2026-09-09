import { ArrowUpRight, ScanLine } from 'lucide-react';
import { healthy } from '../../lib/api/fixtures';
import {
  AssetIdentity,
  DepthLadder,
  LiquiditySourceBreakdown,
  MetricValue,
  ProvenanceStrip,
  RiskBadge,
} from '../keel/result';

export function HeroProductPreview() {
  return (
    <div className="hero-product" id="product-preview">
      <div className="product-toolbar">
        <span>
          <ScanLine size={16} /> Liquidity analysis
        </span>
        <span className="sample-label">Sample result</span>
      </div>
      <div className="product-content">
        <div className="result-heading">
          <AssetIdentity asset={healthy.asset} quote={healthy.quote} />
          <RiskBadge
            band={healthy.band}
            bandConfidence={healthy.bandConfidence}
          />
        </div>
        <div className="hero-metric">
          <span className="label">Executable buy depth at +5%</span>
          <MetricValue
            value={healthy.depth[1].buySide}
            unit={healthy.quote.code}
            places={2}
          />
          <p>Volume the market can absorb before the price moves.</p>
        </div>
        <DepthLadder result={healthy} compact />
        <div className="hero-product-bottom">
          <LiquiditySourceBreakdown result={healthy} />
          <div className="collateral-mini">
            <span className="label">Max safe collateral</span>
            <MetricValue
              value={healthy.maxSafeCollateral}
              unit={healthy.quote.code}
              places={2}
            />
            <span className="micro">Calculated collateral limit</span>
          </div>
        </div>
      </div>
      <ProvenanceStrip result={healthy} />
      <a className="product-response-link" href="/evidence/asset-healthy.json">
        Inspect the sample response <ArrowUpRight size={14} />
      </a>
    </div>
  );
}
