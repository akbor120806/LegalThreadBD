import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/session';

export async function DELETE(req, { params }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await query('DELETE FROM legal_documents WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
