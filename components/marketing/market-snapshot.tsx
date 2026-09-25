import { ChevronRight } from 'lucide-react';
import Decimal from 'decimal.js';
import Link from 'next/link';
import { market } from '../../lib/keel/fixtures/fixtures';
import { dashboardLinks } from '../../lib/dashboard';
import { geometryRatio } from '../../lib/format/keel';
import { flagCopy } from '../../lib/keel/format/glossary';
import { MetricValue, RiskBadge } from '../keel/result';
import { ProvenanceFooter } from '../keel/provenance-footer';

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

/** The band, in the words the dashboard's own filter uses. */
const bandWords: Record<Row['band'], string> = {
  LOW: 'low-risk',
  MEDIUM: 'medium-risk',
  HIGH: 'high-risk',
  CRITICAL: 'critical',
};

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

/**
 * Three markets, one per column of the sheet.
 *
 * They were three cards floating in a grid; they are now three columns of the same
 * ruled sheet the finding and the case study are drawn on, divided by the hairline they
 * share. Each column opens on the reading itself — the issuer, the depth, the ceiling,
 * the price source, the flags — and the sentence under it says what that reading came
 * to, in the engine's own terms.
 *
 * The bars across the three columns share one scale, so a market that is a tenth as
 * deep as its neighbour looks it. That is the whole reason the three sit side by side.
 */
export function MarketSnapshot() {
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
      <div className="container market-frame">
        <div className="market-head">
          <h2 id="market-title">Compare Stellar markets.</h2>
          <p className="market-lede">
            Executable depth, collateral capacity, and the findings that deserve
            a closer look. Amounts in {market.items[0].quote.code}, rounded to
            two decimals.
          </p>
        </div>

        <div className="split split-three">
          {market.items.map((row) => (
            <article className="split-pane" key={row.asset.issuer}>
              <div className="split-visual">
                <RiskBadge
                  band={row.band}
                  bandConfidence={row.bandConfidence}
                />
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
                          row.priceSource === 'none'
                            ? 'market-finding'
                            : undefined
                        }
                      >
                        {priceSourceLabel(row)}
                      </dd>
                    </div>
                    <div>
                      <dt>Triggered flags</dt>
                      <dd>
                        {row.flags.length === 0 ? 'None' : row.flags.length}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <h3 className="split-title">
                {row.asset.code}{' '}
                <span className="pair-divider">/ {row.quote.code}</span>
              </h3>
              <p className="split-copy">{summary(row)}</p>
              {/* Not this asset's own page: these three are a recording, and the live
                  dashboard may not hold the same issuers. The band is the thing a reader
                  can act on, and the filtered set behind it is always there. */}
              <Link
                className="split-more"
                href={`${dashboardLinks.assets}?band=${row.band}`}
              >
                Every {bandWords[row.band]} market <ChevronRight size={16} />
              </Link>
            </article>
          ))}
        </div>
        {/* One footer for the three columns: they are rows of one list response, and
            the methodology is stated once for the list. Each row carries its own
            ledger, so every ledger the rows were read at is shown. */}
        <ProvenanceFooter
          origin="contract-example"
          fixture="asset-list-mixed"
          ledgerSeq={market.items.map((row) => row.ledgerSeq)}
          methodologyVersion={market.methodologyVersion}
        />
      </div>
    </section>
  );
}
