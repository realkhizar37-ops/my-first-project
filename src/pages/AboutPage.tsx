import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { DEFAULT_SITE_SETTINGS } from '../data/defaultCatalog';

export function AboutPage() {
  return (
    <>
      <SeoHead
        title="About Us | Amplix Ecom"
        description="Learn about Amplix Ecom — our mission, engineering standards, and e-commerce expertise."
      />
      <section className="section">
        <div className="container">
          <span className="section-eyebrow">ABOUT AMPLIX ECOM</span>
          <h1 className="section-title">Engineering Digital Commerce That Scales</h1>
          <p className="section-subtitle" style={{ marginBottom: 40 }}>
            {DEFAULT_SITE_SETTINGS.about_text}
          </p>

          <div className="grid-2" style={{ marginBottom: 48 }}>
            <div className="card">
              <h3 style={{ marginBottom: 10 }}>Our Mission</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                To give e-commerce founders and service businesses access to clean, fast, conversion-focused
                web engineering without bloated retainers or opaque communication.
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: 10 }}>Our Technical Standards</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Every Shopify, WordPress, and custom web build follows mobile-first responsiveness,
                accessibility best practices, clean semantic markup, and Core Web Vitals discipline.
              </p>
            </div>
          </div>

          <Link to="/quote" className="btn btn-primary">Start a Project With Us &rarr;</Link>
        </div>
      </section>
    </>
  );
}
