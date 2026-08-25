import Link from 'next/link';
import { db } from '@/lib/db';
import LawyerCard from '@/components/LawyerCard';
import CallBackForm from '@/components/CallBackForm';
import T from '@/components/T';
import HeroSearchBar from '@/components/HeroSearchBar';
import AiAssistant from '@/components/AiAssistant';

async function getData() {
  const conn = db();
  const [lawyers] = await conn.query(
    `SELECT l.*, c.slug AS category_slug FROM lawyers l
     LEFT JOIN legal_categories c ON c.name = l.expertise
     ORDER BY l.id DESC LIMIT 4`
  );
  const [categories] = await conn.query('SELECT * FROM legal_categories ORDER BY id');
  return { lawyers, categories };
}

export default async function HomePage() {
  const { lawyers, categories } = await getData();

  return (
    <>
      <section className="hero">
        <div className="container">
          <T k="hero_title" as="h1" />
          <T k="hero_subtitle" as="p" />
          <HeroSearchBar />
          <div className="hero-actions" style={{ marginTop: 26 }}>
            <Link href="/lawyers" className="btn btn-primary"><T k="hero_find_lawyer_btn" /></Link>
            <Link href="/legal-awareness" className="btn btn-outline"><T k="hero_explore_btn" /></Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <T k="services_title" as="h2" className="section-title" />
          <T k="services_subtitle" as="p" className="section-subtitle" />
          <div className="grid grid-3">
            <div className="card service-card">
              <div className="icon">⚖</div>
              <T k="service_find_lawyer_title" as="h3" />
              <T k="service_find_lawyer_desc" as="p" />
              <Link href="/lawyers" className="btn btn-navy btn-sm" style={{ marginTop: 16 }}>Browse Lawyers</Link>
            </div>
            <div className="card service-card">
              <div className="icon">📄</div>
              <T k="service_documents_title" as="h3" />
              <T k="service_documents_desc" as="p" />
              <Link href="/documents" className="btn btn-navy btn-sm" style={{ marginTop: 16 }}>View Documents</Link>
            </div>
            <div className="card service-card">
              <div className="icon">📚</div>
              <T k="service_knowledge_title" as="h3" />
              <T k="service_knowledge_desc" as="p" />
              <Link href="/legal-awareness" className="btn btn-navy btn-sm" style={{ marginTop: 16 }}>Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--card)' }}>
        <div className="container">
          <T k="find_lawyer_title" as="h2" className="section-title" />
          <T k="find_lawyer_subtitle" as="p" className="section-subtitle" />

          <div className="category-tabs">
            <Link href="/lawyers" className="active"><T k="category_all" /></Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/lawyers?category=${c.slug}`}>{c.name}</Link>
            ))}
          </div>

          <div className="grid grid-4">
            {lawyers.map((l) => (
              <LawyerCard key={l.id} lawyer={l} />
            ))}
          </div>
        </div>
      </section>

      <section className="section callback-band">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div>
              <T k="callback_title" as="h2" style={{ fontSize: 28, marginBottom: 10 }} />
              <T k="callback_subtitle" as="p" style={{ color: '#c9d0e6', maxWidth: 420 }} />
            </div>
            <CallBackForm />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="quote-block">
            <p>
              "The Companies Act 1994 provides the legal foundation for company
              formation, corporate governance, and regulatory compliance in
              Bangladesh — protecting the interests of shareholders and stakeholders."
            </p>
            <span>— Legal Thread BD, Corporate Law Resource</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AiAssistant />
        </div>
      </section>
    </>
  );
}
