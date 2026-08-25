import { db } from '@/lib/db';
import { getUserSession } from '@/lib/session';

async function requireLawyer() {
  const session = await getUserSession();
  if (!session || session.role !== 'lawyer') return null;
  return session;
}

export async function GET() {
  const session = await requireLawyer();
  if (!session) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const [rows] = await db().query(
    `SELECT l.*, c.name AS category_name FROM lawyers l
     LEFT JOIN legal_categories c ON c.id = l.category_id WHERE l.user_id = ?`,
    [session.id]
  );

  if (!rows.length) {
    return Response.json({ ok: false, message: 'Lawyer profile not found.' }, { status: 404 });
  }

  return Response.json({ ok: true, lawyer: rows[0] });
}

export async function PUT(req) {
  const session = await requireLawyer();
  if (!session) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const b = await req.json();

  const [result] = await db().execute(
    `UPDATE lawyers SET expertise=?, category_id=?, experience_years=?, address=?, district=?,
       consultation_fee=?, bar_council_id=?, bio=? WHERE user_id=?`,
    [
      b.expertise,
      b.category_id || null,
      b.experience_years || 0,
      b.address || null,
      b.district || null,
      b.consultation_fee || 0,
      b.bar_council_id || null,
      b.bio || null,
      session.id,
    ]
  );

  if (!result.affectedRows) {
    return Response.json({ ok: false, message: 'Lawyer profile not found.' }, { status: 404 });
  }

  return Response.json({ ok: true, message: 'Profile updated.' });
}
