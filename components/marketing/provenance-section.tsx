import { ArrowUpRight, Fingerprint } from 'lucide-react';
import { healthy, methodology } from '../../lib/api/fixtures';
import { ProvenanceStrip } from '../keel/result';
import Link from 'next/link';

const questions = [
  [
    'How is Keel different from a price feed?',
    'A price feed reports a price. Keel measures the volume available near that price, the cost and reachability of price targets, and the resulting collateral constraints.',
  ],
  [
    'Is the data on this page live?',
    'The product previews use unchanged examples from the backend API contract. The February chart uses archived trade observations. Both are labeled; neither is a live market recommendation.',
  ],
  [
    'What does partial confidence mean?',
    'Some HIGH or CRITICAL checks could not be evaluated. The reported band is a floor: missing evidence could make the finding worse. It does not mean the asset is clear.',
  ],
  [
    'Does Keel need a wallet?',
    'No. Keel is read-only. It never signs or submits a Stellar transaction. You can inspect the sample data and contract without connecting a wallet.',
  ],
  [
    'Does the backtest prove Keel would have prevented the incident?',
    'No. An event marker is historical context, not proof of prediction or prevention. The published February trade analysis did not establish an actionable advance warning.',
  ],
  [
    'Can I use the result as a financial guarantee?',
    'No. Keel is a proof of concept. Its thresholds are chosen rather than empirically calibrated, and its results should not be the sole basis for a financial decision.',
  ],
];

export function ProvenanceSection() {
  return (
    <section
      className="section provenance-section"
      id="methodology"
      aria-labelledby="provenance-title"
    >
      <div className="container">
        <div className="provenance-heading">
          <Fingerprint size={28} />
          <div>
            <h2 id="provenance-title">Sources and methodology</h2>
            <p>
              Each result records its ledger, data source, and methodology
              version.
            </p>
          </div>
          <a className="text-link" href="/evidence/flags-and-bands.md">
            Read methodology <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="evidence-strip">
          <ProvenanceStrip result={healthy} />
          <span className="sample-label">USDC / XLM sample</span>
        </div>
        <p className="calibration-note">
          Methodology {methodology.version} ·{' '}
          {methodology.calibrated
            ? 'Calibrated'
            : 'Thresholds are chosen, not empirically calibrated.'}{' '}
          <Link href="/evidence/methodology">
            See every threshold the engine applies.
          </Link>
        </p>
        <div className="faq-layout">
          <h3>Questions about Keel</h3>
          <div className="faq-list">
            {questions.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
