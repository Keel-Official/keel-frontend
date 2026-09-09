# Keel Frontend — Design System

## 1. Visual direction

**Working direction:** modern financial infrastructure + inspectable risk product.

Keel should feel:
- credible;
- contemporary;
- technically serious;
- product-like rather than editorial;
- information-rich without becoming a trading terminal;
- transparent about uncertainty and provenance.

Keel should not feel:
- like a research PDF converted to HTML;
- like a pitch deck with large headings and repeated text sections;
- like a generic SaaS template;
- casino-like, meme-coin-like, or speculative;
- neon/cyberpunk by default;
- like a minute-by-minute price-trading interface.

Reference mood:

> **serious fintech infrastructure with visible product output**

Useful reference roles:
- Paycrest for infrastructure storytelling;
- Mural Pay and Partna for developer/API product presentation;
- BlindPay for compact technical fintech composition;
- SpherePay for verification and product-surface framing;
- Meld for decision-output patterns;
- Swapped for dashboard/product previews;
- Conduit for system diagrams.

Do not clone any reference visually.

## 2. Core design principles

### Show Keel, not only the idea of Keel

Major marketing sections should contain product-native objects where possible:
- risk result;
- depth ladder;
- safe collateral;
- source breakdown;
- market snapshot;
- API response;
- historical evidence;
- provenance.

Educational diagrams are secondary. They should not replace the product in the hero.

### Demonstration before explanation

A visitor should first see a believable Keel result and then learn what it means.

### Clarity without excessive emptiness

Whitespace should create focus, not make the page feel unfinished. Dense product UI is welcome when it is the point of the section.

### Visual rhythm must vary

Do not repeat the same kicker + oversized heading + paragraph + cards formula across the whole page.

Alternate deliberately between:
- spacious positioning;
- compact product UI;
- market table/preview;
- system flow;
- dark technical section;
- chart/evidence section;
- concise provenance strip.

### Uncertainty is visible

`partial`, `unevaluated`, `null`, reconstructed sources, gaps, and warnings are product information.

### Exact units remain visible

Show `419,502 XLM`, not `419,502`.

### Provenance is part of the interface

Ledger sequence, methodology version, data source, computed time, and confidence should feel intentional — not like debug metadata.

## 3. Brand palette

Keep the current light-first direction, but use it with stronger hierarchy and fewer unrelated section colors.

### Base palette

| Token | Suggested role |
|---|---|
| `--bg` | pale cool page background |
| `--surface` | primary card/product surface |
| `--surface-subtle` | quiet section background |
| `--ink` | body text |
| `--ink-strong` | headings / key product values |
| `--ink-muted` | secondary information |
| `--border` | low-contrast structural border |
| `--border-strong` | data/product boundaries |
| `--brand` | deep navy / primary brand surface |
| `--brand-deep` | darkest technical section/footer surface |
| `--accent` | restrained teal/green action/data accent |
| `--accent-soft` | selected or highlighted background |

Do not introduce a large unrelated purple CTA block unless purple becomes a deliberate brand color used consistently across the entire product.

### Risk semantics

Maintain semantic risk colors:
- LOW → green;
- MEDIUM → amber;
- HIGH → orange;
- CRITICAL → red;
- unknown/unevaluated → neutral gray.

Risk colors are not decorative brand colors. Use them only where the underlying state warrants them.

### Color proportion

Aim approximately for:

```text
85–90% neutral / pale surfaces
7–10% deep brand surfaces
2–5% accent and semantic risk color
```

## 4. Typography

Preferred direction:
- product/marketing UI: **Manrope**;
- technical/numeric UI: **JetBrains Mono**.

Load actual fonts using `next/font`. Do not create misleading CSS token names that fall back to unrelated system fonts.

### Hierarchy

| Style | Use |
|---|---|
| Display | hero only; use sparingly |
| H1 | page title |
| H2 | major section |
| H3 | product module / section heading |
| Body large | positioning and major explanation |
| Body | default product/explanatory copy |
| Small | metadata/help |
| Mono | API paths, ledger, issuer, exact compact metrics |

### Revised scale rule

Do not let headings visually overpower all evidence beneath them.

Previous implementation leaned too hard into poster-sized headings with tiny supporting copy. The new system should slightly reduce display/H2 scale and increase body/product text legibility.

Guideline:
- hero display can still be bold and large;
- section H2 should normally remain below the visual dominance of a major product object placed beside it;
- body text should remain readable in full-page screenshots, not collapse into visual texture.

Use tabular numerals for metric columns.

## 5. Layout & spacing

Base spacing unit: **4px**.

Typical spacing:
- 4–8: micro spacing;
- 12–16: compact component internals;
- 20–24: product card grouping;
- 32–48: major product grouping;
- 64–96: common section separation;
- 96–120: only for intentionally spacious hero/CTA moments.

Avoid defaulting every section to 100–140px vertical padding.

### Container widths

- landing: 1200–1320px;
- dense market/product section: up to 1360px;
- asset/dashboard: 1280–1440px;
- long-form methodology reading column: 700–780px.

### Composition

A section may be:
- 50/50 copy + product;
- 35/65 copy + product;
- full-width product preview;
- asymmetric bento;
- full-width dark technical block;
- narrow copy above a dense table;
- chart-led case-study block.

Do not force every section into the same two-column template.

## 6. Product surfaces

### Product objects must look usable

A marketing product preview should resemble a real Keel interface, not a decorative mockup.

Good preview contents:
- actual asset/quote names or clearly labeled demo fixtures;
- LOW/MEDIUM/HIGH/CRITICAL;
- band confidence;
- depth ±2/5/10%;
- buy/sell or source breakdown;
- safe collateral;
- triggered flags;
- ledger/methodology/source.

Avoid meaningless placeholder patterns like `Asset A` / `Asset B` in major hero/product previews unless the section explicitly teaches an abstract comparison.

### Hero product object

The hero should normally show a compact Keel result or product interface.

Do not use a generic educational chart as the primary hero visual.

### Marketing previews should reuse domain semantics

Where possible, marketing previews should be built from the same underlying concepts/components used by the app:
- `RiskBadge`;
- `DepthLadder`;
- `MetricValue`;
- `FlagList`;
- `ProvenanceStrip`.

## 7. Shape & elevation

Direction:
- radius small: 8px;
- standard product card: 12px;
- large product/marketing panel: 16–20px;
- status chips may use pill radius;
- use thin borders heavily;
- use subtle diffuse shadow only when it helps separate a product object.

Avoid the previous hard offset-shadow treatment (`10px 10px` / `12px 12px`) as a default visual motif. It pushes the design toward editorial poster aesthetics.

Flat bordered surfaces remain appropriate for dense product tables and technical panels.

## 8. Risk badges & confidence

Minimum:

```text
CRITICAL
```

Confidence must remain adjacent or immediately discoverable:

```text
CRITICAL   PARTIAL CONFIDENCE
```

Never render LOW/full and LOW/partial identically.

Do not communicate risk only through color.

## 9. Triggered / clear / unevaluated

Three states must remain visually distinct.

Suggested hierarchy:
- triggered: strong semantic mark + readable explanation;
- clear: low-emphasis positive/neutral state where needed;
- unevaluated: neutral status with explicit “Not evaluated” language.

`unevaluated` must never look like success.

## 10. Data source & provenance

Data source communicates evidence quality:

| Source | UI language |
|---|---|
| `horizon` | Live measurement |
| `hubble` | Historical direct reading |
| `offers-implied` | Reconstructed from posted offers |
| `trades-implied` | Lower-bound reconstruction from executed trades |

For reconstructed/lower-bound series, show the limitation near the metric/chart, not only in a tooltip.

### Provenance strip pattern

Prefer a compact product-native strip such as:

```text
LEDGER        METHOD       SOURCE       CONFIDENCE
57938192      v1.x.x       Horizon      Full
```

This is more tangible than three generic marketing cards that merely say “Traceable / Reproducible / Read-only”.

## 11. Null / zero / unevaluated

- `0` → measured zero.
- `null` → unavailable / not applicable according to field semantics.
- unevaluated flag → required data missing.
- network/API failure → application error.

These states must never collapse into one visual `—` without explanation when the distinction matters.

## 12. Tables

Asset table priority:
1. Asset / quote.
2. Risk band + confidence.
3. 5% depth.
4. Max safe collateral.
5. Key triggered flags.
6. Provenance secondary details.

Desktop: table.  
Mobile: stacked asset cards.

A compact form of this table should be reusable on the landing page as **Market Snapshot**.

## 13. Charts

Charts are evidence, but the landing page may use charts as product demonstration when the data meaning is explicit.

Rules:
- label units;
- preserve exact values in tooltips/text;
- mark gaps;
- mark reconstruction/lower-bound series;
- use event markers;
- do not interpolate across missing data;
- keep buy/sell direction legible;
- avoid generic decorative line charts with no product context.

### Landing chart rule

The most important chart on the landing page should be historical/case-study evidence, not a generic hero illustration.

## 14. Architecture diagrams

Use simple boxes, connectors, labels, and small product-native outputs.

Good:

```text
SDEX ─┐
AMM  ─┼─→ Keel Engine → Depth / Manipulation / Collateral / Flags
Data ─┘                       ↓
                         Dashboard / API / Backtest
```

Avoid blockchain-themed decorative illustrations, 3D chains, coins, globes, or network particles.

## 15. Motion

Motion should support product understanding:
- 120–220ms interaction transitions;
- subtle hover/focus movement;
- optional lightweight reveal transitions;
- no continuously animated risk numbers;
- no background particle systems;
- respect `prefers-reduced-motion`.

Do not use “restrained motion” as an excuse for a completely static, lifeless page. Small purposeful interaction is welcome.

## 16. Accessibility

Target WCAG 2.2 AA.

- visible keyboard focus;
- 44×44px touch targets where practical;
- risk includes text;
- chart critical information has textual/table equivalent;
- tooltips are supplementary, not exclusive;
- readable body size;
- reduced motion supported;
- semantic headings remain logical even when visual composition varies.

## 17. Voice & copy

Tone:
- concise;
- precise;
- technically confident;
- direct;
- never alarmist.

Prefer concrete product language:
- “Executable depth at ±5%: 194,820 XLM.”
- “Holder concentration was not evaluated.”
- “This result is reconstructed from posted offers.”
- “The target is reachable at low cost.”

Avoid empty fintech language:
- “unlock powerful insights”;
- “next-generation risk intelligence”;
- “revolutionary market safety”.

Avoid absolute claims:
- “Safe asset.”
- “Guaranteed.”
- “Keel prevented the exploit.”

## 18. Visual QA questions

Before accepting a major page, ask:

1. Does the page show a real-looking Keel product object above the fold?
2. Could this design belong to any generic fintech startup if the logo were replaced?
3. Are there enough Keel-specific objects: depth, flags, collateral, source, provenance, API, historical evidence?
4. Does every section use the same composition? If yes, redesign the rhythm.
5. Is body/product text readable, or are headings consuming all visual attention?
6. Does whitespace create focus or simply make the page empty?
7. Does the case study show evidence, not only narrative text?
8. Is uncertainty visible without making the UI look broken?

The page is successful when its strongest visual elements could only plausibly belong to Keel.
