import { Activity, ChevronRight } from 'lucide-react';
import { fetchHealth } from '../../lib/keel/api/server';
import { dashboardLinks } from '../../lib/dashboard';

/**
 * One live reading on the landing page, and the reason it exists is a misreading it
 * prevents.
 *
 * Every figure on this page is a recorded sample, labelled as one, because
 * `AGENTS.md` requires the page to stay useful when the API is unavailable. The cost
 * of that is a reader who arrives to assess the product and meets the words "Sample
 * data · not live" before anything else, and concludes the engine is a mock. It is
 * not: `api.keels.app` scans sixty-one markets every fifteen minutes. This strip is
 * the one place that says so, from the API itself rather than from a claim written
 * here.
 *
 * IT SHOWS WHAT THE ENGINE REPORTS ABOUT ITSELF AND NOTHING DERIVED. The asset count,
 * the scan time and the ledger are fields of `GET /v1/health`, served as they arrive.
 * Nothing on this strip is computed, so there is no figure here that could disagree
 * with the dashboard.
 */

/** What the strip needs, reduced from the health response. */
export interface EngineStatus {
  /** Null when the response omitted it. The contract marks it optional, so the
      strip states a count only when one was served. */
  readonly assetsMonitored: number | null;
  readonly latestScanAt: string | null;
  readonly latestScanLedgerSeq: number | null;
  readonly degraded: boolean;
}

/**
 * The presentational half, which takes its figures rather than fetching them.
 *
 * Split from the fetch so the unreachable case is a value a test can pass in. That
 * case is the one `AGENTS.md` actually requires to work, and a component that could
 * only be exercised by reaching the network would never have it checked.
 */
/**
 * What the reader sees while the request is in flight, and it is NOT the
 * unreachable state.
 *
 * The strip streams in under Suspense, so whatever sits in the fallback is in the
 * first HTML the browser receives. Putting "unavailable" there meant a reader on a
 * slow connection met a failure sentence for a moment even when the engine was up,
 * which is the exact impression this component was built to prevent. Caught by
 * rendering the built page and reading the stream rather than by a test, because a
 * test renders the resolved tree and never sees the shell.
 *
 * It reserves the same line so the hero does not move when the answer arrives.
 */
export function EngineStatusPending() {
  return (
    <p className="engine-status engine-status-pending">
      <Activity size={14} aria-hidden="true" />
      <span>Reading live engine status…</span>
    </p>
  );
}

export function EngineStatusView({ status }: { status: EngineStatus | null }) {
  if (!status) {
    // NO INVENTED NUMBERS AND NO SILENCE. The reader is told the page could not
    // reach the engine, which is a state rather than an error, and is sent to the
    // surface that reads it directly.
    return (
      <p className="engine-status engine-status-unknown">
        <Activity size={14} aria-hidden="true" />
        <span>
          Live engine status unavailable from this page. The dashboard reads it
          directly.
        </span>
        <a className="engine-status-link" href={dashboardLinks.assets}>
          Open the dashboard <ChevronRight size={14} aria-hidden="true" />
        </a>
      </p>
    );
  }

  return (
    <p className="engine-status">
      <Activity size={14} aria-hidden="true" />
      <span>
        <strong>Engine live.</strong>{' '}
        {status.assetsMonitored === null
          ? 'scanning'
          : `${status.assetsMonitored} markets scanned`}
        {status.latestScanAt ? (
          <> · last {formatScanTime(status.latestScanAt)}</>
        ) : null}
        {status.latestScanLedgerSeq ? (
          <> · ledger {status.latestScanLedgerSeq}</>
        ) : null}
        {status.degraded ? <> · no scan recorded yet</> : null}
      </span>
      <a className="engine-status-link" href={dashboardLinks.assets}>
        Open the dashboard <ChevronRight size={14} aria-hidden="true" />
      </a>
    </p>
  );
}

/**
 * `2026-09-18T20:46:18.863062Z` as `20:46 UTC`.
 *
 * ABSOLUTE AND NEVER RELATIVE. "Two minutes ago" computed on the server is wrong the
 * moment the page is cached or the reader leaves the tab open, and this page's whole
 * subject is whether a figure is fresh. An unparseable value yields the string
 * unchanged rather than a guess.
 */
function formatScanTime(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return iso;
  const hh = String(at.getUTCHours()).padStart(2, '0');
  const mm = String(at.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm} UTC`;
}

/**
 * The fetching half. A failed read renders the unknown state rather than throwing,
 * because the landing page has to survive the engine being down.
 */
export async function EngineStatusLive() {
  const health = await fetchHealth();
  const data = health.data;
  if (!data) return <EngineStatusView status={null} />;

  return (
    <EngineStatusView
      status={{
        assetsMonitored: data.assetsMonitored ?? null,
        latestScanAt: data.latestScanAt ?? null,
        latestScanLedgerSeq: data.latestScanLedgerSeq ?? null,
        degraded: data.status !== 'ok',
      }}
    />
  );
}
