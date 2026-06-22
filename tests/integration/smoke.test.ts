import { beforeAll, describe, expect, it } from "bun:test";
import { getNewsBaseUrl, isNewsServerUp } from "../helpers/server";

describe("smoke — HTTP API", () => {
  let serverUp = false;
  const baseUrl = getNewsBaseUrl();

  beforeAll(async () => {
    serverUp = await isNewsServerUp(baseUrl);
    if (!serverUp && !process.env.CI) {
      console.warn(
        `⚠️  Integration smoke skipped — start the app first (\`bun dev\`) at ${baseUrl}`,
      );
    }
  });

  it("GET /api/health returns ok", async () => {
    if (!serverUp) {
      if (process.env.CI) {
        expect(serverUp).toBe(true);
      }
      return;
    }

    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.ok).toBe(true);

    const json = (await res.json()) as { status: string; db: string };
    expect(json.status).toBe("ok");
    expect(json.db).toBe("ok");
  });

  it("GET /api/auth/me returns 401 for guest", async () => {
    if (!serverUp) return;

    const res = await fetch(`${baseUrl}/api/auth/me`);
    expect(res.status).toBe(401);
  });
});
