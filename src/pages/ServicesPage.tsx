import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { DEFAULT_SERVICES } from '../data/defaultCatalog';
import { fetchPublishedServices } from '../services/api';
import type { ServiceItem } from '../types';

export function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchPublishedServices().then(setServices);
  }, []);

  const filtered = services.filter((s) => {
    const matchCat = category === 'All' || s.category === category;
    const matchQuery =
      !query.trim() ||
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.short_description.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <>
      <SeoHead
        title="Services | Amplix Ecom"
        description="Explore all 15 Shopify, WordPress, Web Development, Speed Optimization, and Growth services."
      />
      <section className="section">
        <div className="container">
          <span className="section-eyebrow">15 SPECIALIZED SERVICES</span>
          <h1 className="section-title">E-Commerce &amp; Web Engineering Services</h1>
          <p className="section-subtitle" style={{ marginBottom: 28 }}>
            Choose a dedicated service or combine multiple capabilities into a custom growth package.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['All', 'Shopify', 'Performance', 'Web', 'Growth'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-outline'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', minWidth: 260 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)' }} />
              <input
                type="search"
                className="input"
                placeholder="Search services..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>

          <div className="grid-3">
            {filtered.map((svc) => (
              <Link key={svc.slug} to={`/services/${svc.slug}`} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
                <div>
                  <span className="badge badge-blue" style={{ marginBottom: 12 }}>{svc.category}</span>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: 8 }}>{svc.title}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{svc.short_description}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Starting at ${svc.starting_price}</span>
                  <span style={{ color: 'var(--blue-electric)', fontWeight: 600 }}>View Details &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
