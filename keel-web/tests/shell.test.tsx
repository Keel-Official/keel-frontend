import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { KpiStrip } from '@/components/keel/kpi-strip';
import { Notice } from '@/components/keel/notice';
import { Provenance } from '@/components/keel/provenance';
import { classifyCount } from '@/lib/format/value';

afterEach(cleanup);

describe('Provenance', () => {
  it('puts the ledger and the methodology version on screen', () => {
    render(<Provenance methodologyVersion="1.0.8-draft" ledgerSeq={64457447} stalenessSeconds="5" />);
    expect(screen.getByText('1.0.8-draft')).toBeInTheDocument();
    expect(screen.getByText('64,457,447')).toBeInTheDocument();
    expect(screen.getByText('5s')).toBeInTheDocument();
  });

  it('says staleness is not reported rather than showing a zero', () => {
    // /health and /methodology do not send X-Keel-Staleness-Seconds.
    const { container } = render(
      <Provenance methodologyVersion="1.0.8-draft" ledgerSeq={1} stalenessSeconds={null} />,
    );
    expect(within(container).getAllByText('not reported').length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain('0s');
  });

  it('reports an unknown ledger rather than rendering an empty slot', () => {
    const { container } = render(<Provenance methodologyVersion={null} />);
    expect(container.textContent).toContain('not reported');
  });
});

describe('KpiStrip', () => {
  it('renders a figure tile and a text tile', () => {
    render(
      <KpiStrip
        items={[
          { key: 'assets', label: 'Assets monitored', value: classifyCount(61) },
          { key: 'method', label: 'Methodology', text: '1.0.8-draft' },
        ]}
      />,
    );
    expect(screen.getByText('Assets monitored')).toBeInTheDocument();
    expect(screen.getByText('61')).toBeInTheDocument();
    expect(screen.getByText('1.0.8-draft')).toBeInTheDocument();
  });

  it('shows an unmeasured tile as unmeasured, not as zero', () => {
    const { container } = render(
      <KpiStrip items={[{ key: 'a', label: 'Assets monitored', value: classifyCount(null) }]} />,
    );
    expect(container.textContent).toContain('not computed');
    expect(container.textContent).not.toContain('0');
  });

  it('shows an absent text reading rather than an empty tile', () => {
    const { container } = render(
      <KpiStrip items={[{ key: 'm', label: 'Methodology', text: null }]} />,
    );
    expect(container.textContent).toContain('not reported');
  });

  it('renders a note when one is supplied', () => {
    render(
      <KpiStrip
        items={[{ key: 'e', label: 'Engine', text: 'ok', note: 'Historical replay unavailable' }]}
      />,
    );
    expect(screen.getByText('Historical replay unavailable')).toBeInTheDocument();
  });
});

describe('Notice', () => {
  it("shows the API's own message verbatim", () => {
    // ASSET_NOT_MONITORED covers two conditions and the message is what separates them.
    const message = 'Historical replay is not available. The Hubble path is deferred; see DEC-002.';
    render(<Notice tone="problem" title="The engine reported HISTORICAL_UNAVAILABLE" detail={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('announces a problem to assistive technology', () => {
    render(<Notice tone="problem" title="The Keel API could not be reached" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not announce an empty state as an alert', () => {
    render(<Notice tone="empty" title="Not built yet" />);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
