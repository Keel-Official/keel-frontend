import { ArrowUpRight } from 'lucide-react';
import { februaryPoints } from '../../lib/format/history';
import { formatAmount, geometryRatio } from '../../lib/format/keel';
import { BACKTEST_REPORT_URL } from '../../lib/report';

/** The chart's own coordinate space. Bars, not a line: a gap must read as an
    absent observation rather than a segment joining the days either side of it. */
const PLOT = { left: 56, right: 736, top: 40, base: 240 };
const CEILING = '0.4';
const GRID: readonly (readonly [string, number])[] = [
  ['0.4', PLOT.top],
  ['0.3', PLOT.top + 50],
  ['0.2', PLOT.top + 100],
  ['0.1', PLOT.top + 150],
  ['0', PLOT.base],
];
const SLOT = (PLOT.right - PLOT.left) / februaryPoints.length;
const BAR = 13;
const INCIDENT = '2026-02-22';

const slotCentre = (index: number) => PLOT.left + SLOT * (index + 0.5);
const barHeight = (movement: string) =>
  (geometryRatio(movement, CEILING) / 100) * (PLOT.base - PLOT.top);

export function BlendCasePreview() {
  const missing = februaryPoints.filter((point) => point.movement === null);
  const incidentIndex = februaryPoints.findIndex(
    (point) => point.day === INCIDENT,
  );
  const incidentMovement = februaryPoints[incidentIndex]?.movement ?? null;

  return (
    <section
      className="section case-section"
      id="case-study"
      aria-labelledby="case-title"
    >
      <div className="container">
        <h2 id="case-title">The February USTRY incident.</h2>
        <p className="intro">
          Historical evidence includes its limits. The February trade stream did
          not establish an actionable advance warning.
        </p>
        <div className="chart-card">
          <div className="chart-head">
            <div>
              <h3>Movement within a trade leg</h3>
              <p>Largest observed daily price span · USTRY / USDC</p>
            </div>
            <span className="sample-label">Historical observations</span>
          </div>
          <p className="chart-desc">
            Observed trade-leg price movement in February 2026. Daily maximum
            price movement, from zero to 0.4 percent. The largest observed
            movement occurs on February 22, the incident date. {missing.length}{' '}
            days carry no within-leg observation; they are shown as gaps, not
            zeros.
          </p>
          <svg
            className="history-chart"
            viewBox="0 0 760 290"
            role="img"
            aria-labelledby="history-chart-title history-chart-description"
          >
            <title id="history-chart-title">
              Observed trade-leg price movement in February 2026
            </title>
            <desc id="history-chart-description">
              Daily maximum price movement, from zero to 0.4 percent. The
              largest observed movement occurs on February 22, the incident
              date. Missing observations are shown as gaps, not zeros. Exact
              values are available in the table below.
            </desc>
            {GRID.map(([value, lineY]) => (
              <g key={value}>
                <line
                  className="chart-grid"
                  x1={PLOT.left}
                  x2={PLOT.right}
                  y1={lineY}
                  y2={lineY}
                />
                <text
                  className="chart-label"
                  x={PLOT.left - 12}
                  y={lineY + 4}
                  textAnchor="end"
                >
                  {value}%
                </text>
              </g>
            ))}
            {februaryPoints.map((point, index) =>
              point.movement === null ? (
                <g key={point.day} className="missing-mark">
                  <line
                    x1={slotCentre(index) - 4}
                    x2={slotCentre(index) + 4}
                    y1={PLOT.base - 8}
                    y2={PLOT.base}
                  />
                  <line
                    x1={slotCentre(index) - 4}
                    x2={slotCentre(index) + 4}
                    y1={PLOT.base}
                    y2={PLOT.base - 8}
                  />
                  <title>{`${point.day}: no within-leg observation`}</title>
                </g>
              ) : (
                <rect
                  key={point.day}
                  className={
                    point.day === INCIDENT ? 'event-bar' : 'history-bar'
                  }
                  x={slotCentre(index) - BAR / 2}
                  y={PLOT.base - barHeight(point.movement)}
                  width={BAR}
                  height={Math.max(barHeight(point.movement), 1)}
                  rx="2"
                >
                  <title>{`${point.day}: ${formatAmount(point.movement)}%`}</title>
                </rect>
              ),
            )}
            {incidentMovement !== null && (
              <text
                className="event-label"
                x={slotCentre(incidentIndex) - 9}
                y={PLOT.base - barHeight(incidentMovement) - 10}
                textAnchor="end"
              >
                22 Feb · incident
              </text>
            )}
            {[0, 7, 14, 21, 27].map((index) => (
              <text
                className="chart-label"
                key={index}
                x={slotCentre(index)}
                y={PLOT.base + 26}
                textAnchor="middle"
              >
                {februaryPoints[index].day.slice(-2)} Feb
              </text>
            ))}
          </svg>
          <div className="chart-legend">
            <span>
              <i className="legend-dot" />
              Observed movement
            </span>
            <span>
              <i className="legend-dot event-dot" />
              Incident · 22 Feb
            </span>
            <span>× No within-leg observation</span>
            <span>Gaps are not interpolated</span>
          </div>
          <details className="chart-values">
            <summary>Inspect exact observations</summary>
            <div className="observation-table">
              <table>
                <caption>
                  Historical trade observations. This is not an executable-depth
                  series.
                </caption>
                <thead>
                  <tr>
                    <th>Date (UTC)</th>
                    <th>Maximum within-leg move (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {februaryPoints.map((point) => (
                    <tr key={point.day}>
                      <td>{point.day}</td>
                      <td>{formatAmount(point.movement)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
        <div className="case-finding">
          <p>
            No trade leg crossed a 2% price move during the month. The stream
            alone does not establish the available depth or a reliable advance
            warning. Observed trades are not a full historical orderbook, and
            the incident marker supplies context, not proof of prediction.
          </p>
          <div className="case-links">
            <a
              className="button"
              href={BACKTEST_REPORT_URL}
              target="_blank"
              rel="noreferrer"
            >
              Read the backtest report <ArrowUpRight size={15} />
            </a>
            <a
              className="button button-ghost"
              href="/evidence/ustry-february-evidence.md"
            >
              Read the evidence
            </a>
            <a
              className="button button-ghost"
              href="/evidence/ustry-february-daily.csv"
            >
              Download daily observations
            </a>
          </div>
          <p className="case-report-note">
            The February reconstruction in full, day by day, with the steps that
            reproduce every number in it. Still a draft: the section that says
            what those numbers mean is unwritten.
          </p>
        </div>
      </div>
    </section>
  );
}
