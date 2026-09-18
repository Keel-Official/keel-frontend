/**
 * Where the February backtest report is published.
 *
 * It points at the file in the engine repository rather than at a copy served from
 * `public/`, and that is deliberate. `public/evidence/blend-report.md` is a copy taken
 * before sections 5 and 6 were filled on 14 September 2026, so it still tells a reader
 * those two sections are empty on purpose. Nothing links to it. A second home for a
 * document drifts, and this one drifted within four days of being made.
 *
 * The report cites paths in that repository on almost every page, and the Statement of
 * Work asks for the report, the raw data and the calculation code in the same breath.
 * A reader who follows this link lands beside all three.
 */
export const BACKTEST_REPORT_URL =
  'https://github.com/Keel-Official/keel-backend/blob/main/docs/report/blend-february-2026.md';
