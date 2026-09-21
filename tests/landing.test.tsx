import { readFileSync, existsSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import Home from '../app/(marketing)/page';
import { healthy, brokenBook, history, market } from '../lib/keel/fixtures/fixtures';
import { februaryPoints } from '../lib/format/history';
import { EVIDENCE } from '../lib/evidence';
import { BlendCasePreview } from '../components/marketing/blend-case-preview';
import { DASHBOARD_BASE } from '../lib/keel/routes';
import { BACKTEST_REPORT_URL } from '../lib/report';

it('leads with a real result and keeps evidence accessible without live API calls', () => {
  render(<Home />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    'Know how much a price can actually support.',
  );
  expect(screen.getByText('Result')).toBeVisible();
  // The figures on this page are a recorded sample, and the page still says so
  // where the numbers are: the panel's own note points at the sample response.
  expect(
    screen.getByText(/Exact amounts in the sample response/),
  ).toBeVisible();
  // The page must never let a band read as a complete check. The sentence that said so
  // used to be a standalone note under the finding; it is now the clause that closes
  // the finding's own paragraph, and the guarantee is the same one either way.
  expect(
    screen.getByText(
      /could not be evaluated at all, which is why this band is a floor/,
    ),
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
    // A query or a fragment narrows a view of a route; it never names a different one.
    // `/dashboard?band=LOW` is the monitored set with a filter applied, and what has to
    // exist on disk is `/dashboard`.
    const path = href.split(/[?#]/)[0];
    if (href.startsWith('#')) {
      expect(container.querySelector(href), href).not.toBeNull();
    } else if (path.startsWith('/evidence/') && !path.includes('.')) {
      // A rendered evidence page rather than the file it renders. It resolves when
      // the registry has the slug, because that is what generates the route.
      expect(evidenceSlugs.has(path.slice('/evidence/'.length)), href).toBe(
        true,
      );
    } else if (
      path === DASHBOARD_BASE ||
      path.startsWith(`${DASHBOARD_BASE}/`)
    ) {
      // The dashboard is rendered by this application rather than served from
      // `public`, so it resolves when the route segment exists on disk. Its pages read
      // the live API, which is why this checks the route and not the response.
      const segment = path.slice(DASHBOARD_BASE.length).replace(/^\//, '');
      const route = `app/(dashboard)/dashboard/${segment}`.replace(/\/$/, '');
      expect(existsSync(`${route}/page.tsx`), href).toBe(true);
    } else if (path.startsWith('/') && path !== '/') {
      // A page of this site or a file served from `public`.
      expect(
        existsSync(`app/(marketing)${path}/page.tsx`) ||
          existsSync(`public${path}`),
        href,
      ).toBe(true);
    }
  }
});

it('offers the backtest report, and sends it somewhere that stays current', () => {
  // The Statement of Work asks for the report to be published openly, and this page is
  // where a reader arrives. The link deliberately goes to the engine repository rather
  // than to a copy under `public/`: the last such copy stopped at the draft whose
  // sections 5 and 6 were empty, and was removed. See `lib/report.ts`.
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

it('charts real February dates and draws missing observations as gaps, not zeros', () => {
  expect(februaryPoints).toHaveLength(28);
  expect(
    februaryPoints.find((point) => point.day === '2026-02-22')?.movement,
  ).toMatch(/^0\.391964/);
  expect(
    februaryPoints.find((point) => point.day === '2026-02-11')?.movement,
  ).toBeNull();

  // A day without an observation must not be drawn as a measured zero, and the line
  // must not bridge it. Every run of observed days is its own mark, every observed
  // day is one vertex (or a lone point), and the missing days carry a cross instead.
  const missing = februaryPoints.filter((point) => point.movement === null);
  expect(missing).toHaveLength(9);
  const runs = februaryPoints.filter(
    (point, index) =>
      point.movement !== null &&
      (index === 0 || februaryPoints[index - 1].movement === null),
  );
  const { container } = render(<BlendCasePreview />);
  expect(container.querySelectorAll('.history-segment')).toHaveLength(
    runs.length,
  );
  const vertices = Array.from(
    container.querySelectorAll('.history-line'),
  ).reduce(
    (total, path) =>
      total + (path.getAttribute('d')!.match(/[ML]/g) ?? []).length,
    0,
  );
  expect(vertices + container.querySelectorAll('.history-dot').length).toBe(
    februaryPoints.length - missing.length,
  );
  expect(container.querySelectorAll('.missing-mark')).toHaveLength(
    missing.length,
  );
  expect(container.querySelectorAll('.event-point')).toHaveLength(1);
});
