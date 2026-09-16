import { VENUE_TOKENS } from '@/lib/design/tokens';
import { barRatios, stackRatio, toPercent } from '@/lib/chart/geometry';
import type { DepthPoint } from '@/lib/api/types';
import { classify } from '@/lib/format/value';
import { cn } from '@/lib/utils';

import { Value } from './value';

/**
 * Three rungs, two sides, one scale.
 *
 * `depth[]` holds exactly three entries, at 2, 5 and 10 per cent. It is not a
 * continuous function, so it is drawn as bars rather than as a curve: an area chart
 * through three points invents values between them that the engine never computed.
 *
 * Every bar shares one scale, so rungs are comparable across the ladder. A bar that
 * filled its own row would make every rung look equally deep.
 *
 * ON THE VENUE SPLIT. `fromSdex + fromAmm` equals `buySide` exactly — verified against
 * the live API on every rung of every monitored asset checked — and does NOT equal
 * `sellSide`. So the split decomposes the buy side only. The sell bar is drawn as an
 * outline rather than given a venue colour it has no claim to: its composition is not
 * reported, which is different from being unmeasured.
 *
 * The two venues are never presented as two numbers to be added. The stack is a
 * decomposition of a combined figure the engine produced through one shared
 * marginal-price bound.
 */

export interface DepthLadderProps {
  depth: readonly DepthPoint[];
  quoteCode: string;
  className?: string;
}

export function DepthLadder({ depth, quoteCode, className }: DepthLadderProps) {
  // One scale across both sides and all three rungs.
  const ratios = barRatios([
    ...depth.map((rung) => rung.buySide),
    ...depth.map((rung) => rung.sellSide),
  ]);
  const buyRatios = ratios.slice(0, depth.length);
  const sellRatios = ratios.slice(depth.length);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Legend />

      {depth.map((rung, index) => (
        <div key={rung.delta} className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-[var(--keel-ink-strong)]">
            {formatDelta(rung.delta)} from mid
          </p>

          <Row
            label="Buy side"
            ratio={buyRatios[index] ?? null}
            total={rung.buySide}
            quoteCode={quoteCode}
            segments={[
              {
                label: VENUE_TOKENS.sdex.label,
                colour: VENUE_TOKENS.sdex.mark,
                ratio: stackRatio(rung.fromSdex, rung.buySide),
                exact: rung.fromSdex,
              },
              {
                label: VENUE_TOKENS.amm.label,
                colour: VENUE_TOKENS.amm.mark,
                ratio: stackRatio(rung.fromAmm, rung.buySide),
                exact: rung.fromAmm,
              },
            ]}
          />

          <Row
            label="Sell side"
            ratio={sellRatios[index] ?? null}
            total={rung.sellSide}
            quoteCode={quoteCode}
            outlined
          />
        </div>
      ))}

      <p className="text-xs text-[var(--keel-muted)]">
        Bars share one scale. The venue split decomposes the buy side; the sell side is
        drawn as an outline because its composition is not reported.
      </p>
    </div>
  );
}

interface Segment {
  label: string;
  colour: string;
  ratio: number | null;
  exact: string;
}

function Row({
  label,
  ratio,
  total,
  quoteCode,
  segments,
  outlined = false,
}: {
  label: string;
  ratio: number | null;
  total: string;
  quoteCode: string;
  segments?: Segment[];
  outlined?: boolean;
}) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2 text-sm">
      <span className="text-[var(--keel-muted)]">{label}</span>

      <div className="h-5 w-full rounded-sm bg-[var(--keel-surface-subtle)]">
        {ratio === null ? (
          <div className="keel-hatch-unmeasured h-full w-full rounded-sm" />
        ) : (
          <div
            className={cn(
              'flex h-full gap-[2px] overflow-hidden rounded-sm',
              outlined && 'border border-[var(--keel-border-strong)] bg-[var(--keel-surface)]',
            )}
            style={{ width: toPercent(ratio) }}
          >
            {segments?.map((segment) =>
              segment.ratio === null ? null : (
                <span
                  key={segment.label}
                  className="h-full first:rounded-l-sm last:rounded-r-sm"
                  style={{
                    width: toPercent(segment.ratio),
                    backgroundColor: segment.colour,
                  }}
                  title={`${segment.label}: ${segment.exact} ${quoteCode}`}
                />
              ),
            )}
          </div>
        )}
      </div>

      <span className="text-right">
        <Value value={classify(total, quoteCode)} maxFractionDigits={2} />
      </span>
    </div>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--keel-muted)]">
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="size-2.5 rounded-xs"
          style={{ backgroundColor: VENUE_TOKENS.sdex.mark }}
        />
        {VENUE_TOKENS.sdex.label}
      </li>
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="size-2.5 rounded-xs"
          style={{ backgroundColor: VENUE_TOKENS.amm.mark }}
        />
        {VENUE_TOKENS.amm.label}
      </li>
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="size-2.5 rounded-xs border border-[var(--keel-border-strong)] bg-[var(--keel-surface)]"
        />
        Sell side, composition not reported
      </li>
    </ul>
  );
}

/** `0.02` is two per cent. The delta is a contract enum, not a measured value. */
function formatDelta(delta: DepthPoint['delta']): string {
  return delta === 0.02 ? '2%' : delta === 0.05 ? '5%' : '10%';
}
