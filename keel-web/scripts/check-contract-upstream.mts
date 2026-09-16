/**
 * Compares the vendored contract against the backend's own copy, which is where it
 * is authored. This is the drift that has a human in the loop: when it reports a
 * difference, someone decides whether to take the new version, not a build step.
 *
 * Local only. The backend repository is not checked out in CI, so this is not part
 * of `pnpm check`; it is a command to run before starting data work.
 *
 * Override the location with KEEL_BACKEND_DIR when the checkout lives elsewhere.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const VENDORED = 'docs/api/keel-openapi.yaml';
const backendDir = process.env.KEEL_BACKEND_DIR ?? resolve('..', '..', 'keel-backend');
const upstream = join(backendDir, 'docs', 'api', 'keel-openapi.yaml');

/** The version lives in a comment on the first line of the `info:` block. */
function versionOf(source: string): string {
  const match = /^\s*#\s*(\d+\.\d+\.\d+[^.]*)\./m.exec(source);
  return match?.[1] ?? '(version comment not found)';
}

if (!existsSync(upstream)) {
  console.error(`Backend contract not found at ${upstream}`);
  console.error('Set KEEL_BACKEND_DIR to the keel-backend checkout, or skip this check.');
  process.exitCode = 2;
} else {
  const vendored = readFileSync(VENDORED, 'utf8');
  const authored = readFileSync(upstream, 'utf8');

  if (vendored === authored) {
    console.log(`OK  ${VENDORED} is identical to the backend copy (${versionOf(vendored)})`);
    process.exitCode = 0;
  } else {
    console.error(`DRIFT  ${VENDORED} differs from the backend copy.`);
    console.error(`  vendored: ${versionOf(vendored)}`);
    console.error(`  upstream: ${versionOf(authored)}`);
    console.error(`\nTo take the upstream version:`);
    console.error(`  cp ${upstream} ${VENDORED} && pnpm generate:api`);
    console.error('Then read what changed before trusting the new types.');
    process.exitCode = 1;
  }
}
