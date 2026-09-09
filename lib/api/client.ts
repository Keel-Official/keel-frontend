import createClient from 'openapi-fetch';
import type { paths } from './schema';

// No default deployment URL: previews remain local until an API is configured.
export function createKeelClient(
  baseUrl: string,
  fetcher: typeof fetch = fetch,
) {
  return createClient<paths>({ baseUrl, fetch: fetcher });
}
