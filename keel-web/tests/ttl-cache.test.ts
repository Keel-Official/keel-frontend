import { describe, expect, it } from 'vitest';

import { createTtlCache } from '@/lib/api/ttl-cache';

/** A clock the test drives, so nothing here waits on real time. */
function clock(start = 1_000) {
  let t = start;
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

function counter<T>(value: T) {
  let calls = 0;
  return {
    load: async () => {
      calls += 1;
      return value;
    },
    get calls() {
      return calls;
    },
  };
}

describe('createTtlCache', () => {
  it('loads once and serves the held value inside the window', async () => {
    const time = clock();
    const source = counter('ok');
    const cache = createTtlCache<string>({
      ttlMs: 1_000,
      shouldCache: () => true,
      now: time.now,
    });

    expect(await cache.read(source.load)).toBe('ok');
    time.advance(999);
    expect(await cache.read(source.load)).toBe('ok');
    expect(source.calls).toBe(1);
  });

  it('loads again once the window has passed', async () => {
    const time = clock();
    const source = counter('ok');
    const cache = createTtlCache<string>({
      ttlMs: 1_000,
      shouldCache: () => true,
      now: time.now,
    });

    await cache.read(source.load);
    time.advance(1_000);
    await cache.read(source.load);
    expect(source.calls).toBe(2);
  });

  it('never holds a value the caller rejects', async () => {
    // A cached failure would keep reporting an outage that had already ended, on a
    // page whose entire purpose is to say how fresh its numbers are.
    const time = clock();
    const source = counter('failed');
    const cache = createTtlCache<string>({
      ttlMs: 60_000,
      shouldCache: (value) => value !== 'failed',
      now: time.now,
    });

    await cache.read(source.load);
    await cache.read(source.load);
    await cache.read(source.load);
    expect(source.calls).toBe(3);
  });

  it('recovers immediately when a load starts succeeding again', async () => {
    const time = clock();
    let attempt = 0;
    const load = async () => {
      attempt += 1;
      return attempt < 3 ? 'failed' : 'ok';
    };
    const cache = createTtlCache<string>({
      ttlMs: 60_000,
      shouldCache: (value) => value !== 'failed',
      now: time.now,
    });

    expect(await cache.read(load)).toBe('failed');
    expect(await cache.read(load)).toBe('failed');
    expect(await cache.read(load)).toBe('ok');
    // And the success is then held.
    expect(await cache.read(load)).toBe('ok');
    expect(attempt).toBe(3);
  });

  it('drops a held value when a later load is rejected', async () => {
    const time = clock();
    const results = ['ok', 'failed', 'failed'];
    let i = 0;
    const load = async () => results[i++] ?? 'failed';
    const cache = createTtlCache<string>({
      ttlMs: 1_000,
      shouldCache: (value) => value !== 'failed',
      now: time.now,
    });

    expect(await cache.read(load)).toBe('ok');
    time.advance(1_000);
    expect(await cache.read(load)).toBe('failed');
    // Nothing stale is left behind to serve.
    expect(await cache.read(load)).toBe('failed');
    expect(i).toBe(3);
  });

  it('clear forces the next read to load', async () => {
    const time = clock();
    const source = counter('ok');
    const cache = createTtlCache<string>({
      ttlMs: 60_000,
      shouldCache: () => true,
      now: time.now,
    });

    await cache.read(source.load);
    cache.clear();
    await cache.read(source.load);
    expect(source.calls).toBe(2);
  });

  it('halves the upstream calls for a page that reads it twice', async () => {
    // The shape that motivates this: every route fetches /health alongside its own
    // data, so without the cache a page view costs two requests against a budget of
    // sixty a minute shared by the whole audience.
    const time = clock();
    const source = counter({ ok: true });
    const cache = createTtlCache<{ ok: boolean }>({
      ttlMs: 15_000,
      shouldCache: () => true,
      now: time.now,
    });

    for (let view = 0; view < 10; view += 1) await cache.read(source.load);
    expect(source.calls).toBe(1);
  });
});
