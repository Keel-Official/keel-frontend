import { ArrowUpRight } from 'lucide-react';
import { healthy } from '../../lib/api/fixtures';
import { CopyButton } from './copy-button';

const response = {
  band: healthy.band,
  bandConfidence: healthy.bandConfidence,
  depth: [healthy.depth[1]],
  maxSafeCollateral: healthy.maxSafeCollateral,
  ledgerSeq: healthy.ledgerSeq,
  methodologyVersion: healthy.methodologyVersion,
  dataSource: healthy.dataSource,
};
const json = JSON.stringify(response, null, 2);

export function ApiPreview() {
  return (
    <section className="api-section" id="api" aria-labelledby="api-title">
      <div className="container api-layout">
        <div className="api-copy">
          <h2 id="api-title">
            Query an asset.
            <br />
            Get its risk result.
          </h2>
          <p>
            Inspect the same depth, collateral, and risk evidence through one
            read-only API contract.
          </p>
          <p>
            Responses include decimal amounts, confidence, and the ledger used
            for the calculation.
          </p>
          <a className="button button-light" href="/evidence/keel-openapi.yaml">
            View API contract <ArrowUpRight size={16} />
          </a>
          <p className="api-caveat">
            Contract preview. A deployed API is not connected to this page.
          </p>
        </div>
        <div className="api-code-panel">
          <div className="code-toolbar">
            <span>
              <i />
              Response preview
            </span>
            <CopyButton text={json} />
          </div>
          <div className="api-request">
            <span className="http-method">GET</span>
            <code>/v1/asset/USDC:{healthy.asset.issuer}/depth?quote=XLM</code>
          </div>
          <div className="code-caption">
            <span>200 OK</span>
            <span>Selected fields · application/json</span>
          </div>
          <pre tabIndex={0} aria-label="Sample API response">
            <code>
              {json.split('\n').map((line, index) => (
                <span className="code-line" key={index}>
                  <span className="line-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>
                    {line
                      .split(/("[^"\n]*"(?=:)|"[^"\n]*")/g)
                      .map((part, i) => (
                        <span
                          className={
                            part.startsWith('"')
                              ? line.includes(`${part}:`)
                                ? 'json-key'
                                : 'json-string'
                              : undefined
                          }
                          key={i}
                        >
                          {part}
                        </span>
                      ))}
                  </span>
                </span>
              ))}
            </code>
          </pre>
          <a className="code-footer" href="/evidence/asset-healthy.json">
            View complete sample response <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
