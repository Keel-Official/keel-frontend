import { Ban, Check, CircleDashed } from 'lucide-react';

import type { AssetRisk } from '@/lib/keel/api/types';
import { BAND_TOKENS, CONFIDENCE_TOKENS } from '@/lib/keel/design/tokens';
import {
  BINDING_WORDS,
  readCollateralCeiling,
} from '@/lib/keel/format/collateral';
import {
  classifyManipulation,
  formatManipulationDelta,
} from '@/lib/keel/format/cost';
import { assessFlags } from '@/lib/keel/format/flags';
import { classify } from '@/lib/keel/format/value';
import { cn } from '@/lib/keel/utils';

import { BAND_ICONS } from './band-chip';
import { TermMark } from './term';
import { Value } from './value';

/**
 * The answer to the question a reader opens an asset for, before anything else.
 *
 * Every figure here is from the CURRENT reading — the `/depth` response — and never
 * from the stored series. The chart below describes a window; this describes now, and
 * the two used to be mixed on one row of tabs, where a figure from the end of a daily
 * window could sit beside a reading from this morning with nothing saying which was
 * which.
 *
 * Five figures and no more, each with the qualifier the contract says it cannot be
 * shown without:
 *   - the band, with its confidence;
 *   - the collateral ceiling, with the term that binds it;
 *   - buy- and sell-side depth at five per cent;
 *   - the cost to reach the critical target, with whether it is reachable at all;
 *   - the checks that fired, with the checks that could not run.
 * The evidence behind each is in the detail panel lower down.
 */
export function VerdictStrip({
  risk,
  className,
}: {
  risk: AssetRisk;
  className?: string;
}) {
  const quote = risk.quote.code;
  const band = BAND_TOKENS[risk.band];
  const BandIcon = BAND_ICONS[band.icon];
  const confidence = CONFIDENCE_TOKENS[risk.bandConfidence];
  const ceiling = readCollateralCeiling(risk, quote);
  const five = risk.depth.find((rung) => rung.delta === 0.05);
  const flags = assessFlags(risk.flags, risk.unevaluatedFlags);

  // The critical rung is the engine's, read from its own response rather than assumed.
  // Without `oracleResistance` there is no critical delta to look up, and the cell says
  // so instead of picking a rung on the engine's behalf.
  const criticalDelta = risk.oracleResistance?.criticalDelta ?? null;
  const criticalRung =
    criticalDelta === null
      ? undefined
      : risk.manipulationCostOrderbookOnly.find(
          (rung) => rung.delta === criticalDelta,
        );
  const outcome = criticalRung
    ? classifyManipulation(criticalRung, quote)
    : null;

  return (
    <section
      aria-label="The current reading"
      className={cn(
        'keel-panel grid overflow-hidden lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]',
        className,
      )}
    >
      {/* The band carries its own tint because it is the one severity figure here;
          the word and the icon silhouette carry it too, so it is never colour alone. */}
      <div
        className="flex flex-col justify-center gap-1.5 border-b border-[var(--keel-border)] px-5 py-4 lg:border-r lg:border-b-0"
        style={{ backgroundColor: band.surface, color: band.ink }}
      >
        <p className="keel-marker !text-current">Risk band</p>
        <p className="flex items-center gap-2 text-2xl leading-none font-bold">
          <BandIcon
            aria-hidden="true"
            className="size-6 shrink-0"
            strokeWidth={2.25}
          />
          {band.label}
        </p>
        <p
          className="flex items-center gap-1.5 text-sm"
          style={{ color: confidence.ink }}
        >
          {confidence.label}
          {risk.bandConfidence === 'partial' ? (
            <TermMark name="partial" />
          ) : null}
        </p>
        {risk.bandConfidence === 'partial' ? (
          <p className="text-xs text-[var(--keel-ink)]">
            A floor: the real band can only be worse.
          </p>
        ) : null}
      </div>

      {/* Hairlines between the cells are the dl's own background showing through a
          one-pixel gap, so they are right at every column count without per-cell rules. */}
      <dl className="grid grid-cols-1 gap-px bg-[var(--keel-border)] sm:grid-cols-2 xl:grid-cols-4">
        <Cell label="Max safe collateral" term="collateral">
          <Value value={ceiling.ceiling} maxFractionDigits={2} />
          <Caption>{BINDING_WORDS[ceiling.binding]}</Caption>
        </Cell>

        <Cell label="Depth within 5%" term="depth">
          {five ? (
            <span className="flex flex-col gap-0.5">
              <Side label="buy">
                <Value
                  value={classify(five.buySide, quote)}
                  maxFractionDigits={2}
                />
              </Side>
              <Side label="sell">
                <Value
                  value={classify(five.sellSide, quote)}
                  maxFractionDigits={2}
                />
              </Side>
            </span>
          ) : (
            <Missing>No five per cent rung was returned</Missing>
          )}
        </Cell>

        <Cell
          label={
            criticalRung
              ? `Cost to move ${formatManipulationDelta(criticalRung.delta)}`
              : 'Cost to reach the critical move'
          }
          term="manipulation"
        >
          {outcome === null ? (
            <Missing>
              {risk.priceSource === 'none'
                ? 'Not computed: no executable price'
                : 'The engine sent no critical rung'}
            </Missing>
          ) : (
            <>
              {outcome.kind === 'unreachable' ? (
                // Not typeset as a price: on an unreachable rung the figure is how far
                // the book goes, not what the move costs.
                <span className="text-base font-semibold text-[var(--keel-muted)]">
                  Not reachable
                </span>
              ) : (
                <Value value={outcome.cost} maxFractionDigits={2} />
              )}
              <Caption>
                {outcome.kind === 'unreachable' ? (
                  <>
                    <Ban aria-hidden="true" className="size-3.5 shrink-0" />
                    The order book cannot reach the target
                  </>
                ) : (
                  <>
                    <Check aria-hidden="true" className="size-3.5 shrink-0" />
                    {outcome.kind === 'free'
                      ? 'Reachable at no cost: nothing stands in the way'
                      : 'Reachable through the order book'}
                  </>
                )}
              </Caption>
            </>
          )}
        </Cell>

        <Cell label="Checks" term="flags">
          <span className="flex flex-col gap-0.5 text-base">
            <span className="text-[var(--keel-ink-strong)]">
              <span className="tabular font-bold">
                {flags.triggered.length}
              </span>{' '}
              triggered
            </span>
            <span className="flex items-center gap-1.5 text-[var(--keel-muted)]">
              <CircleDashed
                aria-hidden="true"
                className="size-3.5 shrink-0 text-[var(--unmeasured)]"
              />
              <span className="tabular font-bold">
                {flags.unevaluated.length}
              </span>{' '}
              not evaluated
            </span>
          </span>
        </Cell>
      </dl>
    </section>
  );
}

function Cell({
  label,
  term,
  children,
}: {
  label: string;
  term: Parameters<typeof TermMark>[0]['name'];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 bg-[var(--keel-surface)] px-5 py-4">
      <dt className="keel-marker flex items-center gap-1.5">
        {label}
        <TermMark name={term} />
      </dt>
      <dd className="flex min-w-0 flex-col gap-1 text-lg leading-tight font-bold break-words text-[var(--keel-ink-strong)]">
        {children}
      </dd>
    </div>
  );
}

function Side({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="w-8 shrink-0 text-xs font-normal text-[var(--keel-muted)]">
        {label}
      </span>
      <span className="text-base">{children}</span>
    </span>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 text-xs font-normal text-[var(--keel-muted)]">
      {children}
    </span>
  );
}

function Missing({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-normal text-[var(--unmeasured)] italic">
      {children}
    </span>
  );
}
