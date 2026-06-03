import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { createAdminSlug } from '@/lib/slug';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  const { name, description, iconUrl, color, isActive, sortOrder } = await request.json();

  const category = await db.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });

  // Cek duplikat nama/slug jika nama diubah
  if (name && name.trim() !== category.name) {
    const slug = createAdminSlug(name.trim());
    const existing = await db.category.findFirst({
      where: { OR: [{ slug }, { name: name.trim() }], NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Kategori dengan nama tersebut sudah ada' }, { status: 400 });
    }
  }

  const slug = name ? createAdminSlug(name.trim()) : category.slug;

  const updated = await db.category.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim(), slug }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(iconUrl !== undefined && { iconUrl: iconUrl?.trim() || null }),
      ...(color !== undefined && { color: color?.trim() || null }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  // Guard: cek artikel yang masih terhubung
  const articleCount = await db.article.count({ where: { categoryId: id } });
  if (articleCount > 0) {
    return NextResponse.json(
      { error: `Tidak dapat menghapus: kategori digunakan oleh ${articleCount} artikel. Pindahkan artikel terlebih dahulu atau nonaktifkan kategori.` },
      { status: 400 },
    );
  }

  await db.category.delete({ where: { id } });
  return NextResponse.json({ message: 'Kategori berhasil dihapus' });
}
