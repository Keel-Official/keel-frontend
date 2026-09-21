import type { components } from '../../lib/keel/api/schema';
import {
  formatAmount,
  geometryRatio,
  manipulationLabel,
  percent,
  sourceContribution,
  sourceLabels,
} from '../../lib/format/keel';

export type AssetRisk = components['schemas']['AssetRisk'];

/**
 * The risk ramp is directional and four steps long, so the meter has four segments
 * and fills as many as the band is worth. It is drawn next to the band name rather
 * than instead of it: colour and length are the fast read, the word is the real one.
 */
const severity: Record<AssetRisk['band'], number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export function RiskBadge({
  band,
  bandConfidence,
}: Pick<AssetRisk, 'band' | 'bandConfidence'>) {
  const level = severity[band];
  return (
    <span className={`risk-status risk-${band.toLowerCase()}`}>
      <span className="risk-line">
        <span className="sev" aria-hidden="true">
          {[1, 2, 3, 4].map((step) => (
            <i key={step} className={step <= level ? 'on' : ''} />
          ))}
        </span>
        <span className="risk-band">
          <span className="sw" aria-hidden="true" />
          {band}
        </span>
      </span>
      <span className={`confidence ${bandConfidence}`}>
        {bandConfidence === 'partial'
          ? 'Partial confidence'
          : 'Full confidence'}
      </span>
    </span>
  );
}

export function MetricValue({
  value,
  unit,
  places,
}: {
  value: string | null | undefined;
  unit: string;
  places?: number;
}) {
  if (value === undefined)
    return <span className="unavailable">Not provided</span>;
  if (value === null) return <span className="unavailable">Not available</span>;
  return (
    <span className="metric-value" title={`${formatAmount(value)} ${unit}`}>
      <span>{formatAmount(value, places)}</span>
      <span className="unit">{unit}</span>
    </span>
  );
}

export function AssetIdentity({
  asset,
  quote,
  compact = false,
}: Pick<AssetRisk, 'asset' | 'quote'> & { compact?: boolean }) {
  return (
    <div className={`asset-identity ${compact ? 'compact' : ''}`}>
      <span
        className={`asset-symbol symbol-${asset.code.toLowerCase()}`}
        aria-hidden="true"
      >
        {asset.code === 'USDC' ? '$' : asset.code.slice(0, 1)}
      </span>
      <div>
        <strong>
          {asset.code} <span className="pair-divider">/ {quote.code}</span>
        </strong>
        <span className="issuer" title={asset.issuer ?? 'Native Stellar asset'}>
          {asset.issuer
            ? `${asset.issuer.slice(0, 6)}…${asset.issuer.slice(-4)}`
            : 'Native asset'}
          <span className="identity-network"> · Stellar</span>
        </span>
      </div>
    </div>
  );
}

function depthUnavailable(result: AssetRisk) {
  if (result.flags.includes('SPREAD_EXTREME'))
    return (
      <div className="finding-notice">
        <p>
          The reference price is unreliable. Depth derived from this midpoint is
          not meaningful.
        </p>
      </div>
    );
  if (result.priceSource === 'none')
    return (
      <div className="finding-notice">
        <p>
          No executable price. Measured depth is zero; this is a risk finding.
        </p>
      </div>
    );
  return null;
}

export function DepthLadder({
  result,
  compact = false,
}: {
  result: AssetRisk;
  compact?: boolean;
}) {
  const unavailable = depthUnavailable(result);
  if (unavailable) return unavailable;
  const max = result.depth.at(-1)?.buySide ?? '0';

  // The instrument panel reads top to bottom: a labelled amount with the bar that
  // scales it underneath. The full ladder keeps both sides side by side, because a
  // reader comparing buy and sell depth needs them on one line.
  if (compact)
    return (
      <div className="depth-ladder compact">
        {result.depth.map((row) => (
          <div className="drow" key={row.delta}>
            <div className="dtop">
              <span className="rng">±{percent(row.delta)}%</span>
              <span className="amt" title={formatAmount(row.buySide)}>
                {formatAmount(row.buySide, 2)}
              </span>
            </div>
            <span className="track">
              <span
                className="depth-bar"
                style={{ width: `${geometryRatio(row.buySide, max)}%` }}
              />
            </span>
          </div>
        ))}
        <p className="table-note">
          Rounded to 2 decimals. Exact amounts in the sample response.
        </p>
      </div>
    );

  return (
    <div className="depth-ladder">
      <div className="ladder-head">
        <span>Price range</span>
        <span>Buy depth · {result.quote.code}</span>
        <span>Sell depth · {result.quote.code}</span>
      </div>
      {result.depth.map((row) => (
        <div
          className={`ladder-row ${row.delta === 0.05 ? 'ladder-selected' : ''}`}
          key={row.delta}
        >
          <span className="delta">±{percent(row.delta)}%</span>
          <div className="depth-cell">
            <span
              className="depth-bar"
              style={{ width: `${geometryRatio(row.buySide, max)}%` }}
            />
            <span title={formatAmount(row.buySide)}>
              {formatAmount(row.buySide, 2)}
            </span>
          </div>
          <span className="sell-value" title={formatAmount(row.sellSide)}>
            {formatAmount(row.sellSide, 2)}
          </span>
        </div>
      ))}
      <p className="table-note">
        Values rounded to 2 decimals. Exact amounts in the sample response.
      </p>
    </div>
  );
}

export function LiquiditySourceBreakdown({ result }: { result: AssetRisk }) {
  const row = result.depth.find((item) => item.delta === 0.05);
  if (!row) return null;
  const shares = sourceContribution(row.fromSdex, row.fromAmm);
  return (
    <div className="source-breakdown">
      <div className="inline-heading">
        <span>Buy-side sources · +{percent(row.delta)}%</span>
        <span>{result.quote.code}</span>
      </div>
      {shares ? (
        <>
          <div className="source-bar" aria-hidden="true">
            <span style={{ width: `${shares.sdex}%` }} />
            <span style={{ width: `${shares.amm}%` }} />
          </div>
          <div className="source-legend">
            <span>
              <i />
              SDEX <strong>{shares.sdex}%</strong>
            </span>
            <span>
              <i />
              AMM <strong>{shares.amm}%</strong>
            </span>
          </div>
        </>
      ) : (
        <p className="muted">No source liquidity measured.</p>
      )}
    </div>
  );
}

export function ProvenanceStrip({
  result,
  method = true,
}: {
  result: Pick<
    AssetRisk,
    'ledgerSeq' | 'methodologyVersion' | 'dataSource' | 'bandConfidence'
  >;
  /** The marketing page does not carry methodology, so it drops this column. */
  method?: boolean;
}) {
  return (
    <dl className={`provenance-strip ${method ? '' : 'without-method'}`}>
      <div>
        <dt>Ledger</dt>
        <dd>{result.ledgerSeq}</dd>
      </div>
      {method && (
        <div>
          <dt>Method</dt>
          <dd>{result.methodologyVersion}</dd>
        </div>
      )}
      <div>
        <dt>Source</dt>
        <dd>{sourceLabels[result.dataSource]}</dd>
      </div>
      <div>
        <dt>Confidence</dt>
        <dd>{result.bandConfidence === 'full' ? 'Full' : 'Partial'}</dd>
      </div>
    </dl>
  );
}

export function ManipulationRungs({ result }: { result: AssetRisk }) {
  return (
    <div className="manipulation-rungs">
      {result.manipulationCostOrderbookOnly.map((rung) => (
        <div key={rung.delta} className="rung">
          <span className="delta">+{percent(rung.delta)}%</span>
          <div>
            <MetricValue value={rung.cost} unit={result.quote.code} />
            <span className={`rung-status ${rung.reachable ? 'ok' : 'no'}`}>
              {manipulationLabel(rung.cost, rung.reachable)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const flagDescriptions: Partial<Record<components['schemas']['Flag'], string>> =
  {
    ZERO_DEPTH_2PCT: 'No executable depth within ±2% on at least one side.',
    MANIPULATION_CHEAP: 'A defined price target is reachable at low cost.',
    SPREAD_EXTREME:
      'The bid and ask are too far apart for a meaningful reference price.',
    THIN_DEPTH_5PCT: 'Depth at ±5% falls below the configured threshold.',
  };

export function FlagList({ result }: { result: AssetRisk }) {
  return (
    <div className="flag-groups">
      <div>
        <h3 className="flag-label">
          Triggered <span className="ct">{result.flags.length}</span>
        </h3>
        {result.flags.length ? (
          result.flags.map((flag) => (
            <div className="flag-item" key={flag}>
              <code>{flag}</code>
              {flagDescriptions[flag] && <p>{flagDescriptions[flag]}</p>}
            </div>
          ))
        ) : (
          <p className="muted">No flags triggered.</p>
        )}
      </div>
      <div className="unevaluated-group">
        <h3 className="flag-label">
          Not evaluated{' '}
          <span className="ct">{result.unevaluatedFlags.length}</span>
        </h3>
        {result.unevaluatedFlags.map((flag) => (
          <div className="flag-item" key={flag}>
            <code>{flag}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
