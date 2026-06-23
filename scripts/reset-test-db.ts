import { Client } from "pg";
import { loadTestEnv } from "./load-test-env";

loadTestEnv();

const adminUrl =
  process.env.DATABASE_ADMIN_URL ??
  `postgresql://${process.env.DB_USER ?? "root"}:${process.env.DB_PASSWORD ?? "root"}@localhost:5432/postgres`;

const dbName = "jepangku_news_test";

const client = new Client({ connectionString: adminUrl });
await client.connect();

await client.query(
  `
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = $1 AND pid <> pg_backend_pid()
`,
  [dbName],
);

await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
await client.query(
  `CREATE DATABASE ${dbName} ENCODING 'UTF8' TEMPLATE template0`,
);
console.log(`Recreated database ${dbName} (UTF8)`);

await client.end();
