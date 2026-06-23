import { Client } from "pg";
import { loadTestEnv } from "./load-test-env";

loadTestEnv();

const adminUrl =
  process.env.DATABASE_ADMIN_URL ??
  `postgresql://${process.env.DB_USER ?? "root"}:${process.env.DB_PASSWORD ?? "root"}@localhost:5432/postgres`;

const dbName = "jepangku_news_test";

const client = new Client({ connectionString: adminUrl });
await client.connect();

const existing = await client.query(
  "SELECT 1 FROM pg_database WHERE datname = $1",
  [dbName],
);

if (existing.rowCount === 0) {
  await client.query(
    `CREATE DATABASE ${dbName} ENCODING 'UTF8' TEMPLATE template0`,
  );
  console.log(`Created database ${dbName} (UTF8)`);
} else {
  console.log(`Database ${dbName} already exists`);
}

await client.end();
