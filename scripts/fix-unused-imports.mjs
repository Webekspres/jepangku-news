#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { globSync } from 'glob';

const patterns = [
  'app/api/**/route.ts',
  'lib/*.ts',
  'prisma/**/*.js',
  'tests/**/*.ts',
];

let fixed = 0;
let totalErrors = 0;

for (const pattern of patterns) {
  const files = globSync(pattern, { ignore: 'node_modules/**' });

  for (const file of files) {
    if (!existsSync(file)) continue;
    let content = readFileSync(file, 'utf-8');
    const original = content;

    // Get body without import lines for usage checking
    const bodyWithoutImports = content.replace(/^import .+$/gm, '');
    const usesNextResponse = /\bNextResponse\b/.test(bodyWithoutImports);
    const usesApiError = /\bapiError\b/.test(bodyWithoutImports);
    const usesApiSuccess = /\bapiSuccess\b/.test(bodyWithoutImports);

    // Fix { NextRequest, NextResponse } where only NextRequest is used
    const bothImportLine = content.match(
      /^import\s*\{\s*NextRequest\s*,\s*NextResponse\s*\}\s*from\s*['"]next\/server['"];?$/m
    );
    if (bothImportLine && !usesNextResponse) {
      content = content.replace(bothImportLine[0], `import { NextRequest } from 'next/server';`);
      totalErrors++;
    }

    // Fix import { NextResponse } from 'next/server' where unused
    const nextResponseOnlyLine = content.match(
      /^import\s*\{\s*NextResponse\s*\}\s*from\s*['"]next\/server['"];?$/m
    );
    if (nextResponseOnlyLine && !usesNextResponse) {
      content = content.replace(nextResponseOnlyLine[0], '');
      totalErrors++;
    }

    // Fix { apiError, apiSuccess } where only apiSuccess is used
    const apiBothLine = content.match(
      /^import\s*\{\s*apiError\s*,\s*apiSuccess\s*\}\s*from\s*['"]@\/lib\/api-response['"];?$/m
    );
    if (apiBothLine && !usesApiError && usesApiSuccess) {
      content = content.replace(apiBothLine[0], `import { apiSuccess } from '@/lib/api-response';`);
      totalErrors++;
    }

    // Fix { apiSuccess, apiError } where only apiError is used
    const apiBothLine2 = content.match(
      /^import\s*\{\s*apiSuccess\s*,\s*apiError\s*\}\s*from\s*['"]@\/lib\/api-response['"];?$/m
    );
    if (apiBothLine2 && !usesApiSuccess && usesApiError) {
      content = content.replace(apiBothLine2[0], `import { apiError } from '@/lib/api-response';`);
      totalErrors++;
    }

    // Fix { apiError } alone unused
    const apiErrorOnlyLine = content.match(
      /^import\s*\{\s*apiError\s*\}\s*from\s*['"]@\/lib\/api-response['"];?$/m
    );
    if (apiErrorOnlyLine && !usesApiError) {
      content = content.replace(apiErrorOnlyLine[0], '');
      totalErrors++;
    }

    // Fix { apiSuccess } alone unused
    const apiSuccessOnlyLine = content.match(
      /^import\s*\{\s*apiSuccess\s*\}\s*from\s*['"]@\/lib\/api-response['"];?$/m
    );
    if (apiSuccessOnlyLine && !usesApiSuccess) {
      content = content.replace(apiSuccessOnlyLine[0], '');
      totalErrors++;
    }

    // Fix unused type imports (e.g., import type { HomeFeedResponse } from ...)
    const typeImportRegex = /^import type \{.*\}\s*from\s*['"].*['"];?$/gm;
    let typeMatch;
    while ((typeMatch = typeImportRegex.exec(content)) !== null) {
      const line = typeMatch[0];
      const typeNames = line.match(/\{\s*([^}]+)\s*\}/);
      if (typeNames) {
        const types = typeNames[1].split(',').map(t => t.trim());
        const allUnused = types.every(t => !new RegExp(`\\b${t}\\b`).test(bodyWithoutImports));
        if (allUnused) {
          content = content.replace(line, '');
          totalErrors++;
        }
      }
    }

    // Write back if changed
    if (content !== original) {
      writeFileSync(file, content, 'utf-8');
      fixed++;
      console.log(`Fixed: ${file}`);
    }
  }
}

console.log(`\n${fixed} files fixed, ${totalErrors} total import removals.`);
