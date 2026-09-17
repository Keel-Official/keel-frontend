import type {
  AssetIdValue,
  ThresholdGroup,
} from '@/lib/keel/format/methodology';
import { truncateIssuer } from '@/lib/keel/format/decimal';
import { cn } from '@/lib/keel/utils';

import { Value } from './value';

/**
 * Every threshold the engine served, by key name.
 *
 * The map is open ended by contract, so this renders what arrived rather than a list
 * this build knows about. A key added by the engine tomorrow appears tomorrow without
 * a change here, which is the point: a protocol reading this page is meant to be able
 * to apply its own thresholds, and it cannot do that against a list that has been
 * filtered by a dashboard.
 *
 * The key is shown verbatim, in a monospace face, because the key name is the thing a
 * consumer looks up in the contract. Renaming it into prose would break that lookup.
 */

export interface ThresholdTableProps {
  groups: readonly ThresholdGroup[];
  className?: string;
}

export function ThresholdTable({ groups, className }: ThresholdTableProps) {
  return (
    <div
      className={cn(
        'relative overflow-x-auto rounded-lg border border-[var(--keel-border)]',
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Every threshold served by the methodology endpoint, with the asset a
          figure is denominated in where the engine reports one.
        </caption>
        <thead>
          <tr className="border-b border-[var(--keel-border)] bg-[var(--keel-surface-subtle)] text-[var(--keel-muted)]">
            <th scope="col" className="px-3 py-2 text-left font-medium">
              Key
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr
              key={group.key}
              className="border-b border-[var(--keel-border)] last:border-0"
            >
              <th scope="row" className="px-3 py-2 text-left font-normal">
                <code className="tabular text-[var(--keel-ink-strong)]">
                  {group.key}
                </code>
                {group.denominatedIn ? (
                  <p className="mt-0.5 text-xs text-[var(--keel-muted)]">
                    denominated in <AssetPair asset={group.denominatedIn} />
                  </p>
                ) : null}
              </th>
              <td className="px-3 py-2 text-right align-top">
                <ThresholdValueCell group={group} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ThresholdValueCell({ group }: { group: ThresholdGroup }) {
  const { value } = group;

  if (value.kind === 'assetId') {
    return <AssetPair asset={value} />;
  }

  if (value.kind === 'opaque') {
    return (
      <code className="tabular break-all text-[var(--keel-ink)]">
        {value.text}
      </code>
    );
  }

  return <Value value={value.value} />;
}

/**
 * The full `(code, issuer)` pair, never the bare ticker.
 *
 * A threshold denominated in "USDC" names nothing: ninety-seven distinct assets share
 * the AQUA ticker, and the same is true of any other code. The issuer is truncated in
 * the middle so both ends stay comparable by eye, and the whole value is on the
 * element.
 */
function AssetPair({ asset }: { asset: AssetIdValue }) {
  return (
    <span className="tabular text-[var(--keel-ink)]" title={asset.raw}>
      {asset.code}
      <span className="text-[var(--keel-muted)]">
        :{truncateIssuer(asset.issuer, 6)}
      </span>
    </span>
  );
}
