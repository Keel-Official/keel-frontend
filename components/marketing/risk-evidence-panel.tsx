export function RiskEvidencePanel() {
  return (
    <div className="risk-evidence" aria-label="Illustrative explainable risk finding">
      <div className="risk-evidence-header">
        <span className="risk-evidence-title">Asset finding</span>
        <span className="risk-band">Critical</span>
      </div>
      <div className="risk-evidence-body">
        <div className="evidence-group">
          <span className="evidence-group-label">Triggered</span>
          <span className="evidence-item">
            <span className="evidence-item-mark" aria-hidden="true">!</span>
            Zero executable depth within 2%
          </span>
          <span className="evidence-item">
            <span className="evidence-item-mark" aria-hidden="true">!</span>
            Manipulation target is reachable at low cost
          </span>
        </div>
        <div className="evidence-group evidence-group--unevaluated">
          <span className="evidence-group-label">Not evaluated</span>
          <span className="evidence-item">
            <span className="evidence-item-mark" aria-hidden="true">?</span>
            Holder concentration
          </span>
        </div>
        <p className="risk-evidence-note">
          Partial data never means clear data. Every result keeps the checks that could not be evaluated visible.
        </p>
      </div>
    </div>
  );
}
