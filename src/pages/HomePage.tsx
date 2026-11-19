import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ReferencePreviewModal } from '../components/ReferencePreviewModal';
import { SeoHead } from '../components/SeoHead';
import {
  DEFAULT_FAQS,
  DEFAULT_PACKAGES,
  DEFAULT_PROJECTS,
  DEFAULT_REFERENCES,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_TESTIMONIALS,
} from '../data/defaultCatalog';
import {
  fetchDesignReferences,
  fetchFaqs,
  fetchPricingPackages,
  fetchPublishedProjects,
  fetchPublishedServices,
  fetchSiteSettings,
  fetchTestimonials,
} from '../services/api';
import type {
  DesignReferenceItem,
  FaqItem,
  PricingPackage,
  ProjectItem,
  ServiceItem,
  SiteSettings,
  TestimonialItem,
} from '../types';

export function HomePage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [references, setReferences] = useState<DesignReferenceItem[]>(DEFAULT_REFERENCES);
  const [packages, setPackages] = useState<PricingPackage[]>(DEFAULT_PACKAGES);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);

  const [previewRef, setPreviewRef] = useState<DesignReferenceItem | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [openFaqId, setOpenFaqId] = useState<string | null>(DEFAULT_FAQS[0]?.id ?? null);

  useEffect(() => {
    fetchSiteSettings().then(setSettings);
    fetchPublishedServices().then(setServices);
    fetchPublishedProjects().then(setProjects);
    fetchDesignReferences().then(setReferences);
    fetchPricingPackages().then(setPackages);
    fetchTestimonials().then(setTestimonials);
    fetchFaqs().then(setFaqs);
  }, []);

  const featuredServices = services.filter((s) => s.is_featured).slice(0, 6);
  const activeTestimonial = testimonials[slideIdx % Math.max(1, testimonials.length)];

  return (
    <>
      <SeoHead title={settings.seo_metadata.title} description={settings.seo_metadata.description} />

      {/* HERO SECTION */}
      <section
        style={{
          padding: '92px 0 80px',
          background:
            'radial-gradient(circle at 82% 18%, rgba(214, 189, 138, 0.11), transparent 45%), #0B0B0B',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container grid-2" style={{ alignItems: 'center', gap: 48 }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: 22 }}>
              <Sparkles size={13} /> LUXURY E-COMMERCE &amp; WEB AGENCY
            </span>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.1rem)', fontWeight: 700, marginBottom: 22 }}>
              Crafting Digital Experiences That{' '}
              <span className="gold-gradient-text">Define Brands.</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.06rem', marginBottom: 32, maxWidth: 560 }}>
              {settings.hero_subcopy}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
              <Link to="/portfolio" className="btn btn-primary">
                Explore Our Work <ArrowRight size={17} />
              </Link>
              <Link to="/quote" className="btn btn-outline">
                Start Your Project
              </Link>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, fontSize: '0.86rem', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} color="var(--color-gold)" /> Shopify &amp; WordPress Specialists
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} color="var(--color-gold)" /> Conversion-Focused UX
              </span>
            </div>
          </div>

          {/* Luxury Browser Mockup */}
          <div className="card" style={{ padding: 14, borderColor: 'var(--color-gold-dark)', boxShadow: 'var(--shadow-luxury)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#37332B' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#A88B54' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#D6BD8A' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)' }}>AMPLIX ECOM &bull; STUDIO</span>
            </div>
            <img
              src="images/hero-agency.jpg"
              alt="Amplix Ecom luxury storefront and analytics preview"
              style={{ borderRadius: 10, width: '100%', height: 'auto', border: '1px solid var(--color-border)' }}
            />
          </div>
        </div>
      </section>

      {/* 1. TRUST & CREDIBILITY */}
      <section style={{ padding: '36px 0', background: 'var(--color-background-secondary)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <p style={{ textAlign: 'center', fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            Core Platform Disciplines
          </p>
          <div className="grid-4" style={{ textAlign: 'center' }}>
            {['Shopify OS 2.0', 'WordPress Enterprise', 'Core Web Vitals', 'Custom Web Architecture'].map((slot) => (
              <div key={slot} style={{ padding: '14px 16px', borderRadius: 8, border: '1px solid var(--color-border)', color: 'var(--color-gold-light)', fontWeight: 500, fontSize: '0.88rem' }}>
                {slot}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. AGENCY INTRODUCTION */}
      <section className="section">
        <div className="container grid-2" style={{ alignItems: 'center', gap: 40 }}>
          <div>
            <span className="section-eyebrow">ABOUT AMPLIX ECOM</span>
            <h2 className="section-title">Precision Engineering Meets Editorial Luxury</h2>
          </div>
          <div>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 18 }}>{settings.about_text}</p>
            <Link to="/about" className="btn btn-outline btn-sm">Learn About Our Agency &rarr;</Link>
          </div>
        </div>
      </section>

      {/* 3. SERVICES OVERVIEW */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
            <div>
              <span className="section-eyebrow">OUR SERVICES</span>
              <h2 className="section-title">15 Specialized Capabilities</h2>
              <p className="section-subtitle">From bespoke Shopify storefronts to WordPress platforms, speed optimization, and paid growth.</p>
            </div>
            <Link to="/services" className="btn btn-outline">All 15 Services &rarr;</Link>
          </div>

          <div className="grid-3">
            {featuredServices.map((svc) => (
              <Link key={svc.slug} to={`/services/${svc.slug}`} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <span className="badge badge-gold" style={{ marginBottom: 14 }}>{svc.category}</span>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: 8 }}>{svc.title}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{svc.short_description}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--color-border)', fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>From ${svc.starting_price}</span>
                  <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Explore &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PORTFOLIO (Clearly Separated: Our Work vs Design Inspirations) */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div>
              <span className="section-eyebrow">CURATED SHOWCASE</span>
              <h2 className="section-title">Our Work &amp; Brand Inspirations</h2>
              <p className="section-subtitle">
                Our verified agency showcases alongside curated Shopify &amp; WordPress design inspirations.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/portfolio/shopify" className="btn btn-outline btn-sm">Shopify Showcase</Link>
              <Link to="/portfolio/wordpress" className="btn btn-outline btn-sm">WordPress Showcase</Link>
            </div>
          </div>

          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-gold)', marginBottom: 16 }}>A. Our Work (Verified / Demo Showcases)</h3>
          <div className="grid-3" style={{ marginBottom: 42 }}>
            {projects.slice(0, 3).map((proj) => (
              <Link key={proj.slug} to={`/portfolio/${proj.slug}`} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: 200 }}>
                  <img src={proj.cover_image || 'images/project-shopify.jpg'} alt={proj.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className="badge badge-gold" style={{ position: 'absolute', top: 12, left: 12 }}>
                    {proj.is_demo ? 'Demo Showcase' : 'Amplix Ecom Work'}
                  </span>
                </div>
                <div style={{ padding: 22 }}>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: 6 }}>{proj.title}</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>{proj.short_description}</p>
                </div>
              </Link>
            ))}
          </div>

          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-gold)', marginBottom: 16 }}>B. Design Inspirations (Reference Brands)</h3>
          <div className="grid-3">
            {references.slice(0, 3).map((ref) => (
              <div key={ref.slug} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                    <span className="badge badge-gold">Design Inspiration</span>
                    <span className="badge">{ref.platform}</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{ref.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', marginBottom: 10 }}>{ref.industry}</div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>{ref.design_inspiration}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewRef(ref)}>Preview</button>
                  <Link to={`/portfolio/reference/${ref.slug}`} className="btn btn-primary btn-sm">Details &rarr;</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE AMPLIX ECOM */}
      <section className="section section-alt">
        <div className="container">
          <span className="section-eyebrow">THE AMPLIX STANDARD</span>
          <h2 className="section-title">Why Leading Brands Choose Us</h2>
          <div className="grid-3" style={{ marginTop: 32 }}>
            {[
              { icon: Sparkles, title: 'Conversion-Focused Design', desc: 'Editorial elegance paired with clear buyer journeys and checkout clarity.' },
              { icon: Zap, title: 'High-Performance Websites', desc: 'Clean architecture engineered for strong Core Web Vitals.' },
              { icon: Layers, title: 'Mobile-First Development', desc: 'Flawless responsiveness across every mobile and desktop viewport.' },
              { icon: ShieldCheck, title: 'Custom Functionality', desc: 'Tailored Liquid sections and React systems without heavy app bloat.' },
              { icon: Award, title: 'Transparent Communication', desc: 'Structured milestones, honest scope, and direct WhatsApp & Email access.' },
              { icon: CheckCircle2, title: 'Reliable Technical Support', desc: 'Dedicated post-launch care, bug resolution, and store management.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="card">
                  <div style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--color-gold-dark)', color: 'var(--color-gold)', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
                    <Icon size={19} />
                  </div>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{item.title}</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. DEVELOPMENT PROCESS */}
      <section className="section">
        <div className="container">
          <span className="section-eyebrow">DEVELOPMENT PROCESS</span>
          <h2 className="section-title">Discovery to Launch</h2>
          <div className="grid-3" style={{ marginTop: 28 }}>
            {[
              ['01', 'Discovery', 'Audit your brand, catalog, and business objectives.'],
              ['02', 'Strategy', 'Define architecture, timeline, and conversion roadmap.'],
              ['03', 'Design', 'Craft refined black-and-gold or bespoke brand visuals.'],
              ['04', 'Development', 'Build clean Shopify OS 2.0, WordPress, or React systems.'],
              ['05', 'Testing', 'Verify mobile UX, forms, speed, and accessibility.'],
              ['06', 'Launch', 'Deploy smoothly with training and ongoing support.'],
            ].map(([n, t, d]) => (
              <div key={n} className="card">
                <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{n}</span>
                <h4 style={{ margin: '8px 0 6px' }}>{t}</h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PROJECT STATISTICS (Editable Placeholders) */}
      <section className="section section-alt">
        <div className="container">
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <span className="badge badge-gold" style={{ marginBottom: 14 }}>Editable Metrics (Placeholder)</span>
            <h2 className="section-title" style={{ marginBottom: 28 }}>Agency Benchmarks</h2>
            <div className="grid-4">
              {[
                ['15', 'Core Services'],
                ['10', 'Curated Brand Studies'],
                ['90+', 'Target Speed Focus'],
                ['6-Step', 'QA & Launch Process'],
              ].map(([val, lbl]) => (
                <div key={lbl} style={{ padding: 16, borderRadius: 10, background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-gold)', fontFamily: 'var(--font-display)' }}>{val}</div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)' }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. CLIENT TESTIMONIALS */}
      <section className="section">
        <div className="container" style={{ maxWidth: 840 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span className="section-eyebrow">TESTIMONIALS</span>
            <h2 className="section-title">Client Perspectives</h2>
          </div>
          {activeTestimonial && (
            <div className="card" style={{ textAlign: 'center', padding: '36px 28px' }}>
              {activeTestimonial.is_sample && (
                <span className="badge badge-gold" style={{ marginBottom: 14 }}>Sample Placeholder — Replace in Admin</span>
              )}
              <p style={{ fontSize: '1.15rem', marginBottom: 20 }}>&ldquo;{activeTestimonial.quote}&rdquo;</p>
              <strong>{activeTestimonial.client_name}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{activeTestimonial.client_role}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setSlideIdx((i) => (i - 1 + testimonials.length) % testimonials.length)}>
                  <ChevronLeft size={16} />
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setSlideIdx((i) => (i + 1) % testimonials.length)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 9. PRICING PREVIEW */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 38 }}>
            <span className="section-eyebrow">INVESTMENT PACKAGES</span>
            <h2 className="section-title">Transparent Plans</h2>
          </div>
          <div className="grid-4">
            {packages.map((pkg) => (
              <div key={pkg.slug} className="card" style={{ borderColor: pkg.is_featured ? 'var(--color-gold)' : undefined, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: 'var(--color-gold)', fontSize: '0.82rem' }}>{pkg.name}</strong>
                  <div style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>${pkg.price}</div>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.86rem', marginBottom: 16 }}>{pkg.tagline}</p>
                </div>
                <Link to="/pricing" className={`btn btn-sm ${pkg.is_featured ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%' }}>
                  {pkg.cta_text}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="section">
        <div className="container" style={{ maxWidth: 840 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span className="section-eyebrow">FAQ</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.slice(0, 4).map((f) => {
              const isOpen = openFaqId === f.id;
              return (
                <div key={f.id} className="card" style={{ padding: 0 }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : f.id)}
                    style={{ width: '100%', background: 'none', border: 'none', color: 'var(--color-text-primary)', padding: '18px 22px', textAlign: 'left', fontFamily: 'inherit', fontSize: '0.96rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
                  >
                    {f.question}
                    <span style={{ color: 'var(--color-gold)' }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && <div style={{ padding: '0 22px 18px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{f.answer}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="section section-alt">
        <div className="container">
          <div className="card" style={{ textAlign: 'center', padding: '56px 28px', borderColor: 'var(--color-gold-dark)' }}>
            <h2 className="section-title">Ready to Build Something Exceptional?</h2>
            <p className="section-subtitle" style={{ margin: '0 auto 28px' }}>
              Start your Shopify store, WordPress platform, or custom web project with Amplix Ecom today.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/quote" className="btn btn-primary">Start Your Project</Link>
              <Link to="/contact" className="btn btn-outline">Contact Our Team</Link>
            </div>
          </div>
        </div>
      </section>

      <ReferencePreviewModal reference={previewRef} onClose={() => setPreviewRef(null)} />
    </>
  );
}
