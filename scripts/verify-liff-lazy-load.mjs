import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Check the built import graph rather than the source's import syntax:
// manual chunking can pull an optional SDK back into an eager vendor bundle.
const dist = path.resolve(process.argv[2] || 'dist');
const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
const entries = [...html.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"]+)"/g)]
  .map((match) => path.join(dist, match[1].replace(/^\//, '')));
assert.ok(entries.length, 'Built HTML must contain a module entry');

const visited = new Set();
function visit(file) {
  if (visited.has(file)) return;
  visited.add(file);
  const source = readFileSync(file, 'utf8');
  assert.ok(!source.includes('LIFF_STORE:'), `LINE SDK eagerly reachable from ${path.relative(dist, file)}`);
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  for (const statement of ast.statements) {
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
    const specifier = statement.moduleSpecifier;
    if (!specifier || !ts.isStringLiteral(specifier) || !specifier.text.startsWith('.')) continue;
    visit(path.resolve(path.dirname(file), specifier.text));
  }
}
entries.forEach(visit);
const bundledSdk = readdirSync(path.join(dist, 'assets'))
  .filter((name) => name.endsWith('.js'))
  .map((name) => path.join(dist, 'assets', name))
  .filter((file) => readFileSync(file, 'utf8').includes('LIFF_STORE:'));
assert.ok(bundledSdk.length, 'Optional LINE SDK must still be included for sharing');
assert.ok(bundledSdk.every((file) => !visited.has(file)), 'SDK must only be reachable after the guarded action');
console.log(`LINE SDK build regression: ${visited.size} eager modules checked; ${bundledSdk.length} SDK chunk kept optional`);
