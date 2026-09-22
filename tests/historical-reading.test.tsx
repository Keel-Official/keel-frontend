import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EngineWarnings } from '../components/dashboard/engine-warnings';
import { LedgerPicker } from '../components/dashboard/ledger-picker';
import {
  deltaPercent,
  oracleRows,
  priceRows,
  reachRows,
  windowLabel,
} from '../components/dashboard/reading-rows';
import { ReconstructionPanel } from '../components/dashboard/reconstruction-panel';
import type { FigureRow } from '../components/dashboard/figure-list';
import BacktestPage from '../app/(marketing)/backtest/page';
import { RECONSTRUCTED_LEDGERS } from '../lib/backtest';
import { healthy, historical, noPrice } from '../lib/keel/fixtures/fixtures';
import { assetAtLedgerPath, parseLedger } from '../lib/keel/url/ledger';
import {
  HISTORY_SOURCES,
  isStoredRangeSource,
} from '../lib/keel/assets/history-range';
import type { DataSource } from '../lib/keel/format/flags';

/**
 * The historical path, contract 1.7.0.
 *
 * A reconstructed row is a book rebuilt from the operation stream. Every gap the
 * rebuild knows about removes offers, so the page has to say "lower bound" before it
 * shows a single depth figure, and carry the engine's own counts of those gaps.
 */

function row(rows: readonly FigureRow[], key: string) {
  const found = rows.find((r) => r.key === key);
  if (!found) throw new Error(`no row ${key}`);
  return found;
}

describe('the ledger parameter', () => {
  it('accepts a positive whole ledger and drops anything else', () => {
    expect(parseLedger('61340262')).toBe(61340262);
    expect(parseLedger(['61340172', '1'])).toBe(61340172);
    expect(parseLedger(' 61340263 ')).toBe(61340263);
    for (const bad of [
      undefined,
      '',
      '0',
      '-5',
      '1.5',
      '1e6',
      'abc',
      '99999999999',
    ])
      expect(parseLedger(bad), String(bad)).toBeNull();
  });

  it('builds a link to one asset at one ledger without double encoding', () => {
    const id = 'USTRY:GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC';
    const path = assetAtLedgerPath(id, 61340262);
    expect(path).toBe(
      `/dashboard/asset/${encodeURIComponent(id)}?ledger=61340262`,
    );
    expect(assetAtLedgerPath(encodeURIComponent(id), 61340262)).toBe(path);
  });

  it('is asked for with a plain GET form that lands on the asset page', () => {
    const { container } = render(
      <LedgerPicker assetId="USTRY:GABC" current={61340262} />,
    );
    const form = container.querySelector('form')!;
    expect(form.getAttribute('method')).toBe('get');
    expect(form.getAttribute('action')).toBe('/dashboard/asset/USTRY%3AGABC');
    const input = screen.getByLabelText(/Read at ledger/i);
    expect(input).toHaveAttribute('name', 'ledger');
    expect(input).toHaveValue('61340262');
  });
});

describe('a reconstructed reading', () => {
  it('says lower bound, and carries every counter the engine served', () => {
    render(
      <ReconstructionPanel risk={historical} liveHref="/dashboard/asset/X" />,
    );
    expect(
      screen.getByRole('heading', { name: /A past reading, at ledger/ }),
    ).toHaveTextContent(String(historical.ledgerSeq));
    expect(screen.getByText(/rebuilt, not observed/)).toHaveTextContent(
      /lower bound.*upper bound/,
    );
    const rec = historical.reconstruction!;
    expect(screen.getByText(/Out of/)).toHaveTextContent(
      `Out of ${rec.accountsWalked} accounts walked, with an operation floor at ledger ${rec.floorLedger}.`,
    );
    const stopped = screen.getByText(
      'Walks stopped at the floor',
    ).parentElement!;
    expect(within(stopped).getByText(String(rec.stoppedAtFloor))).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Back to the live reading' }),
    ).toHaveAttribute('href', '/dashboard/asset/X');
  });

  it('frames a past reading without counters when nothing was rebuilt', () => {
    render(
      <ReconstructionPanel
        risk={{
          ...historical,
          dataSource: 'horizon',
          reconstruction: undefined,
        }}
        liveHref="/x"
      />,
    );
    expect(screen.queryByText(/rebuilt, not observed/)).toBeNull();
    expect(screen.queryByText(/What the reconstruction reports/)).toBeNull();
    expect(
      screen.getByText(/describes the market at that ledger/),
    ).toBeVisible();
  });
});

describe('the engine warnings', () => {
  it('are rendered verbatim, in the order served', () => {
    render(<EngineWarnings warnings={historical.warnings} />);
    const items = screen.getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(historical.warnings);
  });

  it('say so when there are none, rather than rendering an empty list', () => {
    render(<EngineWarnings warnings={[]} />);
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getByText(/no warnings/)).toBeVisible();
  });
});

describe('the figures the detail view used to leave on the wire', () => {
  it('writes a delta as a percentage without float noise', () => {
    expect(deltaPercent(0.02)).toBe('2%');
    expect(deltaPercent(0.07)).toBe('7%');
    expect(deltaPercent(0.5)).toBe('50%');
    expect(windowLabel(900)).toBe('900 seconds (15 minutes)');
    expect(windowLabel(60)).toBe('60 seconds (1 minute)');
    expect(windowLabel(45)).toBe('45 seconds');
  });

  it('keeps a null ratio unmeasured rather than zero', () => {
    // No genuine trade in the window, so the ratio cannot be computed.
    const rows = oracleRows(historical)!;
    const ratio = row(rows, 'ratio');
    expect('value' in ratio && ratio.value.state).toBe('unknown');
    const genuine = row(rows, 'genuine');
    expect('value' in genuine && genuine.value.state).toBe('zero');
    expect(genuine.note).toContain('900 seconds (15 minutes)');
  });

  it('says there is nothing to move when there is no executable price', () => {
    expect(oracleRows({ ...noPrice, oracleResistance: null })).toBeNull();
  });

  it('warns that an unreachable target is a cost of exhausting the book', () => {
    const oracle = {
      ...healthy.oracleResistance!,
      reachable: false,
      ratio: null,
    };
    const rows = oracleRows({ ...healthy, oracleResistance: oracle })!;
    expect(String(row(rows, 'critical').note)).toMatch(/NOT reachable/);
  });

  it('tells a missing key from a served null', () => {
    const rows = priceRows({
      ...healthy,
      bandDrivenBy: undefined,
      poolSpotPrice: null,
    });
    // Declared but never populated yet, so an absent key adds no row at all.
    expect(rows.find((r) => r.key === 'bandDrivenBy')).toBeUndefined();
    const withDriver = priceRows({
      ...healthy,
      bandDrivenBy: healthy.quote,
      xlmUsdcRate: null,
    });
    const driver = row(withDriver, 'bandDrivenBy');
    expect('text' in driver && driver.text).toBe(healthy.quote.code);
    const rate = row(withDriver, 'xlmUsdc');
    expect('value' in rate && rate.value.state).toBe('unknown');
    const pool = row(rows, 'poolSpot');
    expect('value' in pool && pool.value.state).toBe('unknown');
    expect(row(rows, 'mid').note).toMatch(/Order book mid|pool|No executable/);
  });

  it('reads the top of the book as a pair', () => {
    const rows = reachRows(historical);
    expect(rows.map((r) => r.key)).toEqual(['maxReachable', 'costToMax']);
  });
});

describe('the backtest page', () => {
  it('opens each reconstructed ledger in the dashboard, and copies none of its figures', () => {
    const { container } = render(<BacktestPage />);
    const section = container.querySelector('#ledgers')!;
    const links = within(section as HTMLElement).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(
      RECONSTRUCTED_LEDGERS.map(({ ledger }) =>
        assetAtLedgerPath(
          'USTRY:GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC',
          ledger,
        ),
      ),
    );
    // The band at each ledger is the engine's to say, so the page must not state one.
    expect(section.textContent).not.toMatch(/CRITICAL|LOW|HIGH|MEDIUM/);
  });
});

describe('a stored-range source', () => {
  it('names the sources whose rows exist only where a replay ran', () => {
    // The scan writes a horizon row every fifteen minutes, so a window lands on
    // rows. A reconstruction is written by keel replay, at three ledgers in
    // February 2026, and the engine caps one windowed request at 90 days: no
    // window this dashboard offers can contain them. Contract 1.8.0 lets the
    // window be omitted, and these are the sources that must omit it.
    expect(isStoredRangeSource('offers-implied')).toBe(true);
    expect(isStoredRangeSource('trades-implied')).toBe(true);
    expect(isStoredRangeSource('horizon')).toBe(false);
    expect(isStoredRangeSource('hubble')).toBe(false);
  });

  it('is exactly the set the window pickers are hidden for', () => {
    // Every source the UI offers is classified, so adding one to the contract
    // cannot leave it silently treated as windowed.
    const sources = Object.keys(HISTORY_SOURCES) as DataSource[];
    expect(sources.filter(isStoredRangeSource).sort()).toEqual([
      'offers-implied',
      'trades-implied',
    ]);
  });
});
