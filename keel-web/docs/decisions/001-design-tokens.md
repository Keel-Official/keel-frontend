# 001 — Design tokens

Status: accepted, 16 September 2026.

Tokens are declared in `app/globals.css` and mirrored, typed, in `lib/design/tokens.ts`.
`tests/tokens.test.ts` fails if the two stop agreeing.

## What the operator decided

| Question | Answer |
|---|---|
| Palette and type | neutrals and fonts from the marketing site, band hues from the backend visualization spec |
| Band indicator | four discrete segments, no needle |
| Heatmap sequential scale | build now |
| Dark mode | light only for now |

## The band meter has no needle, because there is nothing to point at

The task list asked for "zone boundaries for the meter". Those boundaries do not exist.

`GET /methodology` returns nineteen thresholds and not one of them is a band boundary.
They are flag thresholds — `spreadExtremePct: 20`, `thinDepth5PctAbsolute: 50000`,
`manipulationCheapAbsolute: 10000`, and so on. `band` is a categorical enum derived
from which flags fired; there is no continuous quantity underneath it.

A needle therefore has no position to take. Giving it one would mean deriving a
continuous risk score from the flag set, and the backend's guidance is explicit that
the frontend must not invent a risk score of its own: `band` and `bandConfidence` are
the score.

So the indicator is four segments with the current one filled. It shows where an asset
sits among four categories, which is what the data supports, and it claims nothing
about distance between them.

**Rejected:** a needle positioned by triggered-flag count. It reads as a measurement,
and the number behind it — nine of twelve, say — is one this codebase would have made
up. The engine never publishes it.

## Band hues are for marks; band labels wear a different ink

The backend visualization spec fixes four hues. Measured against the page surface
`#fbfcfc`:

| Band | Mark | Contrast | Usable as text? |
|---|---|---|---|
| LOW | `#0ca30c` | 3.26:1 | no |
| MEDIUM | `#fab219` | 1.78:1 | no |
| HIGH | `#ec835a` | 2.57:1 | no |
| CRITICAL | `#d03b3b` | 4.67:1 | yes |

Three of the four are unreadable as text. So the hue goes on the mark, and the label
beside it wears an ink inherited from the marketing site, all four of which clear AA:

| Band | Ink | Contrast |
|---|---|---|
| LOW | `#24664f` | 6.62:1 |
| MEDIUM | `#8a5c14` | 5.64:1 |
| HIGH | `#9a4b20` | 6.01:1 |
| CRITICAL | `#ae3737` | 6.01:1 |

This is what "neutrals from the marketing site, band from the backend" resolves to once
contrast is checked rather than assumed.

**Rejected:** using the marketing site's darker hues for the marks too. They are a
matched set with the inks and would have been simpler, but the backend's four were
validated as a set for mark use and are the ones its own charts will use.

## The band palette fails a categorical check, and that is why the icon is mandatory

Running the palette validator against the page surface:

```
Palette (light, surface #fbfcfc, categorical): 4 slots
  [FAIL] Lightness band         outside band: [["#fab219",0.811]]
  [PASS] Chroma floor           all 4 >= 0.1
  [PASS] CVD separation         worst adjacent #ec835a↔#fab219 ΔE 11.3 (deutan) · tritan 9.6
  [FAIL] Normal-vision floor    worst adjacent #ec835a↔#fab219 ΔE 13.6 (normal)
  [WARN] Contrast vs surface    below 3:1: [["#fab219",1.78],["#ec835a",2.57]]
```

MEDIUM against HIGH measures 13.6, under the floor of 15, meaning a reader with full
colour vision cannot reliably tell the two apart. This reproduces the backend's own
figure independently.

The palette is kept, because it is the one the engine's own materials use, and the
failure is answered rather than ignored: **every band carries an icon and a word, and
the four icons are four different silhouettes rather than one shape in four colours.**
`tests/tokens.test.ts` fails if a band loses its icon or its label, or if two bands
share a silhouette. Colour is never the only channel, so the delta E between two hues
stops being load-bearing.

The contrast WARN obligates visible labels, which the same rule already supplies.

## Venue series

`#2a78d6` SDEX, `#eb6834` AMM, `#1baf7a` spare. Validated as a set: all checks pass,
worst adjacent pair delta E 27.6 normal and 9.2 deutan. Three slots and no fourth — a
fourth would put yellow beside orange and fail separation.

These never carry a band, and a band hue never carries a venue. The status palette is
reserved.

## Sequential ramp

Blue, thirteen steps, `#cde2fb` to `#0d366b`, strictly monotonic in luminance from
1.29:1 to 11.63:1 against the surface. One hue, so a reader can rank it.

Step 450 of this ramp is `#2a78d6`, which is also the SDEX series colour. That is the
same design system rather than a collision: the ramp encodes magnitude in the history
heatmap and the series colour encodes venue in the depth chart, and the two never
appear in one chart.

**Rejected:** a rainbow ramp. Hue has no order, so a reader cannot rank it, and the
lightest-to-darkest reading that makes a heatmap legible disappears.

## Absent, unknown, and unevaluated

`--unmeasured` is a neutral `#7b8b93` with a hatch class, never a step on the risk
scale or on the sequential ramp. A value the engine did not produce is not a low value,
and putting it at the light end of a ramp would say it was measured and came back
small. The hatch is a second channel so the state survives greyscale, print, and
forced-colors mode.

## Confidence

`bandConfidence` is orthogonal to band and is `partial` on 61 of 61 monitored assets.
A loud marker on every row would be wallpaper rather than signal, so it is a quiet
qualifier beside the band in lists and is stated in full on the detail view.

If the engine starts producing `full`, this becomes a real distinction and the
treatment should be revisited.

## No dark theme

One was not shipped rather than shipped unvalidated. The `.dark` block that shadcn
generates is a flip of the light one; a dark mode has to be selected from the same
ramps and checked against the dark surface. The block was removed so nothing ships it
by accident.

## Open copy

`TODO-COPY(Al)` placeholders relating to tokens live in `lib/format/flags.ts` and
`lib/format/decimal.ts`. Nothing here states what a band means, only how it is drawn.
