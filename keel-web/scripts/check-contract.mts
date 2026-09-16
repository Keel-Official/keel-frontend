/**
 * Fails when `lib/api/schema.d.ts` is not what `docs/api/keel-openapi.yaml`
 * generates. The generated file is committed so this check can run without a
 * network, and so a contract change shows up as a reviewable diff rather than as a
 * silent type shift.
 *
 * This checks the vendored spec against the types. It does NOT check the vendored
 * spec against the backend, which is a separate drift with a human in the loop; see
 * `pnpm check:contract-upstream`.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SPEC = 'docs/api/keel-openapi.yaml';
const COMMITTED = 'lib/api/schema.d.ts';

const workdir = mkdtempSync(join(tmpdir(), 'keel-contract-'));
const regenerated = join(workdir, 'schema.d.ts');

try {
  execFileSync('openapi-typescript', [SPEC, '-o', regenerated], {
    stdio: 'pipe',
    shell: false,
    env: { ...process.env, PATH: `node_modules/.bin:${process.env.PATH ?? ''}` },
  });

  const fresh = readFileSync(regenerated, 'utf8');
  const committed = readFileSync(COMMITTED, 'utf8');

  if (fresh === committed) {
    console.log(`OK  ${COMMITTED} matches ${SPEC}`);
    process.exitCode = 0;
  } else {
    console.error(`DRIFT  ${COMMITTED} does not match ${SPEC}.`);
    console.error('Run `pnpm generate:api` and commit the result.');
    process.exitCode = 1;
  }
} finally {
  rmSync(workdir, { recursive: true, force: true });
}
