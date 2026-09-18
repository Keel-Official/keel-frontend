import { ArrowUpRight } from 'lucide-react';
import { februaryPoints } from '../../lib/format/history';
import { formatAmount } from '../../lib/format/keel';
import { BACKTEST_REPORT_URL } from '../../lib/report';
import { FebruaryChart } from './february-chart';

export function BlendCasePreview() {
  return (
    <section
      className="section case-section"
      id="case-study"
      aria-labelledby="case-title"
    >
      <div className="container">
        <h2 id="case-title">The February USTRY incident.</h2>
        <div className="chart-card">
          <div className="chart-head">
            <div>
              <h3>Movement within a trade leg</h3>
              <p>Largest observed daily price span · USTRY / USDC</p>
            </div>
            <span className="sample-label">Historical observations</span>
          </div>
          <FebruaryChart />
          <div className="chart-legend">
            <span>
              <i className="legend-line" />
              Observed movement
            </span>
            <span>
              <i className="legend-dot event-dot" />
              Incident · Feb 22
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
        </div>
      </div>
    </section>
  );
}
