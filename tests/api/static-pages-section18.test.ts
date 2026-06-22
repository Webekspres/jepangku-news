import { beforeAll, describe, expect, it } from "bun:test";
import { INFO_PAGE_SLUGS } from "@/lib/info-pages";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

type InfoPagePayload = {
  slug: string;
  title: string;
  subtitle: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
};

describe("API — §18 Halaman statis & navigasi", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  describe("18.1–18.9 — info pages CMS content", () => {
    for (const slug of INFO_PAGE_SLUGS) {
      it(`GET /api/pages/${slug} returns published CMS content`, async () => {
        if (skipUnless(ctx, "server")) return;
        const res = await clientFor(ctx).get(`/api/pages/${slug}`);
        expect(res.status).toBe(200);
        const page = (await res.json()) as InfoPagePayload;
        expect(page.slug).toBe(slug);
        expect(page.title.trim().length).toBeGreaterThan(0);
        expect(page.content.trim().length).toBeGreaterThan(0);
        expect(typeof page.updatedAt).toBe("string");
      });
    }
  });

  describe("18.2 — contact form/link", () => {
    it("contact page content includes mailto contact links", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/pages/contact");
      expect(res.status).toBe(200);
      const page = (await res.json()) as InfoPagePayload;
      expect(page.content).toMatch(/mailto:/i);
    });
  });

  describe("18.12 — dynamic content API", () => {
    it("returns 404 for unknown slug", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/pages/not-a-real-page");
      expect(res.status).toBe(404);
    });

    it("about API content matches published page shape", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/pages/about");
      expect(res.status).toBe(200);
      const page = (await res.json()) as InfoPagePayload;
      expect(page.slug).toBe("about");
      expect(page.content).toMatch(/<p>/i);
      expect(page.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
