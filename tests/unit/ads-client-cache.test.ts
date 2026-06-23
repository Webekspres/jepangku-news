import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  fetchAdSlotClient,
  invalidateAdSlotClientCache,
  peekAdSlotClient,
} from "@/lib/ads/client-cache";
import type { HomeAdResponse } from "@/lib/home/types";

const SAMPLE: HomeAdResponse = {
  slot: "homepage-mid",
  banner: {
    id: "ad-1",
    position: "homepage-mid",
    title: "Test",
    imageUrl: "https://cdn.example.com/banner.jpg",
    linkUrl: null,
    altText: "Test banner",
  },
};

describe("ads client-cache — §14.4 tidak over-fetch", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    invalidateAdSlotClientCache();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    invalidateAdSlotClientCache();
  });

  test("deduplicates concurrent fetches for the same slot", async () => {
    let fetchCount = 0;
    globalThis.fetch = mock(() => {
      fetchCount += 1;
      return Promise.resolve(
        new Response(JSON.stringify(SAMPLE), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    }) as typeof fetch;

    const [a, b, c] = await Promise.all([
      fetchAdSlotClient("homepage-mid"),
      fetchAdSlotClient("homepage-mid"),
      fetchAdSlotClient("homepage-mid"),
    ]);

    expect(fetchCount).toBe(1);
    expect(a).toEqual(SAMPLE);
    expect(b).toEqual(SAMPLE);
    expect(c).toEqual(SAMPLE);
  });

  test("serves cached data without a second network call", async () => {
    let fetchCount = 0;
    globalThis.fetch = mock(() => {
      fetchCount += 1;
      return Promise.resolve(
        new Response(JSON.stringify(SAMPLE), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    }) as typeof fetch;

    await fetchAdSlotClient("homepage-mid");
    await fetchAdSlotClient("homepage-mid");

    expect(fetchCount).toBe(1);
    expect(peekAdSlotClient("homepage-mid")).toEqual(SAMPLE);
  });

  test("invalidateAdSlotClientCache clears one slot", async () => {
    let fetchCount = 0;
    globalThis.fetch = mock(() => {
      fetchCount += 1;
      return Promise.resolve(
        new Response(JSON.stringify(SAMPLE), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    }) as typeof fetch;

    await fetchAdSlotClient("homepage-mid");
    invalidateAdSlotClientCache("homepage-mid");
    await fetchAdSlotClient("homepage-mid");

    expect(fetchCount).toBe(2);
  });
});
