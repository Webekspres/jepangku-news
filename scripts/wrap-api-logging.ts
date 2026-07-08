/**
 * Codemod: wrap all API route handlers with withRequestLogging.
 * Run: bun scripts/wrap-api-logging.ts
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const API_ROOT = join(import.meta.dir, '../app/api');
const IMPORT_LINE = "import { withRequestLogging } from '@/lib/logging/request-logger';";
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry === 'route.ts') out.push(full);
  }
  return out;
}

function findMatchingBrace(src: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findParamClose(src: string, openParen: number): number {
  let depth = 0;
  for (let i = openParen; i < src.length; i++) {
    const ch = src[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function wrapExportAsyncFunctions(src: string): { src: string; methods: string[] } {
  const methods: string[] = [];
  let result = src;
  let offset = 0;

  const pattern = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;

  while (true) {
    pattern.lastIndex = offset;
    const match = pattern.exec(result);
    if (!match) break;

    const method = match[1];
    const fnStart = match.index;
    const parenOpen = match.index + match[0].length - 1;
    const parenClose = findParamClose(result, parenOpen);
    if (parenClose < 0) break;

    let bodyOpen = parenClose + 1;
    while (bodyOpen < result.length && result[bodyOpen] !== '{') bodyOpen++;
    if (result[bodyOpen] !== '{') break;

    const bodyClose = findMatchingBrace(result, bodyOpen);
    if (bodyClose < 0) break;

    const params = result.slice(parenOpen + 1, parenClose);
    const body = result.slice(bodyOpen + 1, bodyClose);

    const replacement =
      `const ${method} = withRequestLogging(async (${params}) => {${body}});`;

    result = result.slice(0, fnStart) + replacement + result.slice(bodyClose + 1);
    methods.push(method);
    offset = fnStart + replacement.length;
  }

  return { src: result, methods };
}

function wrapExportConstAsync(src: string): { src: string; methods: string[] } {
  const methods: string[] = [];
  let result = src;
  const pattern = /export\s+const\s+(GET|POST|PUT|PATCH|DELETE)\s*=\s*async\s*\(/g;
  let m: RegExpExecArray | null;

  while ((m = pattern.exec(result)) !== null) {
    const method = m[1];
    const fnStart = m.index;
    const parenOpen = m.index + m[0].length - 1;
    const parenClose = findParamClose(result, parenOpen);
    if (parenClose < 0) continue;

    let bodyOpen = parenClose + 1;
    while (bodyOpen < result.length && result[bodyOpen] !== '{') bodyOpen++;

    const bodyClose = findMatchingBrace(result, bodyOpen);
    if (bodyClose < 0) continue;

    const params = result.slice(parenOpen + 1, parenClose);
    const body = result.slice(bodyOpen + 1, bodyClose);

    const replacement =
      `const ${method} = withRequestLogging(async (${params}) => {${body}});`;

    result = result.slice(0, fnStart) + replacement + result.slice(bodyClose + 1);
    methods.push(method);
    pattern.lastIndex = fnStart + replacement.length;
  }

  return { src: result, methods };
}

function ensureImport(src: string): string {
  if (src.includes("from '@/lib/logging/request-logger'")) return src;
  const lines = src.split('\n');
  let insertAt = 0;
  while (insertAt < lines.length && lines[insertAt].startsWith('import ')) insertAt++;
  lines.splice(insertAt, 0, IMPORT_LINE);
  return lines.join('\n');
}

function ensureExports(src: string, methods: string[]): string {
  const unique = [...new Set(methods)];
  if (unique.length === 0) return src;

  const exportRe = /export\s*\{\s*([^}]+)\s*\}\s*;?/;
  const existing = exportRe.exec(src);
  if (existing) {
    const current = existing[1].split(',').map((s) => s.trim()).filter(Boolean);
    const merged = [...new Set([...current, ...unique])];
    return src.replace(exportRe, `export { ${merged.join(', ')} };`);
  }

  return src.trimEnd() + `\n\nexport { ${unique.join(', ')} };\n`;
}

function processFile(path: string): boolean {
  const original = readFileSync(path, 'utf8');
  if (original.includes('withRequestLogging')) return false;

  const hasTarget = METHODS.some((m) =>
    new RegExp(`export\\s+(async\\s+function|const)\\s+${m}`).test(original),
  );
  if (!hasTarget) return false;

  const r1 = wrapExportAsyncFunctions(original);
  const r2 = wrapExportConstAsync(r1.src);
  const methods = [...r1.methods, ...r2.methods];
  if (methods.length === 0) return false;

  let out = ensureExports(ensureImport(r2.src), methods);
  writeFileSync(path, out, 'utf8');
  console.log(`wrapped: ${path.replace(/.*app\/api/, 'app/api')}`);
  return true;
}

let count = 0;
for (const file of walk(API_ROOT)) {
  if (processFile(file)) count++;
}
console.log(`\nDone. Wrapped ${count} route files.`);
