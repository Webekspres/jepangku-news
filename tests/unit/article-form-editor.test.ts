/**
 * Unit tests untuk ArticleFormEditor helpers & logika yang bisa diuji tanpa DOM.
 *
 * Scope:
 *  - normaliseTags (via re-export dari lib yang sama)
 *  - buildDraftPayload (logic yang diekstrak)
 *  - integrasi artikel-workflow yang dipakai komponen
 *  - guard canEditOnUserPortal yang dipakai edit-article/page
 */

import { describe, expect, it } from "bun:test";
import {
  canEditOnUserPortal,
  isAdminAuthor,
  submitSuccessMessage,
  userPortalCreateSubtitle,
  userPortalEditSubtitle,
  getUserPortalSubmitStatuses,
  resolveUserPortalSubmitStatus,
} from "@/lib/article-workflow";
import { newDraftClientId, type ArticleFormSnapshot } from "@/hooks/useAutosave";
import {
  buildDraftPayload,
  normaliseTags,
  sanitizeArticleSnapshot,
  validateArticleImageFile,
  ARTICLE_IMAGE_MAX_BYTES,
} from "@/lib/article-form-helpers";

// ===========================================================================
// Test suite
// ===========================================================================

describe("normaliseTags", () => {
  it("returns empty string for null/undefined", () => {
    expect(normaliseTags(null)).toBe("");
    expect(normaliseTags(undefined)).toBe("");
  });

  it("passes through a plain string unchanged", () => {
    expect(normaliseTags("anime, manga, tokyo")).toBe("anime, manga, tokyo");
  });

  it("joins a string array with ', '", () => {
    expect(normaliseTags(["anime", "manga", "tokyo"])).toBe(
      "anime, manga, tokyo",
    );
  });

  it("extracts .name from object array", () => {
    const tags = [{ name: "anime" }, { name: "manga" }, { name: "tokyo" }];
    expect(normaliseTags(tags)).toBe("anime, manga, tokyo");
  });

  it("skips entries without a name property", () => {
    const tags = [{ name: "anime" }, { other: "x" }, { name: "tokyo" }];
    expect(normaliseTags(tags as { name?: string }[])).toBe("anime, tokyo");
  });

  it("handles mixed string and object arrays", () => {
    // Campuran tipe (meski jarang, API bisa mengembalikan ini)
    const tags = ["anime", { name: "manga" }] as (
      | string
      | { name?: string }
    )[];
    expect(normaliseTags(tags)).toBe("anime, manga");
  });

  it("handles empty array", () => {
    expect(normaliseTags([])).toBe("");
  });
});

// ---------------------------------------------------------------------------

describe("buildDraftPayload", () => {
  const snapshot: ArticleFormSnapshot = {
    title: "Judul Test",
    excerpt: "Ringkasan",
    content: "<p>Konten</p>",
    coverImageUrl: "https://example.com/img.jpg",
    categoryId: "cat-123",
    tags: "anime, manga, tokyo",
  };

  it("includes the clientId as id", () => {
    const payload = buildDraftPayload("client-abc", snapshot, "DRAFT");
    expect(payload.id).toBe("client-abc");
  });

  it("splits tags into an array", () => {
    const payload = buildDraftPayload("x", snapshot, "DRAFT");
    expect(payload.tags).toEqual(["anime", "manga", "tokyo"]);
  });

  it("trims whitespace from tags", () => {
    const payload = buildDraftPayload(
      "x",
      { ...snapshot, tags: "  anime  ,  manga  " },
      "DRAFT",
    );
    expect(payload.tags).toEqual(["anime", "manga"]);
  });

  it("filters empty tag strings", () => {
    const payload = buildDraftPayload(
      "x",
      { ...snapshot, tags: "anime,,manga," },
      "DRAFT",
    );
    expect(payload.tags).toEqual(["anime", "manga"]);
  });

  it("converts empty coverImageUrl to null", () => {
    const payload = buildDraftPayload(
      "x",
      { ...snapshot, coverImageUrl: "" },
      "DRAFT",
    );
    expect(payload.coverImageUrl).toBeNull();
  });

  it("converts empty categoryId to null", () => {
    const payload = buildDraftPayload(
      "x",
      { ...snapshot, categoryId: "" },
      "DRAFT",
    );
    expect(payload.categoryId).toBeNull();
  });

  it("passes the status through", () => {
    expect(buildDraftPayload("x", snapshot, "PENDING_REVIEW").status).toBe(
      "PENDING_REVIEW",
    );
    expect(buildDraftPayload("x", snapshot, "PUBLISHED").status).toBe(
      "PUBLISHED",
    );
  });

  it("handles tags-only-whitespace gracefully", () => {
    const payload = buildDraftPayload(
      "x",
      { ...snapshot, tags: "   ,   ,   " },
      "DRAFT",
    );
    expect(payload.tags).toEqual([]);
  });
});

// ---------------------------------------------------------------------------

describe("sanitizeArticleSnapshot", () => {
  it("strips blob: cover URLs", () => {
    const result = sanitizeArticleSnapshot({
      title: "T",
      excerpt: "",
      content: "C",
      coverImageUrl: "blob:http://localhost/abc",
      categoryId: "",
      tags: "",
    });
    expect(result.coverImageUrl).toBe("");
  });

  it("keeps real URLs unchanged", () => {
    const url = "https://cdn.example.com/cover.jpg";
    const result = sanitizeArticleSnapshot({
      title: "T",
      excerpt: "",
      content: "C",
      coverImageUrl: url,
      categoryId: "",
      tags: "",
    });
    expect(result.coverImageUrl).toBe(url);
  });
});

describe("validateArticleImageFile", () => {
  it("rejects files over 5 MB", () => {
    const file = new File(
      [new ArrayBuffer(ARTICLE_IMAGE_MAX_BYTES + 1)],
      "big.jpg",
      { type: "image/jpeg" },
    );
    expect(validateArticleImageFile(file)).toMatch(/melebihi batas/i);
  });

  it("rejects unsupported formats", () => {
    const file = new File([new ArrayBuffer(100)], "doc.pdf", {
      type: "application/pdf",
    });
    expect(validateArticleImageFile(file)).toMatch(/Format harus/i);
  });

  it("accepts valid JPEG under limit", () => {
    const file = new File([new ArrayBuffer(1024)], "ok.jpg", {
      type: "image/jpeg",
    });
    expect(validateArticleImageFile(file)).toBeNull();
  });
});

// ---------------------------------------------------------------------------

describe("ArticleFormEditor — canEditOnUserPortal guard (edit mode)", () => {
  it("allows editing DRAFT articles", () => {
    expect(canEditOnUserPortal("DRAFT")).toBe(true);
  });

  it("allows editing REJECTED articles (resubmission flow)", () => {
    expect(canEditOnUserPortal("REJECTED")).toBe(true);
  });

  it("blocks editing PUBLISHED articles via user portal", () => {
    expect(canEditOnUserPortal("PUBLISHED")).toBe(false);
  });

  it("blocks editing PENDING_REVIEW articles", () => {
    expect(canEditOnUserPortal("PENDING_REVIEW")).toBe(false);
  });

  it("blocks editing ARCHIVED articles", () => {
    expect(canEditOnUserPortal("ARCHIVED")).toBe(false);
  });
});

// ---------------------------------------------------------------------------

describe("ArticleFormEditor — submit status routing", () => {
  it("contributor submit → PENDING_REVIEW", () => {
    const statuses = getUserPortalSubmitStatuses(false);
    expect(statuses).toContain("PENDING_REVIEW");
    expect(statuses).not.toContain("PUBLISHED");
  });

  it("admin submit → PUBLISHED allowed", () => {
    const statuses = getUserPortalSubmitStatuses(true);
    expect(statuses).toContain("PUBLISHED");
    expect(statuses).not.toContain("PENDING_REVIEW");
  });

  it("resolveUserPortalSubmitStatus blocks contributor from publishing", () => {
    expect(resolveUserPortalSubmitStatus("PUBLISHED", false)).toBe("DRAFT");
  });

  it("resolveUserPortalSubmitStatus allows admin to publish", () => {
    expect(resolveUserPortalSubmitStatus("PUBLISHED", true)).toBe("PUBLISHED");
  });

  it("both roles can always save as DRAFT", () => {
    expect(resolveUserPortalSubmitStatus("DRAFT", false)).toBe("DRAFT");
    expect(resolveUserPortalSubmitStatus("DRAFT", true)).toBe("DRAFT");
  });
});

// ---------------------------------------------------------------------------

describe("ArticleFormEditor — success messages", () => {
  it("draft saved message is same for both roles", () => {
    expect(submitSuccessMessage("DRAFT", false)).toBe(
      "Draft berhasil disimpan",
    );
    expect(submitSuccessMessage("DRAFT", true)).toBe("Draft berhasil disimpan");
  });

  it("publish message for admin", () => {
    expect(submitSuccessMessage("PUBLISHED", true)).toBe(
      "Artikel berhasil dipublikasikan",
    );
  });

  it("pending review message for contributor", () => {
    expect(submitSuccessMessage("PENDING_REVIEW", false)).toBe(
      "Artikel berhasil dikirim untuk direview",
    );
  });
});

// ---------------------------------------------------------------------------

describe("ArticleFormEditor — header copy", () => {
  it("create mode: admin sees 'langsung dipublikasikan'", () => {
    expect(userPortalCreateSubtitle(true)).toContain("langsung dipublikasikan");
  });

  it("create mode: contributor sees 'direview admin'", () => {
    expect(userPortalCreateSubtitle(false)).toContain("direview admin");
  });

  it("edit mode: admin sees 'Publikasikan langsung'", () => {
    expect(userPortalEditSubtitle(true)).toContain("Publikasikan langsung");
  });

  it("edit mode: contributor sees 'direview ulang'", () => {
    expect(userPortalEditSubtitle(false)).toContain("direview ulang");
  });
});

// ---------------------------------------------------------------------------

describe("ArticleFormEditor — isAdminAuthor (button branching)", () => {
  it("returns true only for ADMIN role", () => {
    expect(isAdminAuthor({ role: "ADMIN" })).toBe(true);
  });

  it("returns false for CONTRIBUTOR and USER", () => {
    expect(isAdminAuthor({ role: "CONTRIBUTOR" })).toBe(false);
    expect(isAdminAuthor({ role: "USER" })).toBe(false);
  });

  it("returns false for null/undefined", () => {
    expect(isAdminAuthor(null)).toBe(false);
    expect(isAdminAuthor(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------

describe("ArticleFormEditor — clientId generation (create mode)", () => {
  it("generates a valid UUID v4", () => {
    const id = newDraftClientId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("every invocation produces a unique id", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1_000; i++) ids.add(newDraftClientId());
    expect(ids.size).toBe(1_000);
  });
});
