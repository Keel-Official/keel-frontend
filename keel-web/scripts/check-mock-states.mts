/**
 * Asserts that the contract mock actually serves the display states the UI has to
 * handle, before anything is built on top of it.
 *
 * These are not decorative fixtures. Several of them cannot be reached from the live
 * API at all: no live asset has `bandConfidence: "full"`, so a component that only
 * ever sees production data would never exercise the healthy path, and one that only
 * ever sees the mock would never exercise `partial`.
 *
 * Requires the mock:
 *   pnpm mock            # terminal 1
 *   pnpm check:mock-states
 *
 * Not part of `pnpm check`, which must run in CI without a server.
 */
import {
  createKeelClient,
  KEEL_EXAMPLES,
  type KeelExampleName,
} from '../lib/api/client.ts';
import type { AssetRisk, HistoryResponse, AssetListResponse } from '../lib/api/types.ts';

const MOCK_URL = process.env.KEEL_MOCK_URL ?? 'http://localhost:4010';
const ASSET_ID = 'USTRY:GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC';

interface Assertion {
  readonly label: string;
  readonly ok: boolean;
  readonly detail: string;
}

function check(label: string, ok: boolean, detail: string): Assertion {
  return { label, ok, detail };
}

/**
 * Most value-bearing fields in AssetRisk are both optional and nullable, so a field
 * has three wire states: absent, null, or a value. `undefined` and `null` are kept
 * apart here rather than collapsed, because the display must keep them apart too.
 */
function isComputedZero(value: string | null | undefined): boolean {
  return typeof value === 'string' && /^0\.?0*$/.test(value);
}

function describe(value: string | null | undefined): string {
  if (value === undefined) return '(absent)';
  if (value === null) return '(null)';
  return value;
}

const results: { state: string; assertions: Assertion[] }[] = [];

function record(state: string, assertions: Assertion[]): void {
  results.push({ state, assertions });
}

async function depth(example: KeelExampleName) {
  const client = createKeelClient({ baseUrl: MOCK_URL, example });
  const result = await client.GET('/asset/{assetId}/depth', {
    params: { path: { assetId: ASSET_ID } },
  });
  if (!result.data) {
    throw new Error(
      `${example} (Prefer: example=${KEEL_EXAMPLES[example]}) returned ` +
        `${result.response.status}: ${JSON.stringify(result.error)}`,
    );
  }
  return { data: result.data as AssetRisk, status: result.response.status };
}

async function main(): Promise<void> {
  console.log(`keel-web mock state check against ${MOCK_URL}\n`);

  // --- Healthy -------------------------------------------------------------
  // Price present, both sides of the book present, confidence full.
  {
    const { data, status } = await depth('healthy');
    const rung = data.depth[0];
    record('healthy', [
      check('HTTP 200', status === 200, String(status)),
      check('bandConfidence full', data.bandConfidence === 'full', String(data.bandConfidence)),
      check('price present', typeof data.midPrice === 'string', describe(data.midPrice)),
      check('priceSource is a book', data.priceSource === 'book', String(data.priceSource)),
      check('three depth rungs', data.depth.length === 3, String(data.depth.length)),
      check(
        'both sides present',
        rung !== undefined && rung.buySide !== null && rung.sellSide !== null,
        `buy=${rung?.buySide} sell=${rung?.sellSide}`,
      ),
      check('no triggered flags', data.flags.length === 0, JSON.stringify(data.flags)),
    ]);
  }

  // --- No executable price -------------------------------------------------
  // HTTP 200 with band CRITICAL. This is the most dangerous finding the system can
  // produce, and it must never render as an error, an empty state, or a missing row.
  // There is no needle position here: the meter needs a no-measurement state, which
  // is not the same as a needle at the far left.
  {
    const { data, status } = await depth('noPrice');
    record('no price', [
      check('HTTP 200, not an error', status === 200, String(status)),
      check('priceSource none', data.priceSource === 'none', String(data.priceSource)),
      check('band CRITICAL', data.band === 'CRITICAL', data.band),
      check('midPrice is null', data.midPrice === null, describe(data.midPrice)),
      check(
        'maxSafeCollateral is null, not "0" and not absent',
        data.maxSafeCollateral === null,
        describe(data.maxSafeCollateral),
      ),
      check(
        'NO_EXECUTABLE_PRICE flagged',
        data.flags.includes('NO_EXECUTABLE_PRICE'),
        JSON.stringify(data.flags),
      ),
      check(
        'no manipulation rungs to plot',
        data.manipulationCostCombined.length === 0,
        String(data.manipulationCostCombined.length),
      ),
    ]);
  }

  // --- Broken book ---------------------------------------------------------
  // One ask, one bid, far apart, producing a midpoint that means nothing. Everything
  // derived from that midpoint is unreliable and must be visibly damped.
  {
    const { data } = await depth('brokenBook');
    const free = data.manipulationCostCombined.filter((m) => isComputedZero(m.cost));
    const unreachable = data.manipulationCostCombined.filter((m) => !m.reachable);
    record('broken book', [
      check('midPrice present but meaningless', typeof data.midPrice === 'string', describe(data.midPrice)),
      check('SPREAD_EXTREME flagged', data.flags.includes('SPREAD_EXTREME'), JSON.stringify(data.flags)),
      check(
        'maxSafeCollateral is a computed zero, not null',
        isComputedZero(data.maxSafeCollateral),
        describe(data.maxSafeCollateral),
      ),
      check(
        'bandConfidence partial',
        data.bandConfidence === 'partial',
        String(data.bandConfidence),
      ),
      check(
        'has unevaluated flags, distinct from triggered',
        data.unevaluatedFlags.length > 0,
        `${data.flags.length} triggered / ${data.unevaluatedFlags.length} unevaluated`,
      ),
      // Rule 5: cost "0" with reachable true is free to reach; cost "0" with
      // reachable false is no liquidity at all. Opposite findings.
      check(
        'a zero cost that IS reachable exists',
        free.some((m) => m.reachable),
        JSON.stringify(free.map((m) => ({ delta: m.delta, cost: m.cost, reachable: m.reachable }))),
      ),
      check(
        'an unreachable rung exists',
        unreachable.length > 0,
        JSON.stringify(unreachable.map((m) => ({ delta: m.delta, reachable: m.reachable }))),
      ),
      check('maxReachablePrice present', typeof data.maxReachablePrice === 'string', describe(data.maxReachablePrice)),
      check('warnings to render verbatim', data.warnings.length > 0, String(data.warnings.length)),
    ]);
  }

  // --- Pool only -----------------------------------------------------------
  // An active pool means every target is reachable and a highest price has no
  // meaning, so maxReachablePrice is null for a structural reason the API explains
  // in warnings[]. That sentence is rendered, not summarised.
  {
    const { data } = await depth('poolOnly');
    record('pool only', [
      check('priceSource pool', data.priceSource === 'pool', String(data.priceSource)),
      check('no spread, there is no book', data.spreadPct === null, describe(data.spreadPct)),
      check(
        'maxReachablePrice null by structure',
        data.maxReachablePrice === null,
        describe(data.maxReachablePrice),
      ),
      check('warnings explain why', data.warnings.length > 0, `${data.warnings.length} warning(s)`),
    ]);
  }

  // --- Reconstructed reading ----------------------------------------------
  {
    const { data } = await depth('historical');
    record('reconstructed', [
      check(
        'dataSource is not a direct horizon reading',
        data.dataSource !== 'horizon',
        String(data.dataSource),
      ),
      check('unreachable rungs present', data.manipulationCostCombined.some((m) => !m.reachable), 'yes'),
    ]);
  }

  // --- Asset list ----------------------------------------------------------
  {
    const client = createKeelClient({ baseUrl: MOCK_URL, example: 'assetList' });
    const result = await client.GET('/assets', {});
    const data = result.data as AssetListResponse | undefined;
    const bands = new Set(data?.items.map((i) => i.band) ?? []);
    record('asset list', [
      check('items returned', (data?.items.length ?? 0) > 0, String(data?.items.length)),
      check('spans several bands', bands.size > 1, JSON.stringify([...bands])),
      check(
        'total exceeds page, so paging is exercised',
        (data?.total ?? 0) > (data?.items.length ?? 0),
        `total=${data?.total} items=${data?.items.length}`,
      ),
    ]);
  }

  // --- History with a gap --------------------------------------------------
  // Gaps are ledger ranges with no data. They render as holes; the line breaks.
  {
    const client = createKeelClient({ baseUrl: MOCK_URL, example: 'history' });
    const result = await client.GET('/asset/{assetId}/history', {
      params: { path: { assetId: ASSET_ID }, query: { from: 60890000, to: 60950000 } },
    });
    const data = result.data as HistoryResponse | undefined;
    record('history', [
      check('points returned', (data?.points.length ?? 0) > 0, String(data?.points.length)),
      check(
        'an explicit gap to break the line at',
        (data?.gaps?.length ?? 0) > 0,
        data?.gaps === undefined ? '(absent)' : JSON.stringify(data.gaps),
      ),
      check('one source per series', typeof data?.dataSource === 'string', String(data?.dataSource)),
    ]);
  }

  // --- Report --------------------------------------------------------------
  let failed = 0;
  for (const { state, assertions } of results) {
    console.log(state);
    for (const a of assertions) {
      if (!a.ok) failed += 1;
      console.log(`  ${a.ok ? 'ok  ' : 'FAIL'}  ${a.label.padEnd(44)} ${a.detail}`);
    }
    console.log('');
  }

  const total = results.reduce((n, r) => n + r.assertions.length, 0);
  console.log(failed === 0 ? `OK  ${total} assertions` : `FAILED  ${failed} of ${total}`);
  process.exitCode = failed === 0 ? 0 : 1;
}

main().catch((error: unknown) => {
  console.error('\nCould not reach the mock. Start it with `pnpm mock`.\n');
  console.error(error);
  process.exitCode = 1;
});
