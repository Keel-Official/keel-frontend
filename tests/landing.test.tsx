import { readFileSync, existsSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import Home from '../app/page';
import { healthy, brokenBook, history, market } from '../lib/api/fixtures';
import { februaryPoints, observationSegments } from '../lib/format/history';

it('leads with a real result and keeps evidence accessible without live API calls', () => {
  render(<Home />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    'Know how mucha price canactually support.',
  );
  expect(screen.getByText('Sample result')).toBeVisible();
  expect(screen.getByText('Sample data · not live')).toBeVisible();
  expect(
    screen.getByText('Unevaluated checks may conceal additional risk.'),
  ).toBeVisible();
  fireEvent.click(screen.getByText('Does Keel need a wallet?'));
  expect(
    screen.getByText(/No. Keel is read-only. It never signs/),
  ).toBeVisible();
});

it('every local navigation link resolves to a section or a real artifact', () => {
  const { container } = render(<Home />);
  for (const link of container.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href')!;
    if (href.startsWith('#'))
      expect(container.querySelector(href), href).not.toBeNull();
    else if (href.startsWith('/') && href !== '/')
      expect(existsSync(`public${href}`), href).toBe(true);
  }
});

it('typed fixture exports preserve the backend mock data unchanged', () => {
  for (const [name, fixture] of Object.entries({
    'asset-healthy': healthy,
    'asset-broken-book': brokenBook,
    'history-ustry': history,
    'asset-list-mixed': market,
  })) {
    expect(fixture).toEqual(
      JSON.parse(readFileSync(`public/evidence/${name}.json`, 'utf8')),
    );
  }
});

it('charts real February dates and leaves missing observations disconnected', () => {
  expect(februaryPoints).toHaveLength(28);
  expect(
    februaryPoints.find((point) => point.day === '2026-02-22')?.movement,
  ).toMatch(/^0\.391964/);
  expect(
    februaryPoints.find((point) => point.day === '2026-02-11')?.movement,
  ).toBeNull();
  const segments = observationSegments(februaryPoints);
  expect(segments.flat().every((point) => point.movement !== null)).toBe(true);
  expect(segments[0].at(-1)?.day).toBe('2026-02-10');
  expect(segments[1][0].day).toBe('2026-02-15');
});
