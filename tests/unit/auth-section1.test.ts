import { afterEach, describe, expect, it } from "bun:test";
import { decodeCoreJwtClaims, establishCoreSession } from "@/lib/core/session";
import { isCoreApiConfigured } from "@/lib/core/config";
import { fetchCoreUserMe } from "@/lib/core/users";

function makeFakeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url",
  );
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.fake-signature`;
}

describe("§1.9 Core JWT — claims XP/role", () => {
  it("decodeCoreJwtClaims extracts jepangku XP, points, level, and roles", () => {
    const token = makeFakeJwt({
      sub: "user_clerk_abc",
      email: "test@example.com",
      jepangku: {
        totalXp: 420,
        currentPoints: 120,
        level: 3,
        roles: ["USER", "PORTAL_ADMIN"],
      },
    });

    const claims = decodeCoreJwtClaims(token);
    expect(claims?.sub).toBe("user_clerk_abc");
    expect(claims?.jepangku?.totalXp).toBe(420);
    expect(claims?.jepangku?.currentPoints).toBe(120);
    expect(claims?.jepangku?.level).toBe(3);
    expect(claims?.jepangku?.roles).toEqual(["USER", "PORTAL_ADMIN"]);
  });
});

describe("§1.10 Core down — graceful degradation", () => {
  const originalCoreUrl = process.env.CORE_API_URL;

  afterEach(() => {
    if (originalCoreUrl === undefined) {
      delete process.env.CORE_API_URL;
    } else {
      process.env.CORE_API_URL = originalCoreUrl;
    }
  });

  it("establishCoreSession returns null when Core API is not configured", async () => {
    delete process.env.CORE_API_URL;
    expect(isCoreApiConfigured()).toBe(false);
    const claims = await establishCoreSession("clerk-session-token");
    expect(claims).toBeNull();
  });

  it("fetchCoreUserMe returns null on invalid token (no throw)", async () => {
    const profile = await fetchCoreUserMe("not-a-valid-jwt");
    expect(profile).toBeNull();
  });
});
