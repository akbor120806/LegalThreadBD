import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/session';

export async function PUT(req, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const { status } = await req.json();
  const allowed = ['new', 'contacted', 'closed'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }
  await query('UPDATE contact_requests SET status = ? WHERE id = ?', [status, id]);
  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await query('DELETE FROM contact_requests WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
