/**
 * A single-value cache with a time budget.
 *
 * It exists for one reason: the Keel API allows sixty requests a minute and every read
 * is made from the server, so the whole audience shares one budget rather than each
 * visitor having their own. A reading that is identical for everyone and only moves
 * when a scan lands does not need to be fetched once per page view.
 *
 * WHAT IT DELIBERATELY DOES NOT DO. It never caches a result the caller rejects, so a
 * failure is not held for the length of the window and recovery is immediate. And it
 * holds one value rather than a keyed map: the only thing cached here is a reading with
 * no parameters, and a map would invite caching per-asset data, which is exactly the
 * data whose freshness this product is a claim about.
 */

export interface TtlCache<T> {
  /** Returns the held value, or runs `load` and holds what comes back. */
  read: (load: () => Promise<T>) => Promise<T>;
  clear: () => void;
}

export interface TtlCacheOptions<T> {
  ttlMs: number;
  /** Only a value this returns true for is held. */
  shouldCache: (value: T) => boolean;
  /** Injection point for tests. */
  now?: () => number;
}

export function createTtlCache<T>({
  ttlMs,
  shouldCache,
  now = Date.now,
}: TtlCacheOptions<T>): TtlCache<T> {
  let held: { at: number; value: T } | null = null;

  return {
    async read(load) {
      const at = now();
      if (held !== null && at - held.at < ttlMs) return held.value;

      const value = await load();
      held = shouldCache(value) ? { at, value } : null;
      return value;
    },
    clear() {
      held = null;
    },
  };
}
