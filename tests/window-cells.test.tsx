import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  WindowRangeCell,
  WindowTrendCell,
  WindowVerdictCell,
} from '../components/dashboard/window-cells';
import { bandMix, summariseWindow } from '../lib/keel/assets/window-summary';
import type { RowSeries } from '../lib/keel/assets/row-series';
import type { HistoryPoint } from '../lib/keel/api/types';
import type { Band } from '../lib/keel/format/flags';

/**
 * The window cells, and the four different things "nothing here" can mean.
 *
 * A request still in flight, a window the engine holds no readings for, a request that
 * failed, and a view that never asked are four separate facts. Rendered as a dash or a
 * zero they would all read as a measurement, which is the false-confidence bug this
 * product exists to prevent — so each one is pinned by name, and every one of them is
 * checked for NOT containing a figure.
 */

function point(
  ledgerSeq: number,
  depth: string | null,
  band: Band = 'CRITICAL',
): HistoryPoint {
  return {
    ledgerSeq,
    ledgerClosedAt: '2026-09-18T00:00:00Z',
    depth5PctBuySide: depth,
    band,
    flags: [],
  };
}

function ready(
  points: readonly HistoryPoint[],
  gaps: { from: number; to: number }[] = [],
): RowSeries {
  return {
    state: 'ready',
    window: {
      range: '7d',
      resolution: 'day',
      source: 'horizon',
      points,
      gaps,
      depth: summariseWindow(points, (p) => p.depth5PctBuySide, { gaps }),
      bands: bandMix(points),
    },
  };
}

describe('a window cell with no series', () => {
  const cases: { name: string; series: RowSeries | undefined; says: RegExp }[] =
    [
      { name: 'never asked for', series: undefined, says: /not read/i },
      {
        name: 'still in flight',
        series: { state: 'pending' },
        says: /measuring/i,
      },
      {
        name: 'answered with nothing stored',
        series: { state: 'empty' },
        says: /no readings stored/i,
      },
      {
        name: 'failed',
        series: { state: 'failed', message: 'Rate limited.' },
        says: /series unavailable/i,
      },
    ];

  for (const { name, series, says } of cases) {
    it(`says it is ${name}, and shows no figure`, () => {
      const { container } = render(
        <>
          <WindowTrendCell series={series} />
          <WindowRangeCell series={series} quoteCode="USDC" />
          <WindowVerdictCell series={series} />
        </>,
      );

      expect(screen.getAllByText(says).length).toBeGreaterThan(0);
      // Not a zero, not a dash, not an empty cell.
      expect(container.textContent).not.toMatch(/\d/);
      expect(container.textContent).not.toMatch(/[—–-]\s*$/);
    });
  }

  it('carries the engine’s own words on a failure rather than paraphrasing them', () => {
    render(<WindowTrendCell series={{ state: 'failed', message: 'Boom.' }} />);

    expect(screen.getByText(/series unavailable/i)).toHaveAttribute(
      'title',
      'Boom.',
    );
  });
});

describe('a window cell with a series', () => {
  it('names the direction in words and never as a percentage', () => {
    render(<WindowTrendCell series={ready([point(1, '100'), point(2, '40')])} />);

    expect(screen.getByText('Thinner')).toBeVisible();
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it('refuses to call a single reading unchanged', () => {
    render(<WindowTrendCell series={ready([point(1, '100')])} />);

    expect(screen.getByText(/no comparable reading/i)).toBeVisible();
  });

  it('says a break in the line out loud, because at this size it is invisible', () => {
    render(
      <WindowTrendCell
        series={ready([point(1, '100'), point(2, '120')], [{ from: 1, to: 2 }])}
      />,
    );

    expect(screen.getByText(/reading missing/i)).toBeVisible();
  });

  it('shows the low and the high as the engine served them', () => {
    render(
      <WindowRangeCell
        series={ready([point(1, '1000.5'), point(2, '2000.25')])}
        quoteCode="USDC"
      />,
    );

    expect(screen.getByText(/1,000.5/)).toHaveAttribute('data-exact', '1000.5');
    expect(screen.getByText(/2,000.25/)).toHaveAttribute(
      'data-exact',
      '2000.25',
    );
  });

  it('shows a window that bottomed out at zero as the measurement it is', () => {
    render(
      <WindowRangeCell
        series={ready([point(1, '0'), point(2, '5')])}
        quoteCode="USDC"
      />,
    );

    const low = screen.getByText('0 USDC');
    expect(low).toHaveAttribute('data-state', 'zero');
  });

  it('keeps a steady verdict quiet and a moved one legible', () => {
    const { rerender } = render(
      <WindowVerdictCell
        series={ready([point(1, '1', 'LOW'), point(2, '1', 'LOW')])}
      />,
    );
    expect(screen.getByText(/held at all 2 readings/i)).toBeVisible();

    rerender(
      <WindowVerdictCell
        series={ready([point(1, '1', 'LOW'), point(2, '1', 'CRITICAL')])}
      />,
    );
    expect(screen.getByText(/verdict moved/i)).toBeVisible();
    expect(screen.getByText('Critical')).toBeVisible();
  });
});
