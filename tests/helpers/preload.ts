import { config } from "dotenv";
import { resolve } from "node:path";

// Load .env.test for unit/integration runs (Bun also supports --env-file=.env.test on scripts).
config({ path: resolve(import.meta.dir, "../../.env.test"), override: false });
