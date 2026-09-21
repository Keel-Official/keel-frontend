import { dashboardAssetPath } from '../routes';

/**
 * A past ledger to read an asset at, held in the URL like every other view choice.
 *
 * `GET /asset/{id}/depth?ledger=` is the engine's historical path, and it answers only
 * for ledgers a replay has stored: every other ledger is a 404 whose message says so.
 * This page does not keep its own list of which ledgers exist. The engine is asked, and
 * its answer, including its refusal, is what the reader sees.
 *
 * A value that is not a positive whole number is dropped rather than corrected, so a
 * hand-edited URL degrades to the live reading instead of to a guess.
 */

/** Ledger sequences are uint32 on Stellar. */
const MAX_LEDGER = 4_294_967_295;

export function parseLedger(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined || !/^\d{1,10}$/.test(value.trim())) return null;
  const ledger = Number(value.trim());
  return ledger >= 1 && ledger <= MAX_LEDGER ? ledger : null;
}

/** One asset read at one past ledger. */
export function assetAtLedgerPath(assetId: string, ledger: number): string {
  return `${dashboardAssetPath(assetId)}?ledger=${ledger}`;
}
