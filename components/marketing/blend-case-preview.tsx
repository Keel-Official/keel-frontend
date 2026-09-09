import { ArrowUpRight, CircleHelp } from 'lucide-react';
import { februaryPoints, observationSegments } from '../../lib/format/history';
import { formatAmount, geometryRatio } from '../../lib/format/keel';

export function BlendCasePreview() {
  const x = (day: string) =>
    56 + ((Date.parse(day) - Date.parse('2026-02-01')) / 86400000) * (648 / 27);
  const y = (movement: string) => 224 - geometryRatio(movement, '0.4') * 1.6;
  const eventX = x('2026-02-22');
  return (
    <section
      className="section case-section"
      id="case-study"
      aria-labelledby="case-title"
    >
      <div className="container">
        <div className="case-heading">
          <div>
            <span className="case-label">Blend / USTRY · February 2026</span>
            <h2 id="case-title">
              The February
              <br />
              USTRY incident.
            </h2>
          </div>
          <p>
            Historical evidence includes its limits. The February trade stream
            did not establish an actionable advance warning.
          </p>
        </div>
        <div className="case-layout">
          <div className="history-panel panel">
            <div className="history-heading">
              <div>
                <h3>Movement within a trade leg</h3>
                <p>Largest observed daily price span · USTRY / USDC</p>
              </div>
              <span className="sample-label">Historical observations</span>
            </div>
            <svg
              className="history-chart"
              viewBox="0 0 760 280"
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
              {[
                ['0.4', 64],
                ['0.3', 104],
                ['0.2', 144],
                ['0.1', 184],
                ['0', 224],
              ].map(([value, lineY]) => (
                <g key={value}>
                  <line
                    className="chart-grid"
                    x1="56"
                    x2="704"
                    y1={lineY}
                    y2={lineY}
                  />
                  <text className="chart-label" x="12" y={+lineY + 4}>
                    {value}%
                  </text>
                </g>
              ))}
              <line
                className="event-line"
                x1={eventX}
                x2={eventX}
                y1="48"
                y2="236"
              />
              <rect
                x={eventX - 108}
                y="8"
                width="176"
                height="28"
                rx="6"
                className="event-label-bg"
              />
              <text x={eventX - 96} y="27" className="event-label">
                22 Feb · incident
              </text>
              {observationSegments(februaryPoints).map((segment, index) => (
                <polyline
                  key={index}
                  className="history-line"
                  points={segment
                    .map((point) => `${x(point.day)},${y(point.movement!)}`)
                    .join(' ')}
                />
              ))}
              {februaryPoints.map((point) =>
                point.movement !== null ? (
                  <circle
                    key={point.day}
                    className={
                      point.day === '2026-02-22'
                        ? 'event-point'
                        : 'history-point'
                    }
                    cx={x(point.day)}
                    cy={y(point.movement)}
                    r={point.day === '2026-02-22' ? 6 : 3}
                  >
                    <title>{`${point.day}: ${formatAmount(point.movement)}%`}</title>
                  </circle>
                ) : (
                  <g key={point.day}>
                    <line
                      className="missing-point"
                      x1={x(point.day) - 3}
                      x2={x(point.day) + 3}
                      y1="232"
                      y2="238"
                    />
                    <line
                      className="missing-point"
                      x1={x(point.day) - 3}
                      x2={x(point.day) + 3}
                      y1="238"
                      y2="232"
                    />
                  </g>
                ),
              )}
              {[
                '2026-02-01',
                '2026-02-08',
                '2026-02-15',
                '2026-02-22',
                '2026-02-28',
              ].map((day) => (
                <text
                  className="chart-label"
                  key={day}
                  x={x(day)}
                  y="264"
                  textAnchor="middle"
                >
                  {day.slice(-2)} Feb
                </text>
              ))}
            </svg>
            <div className="chart-legend">
              <span>
                <i className="legend-dot" />
                Observed movement
              </span>
              <span>× No within-leg observation</span>
              <span>Gaps are not interpolated</span>
            </div>
            <details className="chart-values">
              <summary>Inspect exact observations</summary>
              <div className="observation-table">
                <table>
                  <caption>
                    Historical trade observations. This is not an
                    executable-depth series.
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
          <aside className="case-finding">
            <CircleHelp size={24} />
            <h3>
              What the evidence
              <br />
              can establish.
            </h3>
            <p>
              No trade leg crossed a 2% price move during the month. The stream
              alone does not establish the available depth or a reliable advance
              warning.
            </p>
            <p>
              Observed trades are not a full historical orderbook. The incident
              marker supplies context, not proof of prediction.
            </p>
            <a
              className="text-link"
              href="/evidence/ustry-february-evidence.md"
            >
              Read the evidence <ArrowUpRight size={16} />
            </a>
            <a
              className="text-link secondary-link"
              href="/evidence/ustry-february-daily.csv"
            >
              Download daily observations <ArrowUpRight size={16} />
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
