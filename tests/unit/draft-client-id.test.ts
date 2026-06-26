import { describe, expect, it } from "bun:test";
import { newDraftClientId } from "@/hooks/useAutosave";

/**
 * The local-first autosave relies on a stable, client-generated id so that
 * every flush (debounced save, sendBeacon on unload, and the explicit "Simpan
 * Draft" button) targets the *same* row — making draft creation idempotent and
 * impossible to duplicate, even across many concurrent users.
 */
describe("newDraftClientId", () => {
  it("returns a non-empty string", () => {
    const id = newDraftClientId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("produces a valid uuid when crypto.randomUUID is available", () => {
    const id = newDraftClientId();
    // RFC 4122 v4 shape: 8-4-4-4-12 hex groups.
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("is unique across many invocations (no collisions for concurrent users)", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 10_000; i++) ids.add(newDraftClientId());
    expect(ids.size).toBe(10_000);
  });

  it("still returns a usable id if crypto.randomUUID is unavailable", () => {
    const original = globalThis.crypto;
    try {
      // Simulate an older/embedded runtime without randomUUID.
      Object.defineProperty(globalThis, "crypto", {
        value: { ...original, randomUUID: undefined },
        configurable: true,
      });
      const id = newDraftClientId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    } finally {
      Object.defineProperty(globalThis, "crypto", {
        value: original,
        configurable: true,
      });
    }
  });
});
