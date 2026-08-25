import { db } from '@/lib/db';
import LawyerCard from '@/components/LawyerCard';
import Link from 'next/link';

async function getLawyers(q, category) {
  const conn = db();
  let sql = `SELECT l.*, c.slug AS category_slug FROM lawyers l
             LEFT JOIN legal_categories c ON c.id = l.category_id WHERE 1=1`;
  const args = [];
  if (q) {
    sql += ' AND (l.name LIKE ? OR l.expertise LIKE ? OR l.district LIKE ?)';
    args.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category) {
    sql += ' AND c.slug = ?';
    args.push(category);
  }
  sql += ' ORDER BY l.rating DESC';
  const [rows] = await conn.query(sql, args);
  return rows;
}

export default async function LawyersPage({ searchParams }) {
  const sp = await searchParams;
  const q = sp?.q || '';
  const category = sp?.category || '';

  const [lawyers, categories] = await Promise.all([
    getLawyers(q, category),
    db().query('SELECT * FROM legal_categories ORDER BY id').then((r) => r[0]),
  ]);

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">Find a Lawyer</h2>
        <p className="section-subtitle">Connect with trusted and experienced lawyers across Bangladesh.</p>

        <form className="search-bar" style={{ maxWidth: 640, margin: '0 auto 26px', boxShadow: 'var(--shadow)' }}>
          {category && <input type="hidden" name="category" value={category} />}
          <input name="q" defaultValue={q} placeholder="Search by name, expertise or district..." />
          <button type="submit">Search</button>
        </form>

        <div className="category-tabs">
          <Link href="/lawyers" className={!category ? 'active' : ''}>All</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/lawyers?category=${c.slug}`} className={category === c.slug ? 'active' : ''}>
              {c.name}
            </Link>
          ))}
        </div>

        {lawyers.length ? (
          <div className="grid grid-4">
            {lawyers.map((l) => (
              <LawyerCard key={l.id} lawyer={l} />
            ))}
          </div>
        ) : (
          <div className="empty-state">No lawyers found. Try a different search or category.</div>
        )}
      </div>
    </div>
  );
}
