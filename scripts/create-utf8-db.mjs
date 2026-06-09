import pg from 'pg';

const adminUrl = process.env.ADMIN_DATABASE_URL ?? 'postgresql://root:root@localhost:5432/postgres';
const dbName = process.env.TARGET_DB ?? 'jepangku_news_utf8';

const admin = new pg.Client({ connectionString: adminUrl });
await admin.connect();

const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
if (exists.rowCount === 0) {
  await admin.query(`CREATE DATABASE "${dbName}" ENCODING 'UTF8' TEMPLATE template0`);
  console.log(`Created database ${dbName} with UTF8 encoding`);
} else {
  console.log(`Database ${dbName} already exists`);
}

const check = await admin.query(
  'SELECT datname, pg_encoding_to_char(encoding) AS encoding FROM pg_database WHERE datname = $1',
  [dbName]
);
console.log(check.rows[0]);
await admin.end();
