import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Eye, Search } from 'lucide-react';
import { ReferencePreviewModal } from '../components/ReferencePreviewModal';
import { SeoHead } from '../components/SeoHead';
import { DEFAULT_PROJECTS, DEFAULT_REFERENCES } from '../data/defaultCatalog';
import { fetchDesignReferences, fetchPublishedProjects } from '../services/api';
import type { DesignReferenceItem, ProjectItem } from '../types';

export function PortfolioPage({ defaultPlatform = 'All' }: { defaultPlatform?: 'All' | 'Shopify' | 'WordPress' }) {
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [references, setReferences] = useState<DesignReferenceItem[]>(DEFAULT_REFERENCES);
  const [platform, setPlatform] = useState<'All' | 'Shopify' | 'WordPress'>(defaultPlatform);
  const [industry, setIndustry] = useState('All');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [previewRef, setPreviewRef] = useState<DesignReferenceItem | null>(null);

  useEffect(() => {
    setPlatform(defaultPlatform);
  }, [defaultPlatform]);

  useEffect(() => {
    fetchPublishedProjects().then(setProjects);
    fetchDesignReferences().then(setReferences);
  }, []);

  const industries = ['All', ...Array.from(new Set(references.map((r) => r.industry)))];

  const filteredRefs = references.filter((r) => {
    const matchPlat = platform === 'All' || r.platform === platform;
    const matchInd = industry === 'All' || r.industry === industry;
    const matchFeat = !featuredOnly || r.is_featured;
    const matchSearch =
      !query.trim() ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.industry.toLowerCase().includes(query.toLowerCase()) ||
      r.design_inspiration.toLowerCase().includes(query.toLowerCase());
    return matchPlat && matchInd && matchFeat && matchSearch;
  });

  const filteredWork = projects.filter((p) => {
    const matchPlat =
      platform === 'All' ||
      (platform === 'Shopify' && p.category === 'Shopify') ||
      (platform === 'WordPress' && p.category === 'Web');
    const matchFeat = !featuredOnly || p.is_featured;
    const matchSearch = !query.trim() || p.title.toLowerCase().includes(query.toLowerCase());
    return matchPlat && matchFeat && matchSearch;
  });

  return (
    <>
      <SeoHead
        title={`${platform === 'All' ? 'Portfolio' : `${platform} Portfolio`} | Amplix Ecom`}
        description="Exceptional Digital Experiences. Inspired by Great Brands. Explore Amplix Ecom work and curated Shopify & WordPress inspirations."
      />
      <section className="section">
        <div className="container">
          <span className="section-eyebrow">PORTFOLIO &amp; INSPIRATIONS</span>
          <h1 className="section-title">Exceptional Digital Experiences. Inspired by Great Brands.</h1>
          <p className="section-subtitle" style={{ marginBottom: 28 }}>
            We clearly separate genuine Amplix Ecom showcases from curated third-party brand inspirations.
          </p>

          {/* Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 38 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {(['All', 'Shopify', 'WordPress'] as const).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setPlatform(plat)}
                  className={`btn btn-sm ${platform === plat ? 'btn-primary' : 'btn-outline'}`}
                >
                  {plat === 'All' ? 'All Projects' : plat}
                </button>
              ))}

              <select className="select" value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ width: 200 }}>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind === 'All' ? 'All Industries' : ind}</option>
                ))}
              </select>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
                Featured Only
              </label>
            </div>

            <div style={{ position: 'relative', minWidth: 250 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--color-text-secondary)' }} />
              <input
                type="search"
                className="input"
                placeholder="Search brand or industry..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>

          {/* COLLECTION A: OUR WORK */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <h2 style={{ fontSize: '1.7rem' }}>A. Our Work</h2>
              <span className="badge badge-gold">Verified / Demo Showcases</span>
            </div>
            {filteredWork.length === 0 ? (
              <div className="card"><p style={{ color: 'var(--color-text-secondary)' }}>No verified agency projects match this filter.</p></div>
            ) : (
              <div className="grid-3">
                {filteredWork.map((proj) => (
                  <Link key={proj.slug} to={`/portfolio/${proj.slug}`} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ position: 'relative', height: 200 }}>
                      <img src={proj.cover_image || 'images/project-shopify.jpg'} alt={proj.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span className="badge badge-gold" style={{ position: 'absolute', top: 12, left: 12 }}>
                        {proj.is_demo ? 'Demo Showcase' : 'Amplix Ecom'}
                      </span>
                    </div>
                    <div style={{ padding: 22 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: 600 }}>{proj.category}</span>
                      <h3 style={{ fontSize: '1.22rem', margin: '6px 0 8px' }}>{proj.title}</h3>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>{proj.short_description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* COLLECTION B: DESIGN INSPIRATIONS */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <h2 style={{ fontSize: '1.7rem' }}>B. Design Inspirations</h2>
              <span className="badge badge-amber">Reference Brands — Not Built by Amplix Ecom</span>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', marginBottom: 22 }}>
              Curated Shopify and WordPress industry benchmarks studied for UX, layout hierarchy, and conversion patterns.
            </p>

            <div className="grid-3">
              {filteredRefs.map((ref) => (
                <article key={ref.slug} className="card card-hover" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ position: 'relative', height: 190 }}>
                      <img src={ref.preview_image || 'images/project-shopify.jpg'} alt={`${ref.name} preview`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span className="badge badge-gold" style={{ position: 'absolute', top: 12, left: 12 }}>
                        {ref.platform} &bull; {ref.industry}
                      </span>
                    </div>
                    <div style={{ padding: 22 }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-gold)', marginBottom: 6 }}>
                        Design Inspiration
                      </div>
                      <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>{ref.name}</h3>
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginBottom: 14 }}>
                        {ref.design_inspiration}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {ref.feature_highlights.slice(0, 3).map((fh) => (
                          <span key={fh} className="badge">{fh}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '0 22px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setPreviewRef(ref)}>
                        <Eye size={14} /> Preview
                      </button>
                      <a href={ref.reference_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                        Live Site <ExternalLink size={14} />
                      </a>
                    </div>
                    <Link to={`/portfolio/reference/${ref.slug}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      View UX Analysis &amp; Build Similar &rarr;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ReferencePreviewModal reference={previewRef} onClose={() => setPreviewRef(null)} />
    </>
  );
}
