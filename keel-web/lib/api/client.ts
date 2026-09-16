import createClient, { type Middleware } from 'openapi-fetch';

import type { paths } from './schema';

/**
 * The Keel API is read-only and unauthenticated. There is nothing to sign, no
 * token to refresh, and no request this client may make that changes state.
 */

/**
 * Both headers are CORS-exposed, so `fetch` can read them in the browser.
 *
 * `X-Keel-Methodology-Version` is stamped on every screen: a screenshot of a page
 * must be enough to re-verify the number it shows. `X-Keel-Staleness-Seconds` says
 * how old that number is and is surfaced rather than hidden.
 */
export const METHODOLOGY_VERSION_HEADER = 'x-keel-methodology-version';
export const STALENESS_SECONDS_HEADER = 'x-keel-staleness-seconds';

/**
 * Named examples carried by `docs/api/keel-openapi.yaml`. Prism serves these
 * verbatim in static mode, which is how the display states that do not occur in
 * live data are exercised. `AssetHealthy` is the clearest case: no live asset has
 * `bandConfidence: "full"`, so the healthy state is reachable only from the mock.
 */
export type KeelExample =
  | 'AssetHealthy'
  | 'AssetNoPrice'
  | 'AssetBrokenBook'
  | 'AssetPoolOnly'
  | 'AssetHistorical'
  | 'AssetListMixed';

export const KEEL_EXAMPLES: readonly KeelExample[] = [
  'AssetHealthy',
  'AssetNoPrice',
  'AssetBrokenBook',
  'AssetPoolOnly',
  'AssetHistorical',
  'AssetListMixed',
] as const;

export function isKeelExample(value: string | undefined): value is KeelExample {
  return value !== undefined && (KEEL_EXAMPLES as readonly string[]).includes(value);
}

/**
 * Selecting a mock example is a development affordance and must not be reachable
 * in a production build, where it would let a URL change what a reader is shown.
 */
export function mockSelectionAllowed(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export class KeelApiNotConfiguredError extends Error {
  constructor() {
    super(
      'NEXT_PUBLIC_KEEL_API_URL is not set. Point it at the contract mock ' +
        '(http://localhost:4010) or at the live API (https://api.keels.app/v1). ' +
        'The dev server must run on port 5173: it is the only localhost origin in ' +
        "the API's CORS allowlist.",
    );
    this.name = 'KeelApiNotConfiguredError';
  }
}

export function keelApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_KEEL_API_URL;
  if (!url) throw new KeelApiNotConfiguredError();
  return url.replace(/\/+$/, '');
}

/**
 * `Prefer: example=<name>` is how Prism is told which named example to return.
 * The live API ignores the header, so a stray value degrades to a normal response
 * rather than to a wrong one.
 */
function preferExampleMiddleware(example: KeelExample): Middleware {
  return {
    onRequest({ request }) {
      request.headers.set('Prefer', `example=${example}`);
      return request;
    },
  };
}

export interface KeelClientOptions {
  /** Defaults to `NEXT_PUBLIC_KEEL_API_URL`. */
  baseUrl?: string;
  /** Ignored in production builds. See {@link mockSelectionAllowed}. */
  example?: KeelExample;
  /** Injection point for tests. */
  fetch?: typeof globalThis.fetch;
}

export type KeelClient = ReturnType<typeof createKeelClient>;

export function createKeelClient(options: KeelClientOptions = {}) {
  const client = createClient<paths>({
    baseUrl: options.baseUrl ?? keelApiUrl(),
    ...(options.fetch ? { fetch: options.fetch } : {}),
  });

  if (options.example && mockSelectionAllowed()) {
    client.use(preferExampleMiddleware(options.example));
  }

  return client;
}

/**
 * Provenance carried by every response, read from the headers rather than from the
 * body so it is available even on an error.
 */
export interface KeelProvenance {
  methodologyVersion: string | null;
  stalenessSeconds: string | null;
}

export function readProvenance(response: Response): KeelProvenance {
  return {
    methodologyVersion: response.headers.get(METHODOLOGY_VERSION_HEADER),
    stalenessSeconds: response.headers.get(STALENESS_SECONDS_HEADER),
  };
}
