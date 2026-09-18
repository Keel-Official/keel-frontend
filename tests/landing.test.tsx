import { readFileSync, existsSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import Home from '../app/(marketing)/page';
import { healthy, brokenBook, history, market } from '../lib/api/fixtures';
import { februaryPoints, observationSegments } from '../lib/format/history';
import { EVIDENCE } from '../lib/evidence';
import { DASHBOARD_BASE } from '../lib/keel/routes';
import { BACKTEST_REPORT_URL } from '../lib/report';

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

it('every local navigation link resolves to a section, a page, or a real artifact', () => {
  const { container } = render(<Home />);
  const evidenceSlugs = new Set(EVIDENCE.map((item) => item.slug));

  for (const link of container.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href')!;
    if (href.startsWith('#')) {
      expect(container.querySelector(href), href).not.toBeNull();
    } else if (href.startsWith('/evidence/') && !href.includes('.')) {
      // A rendered evidence page rather than the file it renders. It resolves when
      // the registry has the slug, because that is what generates the route.
      expect(evidenceSlugs.has(href.slice('/evidence/'.length)), href).toBe(true);
    } else if (href === DASHBOARD_BASE || href.startsWith(`${DASHBOARD_BASE}/`)) {
      // The dashboard is rendered by this application rather than served from
      // `public`, so it resolves when the route segment exists on disk. Its pages read
      // the live API, which is why this checks the route and not the response.
      const segment = href.slice(DASHBOARD_BASE.length).replace(/^\//, '');
      const route = `app/(dashboard)/dashboard/${segment}`.replace(/\/$/, '');
      expect(existsSync(`${route}/page.tsx`), href).toBe(true);
    } else if (href.startsWith('/') && href !== '/') {
      expect(existsSync(`public${href}`), href).toBe(true);
    }
  }
});

it('offers the backtest report, and sends it somewhere that stays current', () => {
  // The Statement of Work asks for the report to be published openly, and this page is
  // where a reader arrives. The link is deliberately not `public/evidence/blend-report.md`:
  // that copy stopped at the draft whose sections 5 and 6 were empty. See `lib/report.ts`.
  const { container } = render(<Home />);
  const links = Array.from(
    container.querySelectorAll(`a[href="${BACKTEST_REPORT_URL}"]`),
  );
  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    expect(link.getAttribute('rel'), link.textContent ?? '').toBe('noreferrer');
  }
});

it('every rendered evidence page has the file it claims to render', () => {
  // The page offers "the file this page renders" in its footer. If that path is
  // wrong the offer is a dead link, and the whole point of the page is that the
  // artefact behind it can be checked.
  for (const item of EVIDENCE) {
    expect(existsSync(`public${item.rawPath}`), item.rawPath).toBe(true);
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
