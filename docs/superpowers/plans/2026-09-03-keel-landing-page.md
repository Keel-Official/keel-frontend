# Keel Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the create-next-app starter with a static, evidence-led Keel landing page that explains quoted price versus executable liquidity and guides visitors to the future evidence surfaces.

**Architecture:** Keep `/` as a mostly static Server Component. Put the header and bespoke SVG evidence visuals in small `components/marketing/` files, keep page-level copy and section composition in `app/page.tsx`, and centralize the visual system in `app/globals.css`. Use semantic HTML, native links, and a native `<details>` mobile menu so no client-side state or additional dependencies are needed.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, CSS custom properties, inline SVG.

**Spec:** `docs/superpowers/specs/2026-09-03-keel-landing-page-design.md`

## Global Constraints

- The page is a brand-facing communication surface for Ambassador/SCF reviewers, Stellar ecosystem builders, and prospective technical users.
- Use an evidence-led technical-poster composition: light research surface, deep blue-black or indigo framing, restrained teal evidence accents, and labeled risk colors.
- The landing page must work without the Keel API and must not fetch live data.
- Keep the page a Server Component; do not add API clients, query libraries, auth, wallet integration, or external UI kits.
- Explain quoted price versus executable liquidity within 30 seconds.
- Risk state must use text and structure, never color alone.
- Include visible keyboard focus, logical heading hierarchy, descriptive labels, 44px minimum targets where practical, and reduced-motion alternatives.
- Test 375px, 768px, 1024px, and 1440px widths with no horizontal overflow.
- Do not use speculative crypto, wallet, transaction-signing, exploit-prevention, guaranteed-safety, or production-SLA claims.
- Use CSS semantic tokens and OKLCH values rather than raw per-component brand colors or gradients.

## File Map

- Create: `components/marketing/site-header.tsx` — server-rendered responsive header with native mobile menu.
- Create: `components/marketing/hero-depth-visual.tsx` — labeled illustrative hero SVG showing deep versus thin executable depth.
- Create: `components/marketing/risk-evidence-panel.tsx` — static example preserving critical, triggered, and not-evaluated states.
- Create: `tests/landing-page-content.test.mjs` — built-in Node content contract for the landing narrative, read-only semantics, metadata, and reduced-motion support.
- Modify: `app/page.tsx` — landing-page sections, copy, links, comparison, process, case-study timeline, proof points, final CTA, and footer composition.
- Modify: `app/layout.tsx` — Keel metadata, social metadata placeholder, and selected font variables.
- Modify: `app/globals.css` — OKLCH tokens, reset, type styles, layout utilities, focus states, responsive rules, and reduced-motion behavior.

## Execution Tasks

### Task 1: Establish global typography, color tokens, and metadata

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces semantic CSS variables consumed by every marketing component: `--keel-bg`, `--keel-surface`, `--keel-ink`, `--keel-muted`, `--keel-brand`, `--keel-accent`, `--keel-risk-*`, and `--keel-border`.
- Produces document metadata with the title `Keel | Liquidity risk intelligence for Stellar`, a description explaining executable liquidity, and Open Graph/Twitter metadata referencing `/og-image.png` as a future asset placeholder.

- [ ] **Step 1: Replace starter theme variables**

  Define OKLCH tokens in `:root`, including a pure or near-white background, a dark indigo-blue brand surface, a distinct teal accent, readable ink/muted text, border, and labeled low/medium/high/critical/unknown risk colors. Add corresponding Tailwind `@theme inline` mappings for background, foreground, sans, and mono.

- [ ] **Step 2: Add global layout and typography rules**

  Set `box-sizing`, body margin/background/color, a readable default line-height, balanced headings, pretty paragraph wrapping, tabular numerals, and a `::selection` color. Add a `.page-shell`, `.section-container`, `.eyebrow`, `.mono-label`, and `.focus-ring` utility layer only where repeated composition needs it.

- [ ] **Step 3: Add interaction and motion safeguards**

  Add visible `:focus-visible` rings for links/buttons/summary controls, pointer cursors for interactive elements, stable 150–220ms color/border/transform transitions, and a `prefers-reduced-motion: reduce` block that disables animation and transition.

- [ ] **Step 4: Update root font and metadata setup**

  Replace the create-next-app title/description with Keel metadata, use one non-reflex display/body family plus a monospace variable for identifiers, and export `metadataBase` from an environment-safe localhost URL. Keep the existing App Router `LayoutProps<"/">` signature valid for Next 16.

- [ ] **Step 5: Run the linter**

  Run `pnpm lint`.

  Expected: the starter files remain lint-clean with the new metadata and token declarations.

### Task 2: Build the focused marketing primitives

**Files:**
- Create: `components/marketing/site-header.tsx`
- Create: `components/marketing/hero-depth-visual.tsx`
- Create: `components/marketing/risk-evidence-panel.tsx`

**Interfaces:**
- `SiteHeader` accepts no props and renders the global navigation with anchors to `#product`, `/assets`, `/case-study/ustry`, `/methodology`, and a primary `/assets` CTA.
- `HeroDepthVisual` accepts no props and renders a decorative-but-labeled static SVG/HTML composition with adjacent text labels `Market depth profile`, `Same quoted price`, `Deep market`, and `Thin market`.
- `RiskEvidencePanel` accepts no props and renders a static evidence example whose text names `CRITICAL`, `Triggered`, `Not evaluated`, and `Partial data never means clear data.`

- [ ] **Step 1: Implement `SiteHeader` markup**

  Use a `<header>` with a landmark label, a text-based Keel mark, desktop `<nav>`, and a `<details>`/`<summary>` mobile menu. Use `aria-label` on each nav landmark, a visually-hidden menu label, 44px summary target, and no JS state. Keep the mobile menu links identical to the desktop destinations.

- [ ] **Step 2: Implement the hero depth visual**

  Use inline SVG with `aria-hidden="true"` for geometry and nearby HTML text for meaning. Draw two axes/curves: a broad descending depth curve for the deep market and an early steep drop for the thin market, with labeled 2%, 5%, and 10% thresholds. Avoid gradients, filters, animation requirements, and unverified live-data claims.

- [ ] **Step 3: Implement the risk evidence panel**

  Render semantic sections for the risk band, triggered findings, and not-evaluated finding. Use icons or simple SVG marks alongside words, but ensure all meaning remains available as text. Use a tinted panel and full borders, never a colored side stripe.

- [ ] **Step 4: Run the linter**

  Run `pnpm lint`.

  Expected: the new components pass without `any`, missing keys, invalid SVG attributes, or accessibility errors from the ESLint configuration.

### Task 3: Compose the landing page narrative

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- `Home` remains the default export and renders a single semantic page with one `h1`, ordered `h2` sections, and the components from Task 2.

- [ ] **Step 1: Replace the starter page with the accessible shell**

  Add a skip link, `SiteHeader`, `<main id="main-content">`, and a footer. Use max-width containers and consistent horizontal gutters. Keep the first fold static and useful with no API dependency.

- [ ] **Step 2: Add the hero section**

  Use the approved eyebrow, headline, supporting copy, primary `Explore assets` link, secondary `See the Blend case study` link, and trust line `Read-only`, `Open methodology`, `No wallet connection`. Pair the copy with `HeroDepthVisual` in a two-column layout that stacks on narrow screens.

- [ ] **Step 3: Add the price-versus-liquidity comparison**

  Add `id="product"`, heading `Price is not liquidity.`, explanatory copy, and a two-column comparison with both quoted prices at `10`, one `5% depth` of `500,000 XLM`, and the other `800 XLM`. Include a text conclusion that the same quoted price can imply different collateral risk.

- [ ] **Step 4: Add the four measurement modules**

  Add a section titled `What Keel measures` with four varied modules for effective liquidity depth, manipulation resistance, maximum safe collateral, and supporting risk signals. Keep manipulation copy paired with reachability and keep the quote-unit example visible.

- [ ] **Step 5: Add the three-step methodology flow**

  Add an ordered sequence with `Observe the market`, `Apply the methodology`, and `Publish evidence`. Use the number only here because the order carries meaning. Keep SDEX/AMM language secondary to the plain-language descriptions.

- [ ] **Step 6: Add the explainable-risk section**

  Add heading `No mystery score. Every flag can be inspected.`, a short explanation of rule-based bands, and `RiskEvidencePanel`. Include a visible note that partial data never means clear data.

- [ ] **Step 7: Add the case-study teaser and timeline**

  Add the February 2026 USTRY/Blend context without claiming prevention, a restrained static timeline with a labeled incident marker, and a standalone `Open the case study` link to `/case-study/ustry`.

- [ ] **Step 8: Add proof points, final CTA, and footer**

  Add `Traceable`, `Reproducible`, and `Read-only` proof points with links to `/methodology`, `/api`, and a GitHub placeholder. Add the final heading `See the market behind the price.`, two action links, the proof-of-concept/no-SLA note, and the financial-decision disclaimer.

- [ ] **Step 9: Run the linter**

  Run `pnpm lint`.

  Expected: the composed page passes lint without invalid nesting, missing `href`s, or image/anchor warnings.

### Task 4: Verify the production build and responsive quality

**Files:**
- Modify: `app/page.tsx`, `app/globals.css`, or marketing component files only if verification finds a concrete issue.

- [ ] **Step 1: Run the production build**

  Run `pnpm build`.

  Expected: Next.js builds the `/` route successfully with static metadata and no runtime-only API or browser dependencies.

- [ ] **Step 2: Run the content contract test**

  Run `node --test tests/landing-page-content.test.mjs`.

  Expected: all three tests pass, confirming the approved narrative, uncertainty language, read-only language, Keel metadata, and reduced-motion rule are present.

- [ ] **Step 3: Inspect responsive layout**

  Start the local app with `pnpm dev`, then inspect `/` at 375px, 768px, 1024px, and 1440px widths. Confirm the headline wraps within its container, the mobile details menu remains usable, all links retain 44px targets, and no horizontal scrollbar appears.

- [ ] **Step 4: Inspect accessibility and motion behavior**

  Keyboard through skip link, nav, menu summary, CTAs, and footer links. Confirm focus is visible and heading order is logical. Enable reduced motion and confirm decorative line/timeline motion is disabled without hiding content.

- [ ] **Step 5: Review the final diff**

  Review only the intended files and confirm no wallet, speculative, exploit-prevention, guaranteed-safety, or production-SLA claim slipped into the page. Confirm `PRODUCT.md`, the design spec, and this plan are the only documentation additions.

- [ ] **Step 6: Report verification evidence**

  State the exact lint/build results, the responsive widths inspected, and any unresolved future-route placeholders.

## Self-Review

- Spec coverage: hero, comparison, metrics, method flow, explainable risk, case study, proof points, CTA/footer, static rendering, metadata, accessibility, responsive behavior, and verification each have explicit task steps.
- Placeholder scan: no implementation step relies on `TBD`, `TODO`, or an undefined function/type. `/assets`, `/methodology`, `/case-study/ustry`, `/api`, and the GitHub destination are intentionally future-route links defined by the approved spec.
- Type consistency: all marketing components are prop-free Server Components, `Home` is the default route export, and CSS utility names are defined in Task 1 before use.
