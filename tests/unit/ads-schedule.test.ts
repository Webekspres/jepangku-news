import { describe, expect, test } from "bun:test";
import { getAdScheduleInfo } from "@/lib/ads/schedule";
import { activeAdSlotWhere } from "@/lib/ads/serialize";

describe("getAdScheduleInfo — §14.3 jadwal", () => {
  const now = new Date("2026-06-15T12:00:00+07:00");

  test("no dates → always / tanpa batas", () => {
    const info = getAdScheduleInfo(null, null, now);
    expect(info.status).toBe("always");
    expect(info.daysRemainingLabel).toBe("Tanpa batas");
  });

  test("future start → upcoming", () => {
    const info = getAdScheduleInfo("2026-07-01T00:00:00+07:00", null, now);
    expect(info.status).toBe("upcoming");
    expect(info.daysRemainingLabel).toMatch(/Mulai/);
  });

  test("past end → expired", () => {
    const info = getAdScheduleInfo(null, "2026-06-01T00:00:00+07:00", now);
    expect(info.status).toBe("expired");
    expect(info.daysRemainingLabel).toBe("Sudah berakhir");
  });

  test("active window → scheduled with days remaining", () => {
    const info = getAdScheduleInfo(
      "2026-06-01T00:00:00+07:00",
      "2026-06-30T23:59:59+07:00",
      now,
    );
    expect(info.status).toBe("scheduled");
    expect(info.daysRemaining).toBeGreaterThan(0);
  });
});

describe("activeAdSlotWhere — §14.3 aktif + jadwal", () => {
  const at = new Date("2026-06-15T12:00:00+07:00");

  test("requires isActive and position (incl. legacy aliases)", () => {
    const where = activeAdSlotWhere("sidebar", at);
    expect(where.position.in).toContain("sidebar");
    expect(where.position.in).toContain("homepage-sidebar");
    expect(where.position.in).toContain("article-sidebar");
    expect(where.isActive).toBe(true);
    expect(where.AND).toHaveLength(2);
  });
});
