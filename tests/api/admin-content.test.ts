import { beforeAll, describe, expect, it } from "bun:test";
import {
  clientFor,
  setupIntegration,
  skipUnless,
  type IntegrationContext,
} from "../helpers/integration";

describe("API — §16 Admin konten & taxonomi", () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await setupIntegration();
  });

  describe("16.1 — kategori CRUD", () => {
    it("ADMIN can create, update, and delete an unused category", async () => {
      if (skipUnless(ctx, "auth")) return;
      const api = clientFor(ctx, "ADMIN");
      const name = `Test Kategori ${Date.now()}`;

      const create = await api.post("/api/admin/categories", {
        name,
        description: "integration test",
        showInNavbar: false,
      });
      expect(create.status).toBe(201);
      const created = (await api.json(create)) as { id: string; slug: string };
      expect(created.slug).toBeTruthy();

      const patch = await api.patch(`/api/admin/categories/${created.id}`, {
        description: "updated description",
      });
      expect(patch.status).toBe(200);
      const updated = (await api.json(patch)) as { description: string | null };
      expect(updated.description).toBe("updated description");

      const del = await api.delete(`/api/admin/categories/${created.id}`);
      expect(del.status).toBe(200);
    });
  });

  describe("16.2 — tag CRUD slug unik", () => {
    it("ADMIN can create and delete an unused tag", async () => {
      if (skipUnless(ctx, "auth")) return;
      const api = clientFor(ctx, "ADMIN");
      const name = `Test Tag ${Date.now()}`;

      const create = await api.post("/api/admin/tags", { name });
      expect(create.status).toBe(201);
      const created = (await api.json(create)) as { id: string; slug: string };
      expect(created.slug).toMatch(/^test-tag-/);

      const del = await api.delete(`/api/admin/tags/${created.id}`);
      expect(del.status).toBe(200);
    });

    it("rejects duplicate tag name/slug on create", async () => {
      if (skipUnless(ctx, "auth")) return;
      const api = clientFor(ctx, "ADMIN");
      const name = `Dup Tag ${Date.now()}`;

      const first = await api.post("/api/admin/tags", { name });
      expect(first.status).toBe(201);
      const created = (await api.json(first)) as { id: string };

      const duplicate = await api.post("/api/admin/tags", { name });
      expect(duplicate.status).toBe(400);

      await api.delete(`/api/admin/tags/${created.id}`);
    });
  });

  describe("16.3 — info pages CMS", () => {
    it("ADMIN can list info pages and fetch about content", async () => {
      if (skipUnless(ctx, "auth")) return;
      const api = clientFor(ctx, "ADMIN");

      const list = await api.get("/api/admin/info-pages");
      expect(list.status).toBe(200);
      const pages = (await api.json(list)) as { slug: string; title: string }[];
      expect(Array.isArray(pages)).toBe(true);
      expect(pages.some((p) => p.slug === "about")).toBe(true);

      const detail = await api.get("/api/admin/info-pages/about");
      expect(detail.status).toBe(200);
      const page = (await api.json(detail)) as { title: string; content: string };
      expect(page.title.trim().length).toBeGreaterThan(0);
      expect(page.content.trim().length).toBeGreaterThan(0);
    });
  });

  describe("16.4–16.5 — social links CMS & footer", () => {
    it("ADMIN can read social links config", async () => {
      if (skipUnless(ctx, "auth")) return;
      const res = await clientFor(ctx, "ADMIN").get("/api/admin/social-links");
      expect(res.status).toBe(200);
      const data = (await res.json()) as { links?: { id: string; href: string }[] };
      expect(Array.isArray(data.links)).toBe(true);
    });

    it("GET /api/social-links returns enabled links with valid http href", async () => {
      if (skipUnless(ctx, "server")) return;
      const res = await clientFor(ctx).get("/api/social-links");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        links: { id: string; label: string; href: string }[];
      };
      expect(Array.isArray(data.links)).toBe(true);
      for (const link of data.links) {
        expect(typeof link.id).toBe("string");
        expect(typeof link.label).toBe("string");
        expect(link.href).toMatch(/^https?:\/\//);
      }
    });
  });
});
