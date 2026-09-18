import { existsSync } from 'node:fs';
import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import BacktestPage from '../app/(marketing)/backtest/page';
import { BACKTEST, BACKTEST_DAYS, BACKTEST_SUMMARY } from '../lib/backtest';

it('derives the month from the rows, matching the evidence notes', () => {
  // The notes state these figures in prose. The page computes them, so a change to
  // the rows that the notes do not follow shows up here first.
  expect(BACKTEST_SUMMARY.days).toBe(28);
  expect(BACKTEST_SUMMARY.trades).toBe('13547');
  expect(BACKTEST_SUMMARY.largestWithinLegDay).toBe('2026-02-22');
  expect(BACKTEST_SUMMARY.causalBoundDays).toBe(0);
  expect(BACKTEST_SUMMARY.assumingBoundDays.map((day) => day.day)).toEqual([
    '2026-02-10',
    '2026-02-22',
  ]);
  expect(BACKTEST_SUMMARY.missingWithinLeg).toBe(9);
});

it('keeps the widest bound a day supports, never a carried one', () => {
  const tenth = BACKTEST_DAYS.find((day) => day.day === '2026-02-10')!;
  expect(tenth.betweenLegsBound).toMatchObject({
    rung: '0.05',
    delta: '0.000001',
    gapSeconds: '399',
  });
  const incident = BACKTEST_DAYS.find((day) => day.day === '2026-02-22')!;
  expect(incident.betweenLegsBound?.rung).toBe('0.5');
  // The day after has no qualifying move of its own, so it shows none.
  const after = BACKTEST_DAYS.find((day) => day.day === '2026-02-23')!;
  expect(after.betweenLegsBound).toBeNull();
});

it('renders every day, marks the incident, and states no zero it did not measure', () => {
  const { container } = render(<BacktestPage />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    'The February USTRY backtest.',
  );
  expect(
    screen.getByText(/Verdict for the month: unevaluated\./),
  ).toBeVisible();

  const table = container.querySelector('#daily table')!;
  const rows = within(table as HTMLElement)
    .getAllByRole('row')
    .slice(1);
  expect(rows).toHaveLength(BACKTEST_DAYS.length);
  expect(table.querySelectorAll('tr.is-incident')).toHaveLength(1);
  // A day without a within-leg observation reads as absent, not as 0%.
  expect(
    within(table as HTMLElement).getAllByText('No within-leg observation'),
  ).toHaveLength(BACKTEST_SUMMARY.missingWithinLeg);
});

it('offers the files it is built from, and they exist', () => {
  render(<BacktestPage />);
  for (const path of [BACKTEST.csvPath, BACKTEST.notesPath])
    expect(existsSync(`public${path}`), path).toBe(true);
});
