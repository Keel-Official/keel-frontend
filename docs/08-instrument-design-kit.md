# Keel Frontend — Instrument Design Kit (v2)

This document records the visual system the marketing surface and the evidence pages
now ship. It is the current source of truth for colour, typography, shape and landing
rhythm, and it supersedes the parts of the earlier docs listed under
[What this supersedes](#what-this-supersedes).

The rendered kit is `docs/design-kit.html`. It is a repository reference: it is not
routed, not served from `public/`, and nothing links to it. Open it from a checkout.

The shipping definitions are in `app/(marketing)/globals.css`. If a value moves there,
move it here and in the rendered kit too.

## The idea

Keel is a read-only measurement instrument, not a marketing site. The page should read
like a panel on a bench: near-black blue ink on a cool light surface, hairline rules,
monospace labels and figures, and no gloss.

Two scales run through it and never meet:

- **One interaction accent — muted teal.** Links, focus rings, buttons, and nothing
  else.
- **One risk ramp — directional, four steps.** Low, medium, high, critical. It is never
  used for anything a reader can click.

The moment the accent also speaks about risk, a reader can no longer tell "this is
clickable" from "this is a finding". That is the rule the rest of the system protects.

## Colour

### Base

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#0F1A24` | Headings, figures, the masthead and the closing panel |
| `--ink-2` | `#33424E` | Secondary prose inside cards |
| `--muted` | `#5F6E7A` | The quietest text tone on the page |
| `--muted-2` | `#8A96A0` | **Graphics only** — meter tracks, bar fills, connector glyphs |
| `--bg` | `#F7F8F9` | Page |
| `--surface` | `#FFFFFF` | Cards and panels |
| `--surface-2` | `#EEF1F3` | Panel heads, table heads, panel feet |
| `--border` | `#DCE1E5` | Hairline |
| `--border-strong` | `#C6CDD3` | Ghost-control borders, marker ticks, unfilled meter segments |

`--muted-2` is 2.95:1 against `--bg`, so no text is set in it. The level below `--muted`
is carried by size, weight and case instead. This is a deliberate departure from the
kit as first drawn, where quiet labels were set in it and failed AA.

### Interaction accent

| Token | Value |
| --- | --- |
| `--accent` | `#1F6F73` |
| `--accent-strong` | `#195C60` |
| `--accent-tint` | `#E6F0F0` |

### Risk ramp

| Band | Text | Tint | Border | Severity |
| --- | --- | --- | --- | --- |
| Low | `#5A6B7C` | `#EDF0F2` | `#CDD5DB` | 1/4 |
| Medium | `#8C5E12` | `#F7EFDD` | `#E6D3A6` | 2/4 |
| High | `#A8451A` | `#F8E9DF` | `#ECCBB6` | 3/4 |
| Critical | `#B3202C` | `#F7E1E2` | `#E6BCC0` | 4/4 |

Medium and high were darkened from the ramp as first drawn (`#A9761A`, `#C2521B`), which
did not reach 4.5:1 against their own tints at the 11px the band label is set in. The
hue and the direction of the ramp are unchanged.

A band is never communicated by colour alone: `RiskBadge` prints the band word and a
four-segment meter beside it, and `bandConfidence` sits under both, because a partial
band is a floor rather than a reading.

### The one exception

`--brand-amber` (`#E49F37`) is the counter of the Keel mark. It belongs to neither
scale, appears only inside the logo, and never says anything about a market.

## Typography

Manrope for prose, JetBrains Mono for every label, figure and meta line. Both are loaded
through `next/font` from `@fontsource-variable`, so the CSS variables name the fonts that
are actually served. The kit as first drawn specified system stacks; that is a property
of a single self-contained HTML file with no build step, not a decision about Keel.

| Role | Spec |
| --- | --- |
| H1 | 700 · `clamp(2rem, 3.6vw, 3rem)` · `-0.035em` |
| H2 | 700 · `clamp(1.5rem, 2.6vw, 2rem)` · `-0.03em` |
| H3 | 700 · 16px |
| Lead / intro | 400 · 1.08rem · `--muted` |
| Body | 400 · 15.5px / 1.5 |
| Section marker | mono · 700 · 11.5px · uppercase · `0.14em` |
| Figure | mono · 700 · tabular numerals |

A heading never grows at the expense of the figures under it.

## Shape and elevation

`--radius: 8px` for panels and cards, `--radius-sm: 5px` for controls, chips and nodes.
Elevation is one hairline plus `--shadow: 0 1px 0 rgb(15 26 36 / 0.02), 0 1px 3px
rgb(15 26 36 / 0.05)`. No hard-offset poster shadows.

Content width is `--maxw: 1120px`, with a 26px gutter, 20px below 720px and 16px below
420px.

## Landing rhythm

Numbered sections, each introduced by a marker, with the density changing from one to
the next so the page does not read as a stack of identical marketing blocks.

```text
masthead
00 — Overview      hero copy + instrument panel (HeroProductPreview)
01 — Monitored     market table (MarketSnapshot)
02 — Method        input nodes → engine → outputs (ArchitectureFlow)
03 — Finding       critical result + cost/reachability (ExplainableRiskDemo)
04 — Case study    February bar chart + evidence links (BlendCasePreview)
05 — Notes         provenance strip + FAQ (ProvenanceSection)
06 — Start         closing panel on ink + three mini results
footer
```

The masthead states what Keel is and what data is on screen before the page says
anything else, so a recorded sample cannot be mistaken for a live feed by a reader who
only glances at the top of the window.

## Data rules the visual system has to keep

These are not style choices; they come from `docs/05-frontend-data-contract.md` and the
backend methodology, and the components enforce them.

- Figures render from exact decimal strings and are rounded only for display.
- `null` renders as "Not available" and never as `0`. A measured zero and an absent
  value are opposite findings.
- Triggered and unevaluated flags are separate groups. Grey means "not evaluated", not
  "passed".
- Manipulation cost is always shown with reachability. A figure on an unreachable rung
  says how far the book goes, not what the move costs.
- Depth derived from an unusable midpoint is withheld and named as a finding rather than
  printed.
- Historical gaps are drawn as gaps. The February chart marks a day without an
  observation with a cross at the baseline; it never draws it as a zero bar and never
  interpolates across it.
- Recorded data is labelled wherever it appears.

## Accessibility

- WCAG 2.2 AA. Every text/background pair in this system clears 4.5:1; the axe pass in
  `e2e/landing.spec.ts` runs at 1440, 820, 390 and 320 and is expected to stay empty.
- Focus is a 2px `--accent` ring at 2px offset.
- Risk is never colour alone.
- The February chart carries a `<title>`, a `<desc>`, a per-point `<title>`, and a table
  of the exact observations underneath it.
- `prefers-reduced-motion: reduce` disables the landing animation and all transitions.

## Where it applies

The marketing surface (`app/(marketing)/`) and the evidence pages. The dashboard keeps
its own stylesheet, `app/(dashboard)/dashboard/dashboard.css`, and its own light and dark
themes. The two surfaces are deliberately not wired together, and Tailwind's source
scanning is scoped so neither generates utilities from the other's markup.

## What this supersedes

- `docs/03-design-system.md` §3 Brand palette, §4 Typography and §7 Shape & elevation.
  The principles in §2 and the product-surface rules in §6 still hold.
- `docs/04-landing-page-spec.md`'s section list and wireframe. The art-direction rule,
  the per-section content requirements that survive, and the "show Keel before
  explaining Keel" test still hold.

Two sections named in the earlier spec are not on the page:

- **"Price is not liquidity"** and the **API/developer** section were removed before this
  change (`086b593`), and this rhythm does not bring them back.
- **The metric bento** (`MetricBento`) is removed by this change. What it carried is
  still on the page: depth and collateral in the hero panel and the market table,
  manipulation cost and reachability in the finding. A second explanatory grid of the
  same four numbers was the repetition the art-direction rule warns about.
