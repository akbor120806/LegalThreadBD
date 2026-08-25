import { db } from '@/lib/db';
import { getUserSession, getAdminSession } from '@/lib/session';

export async function GET() {
  // Admin: return every appointment, with client + lawyer details.
  const admin = await getAdminSession();
  if (admin) {
    const [rows] = await db().query(
      `SELECT a.*, l.name AS lawyer_name, l.expertise, l.consultation_fee,
              u.name AS client_name, u.email AS client_email, u.phone AS client_phone
       FROM appointments a
       JOIN lawyers l ON l.id = a.lawyer_id
       JOIN users u ON u.id = a.user_id
       ORDER BY a.appointment_date DESC, a.created_at DESC`
    );
    return Response.json({ ok: true, appointments: rows });
  }

  // Client: return only their own appointments.
  const session = await getUserSession();
  if (!session) return Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const [rows] = await db().query(
    `SELECT a.*, l.name AS lawyer_name, l.expertise, l.consultation_fee
     FROM appointments a JOIN lawyers l ON l.id = a.lawyer_id
     WHERE a.user_id = ? ORDER BY a.appointment_date DESC, a.created_at DESC`,
    [session.id]
  );

  return Response.json({ ok: true, appointments: rows });
}

export async function POST(req) {
  const session = await getUserSession();
  if (!session) {
    return Response.json({ ok: false, message: 'Please login to book an appointment.' }, { status: 401 });
  }

  const { lawyer_id, mode, appointment_date, appointment_time, notes } = await req.json();

  if (!lawyer_id || !appointment_date || !appointment_time) {
    return Response.json({ ok: false, message: 'Lawyer, date and time are required.' }, { status: 400 });
  }

  const [result] = await db().execute(
    `INSERT INTO appointments (user_id, lawyer_id, mode, appointment_date, appointment_time, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [session.id, lawyer_id, mode === 'offline' ? 'offline' : 'online', appointment_date, appointment_time, notes || null]
  );

  return Response.json({ ok: true, id: result.insertId, message: 'Appointment requested successfully.' });
}
