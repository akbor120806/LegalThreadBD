import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function GET(_req, { params }) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const conn = db();

  const [[lawyer]] = await conn.query(
    `SELECT l.*, c.name AS category_name FROM lawyers l
     LEFT JOIN legal_categories c ON c.id = l.category_id WHERE l.id = ?`,
    [id]
  );
  if (!lawyer) return Response.json({ ok: false, message: 'Lawyer not found.' }, { status: 404 });

  const [appointments] = await conn.query(
    `SELECT a.*, u.name AS client_name FROM appointments a
     JOIN users u ON u.id = a.user_id WHERE a.lawyer_id = ? ORDER BY a.created_at DESC`,
    [id]
  );

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    accepted: appointments.filter((a) => a.status === 'confirmed' || a.status === 'completed').length,
    rejected: appointments.filter((a) => a.status === 'cancelled' && a.cancelled_by === 'lawyer').length,
  };

  return Response.json({ ok: true, lawyer, appointments, stats });
}
