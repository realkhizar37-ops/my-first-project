import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, MessageCircle } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { useToast } from '../context/ToastContext';
import { DEFAULT_SERVICES, DEFAULT_SITE_SETTINGS } from '../data/defaultCatalog';
import { fetchPublishedServices, submitLead } from '../services/api';
import type { ServiceItem } from '../types';

export function ContactPage() {
  const { notify } = useToast();
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceRequired, setServiceRequired] = useState('Shopify Store Development');
  const [budgetRange, setBudgetRange] = useState('$500 – $1,000');
  const [description, setDescription] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPublishedServices().then(setServices);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await submitLead({
        full_name: fullName,
        email,
        whatsapp,
        company_name: companyName,
        service_required: serviceRequired,
        budget_range: budgetRange,
        project_description: description,
        website_honeypot: honeypot,
      });
      setRefCode(res.reference_code);
      notify(`Inquiry submitted! Ref: ${res.reference_code}`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to submit inquiry.';
      setErrorMsg(msg);
      notify(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappClean = DEFAULT_SITE_SETTINGS.whatsapp_number.replace(/[^0-9]/g, '');

  return (
    <>
      <SeoHead
        title="Contact Us | Amplix Ecom"
        description="Get in touch with Amplix Ecom for Shopify store design, speed optimization, WordPress, or custom web development."
      />
      <section className="section">
        <div className="container">
          <span className="section-eyebrow">CONTACT OUR TEAM</span>
          <h1 className="section-title">Let&apos;s Discuss Your Project</h1>
          <p className="section-subtitle" style={{ marginBottom: 36 }}>
            Send your project inquiry below or contact us directly via Email or WhatsApp.
          </p>

          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--blue-electric)', marginBottom: 6 }}>
                  <Mail size={18} /> <strong>Email</strong>
                </div>
                <a href={`mailto:${DEFAULT_SITE_SETTINGS.contact_email}`}>{DEFAULT_SITE_SETTINGS.contact_email}</a>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)', marginBottom: 6 }}>
                  <MessageCircle size={18} /> <strong>WhatsApp</strong>
                </div>
                <a href={`https://wa.me/${whatsappClean}`} target="_blank" rel="noopener noreferrer">
                  {DEFAULT_SITE_SETTINGS.whatsapp_number}
                </a>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>Already Submitted?</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 14 }}>
                  Use your unique reference code (e.g. LED-XXXXXX or QTE-XXXXXX) to check live status updates.
                </p>
                <Link to="/track" className="btn btn-outline btn-sm">Track Your Inquiry &rarr;</Link>
              </div>
            </div>

            {refCode ? (
              <div className="card" style={{ padding: 32 }}>
                <CheckCircle2 size={36} color="var(--success)" style={{ marginBottom: 12 }} />
                <h2 style={{ marginBottom: 8 }}>Message Received!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 14 }}>Your inquiry reference code:</p>
                <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-glow)', fontWeight: 800, color: 'var(--blue-electric)', marginBottom: 18 }}>
                  {refCode}
                </div>
                <Link to={`/track?ref=${refCode}`} className="btn btn-primary">Track Status</Link>
              </div>
            ) : (
              <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                <div className="grid-2">
                  <div>
                    <label className="label" htmlFor="c-name">Full Name *</label>
                    <input id="c-name" className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="label" htmlFor="c-email">Email *</label>
                    <input id="c-email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label className="label" htmlFor="c-wa">WhatsApp Number *</label>
                    <input id="c-wa" className="input" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+92 300 0000000" />
                  </div>
                  <div>
                    <label className="label" htmlFor="c-company">Company Name</label>
                    <input id="c-company" className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Optional" />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label className="label" htmlFor="c-service">Service Required</label>
                    <select id="c-service" className="select" value={serviceRequired} onChange={(e) => setServiceRequired(e.target.value)}>
                      {services.map((s) => (
                        <option key={s.slug} value={s.title}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="c-budget">Budget Range</label>
                    <select id="c-budget" className="select" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}>
                      <option>Under $500</option>
                      <option>$500 – $1,000</option>
                      <option>$1,000 – $2,500</option>
                      <option>$2,500+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="c-desc">Project Description *</label>
                  <textarea id="c-desc" rows={4} className="textarea" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us about your store, website, or goals..." />
                </div>

                {errorMsg && (
                  <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontSize: '0.86rem' }}>
                    {errorMsg}
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
