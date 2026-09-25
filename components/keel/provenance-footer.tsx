/**
 * Where a block of recorded figures came from, set directly beneath the figures.
 *
 * Every figure on the landing page is a recording, and two kinds of recording sit on
 * it: responses copied unchanged from the backend API contract, and trade
 * observations archived from Horizon. A reader has to be able to tell which one a
 * number belongs to, which recording it is, and at which ledger and methodology it
 * was taken, without leaving the block. The values are passed in from the payload the
 * block renders, never written here.
 */

export type ProvenanceOrigin = 'contract-example' | 'archived-observations';

const originLabels: Record<ProvenanceOrigin, string> = {
  'contract-example': 'API contract example',
  'archived-observations': 'Archived trade observations',
};

const NOT_AVAILABLE = 'Not available';

export function ProvenanceFooter({
  origin,
  fixture,
  ledgerSeq,
  methodologyVersion,
}: {
  origin: ProvenanceOrigin;
  /** The recording's own name, as it is filed under `public/evidence`. */
  fixture: string;
  /**
   * One ledger, or the ledgers of every row in a list response. A list whose rows were
   * read at different ledgers shows each of them, in ascending order.
   */
  ledgerSeq: number | readonly number[] | null | undefined;
  methodologyVersion: string | null | undefined;
}) {
  const ledgers =
    ledgerSeq === null || ledgerSeq === undefined
      ? []
      : [...new Set(typeof ledgerSeq === 'number' ? [ledgerSeq] : ledgerSeq)]
          // Copied before sorting, so the caller's rows keep their own order.
          .sort((a, b) => a - b);

  return (
    <footer className="provenance-footer">
      <span className="provenance-origin">{originLabels[origin]}</span>
      <dl>
        <div>
          <dt>Recording</dt>
          <dd>
            <code>{fixture}</code>
          </dd>
        </div>
        <div>
          <dt>{ledgers.length > 1 ? 'Ledgers' : 'Ledger'}</dt>
          <dd>{ledgers.length ? ledgers.join(', ') : NOT_AVAILABLE}</dd>
        </div>
        <div>
          <dt>Methodology</dt>
          <dd>{methodologyVersion ?? NOT_AVAILABLE}</dd>
        </div>
      </dl>
    </footer>
  );
}
