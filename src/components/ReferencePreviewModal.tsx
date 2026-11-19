import { ExternalLink, ShieldAlert, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DesignReferenceItem } from '../types';

export function ReferencePreviewModal({
  reference,
  onClose,
}: {
  reference: DesignReferenceItem | null;
  onClose: () => void;
}) {
  if (!reference) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Preview ${reference.name}`}>
      <div className="modal-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: 6 }}>
              Design Inspiration &bull; {reference.platform} &bull; {reference.industry}
            </span>
            <h2 style={{ fontSize: '1.65rem' }}>{reference.name}</h2>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} aria-label="Close Preview">
            <X size={18} />
          </button>
        </div>

        {/* Browser Frame Preview */}
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            overflow: 'hidden',
            background: 'var(--color-background)',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span>{reference.reference_url}</span>
            <span className="badge">{reference.iframe_allowed ? 'Live Embed' : 'Original Visual Preview'}</span>
          </div>

          {reference.iframe_allowed ? (
            <iframe
              src={reference.reference_url}
              title={reference.name}
              style={{ width: '100%', height: 420, border: 'none' }}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div style={{ position: 'relative' }}>
              <img
                src={reference.preview_image || 'images/project-shopify.jpg'}
                alt={`${reference.name} design inspiration preview`}
                style={{ width: '100%', maxHeight: 380, objectFit: 'cover' }}
              />
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(11,11,11,0.88)',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.82rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <ShieldAlert size={15} color="var(--color-gold)" />
                <span>
                  External live embedding is restricted by site security headers. Showing original agency preview artwork.
                </span>
              </div>
            </div>
          )}
        </div>

        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
          {reference.design_inspiration}
        </p>

        {reference.inspection_note && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 18, fontStyle: 'italic' }}>
            Note: {reference.inspection_note}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href={reference.reference_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            Visit Live Website <ExternalLink size={15} />
          </a>
          <Link to={`/quote?service=${reference.platform === 'Shopify' ? 'shopify-store-development' : 'wordpress-development'}`} className="btn btn-primary" onClick={onClose}>
            Build a Similar {reference.platform === 'Shopify' ? 'Store' : 'Website'}
          </Link>
        </div>
      </div>
    </div>
  );
}
