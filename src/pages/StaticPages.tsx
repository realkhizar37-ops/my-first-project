import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { DEFAULT_FAQS } from '../data/defaultCatalog';
import { fetchFaqs } from '../services/api';
import type { FaqItem } from '../types';

export function ProcessPage() {
  const steps = [
    ['01', 'Discovery', 'We review your business goals, target audience, current store or site, and competitors.'],
    ['02', 'Strategy', 'We define architecture, milestones, page/product scope, and measurable KPIs.'],
    ['03', 'Design', 'We craft a clean dark/light UI system optimized for trust and mobile conversion.'],
    ['04', 'Development', 'We implement clean Liquid, WordPress, or React/TypeScript code with zero bloat.'],
    ['05', 'Testing', 'Cross-device QA, speed audits, form validation, and checkout verification.'],
    ['06', 'Launch', 'Smooth deployment, documentation, and optional ongoing management & maintenance.'],
  ];

  return (
    <>
      <SeoHead title="Our Process | Amplix Ecom" description="6-stage agency delivery framework from Discovery to Launch." />
      <section className="section">
        <div className="container">
          <span className="section-eyebrow">OUR PROCESS</span>
          <h1 className="section-title">How We Deliver Predictable Quality</h1>
          <p className="section-subtitle" style={{ marginBottom: 36 }}>
            Every Amplix Ecom project follows a structured 6-stage engineering and QA workflow.
          </p>
          <div className="grid-3">
            {steps.map(([num, title, desc]) => (
              <div key={num} className="card">
                <strong style={{ color: 'var(--blue-electric)', fontSize: '1.25rem' }}>{num}</strong>
                <h2 style={{ fontSize: '1.2rem', margin: '10px 0 8px' }}>{title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [openId, setOpenId] = useState<string | null>(DEFAULT_FAQS[0]?.id ?? null);

  useEffect(() => {
    fetchFaqs().then(setFaqs);
  }, []);

  return (
    <>
      <SeoHead title="FAQ | Amplix Ecom" description="Frequently asked questions about Shopify, WordPress, speed optimization, and pricing." />
      <section className="section">
        <div className="container" style={{ maxWidth: 840 }}>
          <span className="section-eyebrow">FAQ</span>
          <h1 className="section-title">Frequently Asked Questions</h1>
          <p className="section-subtitle" style={{ marginBottom: 32 }}>
            Clear answers on timelines, deliverables, speed optimization, and ongoing support.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((f) => {
              const isOpen = openId === f.id;
              return (
                <div key={f.id} className="card" style={{ padding: 0 }}>
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : f.id)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-white)',
                      padding: '20px 24px',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      fontSize: '1rem',
                      fontWeight: 600,
                      display: 'flex',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    {f.question}
                    <span style={{ color: 'var(--blue-electric)' }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 24px 20px', color: 'var(--text-muted)', fontSize: '0.94rem' }}>
                      {f.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export function PrivacyPage() {
  return (
    <>
      <SeoHead title="Privacy Policy | Amplix Ecom" description="Privacy Policy for Amplix Ecom." />
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <h1 className="section-title">Privacy Policy</h1>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--text-muted)' }}>
            <p>Amplix Ecom collects only the contact and project details you voluntarily submit via our Contact or Quote Request forms.</p>
            <p>Your information (name, email, WhatsApp number, and project scope) is used solely to prepare proposals, communicate regarding your project, and provide requested services.</p>
            <p>We do not sell or share client inquiry records with third parties. For data deletion requests, contact realkhizar37@gmail.com.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export function TermsPage() {
  return (
    <>
      <SeoHead title="Terms & Conditions | Amplix Ecom" description="Terms and Conditions for Amplix Ecom." />
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <h1 className="section-title">Terms &amp; Conditions</h1>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--text-muted)' }}>
            <p>Project estimates generated by the Cost Calculator are non-binding preliminary figures. Final scope, milestones, and pricing are confirmed in writing before work begins.</p>
            <p>Clients retain ownership of custom deliverables upon full completion of agreed project milestones.</p>
            <p>For questions regarding these terms, contact realkhizar37@gmail.com.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export function NotFoundPage() {
  return (
    <>
      <SeoHead title="404 — Page Not Found | Amplix Ecom" description="The requested page could not be found." />
      <section className="section">
        <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <span className="badge badge-blue" style={{ marginBottom: 16 }}>404 ERROR</span>
          <h1 className="section-title">Page Not Found</h1>
          <p className="section-subtitle" style={{ margin: '0 auto 28px' }}>
            The page you are looking for does not exist or has been moved.
          </p>
          <Link to="/" className="btn btn-primary">Return to Home</Link>
        </div>
      </section>
    </>
  );
}
