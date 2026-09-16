import { CircleHelp, TriangleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Errors and empty results are first-class states here, not an afterthought.
 *
 * When the API returns an error it also returns a message written to be shown to a
 * reader. That message is displayed as served rather than replaced with wording
 * invented here, because two of the error codes cover more than one condition and the
 * message is the only thing that separates them: `ASSET_NOT_MONITORED` means both "not
 * in the demonstration set" and "monitored but not computed yet".
 */

export interface NoticeProps {
  tone: 'problem' | 'empty';
  title: string;
  /** The API's own message, shown verbatim when there is one. */
  detail?: string | null;
  children?: React.ReactNode;
  className?: string;
}

export function Notice({ tone, title, detail, children, className }: NoticeProps) {
  const Icon = tone === 'problem' ? TriangleAlert : CircleHelp;

  return (
    <div
      role={tone === 'problem' ? 'alert' : undefined}
      className={cn(
        'flex gap-3 rounded-lg border p-4',
        tone === 'problem'
          ? 'border-[var(--band-critical)]/35 bg-[var(--band-critical-surface)]'
          : 'border-[var(--keel-border)] bg-[var(--keel-surface-subtle)]',
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0"
        style={{
          color: tone === 'problem' ? 'var(--band-critical-ink)' : 'var(--keel-muted)',
        }}
      />
      <div className="min-w-0">
        <p
          className={cn(
            'font-medium',
            tone === 'problem'
              ? 'text-[var(--band-critical-ink)]'
              : 'text-[var(--keel-ink-strong)]',
          )}
        >
          {title}
        </p>
        {detail ? (
          <p className="mt-1 text-sm text-[var(--keel-ink)]">{detail}</p>
        ) : null}
        {children ? (
          <div className="mt-2 text-sm text-[var(--keel-muted)]">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
