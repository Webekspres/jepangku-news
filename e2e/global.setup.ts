import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { clerkSetup } from "@clerk/testing/playwright";

export default async function globalSetup() {
  loadEnv({ path: resolve(__dirname, "../.env.test") });
  loadEnv({ path: resolve(__dirname, "../.env") });
  await clerkSetup({ dotenv: false });
}
