import { dashboardAssetPath } from '@/lib/keel/routes';
import { cn } from '@/lib/keel/utils';

/**
 * Asks the engine for this asset at a past ledger.
 *
 * A plain GET form, so it works without JavaScript and the result is a URL a reviewer
 * can send. It offers no list of ledgers: the engine answers only for ledgers a replay
 * has stored, and it says which by refusing the others with a message of its own. A
 * list kept here would be a second copy of a decision the engine owns. The backtest
 * page is the one place that names ledgers, because it cites the evidence behind the
 * published report.
 */

export interface LedgerPickerProps {
  assetId: string;
  /** The ledger currently shown, if any, so the field opens on it. */
  current?: number | null;
  className?: string;
}

export function LedgerPicker({
  assetId,
  current,
  className,
}: LedgerPickerProps) {
  return (
    <form
      method="get"
      action={dashboardAssetPath(assetId)}
      className={cn('flex flex-wrap items-end gap-2', className)}
    >
      <label className="flex flex-col gap-1 keel-marker">
        Read at ledger
        <input
          name="ledger"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{1,10}"
          required
          defaultValue={current ?? undefined}
          placeholder="e.g. 61340262"
          className="tabular h-10 w-44 rounded-md border border-[var(--keel-border-strong)] bg-[var(--keel-surface)] px-3 text-sm font-normal tracking-normal normal-case text-[var(--keel-ink-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
        />
      </label>
      <button
        type="submit"
        className="h-10 rounded-md border border-[var(--keel-accent)] bg-[var(--keel-accent)] px-4 text-sm text-[var(--keel-on-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]"
      >
        Read
      </button>
    </form>
  );
}
