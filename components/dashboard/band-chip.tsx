import {
  CircleCheck,
  OctagonAlert,
  OctagonX,
  TriangleAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { BAND_TOKENS } from '@/lib/keel/design/tokens';
import type { Band, BandConfidence } from '@/lib/keel/format/flags';
import { CONFIDENCE_TOKENS } from '@/lib/keel/design/tokens';
import { cn } from '@/lib/keel/utils';

/**
 * A band, wherever one appears in a list.
 *
 * Colour is never the signal. Medium against high measures a normal-vision delta E of
 * 13.6, below the floor at which two hues can be told apart, so each band carries a
 * word and its own silhouette. The chip is still readable with every colour removed.
 *
 * Confidence rides alongside rather than inside: it is orthogonal to band, and it is
 * `partial` on every monitored asset today, so it is a quiet qualifier rather than an
 * alarm repeated on sixty-one rows.
 */

export const BAND_ICONS: Record<BAND_ICON, LucideIcon> = {
  'circle-check': CircleCheck,
  'triangle-alert': TriangleAlert,
  'octagon-alert': OctagonAlert,
  'octagon-x': OctagonX,
};

type BAND_ICON = (typeof BAND_TOKENS)[Band]['icon'];

export interface BandChipProps {
  band: Band;
  confidence?: BandConfidence;
  className?: string;
}

export function BandChip({ band, confidence, className }: BandChipProps) {
  const token = BAND_TOKENS[band];
  const Icon = BAND_ICONS[token.icon];

  return (
    <span className={cn('inline-flex items-baseline gap-1.5', className)}>
      <span
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-medium"
        style={{ backgroundColor: token.surface, color: token.ink }}
      >
        <Icon
          aria-hidden="true"
          className="size-3.5 shrink-0 self-center"
          strokeWidth={2.25}
          style={{ color: token.mark }}
        />
        {token.label}
      </span>
      {confidence ? (
        <span
          className="text-xs whitespace-nowrap"
          style={{ color: CONFIDENCE_TOKENS[confidence].ink }}
          title={CONFIDENCE_TOKENS[confidence].label}
        >
          {confidence}
        </span>
      ) : null}
    </span>
  );
}
