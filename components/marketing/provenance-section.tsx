import { healthy } from '../../lib/api/fixtures';
import { ProvenanceStrip } from '../keel/result';

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
      id="provenance"
      aria-labelledby="provenance-title"
    >
      <div className="container">
        <h2 id="provenance-title">Questions about Keel.</h2>
        <div className="faq-list">
          {questions.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>
                <span className="qn" aria-hidden="true">
                  Q{index + 1}
                </span>
                <span className="qt">{question}</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
