import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function PUT(req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const b = await req.json();

  await db().execute(
    `UPDATE lawyers SET name=?, expertise=?, category_id=?, experience_years=?, address=?, district=?,
       consultation_fee=?, bar_council_id=?, bio=?, is_verified=?, rating=? WHERE id=?`,
    [
      b.name,
      b.expertise,
      b.category_id || null,
      b.experience_years || 0,
      b.address || null,
      b.district || null,
      b.consultation_fee || 0,
      b.bar_council_id || null,
      b.bio || null,
      b.is_verified ? 1 : 0,
      b.rating || 4.5,
      id,
    ]
  );

  return Response.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await db().execute('DELETE FROM lawyers WHERE id = ?', [id]);
  return Response.json({ ok: true });
}
