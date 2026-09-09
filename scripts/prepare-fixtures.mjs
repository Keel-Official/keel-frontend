import { readFileSync, writeFileSync } from 'node:fs';

// Regenerate after refreshing the unchanged files in public/evidence from the backend.
const fixtures = {
  healthy: ['asset-healthy', 'AssetRisk'],
  poolOnly: ['asset-pool-only', 'AssetRisk'],
  noPrice: ['asset-no-price', 'AssetRisk'],
  brokenBook: ['asset-broken-book', 'AssetRisk'],
  historical: ['asset-historical', 'AssetRisk'],
  market: ['asset-list-mixed', 'AssetListResponse'],
  history: ['history-ustry', 'HistoryResponse'],
  methodology: ['methodology', 'Methodology'],
};
let source =
  '// Generated from public/evidence by scripts/prepare-fixtures.mjs. Do not edit fixture values.\n';
source += 'import type { components } from "./schema";\n\n';
for (const [name, [file, schema]] of Object.entries(fixtures)) {
  const data = JSON.parse(
    readFileSync(
      new URL(`../public/evidence/${file}.json`, import.meta.url),
      'utf8',
    ),
  );
  source += `export const ${name}: components["schemas"]["${schema}"] = ${JSON.stringify(data, null, 2)};\n\n`;
}
writeFileSync(new URL('../lib/api/fixtures.ts', import.meta.url), source);

// This export has no quoted/multiline fields. Keep all CSV values as strings.
const [header, ...rows] = readFileSync(
  new URL('../public/evidence/ustry-february-daily.csv', import.meta.url),
  'utf8',
)
  .trim()
  .split(/\r?\n/);
const keys = header.split(',');
const daily = rows.map((row) =>
  Object.fromEntries(
    row.split(',').map((value, index) => [keys[index], value || null]),
  ),
);
writeFileSync(
  new URL('../lib/api/february-evidence.json', import.meta.url),
  JSON.stringify(daily, null, 2) + '\n',
);
