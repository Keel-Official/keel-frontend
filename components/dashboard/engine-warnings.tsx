import { cn } from '@/lib/keel/utils';

/**
 * The engine's own notes about the limits of the computation behind this reading.
 *
 * The contract says these "should be shown to the user, not hidden", and several other
 * places on the page lean on them: the collateral panel labels a null manipulation term
 * as not applicable because a warning carries the reason, and a reconstructed row lists
 * every gap in its book here. So they are rendered verbatim, in the order served, and
 * never paraphrased — a warning rewritten in this codebase's words is a second home for
 * a statement the engine owns, and it drifts.
 *
 * An empty list is a statement too: the engine attached no caveat to this reading.
 */

export interface EngineWarningsProps {
  warnings: readonly string[];
  className?: string;
}

export function EngineWarnings({ warnings, className }: EngineWarningsProps) {
  if (warnings.length === 0) {
    return (
      <p className={cn('text-sm text-[var(--keel-muted)]', className)}>
        The engine attached no warnings to this reading.
      </p>
    );
  }

  return (
    <ol
      className={cn(
        'flex list-decimal flex-col gap-2 pl-5 text-sm text-[var(--keel-ink)] marker:text-[var(--keel-muted)]',
        className,
      )}
    >
      {warnings.map((warning, index) => (
        // A warning can repeat verbatim across pairs, so its text is not a key.
        <li key={index} className="break-words">
          {warning}
        </li>
      ))}
    </ol>
  );
}
