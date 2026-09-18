'use client';

import { useState } from 'react';
import { Database, Layers, Ruler } from 'lucide-react';
import { healthy } from '../../lib/api/fixtures';
import { MetricValue, RiskBadge } from '../keel/result';
import {
  formatAmount,
  percent,
  sourceContribution,
  sourceLabels,
} from '../../lib/format/keel';

/**
 * The first object on the page is a result, not a diagram of one.
 *
 * The left pane says which market was measured and lets the reader pick a price
 * range; the right pane is the ladder itself, with the chosen rung filled. The source
 * split follows the chosen rung, because each rung is measured separately.
 */
export function HeroProductPreview() {
  const [delta, setDelta] = useState(0.05);
  const rung =
    healthy.depth.find((row) => row.delta === delta) ?? healthy.depth[1];
  const shares = sourceContribution(rung.fromSdex, rung.fromAmm);
  const { asset, quote } = healthy;

  return (
    <div className="hero-product" id="product-preview">
      <div className="hero-detail">
        <div className="hero-detail-top">
          <span className="hero-avatar" aria-hidden="true">
            {asset.code === 'USDC' ? '$' : asset.code.slice(0, 1)}
          </span>
          <span className="sample-label">Sample result</span>
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
          <div className="hero-segments" role="group" aria-label="Price range">
            {healthy.depth.map((row) => (
              <button
                type="button"
                key={row.delta}
                aria-pressed={row.delta === rung.delta}
                onClick={() => setDelta(row.delta)}
              >
                ±{percent(row.delta)}%
              </button>
            ))}
          </div>
        </div>
        <div className="hero-option">
          <Layers size={17} aria-hidden="true" />
          <span>
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
  );
}

/**
 * Under the panel: where the reading came from. Triggered and unevaluated flags are
 * counted apart, because an empty list of triggered flags says nothing about checks
 * that could not run.
 */
export function HeroProvenance() {
  return (
    <dl className="hero-proof">
      <div>
        <dt>Ledger</dt>
        <dd>{healthy.ledgerSeq}</dd>
      </div>
      <div>
        <dt>Ledger closed</dt>
        <dd>{healthy.ledgerClosedAt.replace('T', ' ').replace('Z', ' UTC')}</dd>
      </div>
      <div>
        <dt>Flags</dt>
        <dd>
          {healthy.flags.length} triggered · {healthy.unevaluatedFlags.length}{' '}
          unevaluated
        </dd>
      </div>
    </dl>
  );
}
