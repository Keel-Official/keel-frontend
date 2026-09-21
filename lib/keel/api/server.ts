import 'server-only';

import { createTtlCache } from './ttl-cache';

import {
  createKeelClient,
  readProvenance,
  type KeelExampleName,
  type KeelProvenance,
} from './client';
import type {
  AssetListResponse,
  AssetRisk,
  Health,
  HistoryResponse,
  KeelError,
  Methodology,
} from './types';
import type { Band, DataSource, Flag } from '../format/flags';

/**
 * Server-side reads.
 *
 * Every request is made from the server rather than the browser. That is the normal
 * App Router shape, and it has a consequence worth stating: the browser never calls
 * `api.keels.app`, so the API's CORS allowlist does not gate the deployed dashboard.
 * The allowlist still gates anything that reads the API client-side, so if a control
 * is ever built that fetches from the browser, the deployment origin has to be added
 * to KEEL_CORS_ORIGINS first.
 *
 * Nothing is cached. The whole product is a claim about how fresh a figure is, and a
 * cached page that still displays its original staleness reading would be lying about
 * exactly the thing it exists to report.
 */

const NO_CACHE = { cache: 'no-store' } as const satisfies RequestInit;

/**
 * An error the API reported, carrying its own code and message. The message is written
 * to be shown to a reader and is displayed as served.
 */
export interface ApiFailure {
  readonly kind: 'api';
  readonly code: KeelError['error']['code'];
  readonly message: string;
  /** Structured extra context when the contract supplies it. Not free text. */
  readonly detail?: KeelError['error']['detail'];
}

/**
 * The API was not reached at all, so there is no code from the contract to report.
 * This is deliberately not dressed up as one of the contract's error codes: inventing
 * a code here would put a value on screen that no response ever carried.
 */
export interface TransportFailure {
  readonly kind: 'transport';
  readonly message: string;
}

export type Failure = ApiFailure | TransportFailure;

export interface Fetched<T> {
  readonly data: T | null;
  readonly failure: Failure | null;
  readonly status: number;
  readonly provenance: KeelProvenance;
}

const NO_PROVENANCE: KeelProvenance = {
  methodologyVersion: null,
  stalenessSeconds: null,
};

function toFailure(error: unknown): ApiFailure | null {
  const body = error as KeelError | undefined;
  if (body?.error === undefined) return null;
  return {
    kind: 'api',
    code: body.error.code,
    message: body.error.message,
    ...(body.error.detail === undefined ? {} : { detail: body.error.detail }),
  };
}

function transportFailure(cause: unknown): Fetched<never> {
  return {
    data: null,
    failure: {
      kind: 'transport',
      message:
        cause instanceof Error
          ? cause.message
          : 'The Keel API could not be reached.',
    },
    status: 0,
    provenance: NO_PROVENANCE,
  };
}

/**
 * `/health` is the same answer for every visitor and only moves when a scan lands,
 * roughly every fifteen minutes. Every page fetches it, so without this each page view
 * costs two upstream requests instead of one.
 *
 * That matters because the API allows sixty requests a minute and every read here is
 * made from the server, so the whole audience shares one budget. Two calls per view put
 * the ceiling at thirty views a minute for the entire site; one call doubles it.
 *
 * Only a success is held, so an outage is visible immediately rather than kept for the
 * length of the window, and so is the recovery.
 *
 * On a single server this is exact. On a serverless platform each instance keeps its
 * own copy, so the saving is proportional to how much traffic an instance handles —
 * still a real reduction, just not a guaranteed one.
 */
const healthCache = createTtlCache<Fetched<Health>>({
  ttlMs: 15_000,
  shouldCache: (result) => result.data !== null && result.failure === null,
});

/** Exposed so a test or a script can start from a known state. */
export function clearHealthCache(): void {
  healthCache.clear();
}

export async function fetchHealth(): Promise<Fetched<Health>> {
  return healthCache.read(readHealth);
}

async function readHealth(): Promise<Fetched<Health>> {
  try {
    const client = createKeelClient();
    const result = await client.GET('/health', NO_CACHE);
    return {
      data: result.data ?? null,
      failure: toFailure(result.error),
      status: result.response.status,
      provenance: readProvenance(result.response),
    };
  } catch (cause) {
    // A network failure, or a missing NEXT_PUBLIC_KEEL_API_URL, is a state to render
    // rather than a crash: the reader has to be told the engine was not reached.
    return transportFailure(cause);
  }
}

/**
 * The whole monitored set in one request.
 *
 * `band` and `hasFlag` are API parameters, so the engine applies them and `total`
 * comes back describing the filtered set. Free-text search is not a parameter and is
 * applied locally.
 *
 * The limit is the contract maximum. Sixty-one assets are monitored, so one request
 * holds the set and local ordering is exact. The caller is handed `total` so it can
 * say so when that stops being true.
 */
export async function fetchAssets(filters: {
  band?: Band | null;
  hasFlag?: Flag | null;
}): Promise<Fetched<AssetListResponse>> {
  try {
    const client = createKeelClient();
    const result = await client.GET('/assets', {
      ...NO_CACHE,
      params: {
        query: {
          limit: 200,
          ...(filters.band ? { band: filters.band } : {}),
          ...(filters.hasFlag ? { hasFlag: filters.hasFlag } : {}),
        },
      },
    });
    return {
      data: result.data ?? null,
      failure: toFailure(result.error),
      status: result.response.status,
      provenance: readProvenance(result.response),
    };
  } catch (cause) {
    return transportFailure(cause);
  }
}

/**
 * The full risk result for one asset.
 *
 * `priceSource: "none"` comes back as HTTP 200 with band CRITICAL. That is a finding,
 * not an error, and it is the most dangerous state the engine can report — so it is
 * returned as data here and must never be rendered as an error screen or an empty row.
 *
 * The `quote` parameter is omitted, which gives the primary pair. The methodology is
 * explicit that the primary pair is USDC, always.
 */
export async function fetchDepth(
  assetId: string,
  /**
   * Names a contract-mock example instead of taking whatever the mock serves by
   * default. Several display states cannot be reached from live data at all —
   * `priceSource: "none"` is not on any monitored asset today — so they are otherwise
   * unreachable in the running UI. `createKeelClient` drops this in a production
   * build, so a URL cannot change what a reader is shown.
   */
  example?: KeelExampleName,
  /**
   * A past ledger, for the engine's historical path. Omitted, the engine answers with
   * the latest scan. A ledger no replay has stored is refused by the engine with a
   * message of its own, and that refusal is rendered as served.
   */
  ledger?: number,
): Promise<Fetched<AssetRisk>> {
  try {
    const client = createKeelClient(example ? { example } : {});
    const result = await client.GET('/asset/{assetId}/depth', {
      ...NO_CACHE,
      params: {
        path: { assetId },
        ...(ledger === undefined ? {} : { query: { ledger } }),
      },
    });
    return {
      data: result.data ?? null,
      failure: toFailure(result.error),
      status: result.response.status,
      provenance: readProvenance(result.response),
    };
  } catch (cause) {
    return transportFailure(cause);
  }
}

/**
 * The version and every threshold that produced the numbers.
 *
 * This is what lets a protocol apply its own thresholds instead of Keel's, so the page
 * renders whatever comes back rather than a list this build knows about. No threshold
 * is written into this dashboard.
 */
/**
 * The methodology moves only when the engine is redeployed, and every page that shows
 * a band has to show the service's own words about calibration alongside it. Without a
 * cache that would be a third upstream call on every view.
 */
const methodologyCache = createTtlCache<Fetched<Methodology>>({
  ttlMs: 300_000,
  shouldCache: (result) => result.data !== null && result.failure === null,
});

export function clearMethodologyCache(): void {
  methodologyCache.clear();
}

export async function fetchMethodology(): Promise<Fetched<Methodology>> {
  return methodologyCache.read(readMethodology);
}

async function readMethodology(): Promise<Fetched<Methodology>> {
  try {
    const client = createKeelClient();
    const result = await client.GET('/methodology', NO_CACHE);
    return {
      data: result.data ?? null,
      failure: toFailure(result.error),
      status: result.response.status,
      provenance: readProvenance(result.response),
    };
  } catch (cause) {
    return transportFailure(cause);
  }
}

/**
 * The series behind the trend chart.
 *
 * This is NOT the historical replay path. `health.historicalAvailable` being false
 * turns off `GET /asset/{id}/depth?ledger=`, which reconstructs a full risk result at a
 * past ledger; this endpoint reads the stored series and answers today. Conflating the
 * two hides a working chart behind a flag about a different feature.
 *
 * Coverage is as old as the deployment, which is days rather than months, so the caller
 * picks a window it can actually fill and the chart labels itself from the points that
 * came back rather than from the range that was asked for.
 *
 * One request is one `source`. The response names it in `dataSource`, and two sources
 * are never drawn as one line: `trades-implied` is a lower bound rather than a
 * measurement, and averaging it with a direct reading would present the weakest number
 * in the range as the same kind of number as the strongest.
 */
export async function fetchHistory(
  assetId: string,
  range: { from: number; to: number; resolution: 'hour' | 'day' },
  /** One request is one source; the response names it back in `dataSource`. */
  source?: DataSource,
): Promise<Fetched<HistoryResponse>> {
  try {
    const client = createKeelClient();
    const result = await client.GET('/asset/{assetId}/history', {
      ...NO_CACHE,
      params: {
        path: { assetId },
        query: {
          from: range.from,
          to: range.to,
          resolution: range.resolution,
          ...(source ? { source } : {}),
        },
      },
    });
    return {
      data: result.data ?? null,
      failure: toFailure(result.error),
      status: result.response.status,
      provenance: readProvenance(result.response),
    };
  } catch (cause) {
    return transportFailure(cause);
  }
}
