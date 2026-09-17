import { ArrowDown, ArrowUpRight, ListFilter } from 'lucide-react';
import { market } from '../../lib/api/fixtures';
import { dashboardIsLive, dashboardLinks } from '../../lib/dashboard';
import { AssetIdentity, MetricValue, RiskBadge } from '../keel/result';
import Link from 'next/link';

export function MarketSnapshot() {
  return (
    <section
      className="section market-section"
      id="markets"
      aria-labelledby="market-title"
    >
      <div className="container">
        <div className="section-heading-row">
          <div>
            <h2 id="market-title">Compare Stellar markets.</h2>
          </div>
          <p>
            Compare executable depth, collateral capacity, and the findings that
            deserve a closer look.
          </p>
        </div>
        <div className="market-frame">
          <div className="market-toolbar">
            <span>
              <ListFilter size={16} />
              <strong>Monitored markets</strong>
              <span className="count-badge">{market.items.length}</span>
            </span>
            <span className="sample-label">Sample data · not live</span>
          </div>
          <div className="market-table-wrap">
            <table className="market-table">
              <caption className="sr-only">
                Sample Stellar markets. Amounts in XLM, rounded to two decimals.
                Full responses are available below.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Asset / quote</th>
                  <th scope="col">Risk & confidence</th>
                  <th scope="col">
                    5% buy depth <ArrowDown size={12} />
                  </th>
                  <th scope="col">Max safe collateral</th>
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
                    <td>
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
                    <td>
                      <MetricValue
                        value={row.maxSafeCollateral}
                        unit={row.quote.code}
                        places={2}
                      />
                    </td>
                    <td>
                      <span
                        className={`flag-count ${row.flags.length ? 'has-flags' : ''}`}
                      >
                        {row.flags.length === 0
                          ? 'None triggered'
                          : `${row.flags.length} flags`}
                      </span>
                      {row.flags[0] && (
                        <span className="table-flag-name">
                          {row.flags[0].replaceAll('_', ' ').toLowerCase()}
                        </span>
                      )}
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
            <span>
              Ledger {market.items[0].ledgerSeq} · {market.methodologyVersion}
            </span>
            {/* The rows above are a recorded sample. When a live dashboard exists,
                the more useful next step is the real set rather than the JSON the
                sample came from; both are offered when it does. */}
            {dashboardIsLive ? (
              <a href={dashboardLinks.assets}>
                See every monitored asset, live <ArrowUpRight size={14} />
              </a>
            ) : (
              // Says what it gives you. "Inspect all sample rows" promises a table and
              // delivers a file, which is a worse answer than the file honestly named.
              <Link href="/evidence/asset-list-mixed">
                See the whole sample set <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
