import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CollateralCeilingPanel } from '@/components/keel/collateral-ceiling';
import { EngineWarnings } from '@/components/keel/engine-warnings';
import { FigureList } from '@/components/keel/figure-list';
import { FlagGroups } from '@/components/keel/flag-groups';
import { readCollateralCeiling } from '@/lib/format/collateral';
import { classify } from '@/lib/format/value';

afterEach(cleanup);

describe('FigureList', () => {
  it('keeps an absent reading and a null one apart on a text row', () => {
    const { container } = render(
      <FigureList
        rows={[
          { key: 'absent', label: 'Absent', text: undefined },
          { key: 'null', label: 'Null', text: null },
        ]}
      />,
    );

    expect(container.textContent).toContain('not reported');
    expect(container.textContent).toContain('not computed');
  });

  it('never renders a missing reading as an empty line', () => {
    const { container } = render(
      <FigureList rows={[{ key: 'k', label: 'Label', text: null }]} />,
    );
    expect(container.textContent).not.toBe('Label');
  });

  it('sends a numeric row through the value component', () => {
    const { container } = render(
      <FigureList
        rows={[{ key: 'k', label: 'Ceiling', value: classify('0', 'USDC') }]}
      />,
    );
    // A computed zero is a measurement and keeps its exact string on the element.
    expect(container.querySelector('[data-state="zero"]')?.getAttribute('data-exact')).toBe(
      '0',
    );
  });
});

describe('CollateralCeilingPanel', () => {
  it('marks the manipulation term as not applicable rather than as zero', () => {
    // XLM, live: the term was not applied because the critical target is unreachable
    // through the order book. Rendering that as 0 would claim the attack is free.
    const ceiling = readCollateralCeiling(
      {
        maxSafeCollateral: '156164.54',
        maxSafeCollateralLiquidation: '156164.54',
        maxSafeCollateralManipulation: null,
      },
      'USDC',
    );

    const { container } = render(<CollateralCeilingPanel ceiling={ceiling} />);

    expect(container.textContent).toContain('not applicable');
    expect(container.textContent).toContain('Limited by liquidation depth');
    expect(container.textContent).not.toContain('not computed');
  });

  it('does not borrow the unreachable-target reason when nothing was computed', () => {
    // The no-price example from the contract mock. Every term is null because the asset
    // has no executable price, which is not the reason the contract attaches to a null
    // manipulation term — and the engine's own warning says what the reason is.
    const ceiling = readCollateralCeiling(
      {
        maxSafeCollateral: null,
        maxSafeCollateralLiquidation: null,
        maxSafeCollateralManipulation: null,
      },
      'XLM',
    );

    const { container } = render(<CollateralCeilingPanel ceiling={ceiling} />);

    expect(ceiling.manipulationTerm).toBe('unmeasured');
    expect(container.textContent).not.toContain('not reachable through the order book');
    expect(container.textContent).not.toContain('not applicable');
    expect(container.textContent).toContain('No ceiling was computed');
  });

  it('names the binding term when the ceiling is a computed zero', () => {
    // ACT, live. The ceiling is zero and the manipulation term is what put it there.
    const ceiling = readCollateralCeiling(
      {
        maxSafeCollateral: '0',
        maxSafeCollateralLiquidation: '4.422327473454986756077922832380496760127728142446',
        maxSafeCollateralManipulation: '0',
      },
      'USDC',
    );

    render(<CollateralCeilingPanel ceiling={ceiling} />);

    expect(screen.getByText(/Limited by manipulation cost/)).toBeInTheDocument();
    expect(screen.getAllByText('binds')).toHaveLength(1);
  });

  it('raises an alert when the ceiling matches neither term', () => {
    const ceiling = readCollateralCeiling(
      {
        maxSafeCollateral: '7',
        maxSafeCollateralLiquidation: '9',
        maxSafeCollateralManipulation: '11',
      },
      'USDC',
    );

    render(<CollateralCeilingPanel ceiling={ceiling} />);
    expect(screen.getByRole('alert').textContent).toContain('neither term');
  });
});

describe('FlagGroups', () => {
  it('counts unevaluated checks without splitting the word', () => {
    // Rendering against live data produced "6 check s": JSX collapsed the line break
    // between the noun and its plural suffix into a space.
    const { container } = render(
      <FlagGroups
        triggered={[]}
        unevaluated={['NO_GENUINE_TRADE_7D', 'WASH_TRADE_SUSPECTED']}
      />,
    );

    expect(container.textContent).toContain('2 checks could not run');
    expect(container.textContent).not.toContain('check s');
  });

  it('uses the singular for one unevaluated check', () => {
    const { container } = render(
      <FlagGroups triggered={[]} unevaluated={['WASH_TRADE_SUSPECTED']} />,
    );

    expect(container.textContent).toContain('1 check could not run');
    expect(container.textContent).not.toContain('1 checks');
  });

  it('does not call an empty triggered list a pass while checks are outstanding', () => {
    const { container } = render(
      <FlagGroups triggered={[]} unevaluated={['WASH_TRADE_SUSPECTED']} />,
    );

    expect(container.textContent).toContain('This is not a clean result');
    expect(container.textContent).not.toContain('every check ran.');
  });
});

describe('EngineWarnings', () => {
  it('renders the engine wording verbatim', () => {
    const warning =
      'manipulation to delta 0.5 is unreachable through the order book; the manipulation term was not applied';

    render(<EngineWarnings warnings={[warning]} />);
    expect(screen.getByText(warning)).toBeInTheDocument();
  });

  it('renders nothing when the engine sent no warnings', () => {
    const { container } = render(<EngineWarnings warnings={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
