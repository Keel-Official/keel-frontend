import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { LandingMotion } from '@/components/marketing/landing-motion';
import { SiteHeader, BrandMark } from '@/components/marketing/site-header';
import { HeroProductPreview } from '@/components/marketing/hero-product-preview';
import { MarketSnapshot } from '@/components/marketing/market-snapshot';
import { dashboardCopy, dashboardLinks } from '@/lib/dashboard';
import { MetricBento } from '@/components/marketing/metric-bento';
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
          <div className="container hero-grid">
            <div className="hero-copy">
              <h1 id="hero-title">
                Know how much
                <br />a price can
                <br />
                <span>actually support.</span>
              </h1>
              <p className="hero-description">
                Measure how much can trade on Stellar before the price moves,
                what it costs to move it, and how much collateral the market can
                support.
              </p>
              <div className="hero-actions">
                {/* Points at the live dashboard when one is configured, and at the
                    sample on this page when it is not, so the call to action is never
                    a dead link. */}
                <a className="button" href={dashboardLinks.assets}>
                  {dashboardCopy.assets} <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
            <HeroProductPreview />
          </div>
        </section>
        <MarketSnapshot />
        <MetricBento />
        <ArchitectureFlow />
        <ExplainableRiskDemo />
        <BlendCasePreview />
        <ProvenanceSection />
        <section className="final-cta" aria-labelledby="cta-title">
          <div className="container cta-inner">
            <div>
              <h2 id="cta-title">
                Start with a
                <br />
                market result.
              </h2>
            </div>
            <div>
              <a className="button" href={dashboardLinks.assets}>
                {dashboardCopy.assets} <ArrowUpRight size={18} />
              </a>
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
              <p>Market depth and collateral risk on Stellar.</p>
            </div>
            <nav aria-label="Footer product links">
              <span>Product</span>
              <a href="#markets">Market preview</a>
              <a href="#metrics">What Keel measures</a>
              <a href="#case-study">Blend case study</a>
            </nav>
            <nav aria-label="Footer resource links">
              <span>Resources</span>
              <a href="/evidence/keel-openapi.yaml">API contract</a>
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
            <a href="#privacy">Privacy & use</a>
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
