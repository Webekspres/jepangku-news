import { config } from "dotenv";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");

/** Load `.env` then `.env.test` (test DB + URLs override dev). */
export function loadTestEnv(): void {
  config({ path: resolve(root, ".env") });
  config({ path: resolve(root, ".env.test"), override: true });

  const user = process.env.DB_USER ?? "root";
  const pass = process.env.DB_PASSWORD ?? "root";
  const raw = process.env.DATABASE_URL ?? "";
  if (raw.includes("${DB_USER}") || raw.includes("${DB_PASSWORD}")) {
    process.env.DATABASE_URL = `postgresql://${user}:${pass}@localhost:5432/jepangku_news_test?client_encoding=UTF8`;
  } else if (raw && !raw.includes("client_encoding")) {
    process.env.DATABASE_URL = `${raw}${raw.includes("?") ? "&" : "?"}client_encoding=UTF8`;
  }
  process.env.PGCLIENTENCODING = "UTF8";
}

export function assertTestDatabase(): void {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.includes("jepangku_news_test") && !url.includes("_test")) {
    throw new Error(
      `Refusing to run test cleanup against non-test DATABASE_URL: ${url}`,
    );
  }
}
