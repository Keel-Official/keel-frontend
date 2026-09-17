import { DASHBOARD_BASE, DASHBOARD_METHODOLOGY } from './keel/routes';

/**
 * Where the landing page sends someone who wants the product.
 *
 * The dashboard used to be a second application on a second host, so this module read
 * `NEXT_PUBLIC_DASHBOARD_URL` and fell back to anchors on the landing page when nothing
 * was configured — a build that forgot the variable would otherwise have shipped a
 * primary call to action pointing at `http://localhost:5173`.
 *
 * It is now mounted in this application under `/dashboard`, so there is nothing to
 * configure and nothing to fall back to. The link is a path in the same deployment and
 * is live wherever this site is.
 */

/** Destinations the landing page offers. */
export const dashboardLinks = {
  /** The monitored set. */
  assets: DASHBOARD_BASE,
  /** Every threshold, as the engine serves it. */
  methodology: DASHBOARD_METHODOLOGY,
} as const;

/**
 * Wording. These used to soften to "See a sample of the set" when no dashboard existed
 * to link to; the link now reaches sixty-one live assets, so it says so plainly.
 */
export const dashboardCopy = {
  /** The header button, where the bar is narrow and the destination is the label. */
  nav: 'Dashboard',
  /** The hero and closing calls to action, which have room to say what is there. */
  assets: 'Open the dashboard',
  methodology: 'Read methodology',
} as const;
