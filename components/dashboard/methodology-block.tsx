import { cn } from '@/lib/keel/utils';

/**
 * The block that sits under every figure on this page.
 *
 * The reference this follows keeps three things together: where the number came from,
 * how it was arrived at, and what the calculation does not account for. The third is
 * the one usually left out, and it is the one a protocol engineer setting a collateral
 * parameter actually needs.
 *
 * `source` is a fact about this dashboard — which endpoint and field were read — so it
 * is written here. `what` and `ignores` are methodology statements and are authored
 * alongside the methodology, which is why callers pass `TODO-COPY(Al)` placeholders
 * rather than a plausible-sounding draft. A placeholder is visible in review; a
 * confident wrong sentence is not.
 */

export interface MethodologyBlockProps {
  /** The endpoint and field this section reads, e.g. `GET /asset/{id}/depth → depth[]`. */
  source: string;
  /** What the figure is. Methodology copy. */
  what?: string;
  /** What the calculation does not account for. Methodology copy. */
  ignores?: string;
  className?: string;
}

export function MethodologyBlock({
  source,
  what,
  ignores,
  className,
}: MethodologyBlockProps) {
  return (
    <details
      className={cn(
        'mt-3 rounded-md border border-[var(--keel-border)] bg-[var(--keel-surface-subtle)] text-sm',
        className,
      )}
    >
      <summary className="cursor-pointer px-3 py-2 text-[var(--keel-muted)] marker:text-[var(--keel-muted)]">
        Where this number comes from
      </summary>
      <div className="border-t border-[var(--keel-border)] px-3 py-2">
        <dl className="grid gap-x-3 gap-y-1 sm:grid-cols-[auto_1fr]">
          <dt className="font-medium text-[var(--keel-ink-strong)]">Source</dt>
          <dd className="tabular text-xs break-all text-[var(--keel-ink)]">
            {source}
          </dd>

          <dt className="font-medium text-[var(--keel-ink-strong)]">
            What it is
          </dt>
          <dd className="text-[var(--keel-ink)]">{what ?? <Pending />}</dd>

          <dt className="font-medium text-[var(--keel-ink-strong)]">
            What it does not account for
          </dt>
          <dd className="text-[var(--keel-ink)]">{ignores ?? <Pending />}</dd>
        </dl>
      </div>
    </details>
  );
}

function Pending() {
  return (
    <span className="italic text-[var(--unmeasured)]">
      Awaiting methodology copy.
    </span>
  );
}
