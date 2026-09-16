/**
 * Monetary values arrive from the Keel API as decimal strings and are rendered as
 * strings. `"271091.75404722689504149709"` does not survive `Number()`, and a value
 * that has been through a float is not the value the engine computed.
 *
 * Pixel positions do need numbers, so exactly one module is allowed to convert, and
 * it is named here rather than left to judgement. Everything it produces is a
 * coordinate; every label, tooltip, axis tick, and table cell a reader sees comes
 * from the original string.
 *
 * Browser storage is banned outright: there is no user state to persist, and filter
 * state lives in the URL.
 *
 * A rule enforced by a check is a rule. A rule written in a README is a suggestion.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

/** The single module permitted to turn a decimal string into a JS number. */
const GEOMETRY_MODULE_ALLOWLIST: readonly string[] = [
  // 'lib/chart/geometry.ts' — add when the geometry module lands.
];

interface Rule {
  readonly name: string;
  readonly pattern: RegExp;
  readonly reason: string;
  /** Rules that the geometry module is exempt from. */
  readonly geometryMayUse: boolean;
}

const RULES: readonly Rule[] = [
  {
    name: 'parseFloat',
    pattern: /\bparseFloat\s*\(/,
    reason: 'parses a decimal string into a float, losing precision the engine kept',
    geometryMayUse: true,
  },
  {
    name: 'parseInt',
    pattern: /\bparseInt\s*\(/,
    reason: 'silently truncates; integer fields arrive already typed as numbers',
    geometryMayUse: true,
  },
  {
    name: 'Number(',
    pattern: /(?<![.\w])Number\s*\(/,
    reason: 'same precision loss as parseFloat',
    geometryMayUse: true,
  },
  {
    name: '.toNumber(',
    pattern: /\.toNumber\s*\(/,
    reason: 'a decimal type converted back to a float is a float',
    geometryMayUse: true,
  },
  {
    name: 'localStorage',
    pattern: /\blocalStorage\b/,
    reason: 'no browser storage: there is no user state to persist',
    geometryMayUse: false,
  },
  {
    name: 'sessionStorage',
    pattern: /\bsessionStorage\b/,
    reason: 'no browser storage: there is no user state to persist',
    geometryMayUse: false,
  },
];

function trackedSourceFiles(): string[] {
  const out = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '--', 'app', 'components', 'lib', 'hooks', 'scripts', 'tests'],
    { encoding: 'utf8' },
  );
  return out
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /\.(ts|tsx|mts|js|jsx|mjs)$/.test(line))
    .filter((line) => line !== 'lib/api/schema.d.ts')
    .filter((line) => !line.startsWith('scripts/check-'));
}

/** Strips line and block comments so a rule named in prose is not a violation. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

const violations: string[] = [];

for (const file of trackedSourceFiles()) {
  const isGeometry = GEOMETRY_MODULE_ALLOWLIST.includes(file);
  const lines = stripComments(readFileSync(file, 'utf8')).split('\n');

  for (const rule of RULES) {
    if (isGeometry && rule.geometryMayUse) continue;
    lines.forEach((line, index) => {
      if (rule.pattern.test(line)) {
        violations.push(`${file}:${index + 1}  ${rule.name} — ${rule.reason}`);
      }
    });
  }
}

if (violations.length === 0) {
  console.log('OK  no float conversion or browser storage outside the geometry module');
  process.exitCode = 0;
} else {
  console.error('Forbidden construct(s) found:\n');
  for (const violation of violations) console.error(`  ${violation}`);
  console.error(
    `\n${violations.length} violation(s). If this is chart geometry, add the module to ` +
      'GEOMETRY_MODULE_ALLOWLIST in scripts/check-no-float-math.mts and keep every ' +
      'reader-visible value on the original string.',
  );
  process.exitCode = 1;
}
