import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mail, MessageCircle } from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../data/defaultCatalog';

export function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const whatsappClean = DEFAULT_SITE_SETTINGS.whatsapp_number.replace(/[^0-9]/g, '');

  return (
    <>
      <footer
        style={{
          background: 'var(--color-background-secondary)',
          borderTop: '1px solid var(--color-border)',
          padding: '64px 0 32px',
        }}
      >
        <div className="container">
          <div className="grid-4" style={{ marginBottom: 44 }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: 12, letterSpacing: '0.04em' }}>
                AMPLIX <span style={{ color: 'var(--color-gold)' }}>ECOM</span>
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                {DEFAULT_SITE_SETTINGS.tagline}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem' }}>
                <a href={`mailto:${DEFAULT_SITE_SETTINGS.contact_email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)' }}>
                  <Mail size={15} color="var(--color-gold)" /> {DEFAULT_SITE_SETTINGS.contact_email}
                </a>
                <a href={`https://wa.me/${whatsappClean}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)' }}>
                  <MessageCircle size={15} color="var(--color-gold)" /> {DEFAULT_SITE_SETTINGS.whatsapp_number}
                </a>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.92rem', marginBottom: 14, color: 'var(--color-gold)' }}>Agency</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                <Link to="/about">About Us</Link>
                <Link to="/services">All 15 Services</Link>
                <Link to="/portfolio">Portfolio &amp; Inspirations</Link>
                <Link to="/portfolio/shopify">Shopify Showcase</Link>
                <Link to="/portfolio/wordpress">WordPress Showcase</Link>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.92rem', marginBottom: 14, color: 'var(--color-gold)' }}>Clients</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                <Link to="/pricing">Pricing &amp; Packages</Link>
                <Link to="/quote">Quotation Wizard</Link>
                <Link to="/track">Track Inquiry</Link>
                <Link to="/faq">FAQ</Link>
                <Link to="/contact">Contact Us</Link>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.92rem', marginBottom: 14, color: 'var(--color-gold)' }}>Legal &amp; Admin</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms &amp; Conditions</Link>
                <Link to="/admin/login">Admin Portal</Link>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: 22,
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              color: 'var(--color-text-secondary)',
              fontSize: '0.84rem',
            }}
          >
            <span>&copy; {new Date().getFullYear()} {DEFAULT_SITE_SETTINGS.footer_text}</span>
            <span style={{ color: 'var(--color-gold)' }}>Luxury Black &amp; Champagne Gold Edition</span>
          </div>
        </div>
      </footer>

      {showTop && (
        <button
          type="button"
          className="back-to-top"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp size={18} />
        </button>
      )}

      <a
        className="whatsapp-float"
        href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent('Hi Amplix Ecom! I would like to discuss a project.')}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle size={18} /> WhatsApp
      </a>
    </>
  );
}
