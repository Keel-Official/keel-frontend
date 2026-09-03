# Keel Frontend — Initial Design System

## 1. Visual direction

**Working direction:** institutional risk research + modern data terminal.

Keel should feel:
- credible;
- calm;
- analytical;
- transparent;
- technical without being hostile to non-technical readers.

Keel should not feel:
- casino-like;
- meme-coin-like;
- neon/cyberpunk by default;
- overloaded with glowing gradients;
- like a trading terminal optimized for minute-by-minute speculation.

A good reference mood is “research report meets modern fintech product.”

## 2. Core design principles

### Clarity over density

A reviewer should understand a risk state without reading methodology first.

### Uncertainty must be visible

`partial`, `unevaluated`, `null`, reconstructed sources, and warnings are product information, not visual noise.

### Color is secondary to language

Never communicate LOW/HIGH/CRITICAL solely by color. Every state includes a label and, where useful, an icon.

### Exact unit next to every important number

Keel values are denominated in the quote asset. Show `419,502 XLM`, not an unlabeled `419,502`.

### Provenance is first-class

Ledger sequence, data source, and methodology version should be reachable from every metric detail page.

## 3. Color tokens

Initial light-first palette. These are starting tokens, not permanent branding.

### Neutral / brand

| Token | Value | Use |
|---|---:|---|
| `--bg` | `#F7F9FB` | application background |
| `--surface` | `#FFFFFF` | cards, table surfaces |
| `--surface-subtle` | `#F0F4F7` | quiet sections |
| `--ink` | `#0B1726` | primary text |
| `--ink-muted` | `#5E6B78` | secondary text |
| `--border` | `#DDE4EA` | standard borders |
| `--brand` | `#0B2A3D` | header/nav/primary brand |
| `--accent` | `#0F8F83` | links, active controls, selected state |
| `--accent-soft` | `#E6F5F2` | accent background |

### Risk semantics

| Token | Value | Meaning |
|---|---:|---|
| `--risk-low` | `#16794B` | no risk flag triggered |
| `--risk-medium` | `#9A6700` | medium-tier flag present |
| `--risk-high` | `#C45100` | high-tier flag present |
| `--risk-critical` | `#B42318` | critical-tier flag present |
| `--risk-unknown` | `#667085` | unavailable / unevaluated |

Use separate pale background tokens derived from these for badges/cards. Risk colors must not replace textual labels.

## 4. Typography

Recommended:

- UI/body: **Inter**.
- Technical/numeric identifiers: **IBM Plex Mono** or a system monospace fallback.

Typography hierarchy:

| Style | Suggested use |
|---|---|
| Display 1 | landing hero only |
| H1 | page title |
| H2 | major page section |
| H3 | card/section heading |
| Body | default explanation |
| Small | metadata/help text |
| Mono Small | ledger, issuer, methodology version, raw identifiers |

Rules:
- use tabular numerals for metric columns;
- keep issuer addresses monospace and truncate visually, never mutate/cut the actual copy value;
- avoid all-caps paragraphs; all-caps is acceptable for compact status labels only.

## 5. Spacing & layout

Base spacing unit: **4px**.

Common spacing:
- 4 — icon/text micro-gap;
- 8 — compact controls;
- 12 — badge/card internals;
- 16 — standard component padding;
- 24 — card/section internal groups;
- 32 — page blocks;
- 48/64/96 — landing-page section rhythm.

Content widths:
- marketing text: ~720px reading width;
- landing container: 1200–1280px;
- dashboard container: 1280–1440px;
- asset detail: 1200–1280px with full-width charts where useful.

## 6. Shape & elevation

- Radius small: 8px.
- Radius standard card: 12px.
- Radius large marketing panel: 16px.
- Avoid pill shapes for every component; reserve pills for tags/statuses.
- Use borders more often than strong shadows.
- Default shadow should be subtle; risk should come from information hierarchy, not dramatic elevation.

## 7. Risk badges

Minimum contents:

```text
[icon] CRITICAL
```

For confidence:

```text
CRITICAL · PARTIAL DATA
```

or render a separate `Partial data` badge immediately beside it.

Important distinction:
- `LOW + full` = all high/critical checks evaluated and no flag triggered.
- `LOW + partial` = currently no triggered flag, but the final risk could be worse.

Never render both identically.

## 8. Data-source badges

Data source communicates evidence quality:

| Source | UI language |
|---|---|
| `horizon` | Live measurement |
| `hubble` | Historical direct reading |
| `offers-implied` | Reconstructed from posted offers |
| `trades-implied` | Lower-bound reconstruction from executed trades |

`trades-implied` must always show a visible lower-bound/reconstruction notice near the metric/chart. Do not hide it in a tooltip only.

## 9. Null / zero / unevaluated

These are different states.

- `0` → measured zero; often a strong risk signal.
- `null` → unknown/not applicable depending on field semantics; show `—` plus explanation when important.
- `unevaluatedFlags` → condition could not be assessed; show as `Not evaluated`, never as `Clear`.
- missing API/network result → actual application error state.

## 10. Tables

Asset table should prioritize:

1. Asset / quote.
2. Risk band + confidence.
3. 5% depth.
4. Max safe collateral.
5. Key triggered flags.
6. Data/provenance details as secondary information.

Responsive behavior:
- desktop: table;
- mobile: stacked asset cards rather than forcing a horizontally unreadable table.

## 11. Charts

Charts are evidence, not decoration.

Rules:
- always label units;
- preserve exact values in tooltip text;
- mark gaps in history explicitly;
- mark reconstructed/lower-bound series;
- use exploit/event markers as annotations, not color-only indicators;
- do not interpolate across a known data gap as if data existed;
- depth chart should keep buy/sell direction understandable.

## 12. Motion

Use motion sparingly:
- 120–200ms interaction transitions;
- no animated counters for risk values;
- no continuous background animation behind data;
- respect `prefers-reduced-motion`.

## 13. Accessibility baseline

- Target WCAG 2.2 AA.
- Visible keyboard focus for every interactive element.
- Minimum 44×44px touch targets where practical.
- Risk state includes text, not color only.
- Charts require nearby text/table equivalents for critical information.
- Tooltips cannot be the only place a critical explanation exists.
- Do not use placeholder text as a field label.

## 14. Voice & copy

Tone: concise, precise, calm.

Prefer:
- “No executable price was found.”
- “6 high/critical checks were not evaluated.”
- “This result is reconstructed from posted offers.”

Avoid:
- “Danger!!!”
- “Safe asset.”
- “Guaranteed.”
- “Keel prevented the exploit.”

Keel is a proof-of-concept risk instrument. Copy should distinguish observed evidence from inference.

