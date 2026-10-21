#!/usr/bin/env node
/**
 * Fail if unresolved git conflict markers remain in tracked source files.
 * Wired into `pnpm lint` so a bad merge cannot silently ship.
 *
 * Matches real git markers (`<<<<<<< label`, a lone `=======`, `>>>>>>> label`),
 * not ASCII-art lines in figlet fonts that merely contain runs of `=`.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const MARKER = /^(?:<<<<<<< .+|=======|>>>>>>> .+)\s*$/;
const ROOT = process.cwd();

/** Paths we never scan (generated / vendor blobs / ASCII-art fonts). */
const SKIP_PREFIXES = [
  'node_modules/',
  'dist/',
  'public/figlet-fonts/',
  'public/age-wasm/',
  'public/visualsubnetcalc/',
  'public/zpool-calc/',
];

function listTrackedFiles() {
  const out = execFileSync('git', ['ls-files', '-z'], { encoding: 'buffer' });
  return out
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .filter((f) => !SKIP_PREFIXES.some((p) => f.startsWith(p)));
}

const hits = [];
for (const rel of listTrackedFiles()) {
  let text;
  try {
    text = readFileSync(path.join(ROOT, rel), 'utf8');
  }
  catch {
    continue;
  }
  // Skip binary-ish files
  if (text.includes('\0')) {
    continue;
  }
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (MARKER.test(lines[i])) {
      hits.push(`${rel}:${i + 1}:${lines[i]}`);
    }
  }
}

if (hits.length) {
  console.error('Unresolved git conflict markers found:');
  for (const h of hits) {
    console.error(`  ${h}`);
  }
  process.exit(1);
}

console.log('No conflict markers found.');
