import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  RiskBadge,
  MetricValue,
  DepthLadder,
  ManipulationRungs,
  ProvenanceStrip,
} from '../components/keel/result';
import {
  healthy,
  poolOnly,
  noPrice,
  brokenBook,
  historical,
} from '../lib/keel/fixtures/fixtures';

describe('Keel result semantics', () => {
  it('shows partial confidence even for LOW', () => {
    render(<RiskBadge band="LOW" bandConfidence="partial" />);
    expect(screen.getByText('LOW')).toBeVisible();
    expect(screen.getByText('Partial confidence')).toBeVisible();
  });
  it('renders a measured zero and an unavailable value differently', () => {
    render(
      <>
        <MetricValue value="0.0000000" unit="XLM" />
        <MetricValue value={null} unit="XLM" />
      </>,
    );
    expect(screen.getByText('0')).toBeVisible();
    expect(screen.getByText('Not available')).toBeVisible();
  });
  it.each([healthy, poolOnly, noPrice, brokenBook, historical])(
    'renders $asset.code / $quote.code without changing its fixture',
    (asset) => {
      render(
        <>
          <RiskBadge band={asset.band} bandConfidence={asset.bandConfidence} />
          <DepthLadder result={asset} />
          <ProvenanceStrip result={asset} />
        </>,
      );
      expect(screen.getByText(asset.band)).toBeVisible();
      expect(screen.getByText(asset.methodologyVersion)).toBeVisible();
      if (asset.flags.includes('SPREAD_EXTREME'))
        expect(
          screen.getByText(/reference price is unreliable/i),
        ).toBeVisible();
      if (asset.priceSource === 'none')
        expect(screen.getByText(/no executable price/i)).toBeVisible();
    },
  );
  it('never presents exhausted-book costs as costs of reaching a target', () => {
    render(<ManipulationRungs result={brokenBook} />);
    expect(screen.getByText('Reachable at zero cost')).toBeVisible();
    expect(
      screen.getAllByText('Not reachable; book exhausted').length,
    ).toBeGreaterThan(0);
  });
  it('labels trade reconstruction as a lower bound', () => {
    render(
      <ProvenanceStrip
        result={{ ...historical, dataSource: 'trades-implied' }}
      />,
    );
    expect(screen.getByText('Lower bound from executed trades')).toBeVisible();
  });
});
