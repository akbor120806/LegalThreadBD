import { db } from '@/lib/db';
import { getUserSession } from '@/lib/session';

// action: 'accept' | 'reject' | 'reschedule'
export async function PUT(req, { params }) {
  const session = await getUserSession();
  if (!session || session.role !== 'lawyer') {
    return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const conn = db();

  const [[lawyerRow]] = await conn.query('SELECT id FROM lawyers WHERE user_id = ?', [session.id]);
  if (!lawyerRow) return Response.json({ ok: false, message: 'Lawyer profile not found.' }, { status: 404 });

  const [[appt]] = await conn.query('SELECT * FROM appointments WHERE id = ? AND lawyer_id = ?', [id, lawyerRow.id]);
  if (!appt) return Response.json({ ok: false, message: 'Appointment not found.' }, { status: 404 });

  const { action, proposed_date, proposed_time, lawyer_note } = await req.json();

  if (action === 'accept') {
    await conn.execute("UPDATE appointments SET status = 'confirmed', cancelled_by = NULL WHERE id = ?", [id]);
  } else if (action === 'reject') {
    await conn.execute(
      "UPDATE appointments SET status = 'cancelled', cancelled_by = 'lawyer', lawyer_note = ? WHERE id = ?",
      [lawyer_note || null, id]
    );
  } else if (action === 'reschedule') {
    if (!proposed_date || !proposed_time) {
      return Response.json({ ok: false, message: 'Proposed date and time are required.' }, { status: 400 });
    }
    await conn.execute(
      "UPDATE appointments SET status = 'reschedule_requested', proposed_date = ?, proposed_time = ?, lawyer_note = ? WHERE id = ?",
      [proposed_date, proposed_time, lawyer_note || null, id]
    );
  } else if (action === 'complete') {
    await conn.execute("UPDATE appointments SET status = 'completed' WHERE id = ?", [id]);
  } else {
    return Response.json({ ok: false, message: 'Invalid action.' }, { status: 400 });
  }

  return Response.json({ ok: true });
}
