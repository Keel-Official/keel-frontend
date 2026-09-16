/**
 * Sends one request per endpoint through the real typed client and reports what
 * came back. It asserts nothing about the values: the point is to prove that the
 * generated types, the client, and whatever `NEXT_PUBLIC_KEEL_API_URL` points at
 * still agree, and to print the provenance headers that every screen must carry.
 *
 * Against the live API:
 *   NEXT_PUBLIC_KEEL_API_URL=https://api.keels.app/v1 pnpm smoke:api
 *
 * Against the contract mock (see README):
 *   NEXT_PUBLIC_KEEL_API_URL=http://localhost:4010 pnpm smoke:api
 *
 * This runs in Node, so it does not exercise CORS. A browser-origin check needs a
 * page, and arrives with the navigation shell.
 */
import { createKeelClient, keelApiUrl, readProvenance } from '../lib/api/client.ts';

function line(label: string, value: unknown): void {
  console.log(`  ${label.padEnd(22)} ${String(value)}`);
}

async function main(): Promise<void> {
  const baseUrl = keelApiUrl();
  console.log(`keel-web smoke check against ${baseUrl}\n`);

  const client = createKeelClient({ baseUrl });
  let failures = 0;

  const health = await client.GET('/health', {});
  console.log('GET /health');
  line('status', health.response.status);
  if (health.data) {
    line('assetsMonitored', health.data.assetsMonitored);
    line('methodologyVersion', health.data.methodologyVersion);
    line('latestScanLedgerSeq', health.data.latestScanLedgerSeq);
    line('historicalAvailable', health.data.historicalAvailable);
  } else {
    failures += 1;
    line('error', JSON.stringify(health.error));
  }
  const provenance = readProvenance(health.response);
  line('hdr methodology', provenance.methodologyVersion ?? '(absent)');
  line('hdr staleness', provenance.stalenessSeconds ?? '(absent)');

  const assets = await client.GET('/assets', { params: { query: { limit: 200 } } });
  console.log('\nGET /assets?limit=200');
  line('status', assets.response.status);
  if (assets.data) {
    const items = assets.data.items;
    line('total', assets.data.total);
    line('items', items.length);
    const bands = new Map<string, number>();
    const confidences = new Map<string, number>();
    for (const item of items) {
      bands.set(item.band, (bands.get(item.band) ?? 0) + 1);
      const confidence = item.bandConfidence ?? '(absent)';
      confidences.set(confidence, (confidences.get(confidence) ?? 0) + 1);
    }
    line('bands', JSON.stringify(Object.fromEntries(bands)));
    line('bandConfidence', JSON.stringify(Object.fromEntries(confidences)));
  } else {
    failures += 1;
    line('error', JSON.stringify(assets.error));
  }

  const depth = await client.GET('/asset/{assetId}/depth', {
    params: { path: { assetId: 'XLM' } },
  });
  console.log('\nGET /asset/XLM/depth');
  line('status', depth.response.status);
  if (depth.data) {
    line('band', `${depth.data.band} / ${depth.data.bandConfidence ?? '(absent)'}`);
    line('priceSource', depth.data.priceSource);
    line('dataSource', depth.data.dataSource);
    line('depth rungs', depth.data.depth.length);
    line('manipulation rungs', depth.data.manipulationCostCombined.length);
    line('flags', depth.data.flags.length);
    line('unevaluatedFlags', depth.data.unevaluatedFlags.length);
    line('warnings', depth.data.warnings.length);
    line('maxSafeCollateral', depth.data.maxSafeCollateral ?? '(null)');
  } else {
    failures += 1;
    line('error', JSON.stringify(depth.error));
  }

  const methodology = await client.GET('/methodology', {});
  console.log('\nGET /methodology');
  line('status', methodology.response.status);
  if (methodology.data) {
    line('version', methodology.data.version);
    line('calibrated', methodology.data.calibrated);
    line('threshold keys', Object.keys(methodology.data.thresholds).length);
  } else {
    failures += 1;
    line('error', JSON.stringify(methodology.error));
  }

  // The historical parameter answers 503 on this deployment, always. It is checked
  // here so the day it starts working is a visible change rather than a discovery.
  const replay = await client.GET('/asset/{assetId}/depth', {
    params: { path: { assetId: 'XLM' }, query: { ledger: 64400000 } },
  });
  console.log('\nGET /asset/XLM/depth?ledger=64400000');
  line('status', replay.response.status);
  line('expected', '503 HISTORICAL_UNAVAILABLE');

  console.log(failures === 0 ? '\nOK' : `\nFAILED: ${failures} endpoint(s)`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
