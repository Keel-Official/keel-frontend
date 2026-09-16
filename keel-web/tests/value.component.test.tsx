import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Value } from '@/components/keel/value';
import { classify, classifyCount } from '@/lib/format/value';

afterEach(cleanup);

describe('Value', () => {
  it('renders a figure with its unit', () => {
    render(<Value value={classify('1234.5', 'USDC')} />);
    expect(screen.getByText(/1,234\.5 USDC/)).toBeInTheDocument();
  });

  it('renders a computed zero as a figure, not as a missing value', () => {
    const { container } = render(<Value value={classify('0.0000000', 'USDC')} />);
    expect(container.textContent).toContain('0.0000000 USDC');
    expect(container.textContent).not.toContain('not computed');
    expect(container.querySelector('[data-state="zero"]')).not.toBeNull();
  });

  it('never renders null as a zero or a dash', () => {
    const { container } = render(<Value value={classify(null, 'USDC')} />);
    expect(container.textContent).toBe('not computed');
    expect(container.textContent).not.toContain('0');
    expect(container.textContent).not.toBe('-');
  });

  it('distinguishes an absent field from a null one', () => {
    const absent = render(<Value value={classify(undefined)} />).container.textContent;
    cleanup();
    const nul = render(<Value value={classify(null)} />).container.textContent;
    expect(absent).toBe('not reported');
    expect(nul).toBe('not computed');
    expect(absent).not.toBe(nul);
  });

  it('keeps the exact string reachable when the display is shortened', () => {
    const exact = '158493.937041927835527438180617150479700224505053101718';
    const { container } = render(
      <Value value={classify(exact, 'USDC')} maxFractionDigits={4} />,
    );
    const span = container.querySelector('[data-exact]');

    expect(span?.getAttribute('data-exact')).toBe(exact);
    expect(span?.getAttribute('title')).toBe(`${exact} USDC`);
    expect(container.textContent).toContain('158,493.9370');
  });

  it('marks a shortened figure for a screen reader as well as visually', () => {
    render(<Value value={classify('1.23456789')} maxFractionDigits={2} />);
    expect(screen.getByText(/shortened; full value 1\.23456789/)).toBeInTheDocument();
  });

  it('does not mark a figure that was shown whole', () => {
    const { container } = render(<Value value={classify('1.5')} maxFractionDigits={4} />);
    expect(container.querySelector('[data-exact]')?.getAttribute('title')).toBeNull();
    expect(container.textContent).not.toContain('…');
  });

  it('renders an integer count without a unit', () => {
    const { container } = render(<Value value={classifyCount(64457447)} />);
    expect(container.textContent).toBe('64,457,447');
  });

  it('reports an absent count rather than showing nothing', () => {
    const { container } = render(<Value value={classifyCount(undefined)} />);
    expect(container.textContent).toBe('not reported');
  });
});
