import { Info } from 'lucide-react';

/**
 * The engine's own notes about what its computation could not do.
 *
 * The contract's instruction on this field is one sentence: "Notes about the
 * limitations of the computation behind this response. These should be shown to the
 * user, not hidden." So they are on the page rather than behind a disclosure, and they
 * are rendered verbatim rather than summarised — a warning explains exactly why one
 * figure on this page is null, and paraphrasing it would put wording on screen that no
 * response carried.
 *
 * Every monitored asset carries at least one today, so this is the normal state of the
 * page and not an exception path.
 */

export interface EngineWarningsProps {
  warnings: readonly string[];
}

export function EngineWarnings({ warnings }: EngineWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="flex gap-3 rounded-lg border border-[var(--keel-border)] bg-[var(--keel-surface-subtle)] p-4">
      <Info
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-[var(--keel-muted)]"
      />
      <div className="min-w-0">
        <h2 className="font-medium text-[var(--keel-ink-strong)]">
          What this computation could not do
        </h2>
        <ul className="mt-2 flex flex-col gap-2 text-sm text-[var(--keel-ink)]">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-[var(--keel-muted)]">
          Served by the engine with this response and shown as written.
        </p>
      </div>
    </div>
  );
}
