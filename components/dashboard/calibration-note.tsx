import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';

import { DASHBOARD_METHODOLOGY } from '@/lib/keel/routes';
import { cn } from '@/lib/keel/utils';

/**
 * Wherever a band is shown, this is shown with it.
 *
 * `calibrated` is false. The thresholds behind every band were chosen from the
 * magnitude of one incident and conservative judgement, not calibrated against a set of
 * them. A screen that shows a band without saying so is claiming more than the engine
 * does, so this is not confined to the methodology page.
 *
 * The note is the service's own sentence, rendered verbatim. Summarising it here would
 * be writing methodology.
 */

export interface CalibrationNoteProps {
  calibrated: boolean | undefined;
  note: string | undefined;
  /** `compact` sits under a table; the full form opens a detail view. */
  variant?: 'compact' | 'full';
  className?: string;
}

export function CalibrationNote({
  calibrated,
  note,
  variant = 'compact',
  className,
}: CalibrationNoteProps) {
  // Absent is not the same as calibrated. If the engine did not answer, say that
  // rather than quietly omitting the caveat.
  if (calibrated === undefined) {
    return (
      <p className={cn('text-xs text-[var(--unmeasured)] italic', className)}>
        The methodology document could not be read, so the calibration status of
        these bands is unknown.
      </p>
    );
  }

  if (calibrated) return null;

  return (
    <div
      className={cn(
        'flex gap-2 rounded-md border border-[var(--band-medium)]/40 bg-[var(--band-medium-surface)] px-3 py-2',
        className,
      )}
    >
      <TriangleAlert
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-[var(--band-medium-ink)]"
      />
      <div className="min-w-0 text-sm">
        <p className="font-medium text-[var(--band-medium-ink)]">
          These bands come from thresholds that were chosen, not calibrated
        </p>
        {note ? (
          <p
            className={cn(
              'mt-1 text-[var(--keel-ink)]',
              variant === 'compact' && 'text-xs',
            )}
          >
            {note}
          </p>
        ) : null}
        <p className="mt-1 text-xs">
          <Link
            className="underline underline-offset-2"
            href={DASHBOARD_METHODOLOGY}
          >
            Every threshold, as the engine serves it
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * What `bandConfidence` means, in the engine's terms.
 *
 * `partial` says at least one CRITICAL or HIGH level check could not be evaluated, so
 * the band is a FLOOR: it can only be worse than shown, never better. That is the one
 * sentence a reader needs to not misread a LOW, and it is currently the state of every
 * monitored asset.
 */
export function ConfidenceMeaning({ className }: { className?: string }) {
  return (
    <p className={cn('text-xs text-[var(--keel-muted)]', className)}>
      A band marked <span className="font-medium">partial</span> is a floor. At
      least one high-severity check could not be evaluated, so the real band can
      only be worse than the one shown, never better.
    </p>
  );
}
