import { db } from '@/lib/db';

export async function GET(_req, { params }) {
  const { id } = await params;
  const [rows] = await db().query(
    `SELECT l.*, c.name AS category_name FROM lawyers l
     LEFT JOIN legal_categories c ON c.id = l.category_id WHERE l.id = ?`,
    [id]
  );

  if (!rows.length) {
    return Response.json({ ok: false, message: 'Lawyer not found.' }, { status: 404 });
  }

  return Response.json({ ok: true, lawyer: rows[0] });
}
