/**
 * Fix codemod: move withRequestLogging import out of broken multi-line import blocks.
 * Run: bun scripts/fix-api-imports.ts
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const API_ROOT = join(import.meta.dir, '../app/api');
const LOGGING_IMPORT = "import { withRequestLogging } from '@/lib/logging/request-logger';";

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry === 'route.ts') out.push(full);
  }
  return out;
}

function fixFile(file: string): boolean {
  let lines = readFileSync(file, 'utf8').split('\n');

  // Remove any misplaced logging import lines
  const hadMisplaced = lines.some(
    (line, i) => lines[i - 1]?.trim() === 'import {' && line.trim() === LOGGING_IMPORT,
  );
  lines = lines.filter(
    (line, i) => !(lines[i - 1]?.trim() === 'import {' && line.trim() === LOGGING_IMPORT),
  );

  if (!hadMisplaced && !lines.includes(LOGGING_IMPORT)) return false;

  // Ensure logging import exists once, after the last complete import statement
  lines = lines.filter((line) => line.trim() !== LOGGING_IMPORT);

  let insertAt = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s.+from\s+['"].+['"];?\s*$/.test(lines[i].trim())) {
      insertAt = i + 1;
    }
    // closing line of multiline import: } from '...';
    if (/^\}\s+from\s+['"].+['"];?\s*$/.test(lines[i].trim())) {
      insertAt = i + 1;
    }
  }

  lines.splice(insertAt, 0, LOGGING_IMPORT);
  writeFileSync(file, lines.join('\n'), 'utf8');
  return true;
}

let fixed = 0;
for (const file of walk(API_ROOT)) {
  if (fixFile(file)) {
    fixed++;
    console.log(`fixed: ${file.replace(/.*app[\\/]api/, 'app/api')}`);
  }
}
console.log(`\nDone. Fixed ${fixed} files.`);
