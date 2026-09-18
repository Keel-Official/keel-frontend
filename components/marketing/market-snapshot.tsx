import { ChevronRight, Database } from 'lucide-react';
import Decimal from 'decimal.js';
import Link from 'next/link';
import { market } from '../../lib/api/fixtures';
import { dashboardLinks } from '../../lib/dashboard';
import { geometryRatio } from '../../lib/format/keel';
import { flagCopy } from '../../lib/keel/format/glossary';
import { MetricValue, RiskBadge } from '../keel/result';

type Row = (typeof market.items)[number];

/**
 * "None" is a result, not a missing field: the asset has no executable price. A field
 * the response left out is said to be missing, never guessed.
 */
const priceSourceLabels: Record<NonNullable<Row['priceSource']>, string> = {
  book: 'Order book',
  pool: 'Pool',
  none: 'None',
};
const priceSourceLabel = (row: Row) =>
  row.priceSource ? priceSourceLabels[row.priceSource] : 'Not provided';

/**
 * One sentence per market, taken from what the engine reported. The list response
 * carries triggered flags only, so an empty list is stated as "none triggered" and
 * never as a pass.
 */
function summary(row: Row) {
  if (row.flags.length === 0)
    return row.priceSource && row.priceSource !== 'none'
      ? `No flags triggered. The reference price comes from the ${priceSourceLabels[row.priceSource].toLowerCase()}.`
      : 'No flags triggered.';
  const first = flagCopy(row.flags[0]).label.toLowerCase();
  return `${row.flags.length} flags triggered, including ${first}.`;
}

export function MarketSnapshot() {
  const ledger = market.items[0].ledgerSeq;
  // The bars compare the three markets with each other, so they share one scale.
  const deepest = market.items
    .map((row) => row.depth5PctBuySide)
    .filter((depth): depth is string => typeof depth === 'string')
    .reduce((max, depth) => (new Decimal(depth).gt(max) ? depth : max), '0');

  return (
    <section
      className="section market-section"
      id="markets"
      aria-labelledby="market-title"
    >
      <div className="container market-head">
        <h2 id="market-title">Compare Stellar markets.</h2>
        <p className="market-lede">
          Executable depth, collateral capacity, and the findings that deserve a
          closer look. Amounts in {market.items[0].quote.code}, rounded to two
          decimals.
        </p>
        <div className="market-actions">
          {/* The cards are a recorded sample, and the dashboard ships with the site,
              so the live set is the more useful next step. The recording stays beside
              it: it is what a claim on this page is checked against. */}
          <a className="hero-button" href={dashboardLinks.assets}>
            See every asset, live <ChevronRight size={16} />
          </a>
          <Link
            className="hero-button hero-button-quiet"
            href="/evidence/asset-list-mixed"
          >
            See the sample set <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <div className="container market-grid">
        {market.items.map((row) => (
          <article className="market-card" key={row.asset.issuer}>
            <RiskBadge band={row.band} bandConfidence={row.bandConfidence} />
            <h3>
              {row.asset.code}{' '}
              <span className="pair-divider">/ {row.quote.code}</span>
            </h3>
            <p className="market-summary">{summary(row)}</p>

            <div className="market-window">
              <div className="market-window-bar">
                <span className="market-window-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span title={row.asset.issuer ?? 'Native Stellar asset'}>
                  {row.asset.issuer
                    ? `${row.asset.issuer.slice(0, 6)}…${row.asset.issuer.slice(-4)}`
                    : 'Native asset'}
                </span>
              </div>
              <dl className="market-rows">
                <div>
                  <dt>5% buy depth</dt>
                  <dd>
                    <MetricValue
                      value={row.depth5PctBuySide}
                      unit={row.quote.code}
                      places={2}
                    />
                    {typeof row.depth5PctBuySide === 'string' && (
                      <span className="market-bar" aria-hidden="true">
                        <span
                          style={{
                            width: `${geometryRatio(row.depth5PctBuySide, deepest)}%`,
                          }}
                        />
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Max safe collateral</dt>
                  <dd>
                    <MetricValue
                      value={row.maxSafeCollateral}
                      unit={row.quote.code}
                      places={2}
                    />
                  </dd>
                </div>
                <div>
                  <dt>Price source</dt>
                  <dd
                    className={
                      row.priceSource === 'none' ? 'market-finding' : undefined
                    }
                  >
                    {priceSourceLabel(row)}
                  </dd>
                </div>
                <div>
                  <dt>Triggered flags</dt>
                  <dd>{row.flags.length === 0 ? 'None' : row.flags.length}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
