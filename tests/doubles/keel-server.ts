/**
 * The server-side API reader, as the unit tests see it.
 *
 * `lib/keel/api/server.ts` opens with `import 'server-only'`, which throws outside a
 * React Server Component, and every function in it performs a real HTTP request. A
 * test that rendered the landing page would therefore either crash on the import or
 * reach `api.keels.app` over the network, and a unit suite that depends on a
 * deployment being up is not a unit suite.
 *
 * SO THE DOUBLE ANSWERS "NOT REACHED", WHICH IS THE CASE WORTH PINNING. `AGENTS.md`
 * requires the landing page to stay useful when the API is unavailable. That is the
 * one behaviour a stub can verify exactly, and it is the behaviour nobody would
 * otherwise exercise, because the developer machine and the deployment both have a
 * working API. The happy path is covered by passing figures straight into
 * `EngineStatusView`, which takes them as a prop for this reason.
 *
 * Wired in `vitest.config.mts` by path, so a component keeps importing the real
 * module and only the test run substitutes this one.
 */

export interface TransportFailure {
  readonly kind: 'transport';
  readonly message: string;
}

const NOT_REACHED = {
  data: null,
  failure: {
    kind: 'transport',
    message: 'the API was not reached in this test environment',
  } satisfies TransportFailure,
  status: 0,
  provenance: {
    methodologyVersion: null,
    ledgerSeq: null,
    computedAt: null,
  },
} as const;

export async function fetchHealth() {
  return NOT_REACHED;
}

export async function fetchAssets() {
  return NOT_REACHED;
}

export async function fetchDepth() {
  return NOT_REACHED;
}

export async function fetchMethodology() {
  return NOT_REACHED;
}

export async function fetchHistory() {
  return NOT_REACHED;
}

export function clearHealthCache(): void {}
export function clearMethodologyCache(): void {}
