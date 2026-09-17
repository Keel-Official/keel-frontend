import type { AssetSummary } from '../api/types';
import { byValue, compareDecimalStrings } from '../format/compare';
import { compareBands } from '../format/flags';
import { classify } from '../format/value';
import { assetId } from '../format/decimal';
import type { SortDirection, SortKey } from '../url/asset-query';

/**
 * Local ordering and text search over the monitored set.
 *
 * Band and flag filtering are API parameters and are applied by the engine. Ordering
 * is not in the contract, so it happens here — exactly, over decimal strings, never
 * through a float.
 */

export function assetKey(asset: AssetSummary): string {
  return assetId(asset.asset.code, asset.asset.issuer);
}

/**
 * Matches code or issuer. Never matches on code alone when deciding identity — this is
 * a search box, not an identifier — and the issuer is searchable precisely because
 * ninety-seven distinct assets share the AQUA ticker.
 */
export function matchesText(asset: AssetSummary, query: string): boolean {
  if (query === '') return true;
  const needle = query.toLowerCase();
  return (
    asset.asset.code.toLowerCase().includes(needle) ||
    (asset.asset.issuer?.toLowerCase().includes(needle) ?? false) ||
    asset.quote.code.toLowerCase().includes(needle)
  );
}

export function filterByText(
  items: readonly AssetSummary[],
  query: string,
): AssetSummary[] {
  return items.filter((item) => matchesText(item, query));
}

function compareBy(key: SortKey, a: AssetSummary, b: AssetSummary): number {
  switch (key) {
    case 'asset':
      return assetKey(a).localeCompare(assetKey(b));
    case 'band':
      return compareBands(a.band, b.band);
    case 'depth':
      return byValue('asc')(
        classify(a.depth5PctBuySide),
        classify(b.depth5PctBuySide),
      );
    case 'collateral':
      return byValue('asc')(
        classify(a.maxSafeCollateral),
        classify(b.maxSafeCollateral),
      );
    case 'flags':
      return compareDecimalStrings(
        String(a.flags.length),
        String(b.flags.length),
      );
  }
}

/**
 * Reversing the direction reverses measured values only. A row whose figure the engine
 * could not produce stays at the end either way: it is not the safest asset in the
 * table and it is not the riskiest, and sorting it to an extreme would say otherwise.
 */
export function sortAssets(
  items: readonly AssetSummary[],
  key: SortKey,
  direction: SortDirection,
): AssetSummary[] {
  const unmeasuredLast = key === 'depth' || key === 'collateral';

  return [...items].sort((a, b) => {
    const forward = compareBy(key, a, b);
    if (forward === 0) return assetKey(a).localeCompare(assetKey(b));

    if (direction === 'asc') return forward;

    if (unmeasuredLast) {
      const aMissing = missing(key, a);
      const bMissing = missing(key, b);
      if (aMissing !== bMissing) return aMissing ? 1 : -1;
      if (aMissing && bMissing) return assetKey(a).localeCompare(assetKey(b));
    }
    return -forward;
  });
}

function missing(key: SortKey, asset: AssetSummary): boolean {
  const raw =
    key === 'depth' ? asset.depth5PctBuySide : asset.maxSafeCollateral;
  return raw === null || raw === undefined;
}
