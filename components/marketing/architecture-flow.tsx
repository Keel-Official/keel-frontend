import { ArrowRight } from 'lucide-react';

export function ArchitectureFlow() {
  return (
    <section
      className="section engine-section"
      id="engine"
      aria-labelledby="engine-title"
    >
      <div className="container">
        <h2 id="engine-title">From Stellar liquidity to risk calculations.</h2>
        <p className="intro">
          Keel combines orderbook offers and pool reserves, then calculates
          depth, price targets, and collateral limits.
        </p>
        <div
          className="architecture-flow"
          aria-label="Stellar market sources feed the Keel engine, producing depth, manipulation, collateral and flag outputs for dashboards, APIs and backtests"
        >
          <div className="flow-inputs">
            <div className="node">
              <span className="n-k">Input</span>
              <strong>SDEX</strong>
              <small>Orderbook liquidity</small>
            </div>
            <div className="node">
              <span className="n-k">Input</span>
              <strong>AMM pools</strong>
              <small>Pool reserves</small>
            </div>
            <div className="node">
              <span className="n-k">Input</span>
              <strong>Market observations</strong>
              <small>Trades &amp; supporting data</small>
            </div>
          </div>
          <div className="flow-connector" aria-hidden="true">
            <ArrowRight size={16} />
          </div>
          <div className="engine-core node">
            <span className="n-k">Process</span>
            <strong>Keel engine</strong>
            <small>Depth simulation &amp; risk rules</small>
          </div>
          <div className="flow-connector" aria-hidden="true">
            <ArrowRight size={16} />
          </div>
          <div className="flow-outputs">
            <span>Executable depth</span>
            <span>Manipulation cost</span>
            <span>Safe collateral</span>
            <span>Flags &amp; confidence</span>
          </div>
        </div>
        <div className="flow-destinations">
          <span>Dashboard</span>
          <span>API</span>
          <span>Historical backtest</span>
        </div>
      </div>
    </section>
  );
}
