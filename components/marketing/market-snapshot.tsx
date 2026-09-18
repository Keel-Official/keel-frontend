import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { market } from '../../lib/api/fixtures';
import { dashboardLinks } from '../../lib/dashboard';
import { AssetIdentity, MetricValue, RiskBadge } from '../keel/result';
import Link from 'next/link';

/** The first triggered flag, written as a phrase rather than a constant. */
function leadFlag(flags: readonly string[]) {
  return flags[0]?.replaceAll('_', ' ').toLowerCase();
}

export function MarketSnapshot() {
  return (
    <section
      className="section market-section"
      id="markets"
      aria-labelledby="market-title"
    >
      <div className="container">
        <h2 id="market-title">Compare Stellar markets.</h2>
        <p className="intro">
          Executable depth, collateral capacity, and the findings that deserve a
          closer look. Three sample markets, ledger {market.items[0].ledgerSeq}.
          Amounts in {market.items[0].quote.code}, rounded to two decimals.
        </p>
        <div className="market-frame">
          <div className="market-table-wrap">
            <table className="market-table">
              <caption className="sr-only">
                Sample Stellar markets recorded at ledger{' '}
                {market.items[0].ledgerSeq}. Amounts rounded to two decimals;
                the full responses are linked below.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Asset / quote</th>
                  <th scope="col">Risk</th>
                  <th scope="col">
                    5% buy depth <ArrowDown size={11} />
                  </th>
                  <th scope="col" className="hide-sm">
                    Max safe collateral
                  </th>
                  <th scope="col">Triggered flags</th>
                </tr>
              </thead>
              <tbody>
                {market.items.map((row) => (
                  <tr key={row.asset.issuer}>
                    <td>
                      <AssetIdentity
                        asset={row.asset}
                        quote={row.quote}
                        compact
                      />
                    </td>
                    <td>
                      <RiskBadge
                        band={row.band}
                        bandConfidence={row.bandConfidence}
                      />
                    </td>
                    <td className="amt">
                      <MetricValue
                        value={row.depth5PctBuySide}
                        unit={row.quote.code}
                        places={2}
                      />
                      {row.priceSource === 'none' && (
                        <span className="table-finding">
                          No executable price
                        </span>
                      )}
                    </td>
                    <td className="amt hide-sm">
                      <MetricValue
                        value={row.maxSafeCollateral}
                        unit={row.quote.code}
                        places={2}
                      />
                    </td>
                    <td>
                      <span
                        className={`flag-count band-${row.band.toLowerCase()} ${
                          row.flags.length ? 'has-flags' : ''
                        }`}
                      >
                        {row.flags.length === 0
                          ? 'None triggered'
                          : row.flags.length}
                        {row.flags[0] && (
                          <span className="fnote">{leadFlag(row.flags)}</span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="market-cards">
            {market.items.map((row) => (
              <article key={row.asset.issuer} className="market-card">
                <div className="result-heading">
                  <AssetIdentity asset={row.asset} quote={row.quote} compact />
                  <RiskBadge
                    band={row.band}
                    bandConfidence={row.bandConfidence}
                  />
                </div>
                <dl>
                  <div>
                    <dt>5% buy depth</dt>
                    <dd>
                      <MetricValue
                        value={row.depth5PctBuySide}
                        unit={row.quote.code}
                        places={2}
                      />
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
                </dl>
                <p>
                  {row.priceSource === 'none' ? 'No executable price · ' : ''}
                  {row.flags.length} triggered flags
                </p>
              </article>
            ))}
          </div>
          <div className="market-footer">
            <span>Ledger {market.items[0].ledgerSeq}</span>
            <span className="sample-label">Sample data · not live</span>
            <span className="market-footer-links">
              {/* The rows above are a recorded sample, and the dashboard now ships with
                  the site, so the live set is the more useful next step. The recording
                  stays alongside it: it is what a claim on this page is checked against,
                  and the live set cannot serve that purpose because it moves. */}
              <a href={dashboardLinks.assets}>
                See every monitored asset, live <ArrowUpRight size={13} />
              </a>
              {/* Says what it gives you. "Inspect all sample rows" promises a table and
                  delivers a file, which is a worse answer than the file honestly named. */}
              <Link href="/evidence/asset-list-mixed">
                See the whole sample set <ArrowUpRight size={13} />
              </Link>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
