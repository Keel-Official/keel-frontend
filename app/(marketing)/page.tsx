import { Suspense } from 'react';
import { ArrowUpRight, ChevronRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { LandingMotion } from '@/components/marketing/landing-motion';
import { SiteHeader, BrandMark } from '@/components/marketing/site-header';
import { HeroProductPreview } from '@/components/marketing/hero-product-preview';
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

export default function Home() {
  return (
    <>
      <LandingMotion />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="container hero-shell">
            <span className="hero-backdrop" aria-hidden="true" />
            <div className="hero-frame">
              <div className="hero-copy">
                <p className="hero-eyebrow">
                  Liquidity risk intelligence for Stellar
                </p>
                <h1 id="hero-title">
                  Keel measures the market behind a price.
                </h1>
                <p className="hero-description">
                  A price feed tells you what an asset is worth. Keel tells you
                  how much can trade before that price moves, what it would cost
                  to move it, and the collateral limit that follows. For lending
                  protocols, oracle consumers, and risk teams. Read-only, no
                  wallet.
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
              </div>
              <div className="hero-visual">
                <HeroProductPreview />
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
            </div>
          </div>
        </section>
        <MarketSnapshot />
        <ArchitectureFlow />
        <ExplainableRiskDemo />
        <BlendCasePreview />
        <ProvenanceSection />
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
