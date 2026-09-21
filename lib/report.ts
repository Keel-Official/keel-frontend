/**
 * Where the February backtest report is published.
 *
 * It points at the file in the engine repository rather than at a copy served from
 * `public/`, and that is deliberate. A copy used to sit at
 * `public/evidence/blend-report.md`, taken before sections 5 and 6 were filled on
 * 14 September 2026, so it told a reader those two sections were empty on purpose.
 * Nothing linked to it, but it was still publicly served, so it was removed on
 * 21 September 2026. A second home for a document drifts, and that one drifted within
 * four days of being made.
 *
 * The report cites paths in that repository on almost every page, and the Statement of
 * Work asks for the report, the raw data and the calculation code in the same breath.
 * A reader who follows this link lands beside all three.
 */
export const BACKTEST_REPORT_URL =
  'https://github.com/Keel-Official/keel-backend/blob/main/docs/report/blend-february-2026.md';
