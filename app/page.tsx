import Link from "next/link";
import { HeroDepthVisual } from "../components/marketing/hero-depth-visual";
import { RiskEvidencePanel } from "../components/marketing/risk-evidence-panel";
import { SiteHeader } from "../components/marketing/site-header";

const measurements = [
  {
    index: "01",
    title: "Effective liquidity depth",
    body: "Measure quote-asset value that can trade before the market moves by ±2%, ±5%, and ±10%.",
    unit: "BUY + SELL · QUOTE ASSET",
  },
  {
    index: "02",
    title: "Manipulation resistance",
    body: "Estimate the notional needed to reach defined price targets, together with whether each target is reachable.",
    unit: "COST + REACHABILITY",
  },
  {
    index: "03",
    title: "Maximum safe collateral",
    body: "Surface a conservative collateral recommendation derived from executable depth and manipulation constraints.",
    unit: "CONSERVATIVE RECOMMENDATION",
  },
  {
    index: "04",
    title: "Supporting risk signals",
    body: "Keep spread, source divergence, genuine activity, and holder concentration in view where data is available.",
    unit: "PROVENANCE AWARE",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Observe the market",
    body: "Keel reads Stellar market data from SDEX, AMMs, and supporting observations.",
  },
  {
    number: "02",
    title: "Apply the methodology",
    body: "Depth, manipulation, collateral, and rule-based flags turn observations into findings.",
  },
  {
    number: "03",
    title: "Publish evidence",
    body: "Results stay inspectable through the dashboard, API material, and historical case studies.",
  },
];

export default function Home() {
  return (
    <div className="page-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader />

      <main id="main-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="section-container hero-grid">
            <div className="hero-copy">
              <p className="hero-kicker">Liquidity risk intelligence for Stellar</p>
              <h1 className="hero-title" id="hero-title">
                A price is only as credible as the <em>liquidity</em> behind it.
              </h1>
              <p className="hero-description">
                Keel measures executable market depth, estimates how costly it is to move a market, and surfaces collateral risk before thin liquidity is treated like deep liquidity.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary" href="/assets">
                  Explore assets <span aria-hidden="true">↗</span>
                </Link>
                <Link className="button button-secondary" href="/case-study/ustry">
                  See the Blend case study <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <div className="trust-line" aria-label="Keel properties">
                <span>Read-only</span>
                <span>Open methodology</span>
                <span>No wallet connection</span>
              </div>
            </div>
            <HeroDepthVisual />
          </div>
        </section>

        <section className="section section-subtle" id="product" aria-labelledby="problem-title">
          <div className="section-container comparison-layout">
            <div>
              <p className="section-kicker">The missing measurement</p>
              <h2 className="section-heading" id="problem-title">Price is not liquidity.</h2>
              <p className="section-intro">
                A market can print a price with very little executable depth behind it. For lending and collateral decisions, the question is not only what the price is, but how much can actually trade near it.
              </p>
            </div>
            <div className="comparison-grid" aria-label="Illustrative price versus liquidity comparison">
              <article className="comparison-card">
                <div className="comparison-card-header">
                  <h3>Asset A</h3>
                  <span className="comparison-state">Deep market</span>
                </div>
                <div className="comparison-stat">
                  <span className="comparison-stat-label">Quoted price</span>
                  <strong className="comparison-stat-value">10</strong>
                </div>
                <div className="comparison-stat">
                  <span className="comparison-stat-label">5% executable depth</span>
                  <strong className="comparison-stat-value">500,000 XLM</strong>
                </div>
              </article>
              <article className="comparison-card comparison-card--thin">
                <div className="comparison-card-header">
                  <h3>Asset B</h3>
                  <span className="comparison-state">Thin market</span>
                </div>
                <div className="comparison-stat">
                  <span className="comparison-stat-label">Quoted price</span>
                  <strong className="comparison-stat-value">10</strong>
                </div>
                <div className="comparison-stat">
                  <span className="comparison-stat-label">5% executable depth</span>
                  <strong className="comparison-stat-value">800 XLM</strong>
                </div>
              </article>
              <p className="comparison-footnote">Same quoted price. Very different collateral risk.</p>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="measurements-title">
          <div className="section-container">
            <div className="measurements-header">
              <div>
                <p className="section-kicker">The evidence layer</p>
                <h2 className="section-heading" id="measurements-title">What Keel measures</h2>
              </div>
              <p className="section-intro">
                The output is designed for inspection. Each measure keeps its unit, source, and uncertainty close to the conclusion.
              </p>
            </div>
            <div className="measurement-grid">
              {measurements.map((measurement) => (
                <article className="measurement-module" key={measurement.index}>
                  <span className="measurement-index">{measurement.index}</span>
                  <h3>{measurement.title}</h3>
                  <p>{measurement.body}</p>
                  <span className="measurement-unit">{measurement.unit}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-subtle" aria-labelledby="process-title">
          <div className="section-container">
            <div className="process-intro">
              <div>
                <p className="section-kicker">From market to finding</p>
                <h2 className="section-heading" id="process-title">A clear path from observation to evidence.</h2>
              </div>
              <p className="section-intro">
                Keel keeps the chain visible without asking visitors to decode blockchain internals first.
              </p>
            </div>
            <div className="process-grid">
              {processSteps.map((step) => (
                <article className="process-step" key={step.number}>
                  <span className="process-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="risk-title">
          <div className="section-container risk-layout">
            <div>
              <p className="section-kicker">Risk, with its working shown</p>
              <h2 className="section-heading" id="risk-title">No mystery score. Every flag can be inspected.</h2>
              <p className="section-intro">
                Keel uses rule-based bands rather than an unexplained weighted score. The finding comes first, then the triggered checks, the checks that could not be evaluated, and the provenance behind the result.
              </p>
              <div className="risk-callout">
                <span className="risk-callout-mark" aria-hidden="true">!</span>
                Partial data never means clear data.
              </div>
            </div>
            <RiskEvidencePanel />
          </div>
        </section>

        <section className="section section-brand" aria-labelledby="case-study-title">
          <div className="section-container case-study-layout">
            <div>
              <p className="section-kicker">Historical evidence</p>
              <h2 className="section-heading" id="case-study-title">A known incident, replayed as evidence.</h2>
              <p className="section-intro">
                The February 2026 USTRY/Blend incident is Keel&apos;s primary historical test case. The case study asks whether market-depth and manipulation metrics would have exposed structural risk before a quoted price was treated as large collateral value.
              </p>
              <Link className="button button-secondary case-study-link" href="/case-study/ustry">
                Open the case study <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="timeline" aria-label="Illustrative case study timeline">
              <article className="timeline-event">
                <span className="timeline-date">Before the incident</span>
                <h3>Quoted value looks available.</h3>
                <p>Price visibility alone does not show how much volume can trade near that quote.</p>
              </article>
              <article className="timeline-event">
                <span className="timeline-date">Market evidence</span>
                <h3>Depth and reachability add context.</h3>
                <p>Executable depth and manipulation cost make structural weakness legible as evidence.</p>
              </article>
              <article className="timeline-event timeline-event--incident">
                <span className="timeline-date">22 February 2026 · incident marker</span>
                <h3>USTRY / Blend incident.</h3>
                <p>The historical page documents what the data can support, plus the limits of the reconstruction.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section proof-section" aria-labelledby="proof-title">
          <div className="section-container">
            <p className="section-kicker">A product built to be checked</p>
            <h2 className="section-heading" id="proof-title">The evidence stays close to the claim.</h2>
            <div className="proof-grid">
              <article className="proof-point">
                <span className="mono-label">01 · Provenance</span>
                <h3>Traceable</h3>
                <p>Results carry ledger sequence, methodology version, timestamps, and data source.</p>
              </article>
              <article className="proof-point">
                <span className="mono-label">02 · Method</span>
                <h3>Reproducible</h3>
                <p>The methodology and supporting evidence are public and reviewable.</p>
                <Link href="/methodology">Read the methodology <span aria-hidden="true">↗</span></Link>
              </article>
              <article className="proof-point">
                <span className="mono-label">03 · Boundary</span>
                <h3>Read-only</h3>
                <p>Keel never signs or submits a Stellar transaction. It reports evidence for people to inspect.</p>
                <Link href="/api">View the API contract <span aria-hidden="true">↗</span></Link>
              </article>
            </div>
          </div>
        </section>

        <section className="final-cta" aria-labelledby="final-cta-title">
          <div className="section-container final-cta-inner">
            <div>
              <h2 id="final-cta-title">See the market behind the price.</h2>
              <p>Start with the monitored assets, then follow the evidence into methodology and historical context.</p>
            </div>
            <div className="final-cta-actions">
              <Link className="button button-primary" href="/assets">Explore assets <span aria-hidden="true">↗</span></Link>
              <Link className="button button-secondary" href="/methodology">Read methodology <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <Link className="brand-lockup footer-brand" href="/" aria-label="Keel home">
              <span>Keel</span>
            </Link>
            <p className="footer-description">Liquidity risk intelligence for Stellar assets, built for evidence rather than speculation.</p>
          </div>
          <div>
            <p className="footer-heading">Explore</p>
            <nav className="footer-links" aria-label="Explore links">
              <Link href="/assets">Assets</Link>
              <Link href="/case-study/ustry">Blend case study</Link>
              <Link href="/methodology">Methodology</Link>
            </nav>
          </div>
          <div>
            <p className="footer-heading">Project</p>
            <nav className="footer-links" aria-label="Project links">
              <Link href="/api">API / OpenAPI</Link>
              <a href="https://github.com/Keel-Official/keel-frontend" target="_blank" rel="noreferrer">GitHub</a>
              <span>Stellar ecosystem</span>
            </nav>
          </div>
          <p className="footer-disclaimer">
            <strong>Proof of concept, no production SLA.</strong> Keel is read-only; it never signs or submits transactions. It should not be the sole basis for a financial decision.
          </p>
        </div>
      </footer>
    </div>
  );
}
