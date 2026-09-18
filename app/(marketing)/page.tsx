import { Suspense } from 'react';
import { ArrowUpRight, ChevronRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { LandingMotion } from '@/components/marketing/landing-motion';
import {
  SiteHeader,
  Masthead,
  BrandMark,
} from '@/components/marketing/site-header';
import {
  HeroProductPreview,
  HeroProvenance,
} from '@/components/marketing/hero-product-preview';
import { MarketSnapshot } from '@/components/marketing/market-snapshot';
import { dashboardCopy, dashboardLinks } from '@/lib/dashboard';
import { BACKTEST_REPORT_URL } from '@/lib/report';
import {
  EngineStatusLive,
  EngineStatusPending,
} from '@/components/marketing/engine-status';
import { ArchitectureFlow } from '@/components/marketing/architecture-flow';
import { ExplainableRiskDemo } from '@/components/marketing/explainable-risk-demo';
import { BlendCasePreview } from '@/components/marketing/blend-case-preview';
import { ProvenanceSection } from '@/components/marketing/provenance-section';
import { market } from '@/lib/api/fixtures';
import { MetricValue, RiskBadge } from '@/components/keel/result';

export default function Home() {
  return (
    <>
      <LandingMotion />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Masthead />
      <SiteHeader />
      <main id="main-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="container hero-shell">
            <span className="hero-cross hero-cross-start" aria-hidden="true" />
            <span className="hero-cross hero-cross-end" aria-hidden="true" />
            <div className="hero-frame">
              <div className="hero-copy">
                <a className="hero-pill" href="#case-study">
                  February USTRY case study <ChevronRight size={15} />
                </a>
                <h1 id="hero-title">
                  Know how much a price can actually support.
                </h1>
                <p className="hero-description">
                  Measure how much can trade on Stellar before the price moves,
                  what it costs to move it, and how much collateral the market
                  can support.
                </p>
                <div className="hero-actions">
                  {/* Points at the live dashboard mounted in this deployment, so the
                      primary call to action is never a dead link. */}
                  <a className="hero-button" href={dashboardLinks.assets}>
                    <LayoutDashboard size={18} aria-hidden="true" />
                    {dashboardCopy.assets}
                  </a>
                  <Link
                    className="hero-button hero-button-quiet"
                    href="/evidence/asset-healthy"
                  >
                    See the full response <ChevronRight size={16} />
                  </Link>
                </div>
                {/* ONE LIVE READING, STREAMED. The rest of this page is a recorded
                    sample by design, and a reader who meets "Sample data" first can
                    reasonably conclude the engine is a mock. Suspense keeps the hero
                    painting immediately: the strip arrives when the API answers, and
                    the fallback is a neutral pending line, never the unreachable
                    one: whatever sits here is in the first HTML the browser gets,
                    and a failure sentence shown while the engine is up is the
                    impression this strip exists to prevent. */}
                <Suspense fallback={<EngineStatusPending />}>
                  <EngineStatusLive />
                </Suspense>
              </div>
              <div className="hero-visual">
                <HeroProductPreview />
                <HeroProvenance />
              </div>
            </div>
          </div>
        </section>
        <MarketSnapshot />
        <ArchitectureFlow />
        <ExplainableRiskDemo />
        <BlendCasePreview />
        <ProvenanceSection />
        <section className="final-cta-section" aria-labelledby="cta-title">
          <div className="container">
            <div className="final-cta">
              <h2 id="cta-title">Start with a market result.</h2>
              <p>
                Open the dashboard to inspect executable depth, collateral
                limits, and triggered flags across monitored Stellar markets.
              </p>
              <a className="button" href={dashboardLinks.assets}>
                {dashboardCopy.assets} <ArrowUpRight size={16} />
              </a>
              <div className="mini-grid">
                {market.items.map((row) => (
                  <article className="mini" key={row.asset.issuer}>
                    <div className="mini-top">
                      <span className="mini-name">
                        {row.asset.code} / {row.quote.code}
                        <span>
                          {row.asset.issuer
                            ? `${row.asset.issuer.slice(0, 6)}…${row.asset.issuer.slice(-4)}`
                            : 'Native asset'}
                        </span>
                      </span>
                      <RiskBadge
                        band={row.band}
                        bandConfidence={row.bandConfidence}
                      />
                    </div>
                    <dl>
                      <div>
                        <dt>5% depth</dt>
                        <dd>
                          <MetricValue
                            value={row.depth5PctBuySide}
                            unit={row.quote.code}
                            places={2}
                          />
                        </dd>
                      </div>
                      <div>
                        <dt>collateral</dt>
                        <dd>
                          <MetricValue
                            value={row.maxSafeCollateral}
                            unit={row.quote.code}
                            places={2}
                          />
                        </dd>
                      </div>
                      <div>
                        <dt>triggered flags</dt>
                        <dd>{row.flags.length}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <Link className="brand-link" href="/" aria-label="Keel home">
                <BrandMark />
              </Link>
              <p>
                Market depth and collateral risk on Stellar. A read-only
                measurement instrument.
              </p>
            </div>
            <nav aria-label="Footer product links">
              <span>Product</span>
              <a href="#markets">Market preview</a>
              <a href="#engine">What Keel measures</a>
              <a href="#case-study">Blend case study</a>
            </nav>
            <nav aria-label="Footer resource links">
              <span>Resources</span>
              <a href="/evidence/keel-openapi.yaml">API contract</a>
              <a href={BACKTEST_REPORT_URL} target="_blank" rel="noreferrer">
                Backtest report <ArrowUpRight size={12} />
              </a>
              <a href="https://github.com/Keel-Official/keel-frontend">
                GitHub <ArrowUpRight size={12} />
              </a>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Keel</span>
            <p>
              Keel is a proof of concept. It has no production mainnet SLA and
              should not be the sole basis for a financial decision.
            </p>
            <a href="#privacy">Privacy &amp; use</a>
          </div>
          <details id="privacy" className="privacy-note">
            <summary>About this preview</summary>
            <p>
              This page has no account, wallet connection, or analytics
              integration. Your hosting provider may record standard request
              logs. Sample findings and historical observations are provided for
              inspection, without a production SLA or financial guarantee.
            </p>
          </details>
        </div>
      </footer>
    </>
  );
}
