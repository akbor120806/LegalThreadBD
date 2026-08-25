import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth'; // প্রজেক্টের নিজস্ব জেনারেটর ফাংশন

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const conn = db();
    
    const [admins] = await conn.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    if (admins.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const admin = admins[0];

    // প্লেইন টেক্সট পাসওয়ার্ড চেক
    if (password !== 'admin123') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // মিডলওয়্যারের সাথে মিলিয়ে টোকেন তৈরি (যেখানে role হবে 'admin')
    const token = await signToken({ 
      id: admin.id, 
      username: admin.username, 
      role: 'admin' 
    });

    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });
    
    // মিডলওয়্যার যে কুকিটি (`lt_admin_session`) খোঁজে, সেটি সেট করা হলো
    response.cookies.set('lt_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // ১ সপ্তাহ
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}