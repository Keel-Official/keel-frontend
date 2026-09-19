import { plotSeries } from '@/lib/keel/chart/geometry';
import type { RowWindow } from '@/lib/keel/assets/row-series';
import { SEQUENTIAL_RAMP } from '@/lib/keel/design/tokens';
import { cn } from '@/lib/keel/utils';

/**
 * One row's depth over the window, at the size a table row can afford.
 *
 * It is decoration with a job: the cell around it states the direction in words and the
 * low and high as served figures, so nothing here is the only carrier of anything. That
 * is what lets it be `aria-hidden` and lets it be this small.
 *
 * WHAT IT STILL HAS TO GET RIGHT. A gap breaks the line, exactly as it does on the full
 * chart, because a segment drawn across two readings that were never adjacent invents a
 * trend — and at this width the break is easy to miss, which is why the cell also says
 * "reading missing" in words. A single reading is a dot rather than nothing.
 *
 * AND THE FLAT SERIES. `plotSeries` divides by an extent, and when every reading is
 * identical that extent is zero, so it returns `y = 0` for every point — the bottom
 * edge. On a 180px chart that is merely odd; in 24px it reads as a market that
 * collapsed to nothing, which is the opposite of what an unchanged series says. A flat
 * run is drawn across the middle instead.
 */

const WIDTH = 88;
const HEIGHT = 24;
const PAD = 3;

export interface RowSparklineProps {
  window: RowWindow;
  className?: string;
}

export function RowSparkline({ window, className }: RowSparklineProps) {
  const plot = plotSeries(
    window.points.map((point) => ({
      at: point.ledgerSeq,
      value: point.depth5PctBuySide,
    })),
    { gaps: window.gaps },
  );

  if (!plot.hasData) return null;

  // Every coordinate at the floor means the extent was zero: an unchanged series, not a
  // series that fell to nothing. These are coordinates the geometry module returned, so
  // reading them here converts nothing.
  const flat = plot.segments.every((segment) =>
    segment.every((point) => point.y === 0),
  );

  const toX = (x: number): number => PAD + x * (WIDTH - PAD * 2);
  const toY = (y: number): number =>
    flat ? HEIGHT / 2 : HEIGHT - PAD - y * (HEIGHT - PAD * 2);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      aria-hidden="true"
      focusable="false"
      className={cn('block shrink-0 overflow-visible', className)}
    >
      {plot.segments.map((segment, i) =>
        segment.length === 1 ? (
          <circle
            key={i}
            cx={toX(segment[0].x)}
            cy={toY(segment[0].y)}
            r={2}
            fill={SEQUENTIAL_RAMP[10]}
          />
        ) : (
          <polyline
            key={i}
            points={segment.map((p) => `${toX(p.x)},${toY(p.y)}`).join(' ')}
            fill="none"
            stroke={SEQUENTIAL_RAMP[10]}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      )}
    </svg>
  );
}
