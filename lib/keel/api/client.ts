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
 * live data are exercised. The healthy state is the clearest case: no live asset has
 * `bandConfidence: "full"`, so it is reachable only from the mock.
 *
 * The wire values are the keys of the `examples:` map in the contract, which are
 * written in Indonesian, and NOT the names of the schemas under
 * `components/examples` that they point at. Prism answers 404 for the latter. This
 * map is the one place that translation lives; call sites use the English names.
 */
export const KEEL_EXAMPLES = {
  /** `/asset/{id}/depth` — price present, both sides of the book, confidence full. */
  healthy: 'asetSehat',
  /** `/asset/{id}/depth` — AMM only, no order book. */
  poolOnly: 'hanyaPool',
  /** `/asset/{id}/depth` — `priceSource: "none"`, HTTP 200, band CRITICAL. */
  noPrice: 'tanpaHarga',
  /** `/asset/{id}/depth` — one ask, one bid, far apart; the midpoint means nothing. */
  brokenBook: 'bukuRusak',
  /** `/asset/{id}/depth` — a reconstructed reading rather than a measurement. */
  historical: 'replayHistoris',
  /** `/assets` — a set spanning every band. */
  assetList: 'campuran',
  /** `/asset/{id}/history` — the USTRY series. */
  history: 'deretUstry',
} as const;

export type KeelExampleName = keyof typeof KEEL_EXAMPLES;
export type KeelExample = (typeof KEEL_EXAMPLES)[KeelExampleName];

export function isKeelExampleName(
  value: string | undefined,
): value is KeelExampleName {
  return value !== undefined && Object.hasOwn(KEEL_EXAMPLES, value);
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
      'NEXT_PUBLIC_KEEL_API_URL is not set. Point it at the live API ' +
        '(https://api.keels.app/v1) or at the contract mock ' +
        '(http://localhost:4010). Every read is made from the server, so the ' +
        "API's CORS allowlist does not gate this app and the dev server may run " +
        'on any port.',
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
  example?: KeelExampleName;
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
    client.use(preferExampleMiddleware(KEEL_EXAMPLES[options.example]));
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
