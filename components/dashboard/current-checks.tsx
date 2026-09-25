import type { Flag } from '@/lib/keel/format/flags';
import { assessFlags } from '@/lib/keel/format/flags';
import { cn } from '@/lib/keel/utils';

import { FlagChip } from './flag-chip';

/**
 * The checks at this reading, in the two groups the engine keeps apart.
 *
 * The list endpoint carries only what fired, so the overview promises that an asset's
 * own page says which checks could not run. This is where that promise is kept. The
 * two lists are never merged: an unevaluated check is not one that came back clear, and
 * "nothing fired" beside three checks that never ran is not a pass.
 */
export function CurrentChecks({
  triggered,
  unevaluated,
  showTriggered = true,
  className,
}: {
  triggered: readonly Flag[];
  unevaluated: readonly Flag[];
  /**
   * Off where the flag timeline sits above and already lists what fires now, marked on
   * its own row. The unevaluated group is never omitted: the timeline cannot show it.
   */
  showTriggered?: boolean;
  className?: string;
}) {
  const assessment = assessFlags(triggered, unevaluated);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {showTriggered ? (
        <Group title="Triggered" count={triggered.length}>
          {triggered.length === 0 ? (
            <p className="text-sm text-[var(--keel-muted)]">
              {assessment.kind === 'incomplete'
                ? 'Nothing fired — but some checks could not run, so this is not a pass.'
                : 'Nothing fired at this reading.'}
            </p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {triggered.map((flag) => (
                <li key={flag} className="max-w-full">
                  <FlagChip flag={flag} />
                </li>
              ))}
            </ul>
          )}
        </Group>
      ) : null}

      <Group title="Not evaluated" count={unevaluated.length}>
        {unevaluated.length === 0 ? (
          <p className="text-sm text-[var(--keel-muted)]">
            Every check ran at this reading.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {unevaluated.map((flag) => (
              <li key={flag} className="max-w-full">
                <FlagChip flag={flag} tone="unevaluated" />
              </li>
            ))}
          </ul>
        )}
      </Group>
    </div>
  );
}

function Group({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="keel-marker mb-2 flex items-center gap-2">
        {title}
        <span className="tabular rounded-sm bg-[var(--keel-surface-subtle)] px-1.5 py-0.5 text-[var(--keel-ink-strong)]">
          {count}
        </span>
      </h3>
      {children}
    </div>
  );
}
