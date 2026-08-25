'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/admin', label: '📊 Dashboard', exact: true },
  { href: '/admin/lawyers', label: '⚖ Lawyers' },
  { href: '/admin/appointments', label: '📅 Appointments' },
  { href: '/admin/documents', label: '📄 Documents' },
  { href: '/admin/users', label: '👥 Users' },
  { href: '/admin/messages', label: '✉ Messages' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="sidebar">
      <div className="brand">Legal Thread<span> BD</span></div>
      <nav>
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={active ? 'active' : ''}>
              {l.label}
            </Link>
          );
        })}
        <a onClick={handleLogout} style={{ cursor: 'pointer' }}>🚪 Logout</a>
      </nav>
    </aside>
  );
}
