/**
 * Updates client fetch().then(r => r.json()) calls to unwrap API envelope.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const TARGET_DIRS = [
  join(ROOT, 'app'),
  join(ROOT, 'components'),
  join(ROOT, 'hooks'),
  join(ROOT, 'lib'),
  join(ROOT, 'e2e'),
  join(ROOT, 'tests'),
  join(ROOT, 'scripts'),
];

const SKIP_FILES = new Set([
  'lib/api-response.ts',
  'lib/fetch-api.ts',
  'scripts/apply-api-envelope.ts',
  'scripts/update-client-fetch-envelope.ts',
]);

function collectTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      files.push(...collectTsFiles(full));
    } else if (/\.(tsx?)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function ensureFetchApiImport(source: string): string {
  if (source.includes("from '@/lib/fetch-api'")) return source;
  const importLine = "import { parseApiResponse } from '@/lib/fetch-api';\n";
  const nextImport = source.match(/^import .+$/m);
  if (nextImport?.index !== undefined) {
    const insertAt = source.indexOf('\n', nextImport.index) + 1;
    return source.slice(0, insertAt) + importLine + source.slice(insertAt);
  }
  return importLine + source;
}

function transform(source: string): string {
  let next = source;
  let changed = false;

  const patterns: Array<[RegExp, string]> = [
    [/await\s+res\.json\(\)/g, 'await parseApiResponse(res)'],
    [/await\s+response\.json\(\)/g, 'await parseApiResponse(response)'],
    [/await\s+r\.json\(\)/g, 'await parseApiResponse(r)'],
    [
      /\.then\(\(r\)\s*=>\s*r\.json\(\)\)/g,
      '.then((r) => parseApiResponse(r))',
    ],
    [
      /\.then\(\(res\)\s*=>\s*res\.json\(\)\)/g,
      '.then((res) => parseApiResponse(res))',
    ],
    [
      /\.then\(\(response\)\s*=>\s*response\.json\(\)\)/g,
      '.then((response) => parseApiResponse(response))',
    ],
    [
      /\.then\(async\s*\(res\)\s*=>\s*res\.json\(\)\)/g,
      '.then(async (res) => parseApiResponse(res))',
    ],
    [
      /\.then\(async\s*\(response\)\s*=>\s*response\.json\(\)\)/g,
      '.then(async (response) => parseApiResponse(response))',
    ],
  ];

  for (const [pattern, replacement] of patterns) {
    if (pattern.test(next)) {
      next = next.replace(pattern, replacement);
      changed = true;
    }
  }

  if (changed) {
    next = ensureFetchApiImport(next);
  }

  return next;
}

let changed = 0;
for (const dir of TARGET_DIRS) {
  for (const file of collectTsFiles(dir)) {
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    if (SKIP_FILES.has(rel)) continue;

    const original = readFileSync(file, 'utf8');
    const updated = transform(original);
    if (updated !== original) {
      writeFileSync(file, updated, 'utf8');
      changed += 1;
      console.log('updated', rel);
    }
  }
}

console.log(`Done. ${changed} client/test file(s) updated.`);
