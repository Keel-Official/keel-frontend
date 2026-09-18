import { flagCopy } from '@/lib/keel/format/glossary';
import type { Flag } from '@/lib/keel/format/flags';
import { cn } from '@/lib/keel/utils';

/**
 * A flag, said in words first and in the enum value second.
 *
 * The overview used to print `THIN_DEPTH_5PCT` at a reader and leave them to work it
 * out. A newcomer cannot, and an engineer does not need to be protected from the plain
 * sentence — so the label leads and the code follows it, quietly, in the mono face. The
 * code is kept rather than dropped because it is what appears in the API response, in
 * the `hasFlag` filter, and in whatever the reader builds next.
 *
 * Wording comes from `lib/keel/format/glossary.ts`, which is also where the rule lives
 * that no threshold number is ever written into these strings.
 */

export interface FlagChipProps {
  flag: Flag;
  /** `triggered` fired; `unevaluated` could not run and must never look like a pass. */
  tone?: 'triggered' | 'unevaluated';
  /** Hides the enum value where the row is too tight for both. */
  showCode?: boolean;
  className?: string;
}

export function FlagChip({
  flag,
  tone = 'triggered',
  showCode = true,
  className,
}: FlagChipProps) {
  const copy = flagCopy(flag);

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-baseline gap-1.5 rounded-md px-2 py-0.5 text-xs',
        tone === 'triggered'
          ? 'bg-[var(--band-high-surface)] font-medium text-[var(--band-high-ink)]'
          : 'keel-hatch-unmeasured text-[var(--keel-ink)] italic',
        className,
      )}
      // The full sentence, for a reader who wants it without leaving the row. The
      // drill-down carries the same sentence as visible text rather than as a hint.
      title={copy.meaning}
    >
      <span className="truncate">{copy.label}</span>
      {showCode ? (
        <span className="tabular hidden shrink-0 text-[0.62rem] opacity-70 sm:inline">
          {flag}
        </span>
      ) : null}
    </span>
  );
}
