import { CircleDashed } from 'lucide-react';

import { formatDecimal, withUnit } from '@/lib/format/decimal';
import type { KeelValue } from '@/lib/format/value';
import { UNMEASURED_TOKEN } from '@/lib/design/tokens';
import { cn } from '@/lib/utils';

/**
 * The one component that renders a value from the API.
 *
 * It handles four states, and it never collapses them. A figure and a computed zero
 * are measurements; an absent key and a `null` are not. A value the engine did not
 * produce is never drawn as `0`, as a dash, or as an empty cell — each of those says
 * something the engine did not.
 *
 * The exact string the API served is always on the element, so a reader who needs the
 * whole number can get it even when the display is shortened.
 *
 * TODO-COPY(Al): say whether an absent field and a `null` field mean different things
 * to a reader, and give the wording for each. The wire distinguishes them — fourteen
 * AssetRisk fields are both optional and nullable — and this component currently shows
 * "not reported" and "not computed" as a factual description of the response, not as a
 * claim about what the engine was doing.
 */

export interface ValueProps {
  value: KeelValue;
  /** Fraction digits to show. Omitted keeps every digit the engine served. */
  maxFractionDigits?: number;
  /** Renders the unit beside the figure. Defaults to true when a unit is present. */
  showUnit?: boolean;
  className?: string;
}

export function Value({
  value,
  maxFractionDigits,
  showUnit = true,
  className,
}: ValueProps) {
  if (value.exact === null) {
    return <Unmeasured state={value.state} className={className} />;
  }

  const formatted = formatDecimal(value.exact, { maxFractionDigits });
  const body = showUnit ? withUnit(formatted.display, value.unit) : formatted.display;
  const exactWithUnit = showUnit ? withUnit(value.exact, value.unit) : value.exact;

  return (
    <span
      className={cn('tabular', className)}
      // The whole value stays reachable whenever the display is not the whole value.
      title={formatted.truncated ? exactWithUnit : undefined}
      data-exact={value.exact}
      data-state={value.state}
    >
      {body}
      {formatted.truncated ? (
        <span aria-hidden="true" className="text-[var(--keel-muted)]">
          …
        </span>
      ) : null}
      {formatted.truncated ? (
        <span className="sr-only">{` (shortened; full value ${exactWithUnit})`}</span>
      ) : null}
    </span>
  );
}

const UNMEASURED_WORDS = {
  absent: 'not reported',
  unknown: 'not computed',
} as const;

function Unmeasured({
  state,
  className,
}: {
  state: KeelValue['state'];
  className?: string;
}) {
  const words = state === 'absent' ? UNMEASURED_WORDS.absent : UNMEASURED_WORDS.unknown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[var(--unmeasured)] italic',
        className,
      )}
      data-state={state}
    >
      <CircleDashed
        aria-hidden="true"
        className="size-3.5 shrink-0"
        strokeWidth={2}
        style={{ color: UNMEASURED_TOKEN.mark }}
      />
      {words}
    </span>
  );
}
