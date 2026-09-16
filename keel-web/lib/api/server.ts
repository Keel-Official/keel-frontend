import 'server-only';

import { createKeelClient, readProvenance, type KeelProvenance } from './client';
import type { AssetListResponse, AssetRisk, Health, KeelError } from './types';
import type { Band, Flag } from '../format/flags';

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

export async function fetchHealth(): Promise<Fetched<Health>> {
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
export async function fetchDepth(assetId: string): Promise<Fetched<AssetRisk>> {
  try {
    const client = createKeelClient();
    const result = await client.GET('/asset/{assetId}/depth', {
      ...NO_CACHE,
      params: { path: { assetId } },
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
