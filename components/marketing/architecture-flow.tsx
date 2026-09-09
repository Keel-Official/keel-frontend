import {
  ArrowDown,
  ArrowRight,
  Binary,
  Braces,
  Database,
  Layers,
  Network,
  Radio,
  ScanLine,
} from 'lucide-react';

export function ArchitectureFlow() {
  return (
    <section
      className="section engine-section"
      id="engine"
      aria-labelledby="engine-title"
    >
      <div className="container">
        <div className="engine-heading">
          <div>
            <h2 id="engine-title">
              From Stellar liquidity
              <br />
              to risk calculations.
            </h2>
          </div>
          <p>
            Keel combines orderbook offers and pool reserves, then calculates
            depth, price targets, and collateral limits.
          </p>
        </div>
        <div
          className="architecture-flow"
          aria-label="Stellar market sources feed the Keel engine, producing depth, manipulation, collateral and flag outputs for dashboards, APIs and backtests"
        >
          <div className="flow-inputs">
            <div>
              <Layers size={20} />
              <span>
                <strong>SDEX</strong>
                <small>Orderbook liquidity</small>
              </span>
            </div>
            <div>
              <Network size={20} />
              <span>
                <strong>AMM pools</strong>
                <small>Pool reserves</small>
              </span>
            </div>
            <div>
              <Radio size={20} />
              <span>
                <strong>Market observations</strong>
                <small>Trades & supporting data</small>
              </span>
            </div>
          </div>
          <div className="flow-connector" aria-hidden="true">
            <ArrowRight />
          </div>
          <div className="engine-core">
            <div className="engine-symbol">
              <ScanLine size={40} />
            </div>
            <strong>Keel engine</strong>
            <span>Depth simulation & risk rules</span>
            <div className="engine-core-footer">
              <Binary size={14} /> Rule based methodology
            </div>
          </div>
          <div className="flow-connector" aria-hidden="true">
            <ArrowRight />
          </div>
          <div className="flow-outputs">
            <span>Executable depth</span>
            <span>Manipulation cost</span>
            <span>Safe collateral</span>
            <span>Flags & confidence</span>
          </div>
        </div>
        <div className="flow-destinations">
          <ArrowDown size={16} />
          <span>
            <ScanLine size={16} />
            Dashboard
          </span>
          <span>
            <Braces size={16} />
            API
          </span>
          <span>
            <Database size={16} />
            Historical backtest
          </span>
        </div>
      </div>
    </section>
  );
}
