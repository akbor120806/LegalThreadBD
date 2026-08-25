import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function PUT(req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();
  const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return Response.json({ ok: false, message: 'Invalid status.' }, { status: 400 });
  }

  await db().execute('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
  return Response.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await db().execute('DELETE FROM appointments WHERE id = ?', [id]);
  return Response.json({ ok: true });
}
