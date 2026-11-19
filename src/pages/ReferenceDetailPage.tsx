import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Eye } from 'lucide-react';
import { ReferencePreviewModal } from '../components/ReferencePreviewModal';
import { SeoHead } from '../components/SeoHead';
import { DEFAULT_REFERENCES } from '../data/defaultCatalog';
import { fetchDesignReferences } from '../services/api';
import type { DesignReferenceItem } from '../types';

export function ReferenceDetailPage() {
  const { slug } = useParams();
  const [refs, setRefs] = useState<DesignReferenceItem[]>(DEFAULT_REFERENCES);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchDesignReferences().then(setRefs);
  }, []);

  const refItem = refs.find((r) => r.slug === slug);

  if (!refItem) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="section-title">Reference Not Found</h1>
          <Link to="/portfolio" className="btn btn-primary">Back to Portfolio</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <SeoHead
        title={`${refItem.name} (${refItem.platform} Inspiration) | Amplix Ecom`}
        description={refItem.design_inspiration}
      />
      <section className="section">
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            <Link to="/">Home</Link> / <Link to="/portfolio">Portfolio</Link> / <span style={{ color: 'var(--color-text-primary)' }}>{refItem.name}</span>
          </nav>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <span className="badge badge-amber">Design Inspiration — Reference Brand</span>
            <span className="badge badge-gold">{refItem.platform}</span>
            <span className="badge">{refItem.industry}</span>
          </div>

          <h1 className="section-title">{refItem.name}</h1>
          <p className="section-subtitle" style={{ marginBottom: 24 }}>{refItem.design_inspiration}</p>

          {refItem.inspection_note && (
            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: 24, fontStyle: 'italic' }}>
              Inspection Note: {refItem.inspection_note}
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 34 }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowPreview(true)}>
              <Eye size={16} /> Preview Website
            </button>
            <a href={refItem.reference_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Visit Live Website <ExternalLink size={16} />
            </a>
            <Link
              to={`/quote?service=${refItem.platform === 'Shopify' ? 'shopify-store-development' : 'wordpress-development'}`}
              className="btn btn-primary"
            >
              Build a Similar {refItem.platform === 'Shopify' ? 'Store' : 'Website'}
            </Link>
          </div>

          <div className="card" style={{ padding: 14, marginBottom: 32 }}>
            <img
              src={refItem.preview_image || 'images/project-shopify.jpg'}
              alt={`${refItem.name} showcase`}
              style={{ width: '100%', maxHeight: 460, objectFit: 'cover', borderRadius: 10 }}
            />
          </div>

          <div className="grid-2">
            <div className="card">
              <h2 style={{ fontSize: '1.35rem', marginBottom: 16 }}>Key UX Observations</h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {refItem.ux_observations.map((u) => (
                  <li key={u} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={16} color="var(--color-gold)" /> {u}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h2 style={{ fontSize: '1.35rem', marginBottom: 16 }}>Feature Highlights</h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {refItem.feature_highlights.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={16} color="var(--color-gold)" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ReferencePreviewModal reference={showPreview ? refItem : null} onClose={() => setShowPreview(false)} />
    </>
  );
}
