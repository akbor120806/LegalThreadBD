import { getUserSession } from '@/lib/session';

export async function GET() {
  const session = await getUserSession();
  if (!session) return Response.json({ user: null });
  return Response.json({ user: { id: session.id, name: session.name, email: session.email, role: session.role } });
}
