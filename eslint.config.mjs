import { defineConfig, globalIgnores } from "eslint/config";

// Use a minimal flat config so ESLint can run.
// eslint-config-next flat exports vary by version; importing them in flat
// config sometimes causes "Plugin \"\" not found".
export default defineConfig([
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
