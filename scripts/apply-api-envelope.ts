/**
 * One-shot migration: wrap JSON API route handlers with apiSuccess / apiError.
 * Exempt: SSE streams, CSV/binary exports, mock file serving.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const API_DIR = join(ROOT, 'app', 'api');

const EXEMPT_SUFFIXES = [
  'notifications/stream/route.ts',
  'points/export/route.ts',
  'admin/newsletter/export/route.ts',
  'admin/articles/export/route.ts',
  'files/mock/[...path]/route.ts',
];

function collectRouteFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectRouteFiles(full));
    } else if (entry === 'route.ts') {
      files.push(full);
    }
  }
  return files;
}

function isExempt(filePath: string): boolean {
  const rel = relative(API_DIR, filePath).replace(/\\/g, '/');
  return EXEMPT_SUFFIXES.some((suffix) => rel === suffix);
}

function ensureImport(source: string): string {
  if (source.includes("from '@/lib/api-response'")) return source;

  const importLine =
    "import { apiError, apiSuccess } from '@/lib/api-response';\n";

  const nextImport = source.match(/^import .+$/m);
  if (nextImport?.index !== undefined) {
    const insertAt = source.indexOf('\n', nextImport.index) + 1;
    return source.slice(0, insertAt) + importLine + source.slice(insertAt);
  }

  return importLine + source;
}

function transformSource(source: string): string {
  let next = source;

  // Skip if already mostly migrated
  if (next.includes('apiSuccess(') && !next.includes('NextResponse.json(')) {
    return next;
  }

  // Multi-line error with code
  next = next.replace(
    /return NextResponse\.json\(\s*\{\s*error:\s*([^,}]+),\s*code:\s*([^}]+)\s*\}\s*,\s*\{\s*status:\s*(\d+)\s*\}\s*\)/g,
    'return apiError($1, { code: $2, status: $3 })',
  );

  // Error with retryAfter (rate limit style)
  next = next.replace(
    /return NextResponse\.json\(\s*\{\s*error:\s*([^,}]+),\s*retryAfter:\s*([^}]+)\s*\}\s*,\s*\{\s*status:\s*429,\s*headers:\s*\{([^}]+)\}\s*,?\s*\}\s*\)/g,
    'return apiError($1, { status: 429, code: \'RATE_LIMIT_EXCEEDED\', meta: { retryAfter: $2 }, headers: { $3 } })',
  );

  // Simple error responses
  next = next.replace(
    /return NextResponse\.json\(\s*\{\s*error:\s*([^}]+)\s*\}\s*,\s*\{\s*status:\s*(\d+)([^}]*)\}\s*\)/g,
    (_match, message, status, rest) => {
      const codeMatch = rest.match(/code:\s*['"]([^'"]+)['"]/);
      const code = codeMatch ? `, code: '${codeMatch[1]}'` : '';
      return `return apiError(${message}, { status: ${status}${code} })`;
    },
  );

  // Success with headers only
  next = next.replace(
    /return NextResponse\.json\(([^,;]+),\s*\{\s*headers:\s*(\{[\s\S]*?\})\s*,?\s*\}\s*\)/g,
    'return apiSuccess($1, { headers: $2 })',
  );

  // Success with status + headers
  next = next.replace(
    /return NextResponse\.json\(([^,;]+),\s*\{\s*status:\s*(\d+),\s*headers:\s*(\{[\s\S]*?\})\s*,?\s*\}\s*\)/g,
    'return apiSuccess($1, { status: $2, headers: $3 })',
  );

  // Success with status only
  next = next.replace(
    /return NextResponse\.json\(([^,;]+),\s*\{\s*status:\s*(\d+)\s*\}\s*\)/g,
    'return apiSuccess($1, { status: $2 })',
  );

  // Plain success
  next = next.replace(
    /return NextResponse\.json\(([^);]+)\)(?!\s*;?\s*\/\/)/g,
    (match, data) => {
      if (data.includes('apiSuccess') || data.includes('apiError')) return match;
      return `return apiSuccess(${data})`;
    },
  );

  if (next.includes('apiSuccess(') || next.includes('apiError(')) {
    next = ensureImport(next);
  }

  return next;
}

let changed = 0;
for (const file of collectRouteFiles(API_DIR)) {
  if (isExempt(file)) continue;

  const original = readFileSync(file, 'utf8');
  const updated = transformSource(original);
  if (updated !== original) {
    writeFileSync(file, updated, 'utf8');
    changed += 1;
    console.log('updated', relative(ROOT, file));
  }
}

console.log(`Done. ${changed} route file(s) updated.`);
