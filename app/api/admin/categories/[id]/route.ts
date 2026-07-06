import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditAdminEntity } from '@/lib/audit-routes';
import { createAdminSlug } from '@/lib/slug';
import { MAX_NAVBAR_CATEGORIES } from '@/lib/categories/constants';
import { countNavbarCategories } from '@/lib/categories/navbar';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;
  const { name, description, isActive, sortOrder, showInNavbar } = await request.json();

  const category = await db.category.findUnique({ where: { id } });
  if (!category) return apiError('Kategori tidak ditemukan' , { status: 404 });

  if (showInNavbar === true && !category.showInNavbar) {
    const navbarCount = await countNavbarCategories(id);
    if (navbarCount >= MAX_NAVBAR_CATEGORIES) {
      return apiSuccess(
        { error: `Maksimal ${MAX_NAVBAR_CATEGORIES} kategori di navbar` },
        { status: 400 },
      );
    }
  }

  // Cek duplikat nama/slug jika nama diubah
  if (name && name.trim() !== category.name) {
    const slug = createAdminSlug(name.trim());
    const existing = await db.category.findFirst({
      where: { OR: [{ slug }, { name: name.trim() }], NOT: { id } },
    });
    if (existing) {
      return apiError('Kategori dengan nama tersebut sudah ada' , { status: 400 });
    }
  }

  const slug = name ? createAdminSlug(name.trim()) : category.slug;

  const updated = await db.category.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim(), slug }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(isActive !== undefined && { isActive }),
      ...(showInNavbar !== undefined && { showInNavbar: Boolean(showInNavbar) }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
    },
  });

  auditAdminEntity(admin, 'category', 'update', { type: 'category', id: updated.id, label: updated.name, href: '/admin/categories' });

  return apiSuccess(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;

  const category = await db.category.findUnique({ where: { id } });
  if (!category) return apiError('Kategori tidak ditemukan' , { status: 404 });

  // Guard: cek artikel yang masih terhubung
  const articleCount = await db.article.count({ where: { categoryId: id } });
  if (articleCount > 0) {
    return apiSuccess(
      { error: `Tidak dapat menghapus: kategori digunakan oleh ${articleCount} artikel. Pindahkan artikel terlebih dahulu atau nonaktifkan kategori.` },
      { status: 400 },
    );
  }

  auditAdminEntity(admin, 'category', 'delete', { type: 'category', id: category.id, label: category.name, href: '/admin/categories' });

  await db.category.delete({ where: { id } });
  return apiSuccess({ message: 'Kategori berhasil dihapus' });
}
