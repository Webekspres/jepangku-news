import { cleanupTestDatabase } from "../tests/helpers/test-db-cleanup";

const report = await cleanupTestDatabase();
console.log("Test DB cleanup complete:", report);
