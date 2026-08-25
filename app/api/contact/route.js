import { db } from '@/lib/db';

export async function POST(req) {
  const { name, phone, area, message } = await req.json();

  if (!name || !phone) {
    return Response.json({ ok: false, message: 'Name and phone are required.' }, { status: 400 });
  }

  await db().execute(
    'INSERT INTO contact_requests (name, phone, area, message) VALUES (?, ?, ?, ?)',
    [name, phone, area || null, message || null]
  );

  return Response.json({ ok: true, message: 'Request received.' });
}
