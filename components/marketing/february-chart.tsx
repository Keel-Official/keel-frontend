'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import Decimal from 'decimal.js';
import { februaryPoints } from '../../lib/format/history';
import { geometryRatio } from '../../lib/format/keel';

/**
 * The chart is drawn at the width it is shown at, so axis text stays at its set size
 * on a phone instead of shrinking with a scaled drawing. The server renders the
 * desktop width; the first measurement replaces it.
 */
const HEIGHT = 300;
const PLOT = { left: 52, inset: 20, top: 24, base: 256 };
const CEILING = '0.4';
const TICKS = ['0.4', '0.3', '0.2', '0.1'] as const;
const INCIDENT = '2026-02-22';
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type Point = (typeof februaryPoints)[number];

type Scale = (index: number) => number;

const scaleX =
  (width: number): Scale =>
  (index) =>
    PLOT.left +
    ((width - PLOT.inset - PLOT.left) * index) / (februaryPoints.length - 1);
const y = (movement: string) =>
  PLOT.base - (geometryRatio(movement, CEILING) / 100) * (PLOT.base - PLOT.top);

/** Written out from the ISO day, so no time zone can move it to another date. */
function longDate(day: string) {
  const [year, month, date] = day.split('-');
  return `${MONTHS[Number(month) - 1]} ${Number(date)}, ${year}`;
}

/** Enough digits to tell a small move from none; the table below keeps every one. */
const shortPercent = (movement: string) =>
  `${new Decimal(movement).toSignificantDigits(3).toFixed()}%`;

/**
 * Runs of consecutive observed days. A day without an observation ends the run, so
 * the line stops at a gap instead of drawing a movement nobody measured across it.
 */
const segments = februaryPoints
  .reduce<{ point: Point; index: number }[][]>(
    (runs, point, index) => {
      if (point.movement === null) {
        if (runs.at(-1)?.length) runs.push([]);
        return runs;
      }
      (runs.at(-1) ?? runs[runs.push([]) - 1]).push({ point, index });
      return runs;
    },
    [[]],
  )
  .filter((run) => run.length > 0);

/**
 * Beside the crosshair while there is room, on the other side when there is not, and
 * held inside the plot on a phone where neither side fits.
 */
const TOOLTIP = 208;
const tooltipLeft = (at: number, width: number) => {
  if (at + 14 + TOOLTIP <= width) return at + 14;
  if (at - 14 - TOOLTIP >= 0) return at - 14 - TOOLTIP;
  return Math.min(Math.max(at - TOOLTIP / 2, 0), width - TOOLTIP);
};

type Run = { point: Point; index: number }[];

const linePath = (run: Run, x: Scale) =>
  run
    .map(
      ({ point, index }, step) =>
        `${step === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(point.movement!).toFixed(1)}`,
    )
    .join('');

const areaPath = (run: Run, x: Scale) =>
  `${linePath(run, x)}L${x(run.at(-1)!.index).toFixed(1)},${PLOT.base}L${x(run[0].index).toFixed(1)},${PLOT.base}Z`;

export function FebruaryChart() {
  const [active, setActive] = useState<number | null>(null);
  const [width, setWidth] = useState(760);
  const plot = useRef<HTMLDivElement>(null);
  const x = scaleX(width);
  const narrow = width < 520;

  useEffect(() => {
    const element = plot.current;
    if (!element || !window.ResizeObserver) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const incidentIndex = februaryPoints.findIndex(
    (point) => point.day === INCIDENT,
  );
  const incident = februaryPoints[incidentIndex];
  const current = active === null ? null : februaryPoints[active];

  // The crosshair finds the day: the pointer only has to be nearest, not on the line.
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const viewX = ((event.clientX - box.left) / box.width) * width;
    const ratio = (viewX - PLOT.left) / (width - PLOT.inset - PLOT.left);
    const index = Math.round(ratio * (februaryPoints.length - 1));
    setActive(Math.min(Math.max(index, 0), februaryPoints.length - 1));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = februaryPoints.length - 1;
    const step: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
    };
    if (event.key in step) {
      event.preventDefault();
      setActive((index) =>
        Math.min(Math.max((index ?? -1) + step[event.key], 0), last),
      );
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActive(event.key === 'Home' ? 0 : last);
    } else if (event.key === 'Escape') {
      setActive(null);
    }
  };

  const readout =
    current === null
      ? ''
      : `${longDate(current.day)}: ${
          current.movement === null
            ? 'no within-leg observation'
            : `maximum move ${shortPercent(current.movement)}`
        }${current.day === INCIDENT ? ', incident date' : ''}`;

  return (
    <div
      className="history-plot"
      role="group"
      aria-label="February 2026 observations. Use the left and right arrow keys to step through the days."
      tabIndex={0}
      ref={plot}
      onKeyDown={onKeyDown}
      onBlur={() => setActive(null)}
    >
      <svg
        className="history-chart"
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-labelledby="history-chart-title history-chart-description"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(null)}
      >
        <title id="history-chart-title">
          Observed trade-leg price movement in February 2026
        </title>
        <desc id="history-chart-description">
          Daily maximum price movement, from zero to 0.4 percent. The largest
          observed movement occurs on February 22, the incident date. Missing
          observations are shown as gaps, not zeros. Exact values are available
          in the table below.
        </desc>
        <defs>
          <linearGradient id="history-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" className="history-area-top" />
            <stop offset="100%" className="history-area-bottom" />
          </linearGradient>
        </defs>

        {TICKS.map((value) => (
          <g key={value}>
            <line
              className="chart-grid"
              x1={PLOT.left}
              x2={width - PLOT.inset}
              y1={y(value)}
              y2={y(value)}
            />
            <text
              className="chart-label"
              x={PLOT.left - 12}
              y={y(value) + 4}
              textAnchor="end"
            >
              {value}%
            </text>
          </g>
        ))}
        <line
          className="chart-baseline"
          x1={PLOT.left}
          x2={width - PLOT.inset}
          y1={PLOT.base}
          y2={PLOT.base}
        />
        <text
          className="chart-label"
          x={PLOT.left - 12}
          y={PLOT.base + 4}
          textAnchor="end"
        >
          0%
        </text>

        {segments.map((run) =>
          run.length > 1 ? (
            <g key={run[0].point.day} className="history-segment">
              <path className="history-area" d={areaPath(run, x)} />
              <path className="history-line" d={linePath(run, x)} />
            </g>
          ) : (
            // A lone observation between two gaps has no neighbour to join, so it
            // is drawn as a point rather than disappearing as a zero-length line.
            <circle
              key={run[0].point.day}
              className="history-segment history-dot"
              cx={x(run[0].index)}
              cy={y(run[0].point.movement!)}
              r="3.5"
            />
          ),
        )}

        {februaryPoints.map((point, index) =>
          point.movement === null ? (
            <g key={point.day} className="missing-mark">
              <line
                x1={x(index) - 4}
                x2={x(index) + 4}
                y1={PLOT.base - 8}
                y2={PLOT.base}
              />
              <line
                x1={x(index) - 4}
                x2={x(index) + 4}
                y1={PLOT.base}
                y2={PLOT.base - 8}
              />
            </g>
          ) : null,
        )}

        {incident?.movement && (
          <g className="event-point">
            <circle cx={x(incidentIndex)} cy={y(incident.movement)} r="5.5" />
            <text
              className="event-label"
              x={x(incidentIndex) - 12}
              y={y(incident.movement) + 4}
              textAnchor="end"
            >
              Feb 22 · incident
            </text>
          </g>
        )}

        {current !== null && active !== null && (
          <g className="chart-crosshair" aria-hidden="true">
            <line x1={x(active)} x2={x(active)} y1={PLOT.top} y2={PLOT.base} />
            {current.movement !== null && (
              <circle cx={x(active)} cy={y(current.movement)} r="5" />
            )}
          </g>
        )}

        {(narrow ? [0, 14, 27] : [0, 7, 14, 21, 27]).map((index) => (
          <text
            className="chart-label chart-label-x"
            key={index}
            x={x(index)}
            y={PLOT.base + 28}
            textAnchor={index === 0 ? 'start' : index === 27 ? 'end' : 'middle'}
          >
            Feb {Number(februaryPoints[index].day.slice(-2))}
          </text>
        ))}
      </svg>

      {current !== null && active !== null && (
        <div
          className="chart-tooltip"
          style={{ left: `${tooltipLeft(x(active), width)}px` }}
          aria-hidden="true"
        >
          <p className="chart-tooltip-date">{longDate(current.day)}</p>
          <div className="chart-tooltip-row">
            {current.movement !== null && (
              <i
                className={current.day === INCIDENT ? 'is-incident' : undefined}
              />
            )}
            <span>
              {current.movement === null ? 'No observation' : 'Max move'}
            </span>
            <strong>
              {current.movement === null
                ? 'Gap'
                : shortPercent(current.movement)}
            </strong>
          </div>
          {current.day === INCIDENT && (
            <p className="chart-tooltip-note">Incident date</p>
          )}
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {readout}
      </p>
    </div>
  );
}
