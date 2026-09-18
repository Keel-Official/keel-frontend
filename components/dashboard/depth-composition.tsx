import type { DepthPoint } from '@/lib/keel/api/types';
import { stackRatio } from '@/lib/keel/chart/geometry';
import { VENUE_TOKENS } from '@/lib/keel/design/tokens';
import { classify } from '@/lib/keel/format/value';
import { cn } from '@/lib/keel/utils';

import { Term } from './term';
import { Value } from './value';

/**
 * Where the depth comes from, rung by rung.
 *
 * The depth ladder answers how much. This answers what it is made of, and they are
 * different questions: a market whose depth is all AMM behaves differently under stress
 * from one whose depth is posted offers, because a pool quotes at any size while an
 * order book runs out.
 *
 * ONE PIE PER RUNG, NOT ONE PIE. The three rungs are three different splits, and a
 * single pie can only hold one of them. Small multiples keep the comparison the reader
 * actually makes — how composition changes as you walk out from mid — on one screen.
 * Each pie is normalised to its own rung, so the set compares COMPOSITION rather than
 * magnitude; magnitude is the ladder's job, and encoding both in one circle would mean
 * neither could be read off it.
 *
 * THE SPLIT IS ALSO WRITTEN OUT. Two slices at 99.9/0.1 are a circle and an invisible
 * sliver, so the percentages sit under every pie as text. The geometry is the glance;
 * the numbers are the reading. That also keeps identity off colour alone, which the
 * legend and these labels both carry.
 *
 * ON THE ARITHMETIC. `fromSdex + fromAmm` equals `buySide` exactly, verified against the
 * live API on every rung of every monitored asset checked. It does NOT equal `sellSide`,
 * so this decomposition is the buy side only and says so rather than implying the sell
 * side is composed the same way. The two venues are never presented as two numbers to
 * be added: they decompose one combined figure the engine produced through a single
 * shared marginal-price bound.
 */

export interface DepthCompositionProps {
  depth: readonly DepthPoint[];
  quoteCode: string;
  className?: string;
}

/** Radius the wedges are drawn at. The 2px seam between slices eats into this. */
const R = 47;

export function DepthComposition({
  depth,
  quoteCode,
  className,
}: DepthCompositionProps) {
  if (depth.length === 0) {
    return (
      <p className={cn('text-sm text-[var(--unmeasured)] italic', className)}>
        The engine returned no depth rungs for this asset, so there is nothing
        to decompose.
      </p>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--keel-muted)]">
        <li className="flex items-center gap-1.5">
          <Swatch colour={VENUE_TOKENS.sdex.mark} />
          {VENUE_TOKENS.sdex.label}
        </li>
        <li className="flex items-center gap-1.5">
          <Swatch colour={VENUE_TOKENS.amm.mark} />
          {VENUE_TOKENS.amm.label}
        </li>
        <li>
          <Term name="venues">
            <span className="sr-only">Venues</span>
          </Term>
        </li>
      </ul>

      <ul className="mx-auto grid w-full max-w-2xl gap-5 sm:grid-cols-3">
        {depth.map((rung) => {
          const sdex = stackRatio(rung.fromSdex, rung.buySide);
          const amm = stackRatio(rung.fromAmm, rung.buySide);
          const drawable = sdex !== null && amm !== null;
          const delta = formatDelta(rung.delta);

          return (
            <li
              key={rung.delta}
              className="flex flex-col items-center gap-2 text-center"
            >
              <p className="text-xs text-[var(--keel-muted)]">
                {delta} from mid
              </p>

              {drawable ? (
                <svg
                  viewBox="-50 -50 100 100"
                  className="size-24"
                  role="img"
                  aria-label={`At ${delta} from mid, ${percent(sdex)} of buy-side depth is from the order book and ${percent(amm)} is from pools.`}
                >
                  <Pie
                    sdex={sdex}
                    sdexTitle={`${VENUE_TOKENS.sdex.label}: ${rung.fromSdex} ${quoteCode}`}
                    ammTitle={`${VENUE_TOKENS.amm.label}: ${rung.fromAmm} ${quoteCode}`}
                  />
                </svg>
              ) : (
                // Not an empty circle: a share the engine did not report is not a
                // share of nothing.
                <div
                  className="keel-hatch-unmeasured size-24 rounded-full"
                  role="img"
                  aria-label={`The engine did not report a venue split at ${delta} from mid.`}
                />
              )}

              <p className="text-sm text-[var(--keel-ink)]">
                <Value
                  value={classify(rung.buySide, quoteCode)}
                  maxFractionDigits={2}
                />
              </p>

              <p className="text-xs text-[var(--keel-muted)]">
                {drawable ? (
                  <>
                    <span className="tabular">{percent(sdex)}</span> order book
                    <br />
                    <span className="tabular">{percent(amm)}</span> pools
                  </>
                ) : (
                  'No venue split reported.'
                )}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-[var(--keel-muted)]">
        Each pie is normalised to its own rung, so they compare composition
        rather than size. The split covers the buy side; the engine does not
        report how the sell side is composed.
      </p>
    </div>
  );
}

/**
 * The two slices.
 *
 * The MAJORITY venue is the whole circle and the minority is a wedge laid on top,
 * rather than two wedges meeting. Two wedges would mean drawing a near-complete turn
 * for a rung that is 99.9% one venue, and such a path's two straight edges fall on top
 * of each other — the seam stroke then shows as a spurious radius reaching the centre,
 * which reads as a third boundary that is not in the data. It is also how a rung at a
 * flat 100% draws as a plain circle with no seam at all.
 */
function Pie({
  sdex,
  sdexTitle,
  ammTitle,
}: {
  sdex: number;
  sdexTitle: string;
  ammTitle: string;
}) {
  const sdexLeads = sdex >= 0.5;
  return (
    <>
      <circle
        r={R}
        fill={sdexLeads ? VENUE_TOKENS.sdex.mark : VENUE_TOKENS.amm.mark}
      >
        <title>{sdexLeads ? sdexTitle : ammTitle}</title>
      </circle>
      {sdexLeads ? (
        <Wedge
          from={sdex}
          to={1}
          colour={VENUE_TOKENS.amm.mark}
          title={ammTitle}
        />
      ) : (
        <Wedge
          from={0}
          to={sdex}
          colour={VENUE_TOKENS.sdex.mark}
          title={sdexTitle}
        />
      )}
    </>
  );
}

/**
 * The narrowest sweep that still has room for the seam. Below it the 2px stroke is
 * wider than the wedge it would outline, so the surface colour swallows the fill and
 * the slice reads as a gap cut into the circle — a share of a tenth of a per cent drawn
 * as a dark radius, which is the opposite of what it is. Such a wedge goes unstroked
 * and is simply too small to see, which is true of it, and the label underneath is
 * where that share is actually read.
 */
const SEAM_FLOOR = 0.015;

/**
 * One wedge, from `from` to `to` as fractions of the circle, clockwise from twelve.
 * Only ever the minority slice, so the sweep is at most half a turn. A share the engine
 * reported as a flat zero draws nothing — a wedge of no angle is not a wedge.
 */
function Wedge({
  from,
  to,
  colour,
  title,
}: {
  from: number;
  to: number;
  colour: string;
  title: string;
}) {
  const sweep = to - from;
  if (sweep <= 0) return null;

  return (
    <path
      d={`M0 0L${point(from)}A${R} ${R} 0 0 1 ${point(to)}Z`}
      fill={colour}
      stroke="var(--keel-surface)"
      strokeWidth={sweep >= SEAM_FLOOR ? 2 : 0}
    >
      <title>{title}</title>
    </path>
  );
}

/** A point on the circle, as `x y`. Fraction zero is twelve o'clock. */
function point(fraction: number): string {
  const angle = fraction * 2 * Math.PI;
  return `${(R * Math.sin(angle)).toFixed(3)} ${(-R * Math.cos(angle)).toFixed(3)}`;
}

function Swatch({ colour }: { colour: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-2.5 rounded-xs"
      style={{ backgroundColor: colour }}
    />
  );
}

/**
 * A share, for a label beside the wedge it describes. This is a ratio of two figures the
 * engine served, computed for display of the geometry that is already on screen — it
 * is never presented as a Keel measurement, and the served figures stay beside it.
 */
function percent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

/** `0.02` is two per cent. The delta is a contract enum, not a measured value. */
function formatDelta(delta: DepthPoint['delta']): string {
  return delta === 0.02 ? '2%' : delta === 0.05 ? '5%' : '10%';
}
