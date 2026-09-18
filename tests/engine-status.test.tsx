import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { EngineStatusView } from '../components/marketing/engine-status';
import { DASHBOARD_BASE } from '../lib/keel/routes';

// The strip exists to stop a reader concluding the engine is a mock, so the two
// things worth pinning are that it reports what the API said and that it says
// nothing when the API said nothing.

it('reports what the engine says about itself, and no figure it was not given', () => {
  render(
    <EngineStatusView
      status={{
        assetsMonitored: 61,
        latestScanAt: '2026-09-18T20:46:18.863062Z',
        latestScanLedgerSeq: 64495710,
        degraded: false,
      }}
    />,
  );

  expect(screen.getByText(/61 markets scanned/)).toBeVisible();
  // ABSOLUTE AND NOT RELATIVE. "Two minutes ago" is wrong the moment the page is
  // cached or the tab is left open, and freshness is this page's whole subject.
  expect(screen.getByText(/20:46 UTC/)).toBeVisible();
  expect(screen.getByText(/64495710/)).toBeVisible();
  expect(screen.getByRole('link')).toHaveAttribute('href', DASHBOARD_BASE);
});

it('says the engine was not reached rather than inventing a reading', () => {
  render(<EngineStatusView status={null} />);

  expect(
    screen.getByText(/Live engine status unavailable from this page/),
  ).toBeVisible();
  // AGENTS.md requires the landing page to stay useful without the API, so the
  // unreachable state still offers the surface that reads it directly.
  expect(screen.getByRole('link')).toHaveAttribute('href', DASHBOARD_BASE);
  expect(screen.queryByText(/markets scanned/)).toBeNull();
});

it('reports a degraded engine instead of hiding it behind a healthy count', () => {
  // `status: degraded` with a monitored count is the shape the API serves when the
  // scanner has not run yet. Showing the count alone would read as working.
  render(
    <EngineStatusView
      status={{
        assetsMonitored: 61,
        latestScanAt: null,
        latestScanLedgerSeq: null,
        degraded: true,
      }}
    />,
  );

  expect(screen.getByText(/no scan recorded yet/)).toBeVisible();
  expect(screen.queryByText(/UTC/)).toBeNull();
});

it('shows an unparseable scan time as served rather than guessing at it', () => {
  render(
    <EngineStatusView
      status={{
        assetsMonitored: 3,
        latestScanAt: 'not a timestamp',
        latestScanLedgerSeq: null,
        degraded: false,
      }}
    />,
  );

  expect(screen.getByText(/not a timestamp/)).toBeVisible();
});
