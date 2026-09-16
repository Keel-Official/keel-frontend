import { CircleCheck, CircleDashed, TriangleAlert } from 'lucide-react';

import { assessFlags, type Flag } from '@/lib/format/flags';
import { UNMEASURED_TOKEN } from '@/lib/design/tokens';
import { cn } from '@/lib/utils';

/**
 * Two groups that never look alike.
 *
 * `flags` is what fired. `unevaluatedFlags` is what could not be measured. An
 * unevaluated flag is not a flag that came back clear, so an empty `flags` array is
 * only a pass when `unevaluatedFlags` is empty too — which on the live deployment is
 * rare: XLM reports band LOW with nothing triggered and six checks that did not run.
 *
 * A reader has to be able to say which group a flag is in without a legend lookup, so
 * the groups carry different headings, different icons, and different treatments, and
 * they are never merged into one sequence.
 *
 * TODO-COPY(Al): one sentence per flag in the twelve-value enum, written for a protocol
 * engineer deciding a collateral parameter, saying what the flag being triggered
 * implies about the asset. Until then the enum value is shown as served rather than
 * paraphrased.
 */

export interface FlagGroupsProps {
  triggered: readonly Flag[];
  unevaluated: readonly Flag[];
  className?: string;
}

export function FlagGroups({ triggered, unevaluated, className }: FlagGroupsProps) {
  const assessment = assessFlags(triggered, unevaluated);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Group
        heading="Triggered"
        count={assessment.triggered.length}
        empty="Nothing triggered."
        icon={TriangleAlert}
        tone="triggered"
        flags={assessment.triggered}
      />

      <Group
        heading="Could not be evaluated"
        count={assessment.unevaluated.length}
        empty="Every check ran."
        icon={CircleDashed}
        tone="unevaluated"
        flags={assessment.unevaluated}
      />

      {assessment.kind === 'clear' ? (
        <p className="inline-flex items-center gap-1.5 text-sm text-[var(--band-low-ink)]">
          <CircleCheck aria-hidden="true" className="size-4" />
          Nothing triggered and every check ran.
        </p>
      ) : assessment.kind === 'incomplete' ? (
        <p className="text-sm text-[var(--keel-ink)]">
          Nothing triggered, but {assessment.unevaluated.length} check
          {assessment.unevaluated.length === 1 ? '' : 's'} could not run. This is not a
          clean result.
        </p>
      ) : null}
    </div>
  );
}

function Group({
  heading,
  count,
  empty,
  icon: Icon,
  tone,
  flags,
}: {
  heading: string;
  count: number;
  empty: string;
  icon: typeof TriangleAlert;
  tone: 'triggered' | 'unevaluated';
  flags: readonly Flag[];
}) {
  return (
    <section>
      <h3 className="flex items-center gap-1.5 text-sm font-medium text-[var(--keel-ink-strong)]">
        <Icon
          aria-hidden="true"
          className="size-4"
          style={{
            color: tone === 'triggered' ? 'var(--band-high-ink)' : UNMEASURED_TOKEN.mark,
          }}
        />
        {heading}
        <span className="tabular font-normal text-[var(--keel-muted)]">({count})</span>
      </h3>

      {flags.length === 0 ? (
        <p className="mt-1 text-sm text-[var(--keel-muted)]">{empty}</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {flags.map((flag) => (
            <li
              key={flag}
              className={cn(
                'tabular rounded-md px-2 py-1 text-xs',
                tone === 'triggered'
                  ? 'bg-[var(--band-high-surface)] font-medium text-[var(--band-high-ink)]'
                  : 'keel-hatch-unmeasured text-[var(--keel-ink)] italic',
              )}
            >
              {flag}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
