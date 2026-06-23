import { spawn } from "node:child_process";
import { loadTestEnv } from "./load-test-env";

loadTestEnv();

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: bun scripts/with-test-env.ts <command> [args…]");
  process.exit(1);
}

const child = spawn(args[0], args.slice(1), {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("close", (code) => process.exit(code ?? 1));
