import {
  CircleCheck,
  OctagonAlert,
  OctagonX,
  TriangleAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  BAND_ORDER,
  BAND_TOKENS,
  CONFIDENCE_TOKENS,
} from '@/lib/keel/design/tokens';
import type { Band, BandConfidence } from '@/lib/keel/format/flags';
import { cn } from '@/lib/keel/utils';

/**
 * Four segments, the asset's own one filled.
 *
 * There is no needle, because there is nothing for one to point at. `GET /methodology`
 * returns nineteen thresholds and none of them is a band boundary: they are flag
 * thresholds, and `band` is a categorical enum derived from which flags fired. A needle
 * position would have to come from a continuous risk score, and the engine does not
 * publish one.
 *
 * This also settles the no-price case cleanly. With no executable price there is no
 * needle position to invent, but the band is still something the engine computed —
 * CRITICAL — so the segment is filled from the engine's own answer rather than from a
 * measurement that does not exist. What is missing there is the price and everything
 * derived from it, and those render as unmeasured in their own right.
 */

const ICONS: Record<(typeof BAND_TOKENS)[Band]['icon'], LucideIcon> = {
  'circle-check': CircleCheck,
  'triangle-alert': TriangleAlert,
  'octagon-alert': OctagonAlert,
  'octagon-x': OctagonX,
};

export interface BandSegmentsProps {
  band: Band;
  confidence: BandConfidence;
  className?: string;
}

export function BandSegments({
  band,
  confidence,
  className,
}: BandSegmentsProps) {
  const token = BAND_TOKENS[band];
  const Icon = ICONS[token.icon];

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <ol className="flex overflow-hidden rounded-md border border-[var(--keel-border-strong)]">
        {BAND_ORDER.map((candidate) => {
          const active = candidate === band;
          const candidateToken = BAND_TOKENS[candidate];

          return (
            <li
              key={candidate}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'flex-1 border-r border-[var(--keel-border-strong)] last:border-r-0',
                active ? 'font-semibold' : 'text-[var(--keel-muted)]',
              )}
              style={
                active
                  ? {
                      backgroundColor: candidateToken.surface,
                      color: candidateToken.ink,
                    }
                  : { backgroundColor: 'var(--keel-surface)' }
              }
            >
              {/*
                The hue rides on a solid bar, not behind the label. White on the band
                mark measures 3.35:1 for LOW and 1.83:1 for MEDIUM, so a label set on
                the mark is unreadable for three of the four bands. The tint carries the
                text at 5.2:1 or better and the bar above it carries the colour.
              */}
              <span
                aria-hidden="true"
                className="block h-1.5 w-full"
                style={{
                  backgroundColor: active ? candidateToken.mark : 'transparent',
                }}
              />
              <span className="block px-2 py-1.5 text-center text-xs">
                {candidateToken.label}
                {active ? <span className="sr-only"> — this asset</span> : null}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 text-lg font-semibold"
          style={{ color: token.ink }}
        >
          <Icon aria-hidden="true" className="size-5" strokeWidth={2.25} />
          {token.label}
        </span>
        <span
          className="text-sm"
          style={{ color: CONFIDENCE_TOKENS[confidence].ink }}
        >
          {CONFIDENCE_TOKENS[confidence].label}
        </span>
      </p>
    </div>
  );
}
