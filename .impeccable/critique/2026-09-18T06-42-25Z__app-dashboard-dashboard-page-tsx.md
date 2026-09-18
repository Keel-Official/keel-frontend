---
target_identity: "file:C:\\Users\\RAFLI\\Downloads\\Stellar\\Keel\\Project\\keel-frontend\\app-dashboard-dashboard-page-tsx"
timestamp: 2026-09-18T06-42-25Z
slug: app-dashboard-dashboard-page-tsx
closed: true
---
# Keel dashboard critique

Method: dual-agent (A: /root/dashboard_design_review · B: /root/dashboard_detector_review), with an additional populated browser pass at http://localhost:3101/dashboard.

Target: `app/(dashboard)/dashboard/page.tsx` and the dashboard component/style tree.

## Design health

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3/4 | Provenance and API alerts are visible; loading and retry feedback are absent. |
| 2 | Match system / real world | 3/4 | Oracle-versus-liquidity framing is clear, but depth, band, flags, and ledger need inline context. |
| 3 | User control and freedom | 2/4 | Filters and URL state help, but the filter form submits to `/`. |
| 4 | Consistency and standards | 4/4 | Shared tokens, semantic tables, responsive cards, and focus treatment are strong. |
| 5 | Error prevention | 2/4 | The broken form action can silently leave the dashboard. |
| 6 | Recognition rather than recall | 3/4 | Units and confidence are visible; incomplete evaluation requires reading a footnote. |
| 7 | Flexibility and efficiency | 2/4 | Sorting and URL filters exist; filtering is currently broken and there are no power-user shortcuts. |
| 8 | Aesthetic and minimalist design | 3/4 | Calm and legible, but the equal KPI strip and repeated rounded panels feel templated. |
| 9 | Error recovery | 2/4 | The transport error explains configuration but has no retry or useful in-product next action. |
| 10 | Help and documentation | 2/4 | Methodology is reachable; flag and table terminology lack contextual help. |
| **Total** |  | **26/40** | **Acceptable; significant improvements needed** |

## Design specificity

Semantic specificity is strong: executable depth, bands plus confidence, exact units, calibration caveats, provenance, and triggered-flag semantics are genuinely Keel-specific. Visual specificity is moderate. The sticky header, four equal KPI cells, filter card, and sortable table could be reused for a generic fintech risk screener. The overview also omits manipulation cost/reachability and source contribution, leaving the most distinctive evidence to the detail route.

## Priority issues

1. **[P0] Filter submission exits the dashboard.** `components/dashboard/asset-filters.tsx:56` uses `action="/"`; applying `hasFlag` or `q` navigates to the marketing root. Point the form at `/dashboard`, preserve URL state, and test both controls. Suggested command: `$impeccable harden`.
2. **[P1] The overview leads with operations instead of findings.** `app/(dashboard)/dashboard/page.tsx:57-93` prioritizes asset count, ledger, methodology, and engine status before identifying what needs review. Add a finding-led summary before operational metadata. Suggested command: `$impeccable layout`.
3. **[P1] “Flags fired” can imply a clean result.** `components/dashboard/asset-table.tsx:101-103` renders only `item.flags.length`; the warning that zero is not a clean bill of health is below the table at `app/(dashboard)/dashboard/page.tsx:179-185`. Make incomplete evaluation visible per row or beside the count. Suggested command: `$impeccable clarify`.
4. **[P2] Mobile filter controls are undersized.** `components/dashboard/asset-filters.tsx:63-107,127-146` uses compact controls around 28–32px high, below the project’s practical 44px target. Suggested command: `$impeccable adapt`.
5. **[P2] The transport failure has no recovery action.** `app/(dashboard)/dashboard/page.tsx:116-134` explains setup but does not offer retry or a useful fallback. Suggested command: `$impeccable harden`.

## Strengths

- `components/dashboard/value.tsx` preserves exact decimals, units, null states, and not-reported/not-computed distinctions.
- `components/dashboard/band-chip.tsx` combines icon, text, color, and confidence, so risk is not color-only.
- The shell provides a skip link, semantic navigation, `aria-current`, table headers, visible focus, and a mobile card fallback.

## Audit

| Dimension | Score | Evidence |
|---|---:|---|
| Accessibility | 3/4 | Axe reported zero WCAG 2a/2aa violations at 1440px and 390px; practical touch target and jargon issues remain. |
| Performance | 3/4 | Server-rendered data path is straightforward; 61 rows and detail charts render eagerly. |
| Theming | 4/4 | Scoped tokens, semantic risk ramps, and one coherent light theme; no unvalidated dark theme is implied. |
| Responsive design | 3/4 | No horizontal overflow at 390px; header/KPI/filter density is heavy on mobile. |
| Implementation integrity | 3/4 | Detector found zero primary findings; verified UX defects and repeated dashboard scaffolding remain. |
| **Total** | **16/20** | **Good; address weak dimensions** |

## Technical evidence

- Detector: `impeccable detect --json` on `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/dashboard/dashboard.css`, and `components/dashboard`; exit 0, `[]`, no false positives.
- Populated browser: live read-only API at `https://api.keels.app/v1`, dashboard loaded 61 rows, no page errors, no horizontal overflow at 1440px or 390px.
- Axe: zero violations for `wcag2a` and `wcag2aa` at both viewports.
- Error-state browser: with the API URL unset, the dashboard gives explicit configuration guidance but becomes visually sparse and reports “not reported” provenance.
- Overlay injection was unavailable because the browser surface did not expose mutable page evaluation; no `[Human]` overlay was claimed.
- Temporary populated dev server was stopped after inspection.
- No critique ignore file was present. No UI files were modified.
