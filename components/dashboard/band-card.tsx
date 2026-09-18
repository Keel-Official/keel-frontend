import {
  CircleCheck,
  OctagonAlert,
  OctagonX,
  TriangleAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { BAND_TOKENS, CONFIDENCE_TOKENS } from '@/lib/keel/design/tokens';
import type { Band, BandConfidence } from '@/lib/keel/format/flags';
import { cn } from '@/lib/keel/utils';

/**
 * The engine's verdict on this asset, as one card.
 *
 * It replaced a four-segment indicator that drew LOW, MEDIUM, HIGH and CRITICAL side by
 * side and filled the asset's own. The scale answered "where does this sit among the
 * four?", which is a question a reader of a single asset page has already answered by
 * the time they arrive: they came to find out what this asset is, and three bands it is
 * not were taking three quarters of the width to say nothing about it.
 *
 * WHAT IS NOT LOST WITH THE SEGMENTS. The band is still not carried by colour: MEDIUM
 * against HIGH separates by a deuteranope delta E of 5.9, far under the floor of 15, so
 * the word and the icon silhouette do the work here exactly as they do in the chips.
 * Four different shapes, not four colours of one shape.
 *
 * Confidence rides with it and is not optional. `LOW + full` and `LOW + partial` are
 * materially different results, and the second is the state of every monitored asset
 * today — so the sentence explaining what `partial` means to a reader is inside the
 * card rather than somewhere below it.
 */

const ICONS: Record<(typeof BAND_TOKENS)[Band]['icon'], LucideIcon> = {
  'circle-check': CircleCheck,
  'triangle-alert': TriangleAlert,
  'octagon-alert': OctagonAlert,
  'octagon-x': OctagonX,
};

export interface BandCardProps {
  band: Band;
  confidence: BandConfidence;
  className?: string;
}

export function BandCard({ band, confidence, className }: BandCardProps) {
  const token = BAND_TOKENS[band];
  const Icon = ICONS[token.icon];

  return (
    <section
      aria-label="Risk band"
      className={cn(
        'rounded-xl border p-4',
        // The hue is the band's own, and it is a severity scale rather than decoration,
        // so it is correct here and would not be on an ordinary card.
        'border-current',
        className,
      )}
      style={{ backgroundColor: token.surface, color: token.ink }}
    >
      <p className="text-xs font-semibold tracking-wide uppercase">Risk band</p>

      <p className="mt-2 flex items-center gap-2 text-3xl leading-none font-semibold">
        <Icon
          aria-hidden="true"
          className="size-7 shrink-0"
          strokeWidth={2.25}
        />
        {token.label}
      </p>

      <p
        className="mt-2 text-sm"
        style={{ color: CONFIDENCE_TOKENS[confidence].ink }}
      >
        {CONFIDENCE_TOKENS[confidence].label}
      </p>

      {confidence === 'partial' ? (
        <p className="mt-2 text-xs text-[var(--keel-ink)]">
          A band marked <span className="font-medium">partial</span> is a floor.
          At least one high-severity check could not be evaluated, so the real
          band can only be worse than the one shown, never better.
        </p>
      ) : null}
    </section>
  );
}
