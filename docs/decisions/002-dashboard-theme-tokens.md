# 002 — A dark dashboard theme, and the light one kept beside it

Status: accepted
Scope: `/dashboard` only. The marketing site keeps its own stylesheet and stays light.

## What changed

The dashboard had one palette and a comment in `dashboard.css` saying why there was no
second one:

> There is no dark theme. One was not shipped rather than shipped unvalidated: a dark
> mode has to be selected deliberately from the same ramps and checked against the dark
> surface, not produced by flipping the light one.

That reasoning was right and is the reason this document exists. A dark theme was
requested for the redesign, so one was **selected against the dark surface and
validated**, rather than derived by inverting the light one. The light palette is kept
whole: every value in it is what the original validator pass chose, and nothing was
re-derived from the dark set.

Dark is the default. Light is applied by `data-theme="light"` on the html element.

## How it is validated

`scripts/check-token-contrast.mjs` holds both palettes and is the source of every
number quoted in `dashboard.css`. Run it after touching a token:

```
node scripts/check-token-contrast.mjs
```

It checks two different properties, because they answer different questions:

| Check | Method | Floor |
|---|---|---|
| Contrast | WCAG 2.2 relative luminance ratio | 4.5:1 for text, 3:1 for a mark that carries meaning |
| Separation | CIE76 delta E, normal vision and a deuteranope simulation | 15 |

It exits non-zero on a regression and names the pair that regressed. A distinction that
sits below a floor **on purpose** is declared in `TOLERATED` together with the second
channel that carries it, so an exemption is a statement in the file rather than a
silence.

### Result

Both palettes clear every floor. The dark one is measurably the stronger of the two:

| | light | dark |
|---|---|---|
| body text on surface | 13.07:1 | 13.20:1 |
| muted text on surface | 5.72:1 | 7.68:1 |
| band LOW mark on surface | 3.35:1 | 6.74:1 |
| band MEDIUM mark on surface | **1.83:1** | 9.02:1 |
| band HIGH mark on surface | **2.64:1** | 6.65:1 |
| band CRITICAL mark on surface | 4.80:1 | 4.65:1 |

The two bold figures are the light theme's known limitation, inherited and unchanged:
MEDIUM and HIGH are not readable as text against white. That is why a band label wears
a separate `--band-*-ink` while the mark beside it carries the hue, and every band ink
clears 4.5:1 both on the plain surface and on its own chip tint in both themes.

### What colour never does alone

MEDIUM against HIGH separates by a deuteranope delta E of **11.5 in light and 5.9 in
dark**, far under the floor of 15. HIGH against CRITICAL is 14.2 and 6.8. Neither theme
fixes this and neither is expected to: four ordered severity hues cannot all be
separable under deuteranopia. The mitigations are mandatory, not decorative:

- every band carries a **word** and its own **icon silhouette** — four different shapes,
  not four colours of one shape;
- the risk map groups tiles into **labelled band regions**, so position and a heading
  carry the band before the fill does;
- an unmeasured value carries a **hatch**, and a zero-depth tile carries a **stripe**, so
  both survive greyscale, print, and forced-colors mode.

## Two tokens that had to be added

**`--keel-brand-ink`.** `--keel-brand` is a *surface* colour. In light it happens to
double as a heading colour on white; in dark it is a card background that measures
1.44:1 against the page. The wordmark and the active nav item were set in it and were
invisible in dark until this token existed. Surface and ink are now separate tokens
because they cannot be one value in both themes.

**`--keel-on-brand`.** The label on a filled brand control, for the same reason.

## Consequences

**`lib/keel/design/tokens.ts` now exports `var()` references, not hex literals.** Chart
and chip code sets colours from JavaScript through the `style` attribute; a literal
baked in at build time cannot follow a theme. A `var()` in a style attribute resolves
against the element's own cascade, so every existing consumer became theme-aware with no
component change. This works inside SVG too: a presentation attribute is parsed as a
CSS declaration, so `stroke="var(--seq-600)"` resolves against the cascade just as
`style` does — verified in the running page, where the trend chart sets both as
attributes and they compute to the current theme's values.

The hex values now live in exactly two places: `dashboard.css`, which declares them, and
the validator, which checks them.

**The sequential ramp runs the other way in dark.** Light to dark in the light theme,
dark to light in the dark one, so a higher index is always further from the surface it
sits on and "more" is always "brighter against the background".

## The choice is a cookie, read on the server

`THEME_COOKIE` in `lib/keel/design/theme.ts`, read by the dashboard root layout, which
renders `data-theme` before the first byte of HTML leaves the server.

`localStorage` was rejected. It is readable only from the browser, which is why sites
that use it need an inline script in the head to re-apply the theme before paint — a
script React warns about inside a component, and one that can still leave a frame of the
wrong colour. A cookie travels with the request, so there is no flash to suppress and no
script to ship.

The URL was also rejected, although every other view choice on the dashboard lives
there. Band, flag, search, sort and the open drill-down are all query parameters because
a view a reviewer is looking at has to be something they can send to someone else. A
theme is the opposite kind of choice: it belongs to the reader rather than to the view,
and putting it in the query string would paste a personal preference into every shared
link.

`prefers-color-scheme` is deliberately **not** consulted. Dark is this product's chosen
surface, not a preference echo. A reader who wants light picks it, and that choice is
stored and served.

## Verified

- `node scripts/check-token-contrast.mjs` — every token clears its floor, in both themes.
- axe-core, WCAG 2.0/2.1 A and AA, **zero violations** on the overview, a filtered view,
  the open drill-down, mobile at 390px, and the light theme.
- The toggle round-trips through the server: click, reload, still light.
