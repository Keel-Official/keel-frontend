import { notFound } from 'next/navigation';

/**
 * The branded 404, reached on purpose.
 *
 * There are two root layouts, so an unmatched URL has no single root to render in and
 * Next serves its own bare "404: This page could not be found" instead of
 * `not-found.tsx`. A catch-all fixes that by making the miss a match: the URL resolves
 * into the marketing group, which has a root layout, and `notFound()` then renders that
 * group's `not-found.tsx` with a 404 status.
 *
 * It is the least specific route in the group, so every real page — `/`, the evidence
 * pages, and everything under `/dashboard` — still wins over it.
 */
export default function Unmatched() {
  notFound();
}
