import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { useToast } from '../context/ToastContext';
import { DEFAULT_SERVICES, DEFAULT_SITE_SETTINGS } from '../data/defaultCatalog';
import { calculateProjectEstimate, fetchPublishedServices, fetchSiteSettings, submitQuoteRequest } from '../services/api';
import type { ServiceItem, SiteSettings } from '../types';

const OPTIONAL_FEATURES = [
  'Speed Optimization (Core Web Vitals)',
  'Custom Liquid / UI Sections',
  'Payment & Shipping Setup',
  'On-Page Technical SEO',
  'WhatsApp & Lead Capture Integration',
  '30-Day Store Management',
];

const STEPS = [
  'Service',
  'Project Type',
  'Features',
  'Budget',
  'Contact Details',
  'Review',
];

export function QuotePage() {
  const [searchParams] = useSearchParams();
  const { notify } = useToast();
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [step, setStep] = useState(1);
  const [serviceSlug, setServiceSlug] = useState(searchParams.get('service') || 'shopify-store-development');
  const [projectType, setProjectType] = useState<'standard' | 'advanced' | 'enterprise'>('standard');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['Speed Optimization (Core Web Vitals)']);
  const [scopeCount, setScopeCount] = useState(10);
  const [budgetRange, setBudgetRange] = useState('$500 – $1,000');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPublishedServices().then(setServices);
    fetchSiteSettings().then(setSettings);
  }, []);

  const selectedService = services.find((s) => s.slug === serviceSlug) || services[0];
  const estimate = calculateProjectEstimate(
    selectedService?.starting_price ?? 350,
    projectType,
    scopeCount,
    selectedFeatures.length,
    settings.pricing_rules
  );

  function toggleFeature(feat: string) {
    setSelectedFeatures((prev) => (prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]));
  }

  function nextStep() {
    if (step === 5 && (!fullName.trim() || !email.includes('@') || !whatsapp.trim())) {
      setErrorMsg('Please enter your Full Name, valid Email, and WhatsApp number.');
      return;
    }
    setErrorMsg(null);
    setStep((s) => Math.min(6, s + 1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await submitQuoteRequest({
        full_name: fullName,
        email,
        whatsapp,
        company_name: companyName,
        service_slug: serviceSlug,
        complexity: projectType,
        selected_features: selectedFeatures,
        scope_count: scopeCount,
        budget_range: budgetRange,
        calculated_estimate: estimate,
        project_requirements: requirements || `Project Type: ${projectType}, Scope: ${scopeCount}`,
        website_honeypot: honeypot,
      });
      setSubmittedRef(res.reference_code);
      notify(`Quote submitted! Reference: ${res.reference_code}`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to submit quote.';
      setErrorMsg(msg);
      notify(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappClean = settings.whatsapp_number.replace(/[^0-9]/g, '');
  const waSummary = encodeURIComponent(
    `Hi Amplix Ecom! I submitted a quote (${submittedRef || 'Estimate: $' + estimate}). Service: ${selectedService?.title}, Budget: ${budgetRange}.`
  );

  return (
    <>
      <SeoHead
        title="Quotation Wizard | Amplix Ecom"
        description="7-step interactive project quotation wizard for Shopify, WordPress, and custom web development."
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 880 }}>
          <span className="section-eyebrow">QUOTATION WIZARD</span>
          <h1 className="section-title">Build Your Custom Project Quote</h1>
          <p className="section-subtitle" style={{ marginBottom: 28 }}>
            Complete the steps below for a non-binding estimate and submit your requirements to our team.
          </p>

          {submittedRef ? (
            <div className="card" style={{ padding: 36 }}>
              <CheckCircle2 size={36} color="var(--status-success)" style={{ marginBottom: 14 }} />
              <h2 style={{ marginBottom: 8 }}>Quote Request Submitted</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                Your tracking reference code:
              </p>
              <div style={{ padding: '14px 18px', background: 'var(--color-background-secondary)', borderRadius: 10, border: '1px solid var(--color-gold-dark)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-gold)', marginBottom: 22 }}>
                {submittedRef}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to={`/track?ref=${submittedRef}`} className="btn btn-primary">Track Inquiry Status</Link>
                <a href={`https://wa.me/${whatsappClean}?text=${waSummary}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <MessageCircle size={16} /> Send Copy on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 24 }}>
                {STEPS.map((label, idx) => {
                  const num = idx + 1;
                  const active = step === num;
                  const done = step > num;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => num < step && setStep(num)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 8,
                        border: `1px solid ${active || done ? 'var(--color-gold)' : 'var(--color-border)'}`,
                        background: active ? 'rgba(214, 189, 138, 0.14)' : 'var(--color-surface)',
                        color: active || done ? 'var(--color-gold-light)' : 'var(--color-text-secondary)',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        cursor: num < step ? 'pointer' : 'default',
                      }}
                    >
                      {num}. {label}
                    </button>
                  );
                })}
              </div>

              <form className="card" onSubmit={handleSubmit}>
                <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                {step === 1 && (
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 14 }}>Step 1: Select Service</h2>
                    <select className="select" value={serviceSlug} onChange={(e) => setServiceSlug(e.target.value)}>
                      {services.map((s) => (
                        <option key={s.slug} value={s.slug}>{s.title} (Base ${s.starting_price})</option>
                      ))}
                    </select>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 14 }}>Step 2: Select Project Type &amp; Scope</h2>
                    <div className="grid-3" style={{ marginBottom: 20 }}>
                      {([
                        ['standard', 'Standard Build', 'Clean core pages & launch essentials (1.0x)'],
                        ['advanced', 'Advanced / Custom', 'Custom sections, speed & CRO polish (1.5x)'],
                        ['enterprise', 'Enterprise Scale', 'Bespoke architecture & management (2.2x)'],
                      ] as const).map(([val, title, desc]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setProjectType(val)}
                          className="card"
                          style={{
                            textAlign: 'left',
                            cursor: 'pointer',
                            borderColor: projectType === val ? 'var(--color-gold)' : 'var(--color-border)',
                            background: projectType === val ? 'rgba(214,189,138,0.08)' : 'var(--color-background-secondary)',
                          }}
                        >
                          <strong style={{ color: 'var(--color-gold)' }}>{title}</strong>
                          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginTop: 6 }}>{desc}</p>
                        </button>
                      ))}
                    </div>
                    <label className="label">Number of Pages or Products: <strong>{scopeCount}</strong></label>
                    <input type="range" min={1} max={100} value={scopeCount} onChange={(e) => setScopeCount(Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 14 }}>Step 3: Select Features</h2>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {OPTIONAL_FEATURES.map((feat) => (
                        <label key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8, background: 'var(--color-background-secondary)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                          <input type="checkbox" checked={selectedFeatures.includes(feat)} onChange={() => toggleFeature(feat)} />
                          <span>{feat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 14 }}>Step 4: Select Budget Range</h2>
                    <select className="select" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)} style={{ marginBottom: 18 }}>
                      <option>Under $500</option>
                      <option>$500 – $1,000</option>
                      <option>$1,000 – $2,500</option>
                      <option>$2,500+</option>
                    </select>
                    <div style={{ padding: 18, borderRadius: 10, background: 'var(--color-background-secondary)', border: '1px solid var(--color-gold-dark)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Non-Binding Calculated Estimate</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--color-gold)', fontFamily: 'var(--font-display)' }}>${estimate} {settings.currency}</div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <h2 style={{ fontSize: '1.5rem' }}>Step 5: Enter Contact Details</h2>
                    <div className="grid-2">
                      <div>
                        <label className="label">Full Name *</label>
                        <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                      </div>
                      <div>
                        <label className="label">Email *</label>
                        <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
                      </div>
                    </div>
                    <div className="grid-2">
                      <div>
                        <label className="label">WhatsApp Number *</label>
                        <input className="input" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+92 300 0000000" />
                      </div>
                      <div>
                        <label className="label">Company / Brand</label>
                        <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Optional" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Project Details</label>
                      <textarea className="textarea" rows={3} value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Store URL, goals, or specific notes..." />
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 14 }}>Step 6: Review &amp; Submit</h2>
                    <div style={{ display: 'grid', gap: 10, padding: 18, borderRadius: 10, background: 'var(--color-background-secondary)', border: '1px solid var(--color-border)', marginBottom: 16, fontSize: '0.92rem' }}>
                      <div><strong>Service:</strong> {selectedService?.title}</div>
                      <div><strong>Project Type:</strong> {projectType} ({scopeCount} pages/products)</div>
                      <div><strong>Features:</strong> {selectedFeatures.join(', ') || 'None'}</div>
                      <div><strong>Budget:</strong> {budgetRange}</div>
                      <div><strong>Estimated Cost (Non-binding):</strong> <span style={{ color: 'var(--color-gold)' }}>${estimate} {settings.currency}</span></div>
                      <div><strong>Client:</strong> {fullName} ({email} • {whatsapp})</div>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: 'rgba(248,113,113,0.14)', color: '#fca5a5', fontSize: '0.86rem' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button type="button" className="btn btn-outline" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>
                    <ArrowLeft size={16} /> Previous
                  </button>
                  {step < 6 ? (
                    <button type="button" className="btn btn-primary" onClick={nextStep}>
                      Next Step <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Quote Request'}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
}
