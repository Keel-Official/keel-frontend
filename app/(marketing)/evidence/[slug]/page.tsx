import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, FileJson } from 'lucide-react';

import type { components } from '@/lib/api/schema';
import { EVIDENCE, findEvidence, type EvidenceItem } from '@/lib/evidence';
import { dashboardLinks } from '@/lib/dashboard';
import {
  AssetIdentity,
  DepthLadder,
  FlagList,
  LiquiditySourceBreakdown,
  ManipulationRungs,
  MetricValue,
  ProvenanceStrip,
  RiskBadge,
} from '@/components/keel/result';
import { SiteHeader } from '@/components/marketing/site-header';

type AssetRisk = components['schemas']['AssetRisk'];
type AssetList = components['schemas']['AssetListResponse'];
type Methodology = components['schemas']['Methodology'];

export function generateStaticParams() {
  return EVIDENCE.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<'/evidence/[slug]'>): Promise<Metadata> {
  const item = findEvidence((await params).slug);
  if (!item) return {};
  return { title: `${item.title} — Keel evidence`, description: item.summary };
}

export default async function EvidencePage({ params }: PageProps<'/evidence/[slug]'>) {
  const item = findEvidence((await params).slug);
  if (!item) notFound();

  return (
    <>
      <SiteHeader />
      <main className="evidence-main" id="main-content">
        <div className="container">
          <Link className="evidence-back" href="/">
            <ArrowLeft size={16} /> Back to Keel
          </Link>

          <header className="evidence-header">
            <span className="sample-label">Recorded sample · not live</span>
            <h1>{item.title}</h1>
            <p>{item.summary}</p>
          </header>

          {item.kind === 'asset' ? <AssetEvidence result={item.data as AssetRisk} /> : null}
          {item.kind === 'list' ? <ListEvidence list={item.data as AssetList} /> : null}
          {item.kind === 'methodology' ? (
            <MethodologyEvidence doc={item.data as Methodology} />
          ) : null}

          <EvidenceFooter item={item} />
        </div>
      </main>
    </>
  );
}

function AssetEvidence({ result }: { result: AssetRisk }) {
  const quote = result.quote.code;

  return (
    <div className="evidence-body">
      <section className="evidence-card">
        <div className="evidence-identity">
          <AssetIdentity asset={result.asset} quote={result.quote} />
          <RiskBadge band={result.band} bandConfidence={result.bandConfidence} />
        </div>
        <dl className="evidence-figures">
          <div>
            <dt>Mid price</dt>
            <dd>
              <MetricValue value={result.midPrice} unit={quote} places={7} />
            </dd>
            <p>Source: {result.priceSource}</p>
          </div>
          <div>
            <dt>Max safe collateral</dt>
            <dd>
              <MetricValue value={result.maxSafeCollateral} unit={quote} places={2} />
            </dd>
            <p>The lower of the liquidation and manipulation limits</p>
          </div>
          <div>
            <dt>Spread</dt>
            <dd>
              <MetricValue value={result.spreadPct} unit="%" places={4} />
            </dd>
            <p>Undefined unless the price came from a two-sided book</p>
          </div>
        </dl>
      </section>

      <section className="evidence-card">
        <h2>What volume sits near the price?</h2>
        <p className="evidence-note">
          Three rungs, at 2, 5 and 10 per cent from the midpoint. Buy side answers oracle
          manipulation risk and sell side answers liquidation risk; neither is &ldquo;the
          depth&rdquo;.
        </p>
        <DepthLadder result={result} />
        <LiquiditySourceBreakdown result={result} />
      </section>

      <section className="evidence-card">
        <h2>What would it cost to move the price?</h2>
        <p className="evidence-note">
          Read cost together with reachability. A figure on an unreachable rung says how
          far the book goes, not what the move costs.
        </p>
        <ManipulationRungs result={result} />
      </section>

      <section className="evidence-card">
        <h2>Which checks fired, and which could not run?</h2>
        <p className="evidence-note">
          An unevaluated check is not a check that came back clear. An empty list of
          triggered flags is only a pass when nothing went unevaluated.
        </p>
        <FlagList result={result} />
      </section>

      {result.warnings.length > 0 ? (
        <section className="evidence-card">
          <h2>What the engine says about this result</h2>
          <p className="evidence-note">
            Served with the response and shown as written. These sentences explain why a
            field is null for a structural reason rather than a missing one.
          </p>
          <ul className="evidence-warnings">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="evidence-card">
        <h2>Where this result came from</h2>
        <ProvenanceStrip result={result} />
        <p className="evidence-note">
          Ledger closed at {result.ledgerClosedAt}; computed at {result.computedAt}.
        </p>
      </section>
    </div>
  );
}

function ListEvidence({ list }: { list: AssetList }) {
  return (
    <div className="evidence-body">
      <section className="evidence-card">
        <h2>
          {list.items.length} of {list.total} monitored markets
        </h2>
        <p className="evidence-note">
          A page of the set. The engine reports {list.total} in total, so a reader that
          ignores paging sees a page and believes it is everything.
        </p>
        <div className="evidence-table-wrap">
          <table className="evidence-table">
            <thead>
              <tr>
                <th scope="col">Asset</th>
                <th scope="col">Band</th>
                <th scope="col">Depth, 5% buy side</th>
                <th scope="col">Max safe collateral</th>
                <th scope="col">Flags fired</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((row) => (
                <tr key={`${row.asset.code}:${row.asset.issuer ?? 'native'}`}>
                  <td>
                    <AssetIdentity asset={row.asset} quote={row.quote} compact />
                  </td>
                  <td>
                    <RiskBadge band={row.band} bandConfidence={row.bandConfidence} />
                  </td>
                  <td className="numeric">
                    <MetricValue
                      value={row.depth5PctBuySide}
                      unit={row.quote.code}
                      places={2}
                    />
                  </td>
                  <td className="numeric">
                    <MetricValue
                      value={row.maxSafeCollateral}
                      unit={row.quote.code}
                      places={2}
                    />
                  </td>
                  <td className="numeric">{row.flags.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="evidence-note">
          &ldquo;Flags fired&rdquo; counts triggered flags only. This response does not
          carry what could not be evaluated, so a zero here is not a clean bill of health.
        </p>
      </section>
    </div>
  );
}

function MethodologyEvidence({ doc }: { doc: Methodology }) {
  const thresholds = Object.entries(doc.thresholds);

  return (
    <div className="evidence-body">
      {doc.calibrated ? null : (
        <section className="evidence-card evidence-caution">
          <h2>These thresholds are chosen, not calibrated</h2>
          {doc.calibrationNote ? <p>{doc.calibrationNote}</p> : null}
        </section>
      )}

      <section className="evidence-card">
        <h2>Version {doc.version}</h2>
        <p className="evidence-note">
          Keys are shown as served. Every key ending in <code>Pct</code> is a percentage
          rather than a fraction — the one unit convention the contract states.
        </p>
        <div className="evidence-table-wrap">
          <table className="evidence-table">
            <thead>
              <tr>
                <th scope="col">Key</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {thresholds.map(([key, value]) => (
                <tr key={key}>
                  <th scope="row">
                    <code>{key}</code>
                  </th>
                  <td className="numeric">
                    <code>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function EvidenceFooter({ item }: { item: EvidenceItem }) {
  return (
    <footer className="evidence-footer">
      <p>
        This is a recording, kept so a claim on the landing page can be checked against
        what the engine actually returns. It does not update.
      </p>
      <div className="evidence-footer-links">
        <a href={item.rawPath}>
          <FileJson size={16} /> The file this page renders
        </a>
        <a
          href={
            item.kind === 'methodology'
              ? dashboardLinks.methodology
              : dashboardLinks.assets
          }
        >
          See the same thing live <ArrowUpRight size={16} />
        </a>
      </div>
    </footer>
  );
}
