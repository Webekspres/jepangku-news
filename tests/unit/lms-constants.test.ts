import { afterEach, describe, expect, it } from "bun:test";
import {
  LMS_UTM_SOURCE,
  buildLmsUrl,
  getLmsBaseUrl,
} from "@/lib/lms/constants";

describe("§13.4 LMS domain — staging vs production", () => {
  const envKeys = ["NEXT_PUBLIC_LMS_URL"] as const;
  const original: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const key of envKeys) {
      if (original[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original[key];
      }
    }
  });

  function snapshotEnv() {
    for (const key of envKeys) {
      original[key] = process.env[key];
    }
  }

  it("uses explicit NEXT_PUBLIC_LMS_URL when set", () => {
    snapshotEnv();
    process.env.NEXT_PUBLIC_LMS_URL = "https://custom-lms.example.com/";
    expect(getLmsBaseUrl()).toBe("https://custom-lms.example.com");
  });

  it("uses production domain when NODE_ENV is production", () => {
    snapshotEnv();
    const origNodeEnv = process.env.NODE_ENV;
    delete process.env.NEXT_PUBLIC_LMS_URL;
    process.env.NODE_ENV = "production";
    expect(getLmsBaseUrl()).toBe("https://kursus.jepangku.com");
    process.env.NODE_ENV = origNodeEnv;
  });

  it("defaults to staging dev domain otherwise", () => {
    snapshotEnv();
    delete process.env.NEXT_PUBLIC_LMS_URL;
    delete process.env.NODE_ENV;
    expect(getLmsBaseUrl()).toBe("https://dev.kursus.jepangku.com");
  });
});

describe("§13.5 LMS UTM links — buildLmsUrl", () => {
  it("sets utm_source and default utm_medium homepage", () => {
    const url = new URL(buildLmsUrl("/kursus"));
    expect(url.searchParams.get("utm_source")).toBe(LMS_UTM_SOURCE);
    expect(url.searchParams.get("utm_medium")).toBe("homepage");
    expect(url.pathname).toBe("/kursus");
  });

  it("accepts custom medium and campaign", () => {
    const url = new URL(
      buildLmsUrl("/kursus/jlpt-n5", {
        medium: "homepage-lms-card",
        campaign: "jlpt-n5",
      }),
    );
    expect(url.searchParams.get("utm_source")).toBe("jepangku.com");
    expect(url.searchParams.get("utm_medium")).toBe("homepage-lms-card");
    expect(url.searchParams.get("utm_campaign")).toBe("jlpt-n5");
  });
});
