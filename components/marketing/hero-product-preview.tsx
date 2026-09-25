'use client';

import { useEffect, useRef, useState } from 'react';
import { Database, Layers, Ruler } from 'lucide-react';
import { healthy } from '../../lib/keel/fixtures/fixtures';
import { MetricValue, RiskBadge } from '../keel/result';
import { ProvenanceFooter } from '../keel/provenance-footer';
import {
  formatAmount,
  percent,
  sourceContribution,
  sourceLabels,
} from '../../lib/format/keel';

/**
 * The walk the panel takes on its own, once, so a first-time reader sees that the
 * ladder is a control and that each rung is measured separately. It is a
 * demonstration of the control, not of the market: every figure on screen is the one
 * the engine recorded for that rung, at every step.
 */
const DEMO_WALK = [0.02, 0.05, 0.1] as const;
const DEMO_START_MS = 900;
const DEMO_STEP_MS = 1300;
/**
 * Once per tab. A reader who walks to the backtest and comes back is not new, so the
 * panel stays where they left it; a fresh tab is a fresh opening and gets the walk.
 */
const DEMO_KEY = 'keel:hero-depth-walk';

/**
 * The first object on the page is a result, not a diagram of one.
 *
 * The left pane says which market was measured and lets the reader pick a price
 * range; the right pane is the ladder itself, with the chosen rung filled. The source
 * split follows the chosen rung, because each rung is measured separately.
 */
export function HeroProductPreview() {
  const [delta, setDelta] = useState(0.05);
  /** Set the moment the reader picks a rung; the walk never overrides a choice. */
  const chosen = useRef(false);
  const rung =
    healthy.depth.find((row) => row.delta === delta) ?? healthy.depth[1];
  const shares = sourceContribution(rung.fromSdex, rung.fromAmm);
  const { asset, quote } = healthy;

  useEffect(() => {
    // A reader who asked for less motion is shown the result, not the walk. A reader
    // who has already seen it this visit is not shown it twice, and a tab that is not
    // in front waits rather than spending its walk unseen.
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (motion?.matches) return;
    try {
      if (sessionStorage.getItem(DEMO_KEY)) return;
    } catch {
      // Private mode, or storage refused. The walk is not worth failing over.
    }

    const timers: number[] = [];
    const stop = () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
    };
    const walk = () => {
      DEMO_WALK.forEach((step, index) => {
        timers.push(
          window.setTimeout(
            () => {
              if (chosen.current) return;
              setDelta(step);
              // Marked on the last step rather than when the walk is scheduled. A
              // scheduled walk is not a walk the reader saw: in development React
              // mounts effects twice, and a tab closed early never reaches this line,
              // so either way the next visit still gets it.
              if (index === DEMO_WALK.length - 1) {
                try {
                  sessionStorage.setItem(DEMO_KEY, '1');
                } catch {
                  // As above.
                }
              }
            },
            DEMO_START_MS + index * DEMO_STEP_MS,
          ),
        );
      });
    };

    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener('visibilitychange', onVisible);
      walk();
    };
    if (document.hidden)
      document.addEventListener('visibilitychange', onVisible);
    else walk();

    motion?.addEventListener?.('change', stop);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisible);
      motion?.removeEventListener?.('change', stop);
    };
  }, []);

  return (
    <>
      <div className="hero-product" id="product-preview">
        <div className="hero-detail">
          <div className="hero-detail-top">
            <span className="hero-avatar" aria-hidden="true">
              {asset.code === 'USDC' ? '$' : asset.code.slice(0, 1)}
            </span>
            <span className="sample-label">Result</span>
          </div>
          <span className="hero-issuer" title={asset.issuer ?? undefined}>
            {asset.issuer
              ? `${asset.issuer.slice(0, 6)}…${asset.issuer.slice(-4)}`
              : 'Native asset'}{' '}
            · Stellar
          </span>
          <p className="hero-pair">
            {asset.code} / {quote.code}
          </p>
          <p className="hero-detail-copy">
            Volume the market can absorb before the price moves, and the
            collateral limit that follows from it.
          </p>
          <div className="hero-option">
            <Ruler size={17} aria-hidden="true" />
            <div
              className="hero-segments"
              role="group"
              aria-label="Price range"
            >
              {healthy.depth.map((row) => (
                <button
                  type="button"
                  key={row.delta}
                  aria-pressed={row.delta === rung.delta}
                  onClick={() => {
                    chosen.current = true;
                    setDelta(row.delta);
                  }}
                >
                  ±{percent(row.delta)}%
                </button>
              ))}
            </div>
          </div>
          <div className="hero-option">
            <Layers size={17} aria-hidden="true" />
            {/* Keyed by the rung, so the line re-enters when the figures behind it
              change rather than swapping under the reader's eye. */}
            <span className="hero-source" key={rung.delta}>
              {shares
                ? `SDEX ${shares.sdex}% · AMM ${shares.amm}%`
                : 'No source liquidity measured'}
            </span>
          </div>
          <div className="hero-option">
            <Database size={17} aria-hidden="true" />
            <span>{sourceLabels[healthy.dataSource]}</span>
          </div>
          <div className="hero-risk">
            <RiskBadge
              band={healthy.band}
              bandConfidence={healthy.bandConfidence}
            />
          </div>
        </div>

        <div className="hero-ladder">
          <p className="hero-ladder-title">
            Executable depth <span>{quote.code}</span>
          </p>
          <table className="hero-depth">
            <thead>
              <tr>
                <th scope="col">Range</th>
                <th scope="col">Buy</th>
                <th scope="col">Sell</th>
              </tr>
            </thead>
            <tbody>
              {healthy.depth.map((row) => {
                const selected = row.delta === rung.delta;
                return (
                  <tr key={row.delta} className={selected ? 'is-selected' : ''}>
                    <th scope="row">
                      ±{percent(row.delta)}%
                      {selected && <span className="sr-only"> (selected)</span>}
                    </th>
                    <td title={formatAmount(row.buySide)}>
                      <span>{formatAmount(row.buySide, 2)}</span>
                    </td>
                    <td title={formatAmount(row.sellSide)}>
                      <span>{formatAmount(row.sellSide, 2)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="hero-collateral">
            <span>Max safe collateral</span>
            <MetricValue
              value={healthy.maxSafeCollateral}
              unit={quote.code}
              places={2}
            />
          </div>
          <p className="hero-ladder-note">
            Rounded to 2 decimals. Exact amounts in the sample response.
          </p>
        </div>
      </div>
      {/* Under the panel and above the live strip, so the recording's ledger is never
        read as the engine's current one. */}
      <ProvenanceFooter
        origin="contract-example"
        fixture="asset-healthy"
        ledgerSeq={healthy.ledgerSeq}
        methodologyVersion={healthy.methodologyVersion}
      />
    </>
  );
}
