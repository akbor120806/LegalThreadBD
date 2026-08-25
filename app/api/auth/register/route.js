import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createUserSession } from '@/lib/session';

export async function POST(req) {
  const body = await req.json();
  const { name, email, phone, password, role } = body;
  const userRole = role === 'lawyer' ? 'lawyer' : 'client';

  if (!name || !email || !password || password.length < 6) {
    return Response.json(
      { ok: false, message: 'Name, email and a password of at least 6 characters are required.' },
      { status: 400 }
    );
  }

  if (userRole === 'lawyer' && (!body.expertise || !body.category_id)) {
    return Response.json(
      { ok: false, message: 'Please provide your expertise and practice area to register as a lawyer.' },
      { status: 400 }
    );
  }

  const conn = db();

  try {
    const [existing] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return Response.json({ ok: false, message: 'An account with this email already exists.' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await conn.execute(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, hash, userRole]
    );
    const userId = result.insertId;

    if (userRole === 'lawyer') {
      await conn.execute(
        `INSERT INTO lawyers
          (user_id, name, expertise, category_id, experience_years, address, district, consultation_fee, bar_council_id, bio, is_verified, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 4.5)`,
        [
          userId,
          name,
          body.expertise,
          body.category_id,
          body.experience_years || 0,
          body.address || null,
          body.district || null,
          body.consultation_fee || 0,
          body.bar_council_id || null,
          body.bio || null,
        ]
      );
    }

    const user = { id: userId, name, email, role: userRole };
    await createUserSession(user);

    return Response.json({ ok: true, message: 'Registration successful.', user });
  } catch (err) {
    return Response.json({ ok: false, message: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
