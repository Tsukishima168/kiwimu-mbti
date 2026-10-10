import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// No credentials or requests: these placeholders only keep configured branches
// in the compiled graph. Keep artifacts for diagnosing a failed combination.
const outputRoot = mkdtempSync(path.join(tmpdir(), 'kiwimu-liff-build-matrix-'));
const root = path.resolve(import.meta.dirname, '..');
const cases = [
  ['unconfigured', false, false],
  ['liff-only', false, true],
  ['auth-only', true, false],
  ['auth-and-liff', true, true],
];

for (const [name, auth, liff] of cases) {
  const env = { ...process.env };
  for (const key of [
    'VITE_MOON_ISLAND_SUPABASE_URL', 'VITE_MOON_ISLAND_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_USER_URL', 'VITE_SUPABASE_USER_ANON_KEY', 'VITE_LINE_LIFF_ID',
  ]) env[key] = '';
  if (auth) {
    env.VITE_MOON_ISLAND_SUPABASE_URL = 'https://example.invalid';
    env.VITE_MOON_ISLAND_SUPABASE_ANON_KEY = 'qa-noncredential-placeholder';
  }
  if (liff) env.VITE_LINE_LIFF_ID = 'qa-build-only-no-network';
  const dist = path.join(outputRoot, name);
  const build = spawnSync(process.execPath,
    [path.join(root, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', dist],
    { cwd: root, env, stdio: 'inherit' });
  assert.equal(build.status, 0, `${name}: production build failed`);
  const check = spawnSync(process.execPath,
    [path.join(root, 'scripts/verify-liff-lazy-load.mjs'), dist],
    { cwd: root, env, stdio: 'inherit' });
  assert.equal(check.status, 0, `${name}: SDK eagerly reachable`);
  console.log(`PASS ${name}`);
}
console.log(`LIFF configured build matrix: ${cases.length} cases passed; artifacts: ${outputRoot}`);
